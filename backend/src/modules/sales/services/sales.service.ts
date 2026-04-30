import { Injectable, Logger } from '@nestjs/common';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { AccountingService } from '../../accounting/services/accounting.service';
import { JournalEntry } from '../../accounting/domain/journal.domain';
import { ProcessSaleDto } from '../controllers/process-sale.dto';
import { AccountingRepository } from '../../accounting/repositories/accounting.repository';
import { UnitOfWork } from '../../../core/database/unit-of-work';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SupabaseService } from '../../../shared/supabase.service';
import { SubscriptionTier } from '../../../core/auth/tier.enum';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly accountingService: AccountingService,
    private readonly accountingRepository: AccountingRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly eventBus: EventBusService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async processSale(user: any, payload: ProcessSaleDto) {
    const client = this.supabaseService.getClient();

    if (user.tier === SubscriptionTier.STARTER) {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count, error: countError } = await client
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', firstDayOfMonth.toISOString());
      
      if (countError) throw countError;
      if (count && count >= 500) {
        throw new ForbiddenException('Limit 500 transaksi per bulan tercapai untuk Tier STARTER. Silakan upgrade ke Tier BUSINESS.');
      }
    }

    return await this.unitOfWork.runInTransaction(async (dbClient) => {
      // 1. INIT: Create transaction record
      const transactionData = {
        tenant_id: payload.entity_id,
        reference_number: `POS-${Date.now()}`,
        transaction_type: 'sales',
        description: 'Penjualan POS',
      };
      
      const transaction = await this.accountingRepository.createTransactionWithLines(
        transactionData,
        [], // Lines will be added later if I update the repository to handle it, but for now I'll follow the existing flow or fix it.
        dbClient
      );
      const transactionId = transaction.id;

      try {
        // 2. VALIDATING
        await this.accountingRepository.updateTransactionStatus(transactionId, 'VALIDATING', dbClient);
        
        let totalSaleAmount = 0;
        let totalHppAmount = 0;
        const itemsToProcess = [];

        for (const item of payload.items) {
          totalSaleAmount += item.price * item.quantity;
          const product = await this.inventoryRepository.getProductWithRecipe(
            item.product_id,
            payload.entity_id,
            dbClient
          );
          if (!product) throw new Error(`Product not found: ${item.product_id}`);
          itemsToProcess.push({ item, product });
        }

        // 3. PROCESSING
        await this.accountingRepository.updateTransactionStatus(transactionId, 'PROCESSING', dbClient);

        // Auto-lookup accounts by code if not provided
        const codesToLookup = [];
        if (!payload.payment_account_id) codesToLookup.push('1-10000'); // Kas Tangan
        if (!payload.revenue_account_id) codesToLookup.push('4-40000'); // Penjualan Produk
        if (!payload.hpp_account_id) codesToLookup.push('5-50000'); // HPP
        if (!payload.inventory_account_id) codesToLookup.push('1-10503'); // Persediaan Barang Dagang
        if (!payload.discount_account_id) codesToLookup.push('4-41000'); // Diskon

        const accounts = await this.accountingRepository.getAccountsByCodes(payload.entity_id, codesToLookup, dbClient);
        const findId = (code: string) => accounts.find(a => a.code === code)?.id;

        const paymentAccountId = payload.payment_account_id || findId('1-10000');
        const revenueAccountId = payload.revenue_account_id || findId('4-40000');
        const hppAccountId = payload.hpp_account_id || findId('5-50000');
        const inventoryAccountId = payload.inventory_account_id || findId('1-10503');
        const discountAccountId = payload.discount_account_id || findId('4-41000');

        if (!paymentAccountId || !revenueAccountId || !hppAccountId || !inventoryAccountId) {
          throw new Error('Akun akuntansi dasar (Kas/HPP/Pendapatan/Persediaan) tidak ditemukan untuk tenant ini.');
        }

        for (const { item, product } of itemsToProcess) {
          for (const recipe of product.product_recipes) {
            const requiredQty = recipe.quantity_needed * item.quantity;
            const materialHpp = recipe.raw_materials.unit_price * requiredQty;
            totalHppAmount += materialHpp;
            
            // Atomic stock deduction
            await this.inventoryRepository.deductStock(recipe.raw_material_id, requiredQty, dbClient);
          }
        }

        const totalNetSale = totalSaleAmount - (payload.discount_amount || 0);
        const journalLines = [];

        // 3a. Debit Kas (1-10000)
        journalLines.push({ account_id: paymentAccountId, debit: totalNetSale, credit: 0 });

        // 3b. Kredit Penjualan (4-40000)
        journalLines.push({ account_id: revenueAccountId, debit: 0, credit: totalSaleAmount });

        // 3c. Debit Diskon (4-41000) if exists
        if (payload.discount_amount && discountAccountId) {
          journalLines.push({ account_id: discountAccountId, debit: payload.discount_amount, credit: 0 });
        }

        // 3d. HPP (5-50000) & Persediaan (1-10503)
        if (totalHppAmount > 0) {
          journalLines.push(
            { account_id: hppAccountId, debit: totalHppAmount, credit: 0 },
            { account_id: inventoryAccountId, debit: 0, credit: totalHppAmount },
          );
        }

        // 4. COMMIT via AccountingService
        const journal = await this.accountingService.createJournalEntry(payload.entity_id, {
          reference_number: `POS-${Date.now()}`,
          description: `Penjualan POS #${payload.items.length} item`,
          lines: journalLines,
        });

        // 5. Store Sale Items
        const saleItems = itemsToProcess.map(({ item }) => ({
          transaction_id: journal.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total_price: item.price * item.quantity,
        }));
        
        for (const s of saleItems) {
          await dbClient.query(
            'INSERT INTO sale_items (transaction_id, product_id, quantity, price, total_price) VALUES ($1, $2, $3, $4, $5)',
            [s.transaction_id, s.product_id, s.quantity, s.price, s.total_price]
          );
        }

        // 6. Emit Domain Event
        await this.eventBus.emit({
          tenant_id: payload.entity_id,
          event_type: 'SaleCreated',
          payload: { journalId: journal.id, totalAmount: totalSaleAmount },
        });

        return { journalId: journal.id, status: 'COMMITTED' };

      } catch (error) {
        await this.accountingRepository.updateTransactionStatus(transactionId, 'FAILED', dbClient);
        throw error;
      }
    });
  }
}

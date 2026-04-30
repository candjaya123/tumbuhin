import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class ProcurementCronService {
  private readonly logger = new Logger(ProcurementCronService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Menjalankan Deterministic Procurement Autopilot...');
    
    try {
      const client = this.supabaseService.getClient();

      // 1. Ambil semua tenant aktif
      const { data: tenants, error: tenantError } = await client
        .from('tenants')
        .select('id, name');

      if (tenantError) throw tenantError;

      for (const tenant of tenants) {
        // 2. Cari stok yang di bawah ambang batas (stok <= 5 untuk simulasi)
        // Di sistem nyata, ini bisa mengambil dari kolom 'reorder_level'
        const { data: lowStockItems, error: stockError } = await client
          .from('products')
          .select('id, name, current_stock')
          .eq('tenant_id', tenant.id)
          .lte('current_stock', 5);

        if (stockError) {
          this.logger.error(`Gagal mengambil data stok untuk tenant ${tenant.name}: ${stockError.message}`);
          continue;
        }

        if (lowStockItems && lowStockItems.length > 0) {
          this.logger.log(`Tenant ${tenant.name}: Ditemukan ${lowStockItems.length} item stok rendah.`);
          
          // 3. Rakit draft PO secara matematis
          const draftItems = lowStockItems.map(item => ({
            product_id: item.id,
            product_name: item.name,
            quantity: 50, // Default restock qty
            price: 10000, // Harga estimasi
          }));

          const draftPayload = {
            vendor: "Supplier Utama (Otomatis)",
            items: draftItems,
            total_estimated: draftItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
          };

          // 4. Simpan ke business_memory (tipe: procurement_draft)
          const { error: memoryError } = await client
            .from('business_memory')
            .insert({
              tenant_id: tenant.id,
              memory_type: 'procurement_draft',
              memory_key: `po_draft_${new Date().toISOString().split('T')[0]}`,
              content: draftPayload,
              importance_score: 0.8
            });

          if (memoryError) {
            this.logger.error(`Gagal menyimpan draft PO untuk tenant ${tenant.name}: ${memoryError.message}`);
          } else {
            this.logger.log(`Tenant ${tenant.name}: Draft PO berhasil dibuat.`);
          }
        }
      }

    } catch (error) {
      this.logger.error(`Procurement Cron Error: ${error.message}`);
    }
  }
}

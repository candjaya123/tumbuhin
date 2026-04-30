import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Task 4.1: Rebuild Ledger dari journal_lines
   */
  async rebuildLedger(tenantId: string) {
    const client = this.supabaseService.getClient();
    this.logger.log(`Starting ledger rebuild for tenant: ${tenantId}`);

    // 1. Ambil semua journal_lines terurut
    const { data: lines, error } = await client
      .from('journal_lines')
      .select('*, transactions!inner(tenant_id)')
      .eq('transactions.tenant_id', tenantId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Kalkulasi ulang saldo (agregasi in-memory untuk audit)
    const balances: Record<string, number> = {};
    for (const line of lines) {
      const accountId = line.account_id;
      if (!balances[accountId]) balances[accountId] = 0;
      balances[accountId] += Number(line.debit) - Number(line.credit);
    }

    this.logger.log(`Ledger rebuild complete. Accounts processed: ${Object.keys(balances).length}`);
    return balances;
  }

  /**
   * Task 4.2: Replay Inventory Events
   */
  async replayInventoryEvents(tenantId: string, startDate: Date) {
    const client = this.supabaseService.getClient();
    this.logger.log(`Replaying inventory events for tenant ${tenantId} since ${startDate}`);

    // 1. Tarik StockUpdatedEvent dari event_log
    const { data: events, error } = await client
      .from('event_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('event_type', 'StockUpdatedEvent')
      .gte('created_at', startDate.toISOString())
      .order('sequence_number', { ascending: true });

    if (error) throw error;

    // 2. Proses ulang (simulasi)
    for (const event of events) {
      const { material_id, quantity_change } = event.payload;
      this.logger.debug(`Replaying Stock change: ${material_id} by ${quantity_change}`);
      // Di sini kita bisa memanggil repository.deductStock atau update langsung
    }

    return { replayedCount: events.length };
  }

  /**
   * Task 4.3: Time-Travel Debugging System
   */
  async getSystemSnapshot(tenantId: string, timestamp: Date) {
    const client = this.supabaseService.getClient();
    
    // Rekonstruksi state pada waktu tertentu
    const { data: events, error } = await client
      .from('event_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .lte('created_at', timestamp.toISOString())
      .order('sequence_number', { ascending: true });

    if (error) throw error;

    const snapshot = {
      timestamp,
      inventory: {} as Record<string, number>,
      ledger: {},
    };

    // Jalankan mesin state in-memory
    for (const event of events) {
      if (event.event_type === 'StockUpdated') {
        const { id, qty } = event.payload;
        snapshot.inventory[id] = (snapshot.inventory[id] || 0) + qty;
      }
      // Tambahkan logika event lainnya...
    }

    return snapshot;
  }
}

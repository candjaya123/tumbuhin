import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Mengambil data Laba Rugi dan Neraca lalu merangkumnya ke dalam JSON deskriptif
   * agar bisa dikonsumsi oleh LLM tanpa harus membaca ribuan baris jurnal.
   */
  async getSemanticFinancialSummary(tenantId: string) {
    const client = this.supabaseService.getClient();

    // 1. Ambil Saldo dari View ledger_balances
    const { data: balances, error } = await client
      .from('ledger_balances')
      .select('code, name, type, current_balance')
      .eq('tenant_id', tenantId);

    if (error) {
      this.logger.error(`Failed to fetch ledger balances: ${error.message}`);
      throw error;
    }

    // 2. Kategorisasi Data
    const summary = {
      cash_on_hand: balances.filter(b => b.code.startsWith('1-100')).reduce((sum, b) => sum + b.current_balance, 0),
      inventory_value: balances.filter(b => b.code === '1-10503').reduce((sum, b) => sum + b.current_balance, 0),
      total_revenue: balances.filter(b => b.type === 'revenue').reduce((sum, b) => sum + b.current_balance, 0),
      total_cogs: balances.filter(b => b.code === '5-50000').reduce((sum, b) => sum + b.current_balance, 0),
      total_expenses: balances.filter(b => b.type === 'expense' && b.code !== '5-50000').reduce((sum, b) => sum + b.current_balance, 0),
      timestamp: new Date().toISOString(),
    };

    // 3. Tambahkan Context Deskriptif
    return {
      metadata: {
        tenant_id: tenantId,
        currency: 'IDR',
      },
      pnl_snapshot: {
        revenue: summary.total_revenue,
        gross_profit: summary.total_revenue - summary.total_cogs,
        net_profit: summary.total_revenue - summary.total_cogs - summary.total_expenses,
      },
      liquidity_snapshot: {
        cash: summary.cash_on_hand,
        inventory: summary.inventory_value,
      }
    };
  }
}

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/supabase.service';

@Injectable()
export class ReportService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getIncomeStatement(tenantId: string, startDate: string, endDate: string) {
    const client = this.supabaseService.getClient();

    // Query journal_lines joined with accounts
    // Filter by tenant_id (via transaction_id), date range, and account type
    const { data, error } = await client
      .from('journal_lines')
      .select(`
        debit,
        credit,
        accounts!inner (
          name,
          type
        ),
        transactions!inner (
          tenant_id,
          created_at
        )
      `)
      .eq('transactions.tenant_id', tenantId)
      .gte('transactions.created_at', startDate)
      .lte('transactions.created_at', endDate)
      .in('accounts.type', ['pendapatan', 'beban']);

    if (error) throw error;

    const summary: Record<string, number> = { pendapatan: 0, beban: 0 };
    
    data.forEach((line: any) => {
      const type = line.accounts.type;
      const net = Number(line.credit) - Number(line.debit);
      
      if (!summary[type]) summary[type] = 0;
      summary[type] += net;
    });

    return {
      revenue: summary.pendapatan || 0,
      expenses: Math.abs(summary.beban || 0),
      net_profit: (summary.pendapatan || 0) - Math.abs(summary.beban || 0),
    };
  }

  async getDashboardSummary(tenantId: string) {
    const client = this.supabaseService.getClient();
    
    // Quick summary for dashboard
    const { data: sales, error: salesError } = await client
      .from('transactions')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('transaction_type', 'sales');

    if (salesError) throw salesError;

    return {
      total_sales: sales.length,
      // Add more metrics as needed
    };
  }

  async getAccountingAccounts(tenantId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('code', { ascending: true });

    if (error) throw error;
    return data;
  }
}

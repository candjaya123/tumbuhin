import { Controller, Get, Request, UseGuards, Query } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('balance-sheet')
  @RequireTier(SubscriptionTier.PRO)
  async getBalanceSheet(@Request() req: any) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('ledger_balances')
      .select('*')
      .eq('tenant_id', req.user.tenant_id);
    
    if (error) throw error;
    return data;
  }

  @Get('cash-flow')
  @RequireTier(SubscriptionTier.PRO)
  async getCashFlow(@Request() req: any, @Query('account_id') accountId?: string) {
    const client = this.supabaseService.getClient();
    let query = client
      .from('journal_lines')
      .select(`
        id,
        debit,
        credit,
        created_at,
        accounts:chart_of_accounts (
          name,
          code,
          type
        ),
        journal_entries (
          description,
          reference_number
        )
      `)
      .eq('tenant_id', req.user.tenant_id);
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    } else {
      // Filter by cash/bank accounts only by default for cash flow
      query = query.or('type.eq.asset,type.eq.liability', { foreignTable: 'chart_of_accounts' });
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  @Get('ledger')
  @RequireTier(SubscriptionTier.PRO)
  async getLedger(@Request() req: any, @Query('account_id') accountId: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('journal_lines')
      .select(`
        *,
        journal_entries (
          description,
          reference_number,
          date
        )
      `)
      .eq('tenant_id', req.user.tenant_id)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

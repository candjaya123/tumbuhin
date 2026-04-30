import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { PoolClient } from 'pg';

@Injectable()
export class AccountingRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createTransactionWithLines(entry: any, lines: any[], dbClient?: PoolClient) {
    const client = this.supabaseService.getClient();
    
    // 1. Insert Journal Entry
    const { data: journalEntry, error: entryError } = await client
      .from('journal_entries')
      .insert({
        tenant_id: entry.tenant_id,
        reference_doc: entry.reference_number,
        description: entry.description || entry.transaction_type,
      })
      .select()
      .single();

    if (entryError) {
      throw new Error(`Failed to create journal entry: ${entryError.message}`);
    }

    // 2. Insert Journal Lines
    const journalLines = lines.map(line => ({
      entry_id: journalEntry.id,
      account_id: line.account_id,
      debit: line.debit || 0,
      credit: line.credit || 0,
    }));

    const { error: linesError } = await client
      .from('journal_lines')
      .insert(journalLines);

    if (linesError) {
      throw new Error(`Failed to create journal lines: ${linesError.message}`);
    }

    return journalEntry;
  }

  async updateTransactionStatus(transactionId: string, status: string, dbClient?: PoolClient) {
    // Note: journal_entries doesn't have a status column in the new migration.
    // We could add it, but strategi.md says journal table is immutable.
    // For now, we'll just skip status updates for journal_entries or log them.
    this.supabaseService.getClient().from('business_events').insert({
      tenant_id: (await this.supabaseService.getClient().from('journal_entries').select('tenant_id').eq('id', transactionId).single()).data?.tenant_id,
      event_type: `journal_status_${status.toLowerCase()}`,
      payload: { journal_id: transactionId }
    });
  }

  async getAccountByCode(tenantId: string, code: string, dbClient?: PoolClient) {
    if (dbClient) {
      const res = await dbClient.query('SELECT id FROM chart_of_accounts WHERE tenant_id = $1 AND code = $2 LIMIT 1', [tenantId, code]);
      return res.rows[0]?.id;
    }
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('chart_of_accounts')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('code', code)
      .single();
    if (error) return null;
    return data?.id;
  }

  async getAccountsByCodes(tenantId: string, codes: string[], dbClient?: PoolClient) {
    if (dbClient) {
      const res = await dbClient.query('SELECT id, code FROM chart_of_accounts WHERE tenant_id = $1 AND code = ANY($2)', [tenantId, codes]);
      return res.rows;
    }
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('chart_of_accounts')
      .select('id, code')
      .eq('tenant_id', tenantId)
      .in('code', codes);
    if (error) return [];
    return data;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { AccountingRepository } from '../repositories/accounting.repository';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(private readonly accountingRepository: AccountingRepository) {}

  /**
   * Menghasilkan entri jurnal double-entry.
   * Memastikan total Debit == total Kredit.
   */
  async createJournalEntry(tenantId: string, payload: {
    date?: string;
    reference_number: string;
    description: string;
    lines: { account_id: string; debit: number; credit: number }[];
  }) {
    this.logger.log(`Creating journal entry for tenant: ${tenantId}, ref: ${payload.reference_number}`);

    // 1. Validasi Persamaan Dasar Akuntansi (Debit == Kredit)
    const totalDebit = payload.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = payload.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

    // Gunakan toleransi kecil untuk floating point
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      this.logger.error(`Journal imbalance: Debit (${totalDebit}) != Credit (${totalCredit})`);
      throw new Error(`Entri jurnal tidak seimbang: Debit (${totalDebit}) != Kredit (${totalCredit})`);
    }

    // 2. Simpan via Repository
    const entry = await this.accountingRepository.createTransactionWithLines(
      {
        tenant_id: tenantId,
        reference_number: payload.reference_number,
        description: payload.description,
      },
      payload.lines
    );

    return entry;
  }
}

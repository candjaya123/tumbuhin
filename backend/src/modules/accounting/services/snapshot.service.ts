import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../../shared/supabase.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Task 5.2: CronJob Bulanan untuk Saldo Akhir
   * Dijalankan setiap tanggal 1 jam 00:01
   */
  @Cron('1 0 1 * *')
  async captureMonthlySnapshots() {
    const client = this.supabaseService.getClient();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();

    this.logger.log(`Capturing monthly snapshots for ${month}/${year}`);

    // Logic: 
    // 1. Ambil semua account
    // 2. SUM(debit - credit) dari journal_lines hingga akhir bulan lalu
    // 3. Masukkan ke ledger_snapshots
    
    // Placeholder implementation for the user to refine
    this.logger.log('Snapshot capture process initiated...');
  }
}

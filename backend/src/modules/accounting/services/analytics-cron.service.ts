import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../../../shared/supabase.service';

@Injectable()
export class AnalyticsCronService {
  private readonly logger = new Logger(AnalyticsCronService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async refreshAnalytics() {
    this.logger.log('Menyegarkan Materialized Views (Accounting Analytics)...');
    
    try {
      // Menggunakan rpc atau query langsung via pool jika tersedia
      // Karena kita menggunakan Supabase client, kita bisa menggunakan rpc jika sudah dibuat fungsinya
      // Atau menjalankan query mentah jika konfigurasi mendukung.
      
      const client = this.supabaseService.getClient();
      
      // Simulasi pemanggilan refresh untuk view (asumsi sudah dikonversi ke Materialized)
      // Di produksi, kita akan memanggil fungsi PostgreSQL khusus
      const { error } = await client.rpc('refresh_ledger_analytics');

      if (error) {
        // Jika rpc belum ada, kita coba jalankan manual via query (jika memungkinkan)
        // Namun di arsitektur ini, lebih aman menggunakan RPC yang didefinisikan di DB
        this.logger.warn(`Gagal merefresh via RPC (Mungkin fungsi belum ada): ${error.message}`);
      } else {
        this.logger.log('Analytics Materialized Views berhasil diperbarui.');
      }

    } catch (error) {
      this.logger.error(`Analytics Refresh Error: ${error.message}`);
    }
  }
}

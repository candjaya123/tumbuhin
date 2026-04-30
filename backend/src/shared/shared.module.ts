import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { MidtransService } from './midtrans.service';

@Global()
@Module({
  providers: [SupabaseService, MidtransService],
  exports: [SupabaseService, MidtransService],
})
export class SharedModule {}

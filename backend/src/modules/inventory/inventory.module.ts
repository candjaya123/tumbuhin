import { Module } from '@nestjs/common';
import { InventoryRepository } from './repositories/inventory.repository';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { SupabaseService } from '../../shared/supabase.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryRepository, InventoryService, SupabaseService],
  exports: [InventoryRepository, InventoryService],
})
export class InventoryModule {}

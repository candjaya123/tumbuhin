import { Module } from '@nestjs/common';
import { WarehouseController } from './controllers/warehouse.controller';
import { WarehouseService } from './services/warehouse.service';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService],
  exports: [WarehouseService],
})
export class WarehouseModule {}

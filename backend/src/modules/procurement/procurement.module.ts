import { Module } from '@nestjs/common';
import { ProcurementCronService } from './services/procurement-cron.service';
import { ProcurementController } from './controllers/procurement.controller';

@Module({
  controllers: [ProcurementController],
  providers: [ProcurementCronService],
  exports: [ProcurementCronService],
})
export class ProcurementModule {}

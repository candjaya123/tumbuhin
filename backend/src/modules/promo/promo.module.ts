import { Module } from '@nestjs/common';
import { PromoController } from './controllers/promo.controller';
import { PromoService } from './services/promo.service';

@Module({
  controllers: [PromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}

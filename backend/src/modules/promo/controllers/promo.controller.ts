import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PromoService } from '../services/promo.service';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/auth/tier.enum';

@Controller('api/v1/promotions')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Get()
  @RequireTier(SubscriptionTier.BUSINESS)
  async getPromotions(@Request() req: any) {
    return this.promoService.getPromotions(req.user.tenant_id);
  }

  @Post()
  @RequireTier(SubscriptionTier.BUSINESS)
  async createPromotion(@Request() req: any, @Body() body: any) {
    return this.promoService.createPromotion(req.user.tenant_id, body);
  }

  @Put(':id')
  @RequireTier(SubscriptionTier.BUSINESS)
  async updatePromotion(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.promoService.updatePromotion(id, req.user.tenant_id, body);
  }

  @Delete(':id')
  @RequireTier(SubscriptionTier.BUSINESS)
  async deletePromotion(@Request() req: any, @Param('id') id: string) {
    return this.promoService.deletePromotion(id, req.user.tenant_id);
  }
}

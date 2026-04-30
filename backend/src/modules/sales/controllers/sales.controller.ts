import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SalesService } from '../services/sales.service';
import { ProcessSaleDto } from './process-sale.dto';
import { MidtransService } from '../../../shared/midtrans.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly midtransService: MidtransService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('process')
  async processSale(@Request() req: any, @Body() payload: ProcessSaleDto) {
    return await this.salesService.processSale(req.user, payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout-midtrans')
  async checkoutMidtrans(@Body() payload: any, @Request() req: any) {
    const { amount, items } = payload;
    const orderId = `ORDER-${Date.now()}-${req.user.id.slice(0, 5)}`;
    
    return await this.midtransService.createSnapToken({
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: items,
      customer_details: {
        first_name: req.user.email.split('@')[0],
        email: req.user.email,
        phone: '',
      },
    });
  }
}

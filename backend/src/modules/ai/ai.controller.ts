import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GeminiProvider } from '../../core/ai/gemini.provider';
import { ForecastingService } from './services/forecasting.service';
import { JwtAuthGuard } from '../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../core/auth/tier.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly gemini: GeminiProvider,
    private readonly forecastingService: ForecastingService,
  ) {}

  @Post('chat')
  @RequireTier(SubscriptionTier.BUSINESS)
  async chat(@Body() body: { prompt: string }, @Request() req: any) {
    const { prompt } = body;
    const tenantId = req.user.tenant_id;

    // Jika prompt kosong, berikan insight umum
    if (!prompt || prompt.trim() === '') {
      const insight = await this.forecastingService.generateFinancialInsight(tenantId);
      return { response: insight };
    }
    
    // Antarmuka chat interaktif
    const systemContext = `Anda adalah CFO Virtual (Tumbuhin AI). 
    Berikan jawaban profesional mengenai keuangan dan operasional bisnis berdasarkan pertanyaan user.`;
    
    const response = await this.gemini.generateContent(`${systemContext}\n\nUser Question: ${prompt}`);
    return { response };
  }

  @Post('scan-receipt')
  @RequireTier(SubscriptionTier.PRO)
  @UseInterceptors(FileInterceptor('image'))
  async scanReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No image uploaded');
    
    const result = await this.gemini.extractReceipt(file.buffer, file.mimetype);
    return result;
  }
}

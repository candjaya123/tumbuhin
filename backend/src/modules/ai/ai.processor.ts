import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GeminiProvider } from '../../core/ai/gemini.provider';
import { SupabaseService } from '../../shared/supabase.service';

@Processor('ai-ocr-queue')
export class AiProcessor extends WorkerHost {
  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly supabaseService: SupabaseService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { imageBuffer, mimetype, tenantId } = job.data;

    try {
      // 1. Extract using Gemini
      const extractedData = await this.geminiProvider.extractReceipt(
        Buffer.from(imageBuffer),
        mimetype,
      );

      // 2. Save to drafts table
      const client = this.supabaseService.getClient();
      const { error } = await client.from('drafts').insert({
        tenant_id: tenantId,
        source: 'ai_ocr',
        payload: extractedData,
        status: 'pending',
      });

      if (error) throw error;

      return extractedData;
    } catch (error) {
      console.error('OCR Processing failed:', error);
      throw error;
    }
  }
}

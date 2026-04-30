import { Controller, Post, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('api/v1/ai')
export class OcrController {
  constructor(@InjectQueue('ai-ocr-queue') private readonly aiQueue: Queue) {}

  @Post('ocr')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  async extractReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ) {
    if (!file) throw new Error('No file uploaded');

    const tenantId = req.user.tenant_id || req.user.entity_id;

    const job = await this.aiQueue.add('extract', {
      imageBuffer: file.buffer,
      mimetype: file.mimetype,
      tenantId: tenantId,
    });

    return {
      message: "Struk sedang diproses AI",
      status: "pending",
      jobId: job.id
    };
  }
}

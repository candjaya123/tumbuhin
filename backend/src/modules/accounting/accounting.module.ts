import { Module } from '@nestjs/common';
import { AccountingRepository } from './repositories/accounting.repository';
import { AccountingService } from './services/accounting.service';
import { JournalController } from './controllers/journal.controller';
import { OcrController } from './controllers/ocr.controller';
import { FinanceController } from './controllers/finance.controller';
import { AiModule } from '../ai/ai.module';
import { AnalyticsCronService } from './services/analytics-cron.service';

@Module({
  imports: [AiModule],
  controllers: [JournalController, OcrController, FinanceController],
  providers: [AccountingRepository, AccountingService, AnalyticsCronService],
  exports: [AccountingRepository, AccountingService],
})
export class AccountingModule {}

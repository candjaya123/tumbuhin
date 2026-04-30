import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './controllers/onboarding.controller';
import { SharedModule } from '../../shared/shared.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [SharedModule, AiModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}

import { Module } from '@nestjs/common';
import { OnboardingService } from './services/onboarding.service';
import { PayoutController } from './controllers/payout.controller';
import { BusinessProfileController } from './controllers/business-profile.controller';
import { AdminController } from './controllers/admin.controller';
import { StaffController } from './controllers/staff.controller';
import { SupabaseService } from '../../shared/supabase.service';

@Module({
  controllers: [PayoutController, BusinessProfileController, AdminController, StaffController],
  providers: [OnboardingService, SupabaseService],
  exports: [OnboardingService],
})
export class BusinessProfileModule {}

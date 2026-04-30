import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from './tier.enum';

export const REQUIRE_TIER_KEY = 'require_tier';
export const RequireTier = (tier: SubscriptionTier) => SetMetadata(REQUIRE_TIER_KEY, tier);

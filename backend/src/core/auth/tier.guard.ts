import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../shared/supabase.service';
import { SubscriptionTier } from './tier.enum';
import { REQUIRE_TIER_KEY } from './tier.decorator';

const TIER_HIERARCHY = {
  [SubscriptionTier.STARTER]: 0,
  [SubscriptionTier.BUSINESS]: 1,
  [SubscriptionTier.PRO]: 2,
};

@Injectable()
export class TierGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.get<SubscriptionTier>(REQUIRE_TIER_KEY, context.getHandler());
    
    // If no tier is required, allow access
    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    const client = this.supabaseService.getClient();

    // 1. Get tenant_id and role from profiles
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new ForbiddenException('Profile not found or no tenant associated');
    }

    // 2. Get tier from tenants
    const { data: tenant, error: tenantError } = await client
      .from('tenants')
      .select('tier')
      .eq('id', profile.tenant_id)
      .single();

    if (tenantError || !tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    const userTier = tenant.tier as SubscriptionTier;

    // 3. Compare tiers using hierarchy
    if (TIER_HIERARCHY[userTier] < TIER_HIERARCHY[requiredTier]) {
      throw new ForbiddenException(
        `Fitur ini membutuhkan langganan Tier ${requiredTier.toUpperCase()}. Tier Anda saat ini adalah ${userTier.toUpperCase()}.`
      );
    }

    // Attach tenant_id, tier, and role to request for downstream use
    request.user.tenant_id = profile.tenant_id;
    request.user.tier = userTier;
    request.user.role = profile.role;

    return true;
  }
}

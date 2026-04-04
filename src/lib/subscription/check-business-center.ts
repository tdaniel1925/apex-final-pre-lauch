/**
 * Business Center Subscription Checker
 *
 * Checks if user has active $39/month Business Center subscription
 * and calculates grace period status.
 *
 * @module lib/subscription/check-business-center
 */

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Grace period configuration
 * - 0-7 days: Full access, no nag
 * - 8-21 days: Soft banner reminder
 * - 22+ days: Modal + feature gating
 */
const GRACE_PERIOD_DAYS = 7;
const SOFT_NAG_THRESHOLD_DAYS = 8;
const HARD_NAG_THRESHOLD_DAYS = 22;

export interface BusinessCenterStatus {
  hasSubscription: boolean;
  daysWithout: number;
  nagLevel: 'none' | 'soft' | 'hard';
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'expired';
  expiresAt?: Date;
  trialEndsAt?: Date;
}

/**
 * Check if distributor has active Business Center subscription
 *
 * @param distributorId - Distributor UUID
 * @returns Subscription status and nag level
 */
export async function checkBusinessCenterSubscription(
  distributorId: string
): Promise<BusinessCenterStatus> {
  const supabase = createServiceClient();

  // 1. Get distributor creation date
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('created_at')
    .eq('id', distributorId)
    .single();

  if (distError || !distributor) {
    console.error('Error fetching distributor:', distError);
    return {
      hasSubscription: false,
      daysWithout: 0,
      nagLevel: 'none',
    };
  }

  // 2. Calculate days since signup
  const createdAt = new Date(distributor.created_at);
  const now = new Date();
  const daysWithout = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 3. Check for active Business Center subscription
  const { data: businessCenterProduct } = await supabase
    .from('products')
    .select('id')
    .eq('slug', 'businesscenter')
    .single();

  if (!businessCenterProduct) {
    console.error('Business Center product not found');
    return {
      hasSubscription: false,
      daysWithout,
      nagLevel: 'none',
    };
  }

  // 4. Check service_access table for active subscription
  const { data: serviceAccess } = await supabase
    .from('service_access')
    .select('status, expires_at, is_trial, trial_ends_at')
    .eq('distributor_id', distributorId)
    .eq('product_id', businessCenterProduct.id)
    .eq('status', 'active')
    .single();

  // 5. Check if service access exists
  if (serviceAccess) {
    // Check if trial has expired
    if (serviceAccess.is_trial && serviceAccess.trial_ends_at) {
      const trialEndDate = new Date(serviceAccess.trial_ends_at);
      const now = new Date();

      if (now > trialEndDate) {
        // Trial expired - update status and block access
        await supabase
          .from('service_access')
          .update({ status: 'expired' })
          .eq('distributor_id', distributorId)
          .eq('product_id', businessCenterProduct.id);

        const daysExpired = Math.floor(
          (now.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          hasSubscription: false,
          daysWithout: daysExpired,
          nagLevel: 'hard',
          subscriptionStatus: 'expired',
          trialEndsAt: trialEndDate,
        };
      }

      // Trial still active
      const daysRemaining = Math.ceil(
        (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        hasSubscription: true,
        daysWithout: 0,
        nagLevel: daysRemaining <= 3 ? 'soft' : 'none', // Show reminder in last 3 days
        subscriptionStatus: 'trialing',
        expiresAt: serviceAccess.expires_at ? new Date(serviceAccess.expires_at) : undefined,
        trialEndsAt: trialEndDate,
      };
    }

    // Paid subscription active
    return {
      hasSubscription: true,
      daysWithout: 0,
      nagLevel: 'none',
      subscriptionStatus: 'active',
      expiresAt: serviceAccess.expires_at ? new Date(serviceAccess.expires_at) : undefined,
    };
  }

  // 6. No subscription - determine nag level based on days
  let nagLevel: 'none' | 'soft' | 'hard' = 'none';

  if (daysWithout >= HARD_NAG_THRESHOLD_DAYS) {
    nagLevel = 'hard';
  } else if (daysWithout >= SOFT_NAG_THRESHOLD_DAYS) {
    nagLevel = 'soft';
  } else {
    nagLevel = 'none';
  }

  return {
    hasSubscription: false,
    daysWithout,
    nagLevel,
    subscriptionStatus: 'expired',
  };
}

/**
 * Quick check if user needs to be shown Business Center nag
 *
 * @param distributorId - Distributor UUID
 * @returns True if any nag should be shown (soft or hard)
 */
export async function shouldShowBusinessCenterNag(
  distributorId: string
): Promise<boolean> {
  const status = await checkBusinessCenterSubscription(distributorId);
  return status.nagLevel !== 'none';
}

/**
 * Check if feature requires Business Center subscription
 *
 * @param distributorId - Distributor UUID
 * @param feature - Feature path or name
 * @returns True if user has access, false if gated
 */
export async function hasFeatureAccess(
  distributorId: string,
  feature: string
): Promise<boolean> {
  const status = await checkBusinessCenterSubscription(distributorId);

  // If has subscription or in grace period, allow access
  if (status.hasSubscription || status.nagLevel === 'none' || status.nagLevel === 'soft') {
    return true;
  }

  // After day 22, gate advanced features
  const gatedFeatures = [
    '/dashboard/ai-assistant',
    '/dashboard/ai-calls',
    '/dashboard/crm',
    '/dashboard/reports',
    '/dashboard/genealogy',
    '/dashboard/team',
  ];

  return !gatedFeatures.some(gated => feature.startsWith(gated));
}

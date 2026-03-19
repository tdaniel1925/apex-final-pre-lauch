// =============================================
// Apex Lead Autopilot - Database Query Helpers
// Simplified database operations for autopilot subscriptions
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { AutopilotTier, AutopilotStatus } from '@/lib/stripe/autopilot-products';

/**
 * Autopilot Subscription Data Interface
 */
export interface AutopilotSubscriptionData {
  distributor_id: string;
  tier: AutopilotTier;
  status: AutopilotStatus;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
}

/**
 * Create new autopilot subscription
 * Note: This will automatically trigger usage limits initialization via database trigger
 */
export async function createAutopilotSubscription(
  data: AutopilotSubscriptionData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const supabase = createServiceClient();

    const { data: subscription, error } = await supabase
      .from('autopilot_subscriptions')
      .insert({
        distributor_id: data.distributor_id,
        tier: data.tier,
        status: data.status,
        stripe_subscription_id: data.stripe_subscription_id || null,
        stripe_customer_id: data.stripe_customer_id || null,
        trial_start: data.trial_start || null,
        trial_end: data.trial_end || null,
        current_period_start: data.current_period_start || null,
        current_period_end: data.current_period_end || null,
        cancel_at_period_end: data.cancel_at_period_end || false,
      })
      .select()
      .single();

    if (error) {
      console.error('[DB] Error creating autopilot subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error: any) {
    console.error('[DB] Exception creating autopilot subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Update existing autopilot subscription
 */
export async function updateAutopilotSubscription(
  distributorId: string,
  updates: Partial<AutopilotSubscriptionData>
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const supabase = createServiceClient();

    const { data: subscription, error } = await supabase
      .from('autopilot_subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('distributor_id', distributorId)
      .select()
      .single();

    if (error) {
      console.error('[DB] Error updating autopilot subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error: any) {
    console.error('[DB] Exception updating autopilot subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get autopilot subscription by distributor ID
 */
export async function getAutopilotSubscription(
  distributorId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const supabase = createServiceClient();

    const { data: subscription, error } = await supabase
      .from('autopilot_subscriptions')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found - not an error
        return {
          success: true,
          data: null,
        };
      }

      console.error('[DB] Error fetching autopilot subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: subscription,
    };
  } catch (error: any) {
    console.error('[DB] Exception fetching autopilot subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Cancel autopilot subscription (mark for cancellation at period end)
 */
export async function cancelAutopilotSubscription(
  distributorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('autopilot_subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('distributor_id', distributorId);

    if (error) {
      console.error('[DB] Error canceling autopilot subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[DB] Exception canceling autopilot subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateAutopilotSubscription(
  distributorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('autopilot_subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('distributor_id', distributorId);

    if (error) {
      console.error('[DB] Error reactivating autopilot subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[DB] Exception reactivating autopilot subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Sync Stripe subscription data to database
 * Used by webhook handler
 */
export async function syncStripeSubscription(
  distributorId: string,
  stripeData: {
    tier: AutopilotTier;
    status: AutopilotStatus;
    stripe_subscription_id: string;
    stripe_customer_id: string;
    trial_start?: string | null;
    trial_end?: string | null;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('autopilot_subscriptions')
      .upsert(
        {
          distributor_id: distributorId,
          tier: stripeData.tier,
          status: stripeData.status,
          stripe_subscription_id: stripeData.stripe_subscription_id,
          stripe_customer_id: stripeData.stripe_customer_id,
          trial_start: stripeData.trial_start || null,
          trial_end: stripeData.trial_end || null,
          current_period_start: stripeData.current_period_start,
          current_period_end: stripeData.current_period_end,
          cancel_at_period_end: stripeData.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'distributor_id',
        }
      );

    if (error) {
      console.error('[DB] Error syncing Stripe subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[DB] Exception syncing Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get usage limits for distributor
 */
export async function getAutopilotUsageLimits(
  distributorId: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('autopilot_usage_limits')
      .select('*')
      .eq('distributor_id', distributorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No usage limits found
        return {
          success: true,
          data: null,
        };
      }

      console.error('[DB] Error fetching usage limits:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[DB] Exception fetching usage limits:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Check if distributor can perform an action based on usage limits
 */
export async function checkAutopilotLimit(
  distributorId: string,
  limitType: 'email' | 'sms' | 'contacts' | 'social' | 'flyers' | 'broadcasts' | 'training' | 'meetings'
): Promise<{ success: boolean; canProceed: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('check_autopilot_limit', {
      p_distributor_id: distributorId,
      p_limit_type: limitType,
    });

    if (error) {
      console.error('[DB] Error checking autopilot limit:', error);
      return {
        success: false,
        canProceed: false,
        error: error.message,
      };
    }

    return {
      success: true,
      canProceed: data === true,
    };
  } catch (error: any) {
    console.error('[DB] Exception checking autopilot limit:', error);
    return {
      success: false,
      canProceed: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Increment usage counter after an action
 */
export async function incrementAutopilotUsage(
  distributorId: string,
  limitType: 'email' | 'sms' | 'contacts' | 'social' | 'flyers' | 'broadcasts' | 'training' | 'meetings',
  increment: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributorId,
      p_limit_type: limitType,
      p_increment: increment,
    });

    if (error) {
      console.error('[DB] Error incrementing usage:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[DB] Exception incrementing usage:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

// =============================================
// Apex Lead Autopilot - Stripe Helper Functions
// Utilities for managing autopilot subscriptions
// =============================================

import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import {
  AutopilotTier,
  AutopilotStatus,
  AUTOPILOT_PRODUCTS,
  getAutopilotProduct,
  calculateUpgradePrice,
} from './autopilot-products';

/**
 * Lazy-load Stripe client to prevent build-time initialization
 */
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

/**
 * Autopilot Subscription Data
 */
export interface AutopilotSubscription {
  id: string;
  distributor_id: string;
  tier: AutopilotTier;
  status: AutopilotStatus;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get distributor's current autopilot subscription
 */
export async function getAutopilotSubscription(
  distributorId: string
): Promise<AutopilotSubscription | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('autopilot_subscriptions')
    .select('*')
    .eq('distributor_id', distributorId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No subscription found - return null
      return null;
    }
    console.error('[Autopilot] Error fetching subscription:', error);
    throw new Error('Failed to fetch autopilot subscription');
  }

  return data;
}

/**
 * Get distributor's current tier
 */
export async function getAutopilotTier(distributorId: string): Promise<AutopilotTier> {
  const subscription = await getAutopilotSubscription(distributorId);
  return subscription?.tier || 'free';
}

/**
 * Check if distributor has access to a specific feature
 */
export async function hasAutopilotAccess(
  distributorId: string,
  featureName: string
): Promise<boolean> {
  const subscription = await getAutopilotSubscription(distributorId);
  const tier = subscription?.tier || 'free';
  const product = getAutopilotProduct(tier);

  // Check if feature is included in tier
  const feature = product.features.find((f) => f.name === featureName);
  return feature?.isIncluded || false;
}

/**
 * Check if distributor can upgrade to a new tier
 */
export async function canUpgradeToTier(
  distributorId: string,
  newTier: AutopilotTier
): Promise<boolean> {
  const currentTier = await getAutopilotTier(distributorId);

  const tiers: AutopilotTier[] = ['free', 'social_connector', 'lead_autopilot_pro', 'team_edition'];
  const currentIndex = tiers.indexOf(currentTier);
  const newIndex = tiers.indexOf(newTier);

  return newIndex > currentIndex;
}

/**
 * Calculate prorated upgrade cost
 */
export async function calculateProration(
  distributorId: string,
  newTier: AutopilotTier
): Promise<number> {
  const subscription = await getAutopilotSubscription(distributorId);

  if (!subscription || !subscription.current_period_end) {
    // No active subscription - return full price
    return AUTOPILOT_PRODUCTS[newTier].priceCents;
  }

  // Calculate days remaining in current billing cycle
  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);
  const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return calculateUpgradePrice(subscription.tier, newTier, daysRemaining);
}

/**
 * Create Stripe Checkout Session for subscription
 */
export async function createAutopilotCheckoutSession(
  distributorId: string,
  tier: AutopilotTier,
  distributorEmail: string
): Promise<string> {
  const stripe = getStripe();
  const product = getAutopilotProduct(tier);

  if (!product.stripePriceId) {
    throw new Error(`Stripe price ID not configured for tier: ${tier}`);
  }

  const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/autopilot/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/autopilot/subscription?canceled=true`;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: distributorEmail,
    ...(product.hasFreeTrial && product.trialDays && {
      subscription_data: {
        trial_period_days: product.trialDays,
      },
    }),
    metadata: {
      distributor_id: distributorId,
      autopilot_tier: tier,
      product_type: 'autopilot_subscription',
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return session.url;
}

/**
 * Create Stripe Customer Portal Session (for managing subscriptions)
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string
): Promise<string> {
  const stripe = getStripe();

  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/autopilot/subscription`;

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Cancel subscription at period end
 */
export async function cancelAutopilotSubscription(distributorId: string): Promise<void> {
  const subscription = await getAutopilotSubscription(distributorId);

  if (!subscription || !subscription.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  const stripe = getStripe();

  // Cancel at period end in Stripe
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  // Update database
  const supabase = createServiceClient();
  await supabase
    .from('autopilot_subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateAutopilotSubscription(distributorId: string): Promise<void> {
  const subscription = await getAutopilotSubscription(distributorId);

  if (!subscription || !subscription.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  if (!subscription.cancel_at_period_end) {
    throw new Error('Subscription is not scheduled for cancellation');
  }

  const stripe = getStripe();

  // Reactivate in Stripe
  await stripe.subscriptions.update(subscription.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  // Update database
  const supabase = createServiceClient();
  await supabase
    .from('autopilot_subscriptions')
    .update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscription.id);
}

/**
 * Sync Stripe subscription data to database
 */
export async function syncStripeSubscription(
  distributorId: string,
  stripeSubscription: Stripe.Subscription
): Promise<void> {
  const supabase = createServiceClient();

  // Extract tier from metadata
  const tier = (stripeSubscription.metadata.autopilot_tier as AutopilotTier) || 'free';

  // Map Stripe status to our status
  let status: AutopilotStatus = 'active';
  if (stripeSubscription.status === 'trialing') {
    status = 'trialing';
  } else if (stripeSubscription.status === 'past_due') {
    status = 'past_due';
  } else if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
    status = 'canceled';
  } else if (stripeSubscription.status === 'paused') {
    status = 'paused';
  }

  const subscriptionData = {
    distributor_id: distributorId,
    tier,
    status,
    stripe_subscription_id: stripeSubscription.id,
    stripe_customer_id: stripeSubscription.customer as string,
    trial_start: stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000).toISOString()
      : null,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    current_period_start: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
    updated_at: new Date().toISOString(),
  };

  // Upsert subscription
  const { error } = await supabase
    .from('autopilot_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'distributor_id',
    });

  if (error) {
    console.error('[Autopilot] Error syncing subscription:', error);
    throw new Error('Failed to sync subscription');
  }
}

/**
 * Get usage limits for distributor
 */
export async function getAutopilotUsageLimits(distributorId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('autopilot_usage_limits')
    .select('*')
    .eq('distributor_id', distributorId)
    .single();

  if (error) {
    console.error('[Autopilot] Error fetching usage limits:', error);
    return null;
  }

  return data;
}

/**
 * Check if distributor has reached a specific limit
 */
export async function hasReachedLimit(
  distributorId: string,
  limitType: 'email' | 'sms' | 'contacts' | 'social' | 'flyers' | 'broadcasts' | 'training' | 'meetings'
): Promise<boolean> {
  const supabase = createServiceClient();

  const { data } = await supabase.rpc('check_autopilot_limit', {
    p_distributor_id: distributorId,
    p_limit_type: limitType,
  });

  // Function returns true if CAN send more (not reached limit)
  // We return true if HAS reached limit (inverse)
  return !data;
}

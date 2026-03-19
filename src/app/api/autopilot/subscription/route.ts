import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAutopilotSubscription, getAutopilotUsageLimits } from '@/lib/stripe/autopilot-helpers';
import { getAutopilotProduct } from '@/lib/stripe/autopilot-products';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/subscription
 * Get current user's autopilot subscription status and usage
 *
 * @returns Subscription details including tier, features, usage limits, and current usage
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to view subscription',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Subscription API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get subscription
    const subscription = await getAutopilotSubscription(distributor.id);

    // Default to free tier if no subscription
    const tier = subscription?.tier || 'free';
    const product = getAutopilotProduct(tier);

    // Get usage limits
    const usageLimits = await getAutopilotUsageLimits(distributor.id);

    // Calculate trial status
    let trialStatus = null;
    if (subscription?.trial_end && subscription.status === 'trialing') {
      const trialEndDate = new Date(subscription.trial_end);
      const now = new Date();
      const daysRemaining = Math.ceil(
        (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      trialStatus = {
        isTrialing: true,
        trialEnd: subscription.trial_end,
        daysRemaining,
      };
    }

    // Calculate billing period
    let billingPeriod = null;
    if (subscription?.current_period_start && subscription?.current_period_end) {
      billingPeriod = {
        start: subscription.current_period_start,
        end: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    return NextResponse.json({
      success: true,
      subscription: {
        tier,
        status: subscription?.status || 'active',
        productName: product.name,
        displayName: product.displayName,
        description: product.description,
        priceMonthly: product.priceMonthly,
        features: product.features,
        limits: product.limits,
        trialStatus,
        billingPeriod,
        stripeCustomerId: subscription?.stripe_customer_id || null,
      },
      usage: usageLimits
        ? {
            emailInvites: {
              used: usageLimits.email_invites_used_this_month,
              limit: usageLimits.email_invites_limit,
              isUnlimited: usageLimits.email_invites_limit === -1,
            },
            smsMessages: {
              used: usageLimits.sms_sent_this_month,
              limit: usageLimits.sms_limit,
              isUnlimited: usageLimits.sms_limit === -1,
            },
            contacts: {
              used: usageLimits.contacts_count,
              limit: usageLimits.contacts_limit,
              isUnlimited: usageLimits.contacts_limit === -1,
            },
            socialPosts: {
              used: usageLimits.social_posts_this_month,
              limit: usageLimits.social_posts_limit,
              isUnlimited: usageLimits.social_posts_limit === -1,
            },
            flyers: {
              used: usageLimits.flyers_created_this_month,
              limit: usageLimits.flyers_limit,
              isUnlimited: usageLimits.flyers_limit === -1,
            },
            broadcasts: {
              used: usageLimits.broadcasts_this_month,
              limit: usageLimits.broadcasts_limit,
              isUnlimited: usageLimits.broadcasts_limit === -1,
            },
            nextResetAt: usageLimits.next_reset_at,
          }
        : null,
    });
  } catch (error: any) {
    console.error('[Subscription API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch subscription',
      },
      { status: 500 }
    );
  }
}

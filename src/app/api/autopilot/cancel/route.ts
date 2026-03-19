import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelAutopilotSubscription } from '@/lib/stripe/autopilot-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/autopilot/cancel
 * Cancel autopilot subscription at the end of the current billing period
 *
 * @returns Success confirmation
 */
export async function POST(request: NextRequest) {
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
          message: 'You must be logged in to cancel subscription',
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
      console.error('[Cancel API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Check for existing subscription
    const { data: subscription } = await supabase
      .from('autopilot_subscriptions')
      .select('tier, status, stripe_subscription_id, current_period_end')
      .eq('distributor_id', distributor.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'No active subscription found',
        },
        { status: 404 }
      );
    }

    if (subscription.tier === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Cannot cancel free tier subscription',
        },
        { status: 400 }
      );
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'No Stripe subscription found',
        },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe and update database
    await cancelAutopilotSubscription(distributor.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancelAt: subscription.current_period_end,
    });
  } catch (error: any) {
    console.error('[Cancel API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}

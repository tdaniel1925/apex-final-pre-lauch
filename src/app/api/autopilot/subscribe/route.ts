import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAutopilotCheckoutSession } from '@/lib/stripe/autopilot-helpers';
import { AutopilotTier } from '@/lib/stripe/autopilot-products';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Request validation schema
 */
const subscribeSchema = z.object({
  tier: z.enum(['social_connector', 'lead_autopilot_pro', 'team_edition']),
});

/**
 * POST /api/autopilot/subscribe
 * Create Stripe Checkout session for autopilot subscription
 *
 * @body {tier} - Subscription tier to subscribe to
 * @returns {url} - Stripe Checkout URL to redirect to
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
          message: 'You must be logged in to subscribe',
        },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid subscription tier',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { tier } = validation.data;

    // Get distributor info from auth user
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, email, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Subscribe API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Check if distributor already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('autopilot_subscriptions')
      .select('tier, status')
      .eq('distributor_id', distributor.id)
      .single();

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Already Subscribed',
          message: `You already have an active ${existingSubscription.tier} subscription`,
        },
        { status: 400 }
      );
    }

    // Create Stripe Checkout session
    const checkoutUrl = await createAutopilotCheckoutSession(
      distributor.id,
      tier as AutopilotTier,
      distributor.email
    );

    // Store pending subscription in database
    await supabase.from('autopilot_subscriptions').upsert(
      {
        distributor_id: distributor.id,
        tier,
        status: 'trialing', // Will be updated by webhook
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'distributor_id',
      }
    );

    return NextResponse.json({
      success: true,
      url: checkoutUrl,
    });
  } catch (error: any) {
    console.error('[Subscribe API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

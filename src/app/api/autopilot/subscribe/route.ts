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
 * NOTE: As of 2026, ALL Autopilot tiers are FREE
 * This endpoint now just updates the tier preference without charging
 *
 * @body {tier} - Subscription tier to select (all free)
 * @returns {success: true} - Confirmation that tier was updated
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
          message: 'You must be logged in',
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
          message: 'Invalid tier selection',
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

    // Since everything is FREE, just update the tier preference directly
    const { error: upsertError } = await supabase.from('autopilot_subscriptions').upsert(
      {
        distributor_id: distributor.id,
        tier,
        status: 'active', // All tiers are active and free
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'distributor_id',
      }
    );

    if (upsertError) {
      console.error('[Subscribe API] Error updating tier:', upsertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to update tier preference',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully activated ${tier} tier (free)`,
      tier,
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

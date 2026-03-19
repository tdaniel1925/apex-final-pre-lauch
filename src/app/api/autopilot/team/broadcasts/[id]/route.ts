import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canSendTeamBroadcast } from '@/lib/autopilot/team-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/team/broadcasts/[id]
 * Get broadcast details including delivery stats
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const broadcastId = params.id;

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

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Team Broadcast Detail API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Check if distributor has Team Edition access
    const hasAccess = await canSendTeamBroadcast(distributor.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied',
          message: 'Team Edition subscription required',
        },
        { status: 403 }
      );
    }

    // Get broadcast details
    const { data: broadcast, error: broadcastError } = await supabase
      .from('team_broadcasts')
      .select('*')
      .eq('id', broadcastId)
      .eq('distributor_id', distributor.id)
      .single();

    if (broadcastError || !broadcast) {
      console.error('[Team Broadcast Detail API] Error fetching broadcast:', broadcastError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Broadcast not found',
        },
        { status: 404 }
      );
    }

    // Calculate engagement rates
    const deliveryRate = broadcast.total_sent > 0
      ? (broadcast.total_delivered / broadcast.total_sent) * 100
      : 0;

    const openRate = broadcast.total_delivered > 0
      ? (broadcast.total_opened / broadcast.total_delivered) * 100
      : 0;

    const clickRate = broadcast.total_opened > 0
      ? (broadcast.total_clicked / broadcast.total_opened) * 100
      : 0;

    return NextResponse.json({
      success: true,
      broadcast: {
        ...broadcast,
        engagement: {
          deliveryRate: Math.round(deliveryRate * 10) / 10,
          openRate: Math.round(openRate * 10) / 10,
          clickRate: Math.round(clickRate * 10) / 10,
        },
      },
    });
  } catch (error: any) {
    console.error('[Team Broadcast Detail API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch broadcast',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/autopilot/team/broadcasts/[id]
 * Cancel a scheduled broadcast
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const broadcastId = params.id;

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

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Team Broadcast Detail API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get broadcast to check if it can be canceled
    const { data: broadcast, error: broadcastError } = await supabase
      .from('team_broadcasts')
      .select('status')
      .eq('id', broadcastId)
      .eq('distributor_id', distributor.id)
      .single();

    if (broadcastError || !broadcast) {
      console.error('[Team Broadcast Detail API] Error fetching broadcast:', broadcastError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Broadcast not found',
        },
        { status: 404 }
      );
    }

    // Can only cancel scheduled or draft broadcasts
    if (!['scheduled', 'draft'].includes(broadcast.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Only scheduled or draft broadcasts can be canceled',
        },
        { status: 400 }
      );
    }

    // Update broadcast status to canceled
    const { error: updateError } = await supabase
      .from('team_broadcasts')
      .update({ status: 'canceled' })
      .eq('id', broadcastId);

    if (updateError) {
      console.error('[Team Broadcast Detail API] Error canceling broadcast:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to cancel broadcast',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Broadcast canceled successfully',
    });
  } catch (error: any) {
    console.error('[Team Broadcast Detail API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to cancel broadcast',
      },
      { status: 500 }
    );
  }
}

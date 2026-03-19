import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/team/training/shared/[id]
 * Get training share details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const shareId = params.id;

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
      console.error('[Training Share Detail API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get share details (must be either sender or recipient)
    const { data: share, error: shareError } = await supabase
      .from('training_shares')
      .select('*')
      .eq('id', shareId)
      .or(
        `shared_by_distributor_id.eq.${distributor.id},shared_with_distributor_id.eq.${distributor.id}`
      )
      .single();

    if (shareError || !share) {
      console.error('[Training Share Detail API] Error fetching share:', shareError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Training share not found',
        },
        { status: 404 }
      );
    }

    // If recipient is viewing, mark as accessed
    if (share.shared_with_distributor_id === distributor.id && !share.accessed) {
      await supabase
        .from('training_shares')
        .update({
          accessed: true,
          accessed_at: new Date().toISOString(),
        })
        .eq('id', shareId);

      share.accessed = true;
      share.accessed_at = new Date().toISOString();
    }

    return NextResponse.json({
      success: true,
      share,
    });
  } catch (error: any) {
    console.error('[Training Share Detail API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch training share',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/autopilot/team/training/shared/[id]
 * Update training share progress (recipient only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabase = await createClient();
    const shareId = params.id;

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
      console.error('[Training Share Detail API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get share (must be the recipient)
    const { data: share, error: shareError } = await supabase
      .from('training_shares')
      .select('id, shared_with_distributor_id')
      .eq('id', shareId)
      .eq('shared_with_distributor_id', distributor.id)
      .single();

    if (shareError || !share) {
      console.error('[Training Share Detail API] Error fetching share:', shareError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Training share not found or you are not the recipient',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { watch_progress_percent } = body;

    // Validate progress
    if (
      typeof watch_progress_percent !== 'number' ||
      watch_progress_percent < 0 ||
      watch_progress_percent > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'watch_progress_percent must be between 0 and 100',
        },
        { status: 400 }
      );
    }

    // Update progress
    const updates: any = {
      watch_progress_percent,
      last_watched_at: new Date().toISOString(),
    };

    // Mark as completed if 100%
    if (watch_progress_percent === 100) {
      updates.completed = true;
      updates.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('training_shares')
      .update(updates)
      .eq('id', shareId);

    if (updateError) {
      console.error('[Training Share Detail API] Error updating progress:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to update progress',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      progress: watch_progress_percent,
    });
  } catch (error: any) {
    console.error('[Training Share Detail API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to update progress',
      },
      { status: 500 }
    );
  }
}

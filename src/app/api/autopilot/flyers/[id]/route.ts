import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/flyers/[id]
 * Get single flyer details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          message: 'You must be logged in to view flyers',
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get flyer
    const { data: flyer, error: flyerError } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (flyerError || !flyer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Flyer not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      flyer,
    });
  } catch (error: any) {
    console.error('[Flyers API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch flyer',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/autopilot/flyers/[id]
 * Delete flyer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          message: 'You must be logged in to delete flyers',
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get existing flyer
    const { data: existingFlyer, error: getError } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (getError || !existingFlyer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Flyer not found',
        },
        { status: 404 }
      );
    }

    // Delete flyer
    const { error: deleteError } = await supabase
      .from('event_flyers')
      .delete()
      .eq('id', id)
      .eq('distributor_id', distributor.id);

    if (deleteError) {
      console.error('[Flyers API] Error deleting flyer:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to delete flyer',
        },
        { status: 500 }
      );
    }

    // Decrement usage counter if flyer was successfully generated
    if (existingFlyer.status === 'ready') {
      const { error: usageError } = await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: distributor.id,
        p_limit_type: 'flyers',
        p_increment: -1, // Decrement
      });

      if (usageError) {
        console.error('[Flyers API] Warning: Failed to decrement usage counter:', usageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Flyer deleted successfully',
    });
  } catch (error: any) {
    console.error('[Flyers API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete flyer',
      },
      { status: 500 }
    );
  }
}

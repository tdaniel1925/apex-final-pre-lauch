import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/invitations/[id]
 * Get a single invitation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: invitationId } = await params;

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
          message: 'You must be logged in to view invitations',
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
      console.error('[Invitation API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('distributor_id', distributor.id) // Ensure ownership
      .single();

    if (fetchError || !invitation) {
      console.error('[Invitation API] Error fetching invitation:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Invitation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation,
    });
  } catch (error: any) {
    console.error('[Invitation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch invitation',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/autopilot/invitations/[id]
 * Delete an invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: invitationId } = await params;

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
          message: 'You must be logged in to delete invitations',
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
      console.error('[Invitation API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Delete invitation (verify ownership)
    const { error: deleteError } = await supabase
      .from('meeting_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('distributor_id', distributor.id); // Ensure ownership

    if (deleteError) {
      console.error('[Invitation API] Error deleting invitation:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to delete invitation',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted successfully',
    });
  } catch (error: any) {
    console.error('[Invitation API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete invitation',
      },
      { status: 500 }
    );
  }
}

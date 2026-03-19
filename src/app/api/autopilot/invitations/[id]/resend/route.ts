import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendMeetingInvitationEmail } from '@/lib/email/send-meeting-invitation';
import type { MeetingInvitation } from '@/lib/autopilot/invitation-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/autopilot/invitations/[id]/resend
 * Resend an existing invitation
 */
export async function POST(
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
          message: 'You must be logged in to resend invitations',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Resend API] Error fetching distributor:', distError);
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
      console.error('[Resend API] Error fetching invitation:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Invitation not found',
        },
        { status: 404 }
      );
    }

    // Check if invitation already has a response
    if (invitation.response_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already Responded',
          message: 'This invitation has already been responded to. Cannot resend.',
        },
        { status: 400 }
      );
    }

    // Check if meeting has already passed
    const meetingDate = new Date(invitation.meeting_date_time);
    const now = new Date();
    if (meetingDate < now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Meeting Expired',
          message: 'Cannot resend invitation for a past meeting.',
        },
        { status: 400 }
      );
    }

    // Send email
    const distributorName = `${distributor.first_name} ${distributor.last_name}`;
    const emailResult = await sendMeetingInvitationEmail({
      invitation: invitation as MeetingInvitation,
      distributorName,
    });

    if (!emailResult.success) {
      console.error('[Resend API] Error sending email:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Email Error',
          message: 'Failed to resend invitation email. Please try again.',
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    // Update sent_at timestamp
    const { error: updateError } = await supabase
      .from('meeting_invitations')
      .update({
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('[Resend API] Error updating invitation:', updateError);
      // Don't fail the request since email was sent
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
    });
  } catch (error: any) {
    console.error('[Resend API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to resend invitation',
      },
      { status: 500 }
    );
  }
}

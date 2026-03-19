// =============================================
// Attendance Tracking API
// Marks invitation as attended and sends SMS to distributor
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendAttendanceNotification } from '@/lib/sms/send-attendance-notification';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    invitationId: string;
  }>;
}

/**
 * POST /api/autopilot/attend/[invitationId]
 * Mark invitation as attended and send SMS notification to distributor
 *
 * Features:
 * - Marks invitation as attended with timestamp
 * - Prevents duplicate attendance marking
 * - Sends SMS notification to distributor (if phone configured)
 * - Redirects to actual meeting link
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { invitationId } = await params;
    const supabase = await createClient();

    // Fetch invitation with distributor info
    const { data: invitation, error: fetchError } = await supabase
      .from('meeting_invitations')
      .select(
        `
        id,
        recipient_name,
        recipient_email,
        meeting_title,
        meeting_date_time,
        meeting_link,
        status,
        attended,
        attended_at,
        distributor_id,
        distributors!inner(
          id,
          first_name,
          last_name,
          phone
        )
      `
      )
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      console.error('[Attendance API] Error fetching invitation:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Invitation not found',
        },
        { status: 404 }
      );
    }

    // Check if invitation is expired or canceled
    if (invitation.status === 'expired' || invitation.status === 'canceled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Status',
          message: `This invitation has been ${invitation.status}`,
        },
        { status: 400 }
      );
    }

    // Check if already attended
    const isFirstAttendance = !invitation.attended;

    // Mark as attended
    const { error: updateError } = await supabase
      .from('meeting_invitations')
      .update({
        attended: true,
        attended_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('[Attendance API] Error updating attendance:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Update Failed',
          message: 'Failed to mark attendance',
        },
        { status: 500 }
      );
    }

    // Send SMS notification to distributor (only on first attendance)
    // Note: distributors is returned as an array even with .single() due to !inner join
    const distributor = Array.isArray(invitation.distributors)
      ? invitation.distributors[0]
      : invitation.distributors;

    if (isFirstAttendance && distributor?.phone) {
      const smsResult = await sendAttendanceNotification({
        distributorPhone: distributor.phone,
        recipientName: invitation.recipient_name,
        meetingTitle: invitation.meeting_title,
        meetingDateTime: invitation.meeting_date_time,
      });

      if (!smsResult.success) {
        console.warn('[Attendance API] SMS notification failed:', smsResult.error);
        // Don't fail the request if SMS fails - attendance is still recorded
      } else {
        console.log('[Attendance API] SMS notification sent:', smsResult.messageId);
      }
    }

    // If no meeting link, return success without redirect
    if (!invitation.meeting_link) {
      return NextResponse.json({
        success: true,
        message: 'Attendance recorded',
        attended: true,
      });
    }

    // Redirect to actual meeting link
    return NextResponse.redirect(invitation.meeting_link);
  } catch (error: any) {
    console.error('[Attendance API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to process attendance',
      },
      { status: 500 }
    );
  }
}

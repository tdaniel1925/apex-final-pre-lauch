/**
 * Test Email API Endpoint
 * Sends test invitation email to authenticated user
 * NO database writes, NO quota consumption
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { render } from '@react-email/components';
import { MeetingInvitationEmail } from '@/lib/email/templates/meeting-invitation';
import { sendEmail } from '@/lib/email/resend';
import {
  generateMeetingEntranceLink,
  generateInvitationLink,
  generateTrackingPixelUrl,
  formatMeetingDateTime,
  generateCalendarFile,
  type MeetingInvitation,
} from '@/lib/autopilot/invitation-helpers';
import { z } from 'zod';

// Validation schema for test email request
const testEmailSchema = z.object({
  recipient_name: z.string().min(1),
  recipient_email: z.string().email(),
  meeting_title: z.string().min(1),
  meeting_description: z.string().optional(),
  meeting_date_time: z.string().min(1),
  meeting_location: z.string().optional(),
  meeting_link: z.string().optional(),
  distributor_name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = testEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const {
      recipient_name,
      recipient_email,
      meeting_title,
      meeting_description,
      meeting_date_time,
      meeting_location,
      meeting_link,
      distributor_name,
    } = validationResult.data;

    // Generate temporary invitation ID for test email
    const tempInvitationId = crypto.randomUUID();

    // Generate all links
    const meetingEntranceLink = generateMeetingEntranceLink(tempInvitationId);
    const yesLink = generateInvitationLink(tempInvitationId, 'yes');
    const noLink = generateInvitationLink(tempInvitationId, 'no');
    const maybeLink = generateInvitationLink(tempInvitationId, 'maybe');
    const trackingPixelUrl = generateTrackingPixelUrl(tempInvitationId);

    // Format meeting date/time
    const formattedDateTime = formatMeetingDateTime(meeting_date_time);

    // Generate calendar file
    const testInvitation: Pick<
      MeetingInvitation,
      | 'id'
      | 'meeting_title'
      | 'meeting_description'
      | 'meeting_date_time'
      | 'meeting_location'
      | 'meeting_link'
      | 'recipient_email'
      | 'recipient_name'
    > = {
      id: tempInvitationId,
      meeting_title,
      meeting_description: meeting_description || null,
      meeting_date_time,
      meeting_location: meeting_location || null,
      meeting_link: meeting_link || null,
      recipient_email,
      recipient_name,
    };

    const calendarFile = generateCalendarFile(testInvitation as MeetingInvitation);

    // Render email HTML
    const emailHtml = await render(
      MeetingInvitationEmail({
        recipientName: recipient_name,
        distributorName: distributor_name,
        meetingTitle: meeting_title,
        meetingDescription: meeting_description,
        meetingDateTime: formattedDateTime,
        meetingLocation: meeting_location,
        meetingLink: meetingEntranceLink,
        yesLink,
        noLink,
        maybeLink,
        trackingPixelUrl,
      })
    );

    // Send test email to authenticated user only
    const result = await sendEmail({
      to: recipient_email, // User's email (passed from frontend)
      subject: `[TEST] ${distributor_name} invites you to ${meeting_title}`,
      html: emailHtml,
      from: `${distributor_name} via Apex <theapex@theapexway.net>`,
      attachments: [
        {
          filename: 'meeting.ics',
          content: Buffer.from(calendarFile).toString('base64'),
        },
      ],
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send test email');
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipient_email}`,
    });
  } catch (error) {
    console.error('[Test Email API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

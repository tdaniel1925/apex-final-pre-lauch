/**
 * Invitation Preview API Endpoint
 * Generates preview HTML of meeting invitation email
 * NO database writes, NO quota consumption
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { render } from '@react-email/components';
import { MeetingInvitationEmail } from '@/lib/email/templates/meeting-invitation';
import {
  generateMeetingEntranceLink,
  generateInvitationLink,
  generateTrackingPixelUrl,
  formatMeetingDateTime,
} from '@/lib/autopilot/invitation-helpers';
import { z } from 'zod';

// Validation schema for preview request
const previewSchema = z.object({
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
    const validationResult = previewSchema.safeParse(body);

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

    // Generate temporary invitation ID for link preview
    const tempInvitationId = crypto.randomUUID();

    // Generate all links (these won't work, just for preview)
    const meetingEntranceLink = generateMeetingEntranceLink(tempInvitationId);
    const yesLink = generateInvitationLink(tempInvitationId, 'yes');
    const noLink = generateInvitationLink(tempInvitationId, 'no');
    const maybeLink = generateInvitationLink(tempInvitationId, 'maybe');
    const trackingPixelUrl = generateTrackingPixelUrl(tempInvitationId);

    // Format meeting date/time
    const formattedDateTime = formatMeetingDateTime(meeting_date_time);

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

    // Generate subject line
    const subject = `${distributor_name} invites you to ${meeting_title}`;

    return NextResponse.json({
      success: true,
      subject,
      html: emailHtml,
      entranceLink: meetingEntranceLink,
    });
  } catch (error) {
    console.error('[Preview API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

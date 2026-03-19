// =============================================
// Send Meeting Invitation Email
// Service for sending meeting invitation emails
// =============================================

import { render } from '@react-email/components';
import { MeetingInvitationEmail } from './templates/meeting-invitation';
import { MeetingReminderEmail } from './templates/meeting-reminder';
import { sendEmail } from './resend';
import {
  generateInvitationLink,
  generateTrackingPixelUrl,
  formatMeetingDateTime,
  type MeetingInvitation,
} from '../autopilot/invitation-helpers';

interface SendMeetingInvitationParams {
  invitation: MeetingInvitation;
  distributorName: string;
}

/**
 * Send meeting invitation email
 */
export async function sendMeetingInvitationEmail({
  invitation,
  distributorName,
}: SendMeetingInvitationParams) {
  try {
    // Generate response links
    const yesLink = generateInvitationLink(invitation.id, 'yes');
    const noLink = generateInvitationLink(invitation.id, 'no');
    const maybeLink = generateInvitationLink(invitation.id, 'maybe');
    const trackingPixelUrl = generateTrackingPixelUrl(invitation.id);

    // Format meeting date/time
    const formattedDateTime = formatMeetingDateTime(invitation.meeting_date_time);

    // Render email HTML
    const emailHtml = await render(
      MeetingInvitationEmail({
        recipientName: invitation.recipient_name,
        distributorName,
        meetingTitle: invitation.meeting_title,
        meetingDescription: invitation.meeting_description || undefined,
        meetingDateTime: formattedDateTime,
        meetingLocation: invitation.meeting_location || undefined,
        meetingLink: invitation.meeting_link || undefined,
        yesLink,
        noLink,
        maybeLink,
        trackingPixelUrl,
      })
    );

    // Send email via Resend
    const result = await sendEmail({
      to: invitation.recipient_email,
      subject: `${distributorName} invites you to ${invitation.meeting_title}`,
      html: emailHtml,
      from: `${distributorName} via Apex <theapex@theapexway.net>`,
    });

    return result;
  } catch (error) {
    console.error('[Meeting Invitation Email] Error sending:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

interface SendMeetingReminderParams {
  invitation: MeetingInvitation;
  distributorName: string;
  hoursUntilMeeting: number;
}

/**
 * Send meeting reminder email
 */
export async function sendMeetingReminderEmail({
  invitation,
  distributorName,
  hoursUntilMeeting,
}: SendMeetingReminderParams) {
  try {
    // Format meeting date/time
    const formattedDateTime = formatMeetingDateTime(invitation.meeting_date_time);

    // Render email HTML
    const emailHtml = await render(
      MeetingReminderEmail({
        recipientName: invitation.recipient_name,
        distributorName,
        meetingTitle: invitation.meeting_title,
        meetingDescription: invitation.meeting_description || undefined,
        meetingDateTime: formattedDateTime,
        meetingLocation: invitation.meeting_location || undefined,
        meetingLink: invitation.meeting_link || undefined,
        hoursUntilMeeting,
      })
    );

    // Send email via Resend
    const result = await sendEmail({
      to: invitation.recipient_email,
      subject: `Reminder: ${invitation.meeting_title} is in ${hoursUntilMeeting} hours`,
      html: emailHtml,
      from: `${distributorName} via Apex <theapex@theapexway.net>`,
    });

    return result;
  } catch (error) {
    console.error('[Meeting Reminder Email] Error sending:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// =============================================
// Send Meeting Invitation Email
// Service for sending meeting invitation emails
// =============================================

import { render } from '@react-email/components';
import { MeetingInvitationEmail } from './templates/meeting-invitation';
import { MeetingReminderEmail } from './templates/meeting-reminder';
import { sendEmail } from './resend';
import {
  generateMeetingEntranceLink,
  generateInvitationLink,
  generateTrackingPixelUrl,
  formatMeetingDateTime,
  generateCalendarFile,
  type MeetingInvitation,
} from '../autopilot/invitation-helpers';

interface SendMeetingInvitationParams {
  invitation: MeetingInvitation;
  distributorName: string;
  customSubject?: string;
  customHtml?: string;
}

/**
 * Send meeting invitation email with calendar attachment
 * @param invitation - The invitation record with meeting details
 * @param distributorName - Full name of the distributor sending the invitation
 * @param customSubject - Optional custom email subject (edited in preview)
 * @param customHtml - Optional custom email body HTML (edited in preview)
 * @returns Result object with success status
 */
export async function sendMeetingInvitationEmail({
  invitation,
  distributorName,
  customSubject,
  customHtml,
}: SendMeetingInvitationParams) {
  try {
    // Generate entrance page link (invitees click this to enter the meeting)
    const meetingEntranceLink = generateMeetingEntranceLink(invitation.id);

    // Generate response links (for Yes/No/Maybe)
    const yesLink = generateInvitationLink(invitation.id, 'yes');
    const noLink = generateInvitationLink(invitation.id, 'no');
    const maybeLink = generateInvitationLink(invitation.id, 'maybe');
    const trackingPixelUrl = generateTrackingPixelUrl(invitation.id);

    // Format meeting date/time
    const formattedDateTime = formatMeetingDateTime(invitation.meeting_date_time);

    // Generate calendar file for easy calendar import
    const calendarFile = generateCalendarFile(invitation);

    // Render email HTML (use custom if provided, otherwise generate from template)
    // Note: Use meetingEntranceLink instead of direct meeting link
    // This ensures we track attendance when users click "Enter Room"
    const emailHtml = customHtml || await render(
      MeetingInvitationEmail({
        recipientName: invitation.recipient_name,
        distributorName,
        meetingTitle: invitation.meeting_title,
        meetingDescription: invitation.meeting_description || undefined,
        meetingDateTime: formattedDateTime,
        meetingLocation: invitation.meeting_location || undefined,
        meetingLink: meetingEntranceLink, // Use entrance page instead of direct meeting link
        yesLink,
        noLink,
        maybeLink,
        trackingPixelUrl,
      })
    );

    // Send email via Resend with calendar attachment
    const result = await sendEmail({
      to: invitation.recipient_email,
      subject: customSubject || `${distributorName} invites you to ${invitation.meeting_title}`,
      html: emailHtml,
      from: `${distributorName} via Apex <theapex@theapexway.net>`,
      attachments: [
        {
          filename: 'meeting.ics',
          content: Buffer.from(calendarFile).toString('base64'),
        },
      ],
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

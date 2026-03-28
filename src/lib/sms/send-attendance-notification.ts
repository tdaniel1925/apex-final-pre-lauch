// =============================================
// Send Attendance SMS Notification
// Notify distributors when invitees attend meetings
// =============================================

import { getTwilioClient, getTwilioPhoneNumber, isTwilioConfigured } from '../twilio/client';

interface SendAttendanceNotificationParams {
  distributorPhone: string;
  recipientName: string;
  meetingTitle: string;
  meetingDateTime: string;
}

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS notification to distributor when invitee attends meeting
 * @param distributorPhone - Distributor's phone number (must be E.164 format: +1234567890)
 * @param recipientName - Name of the person who attended
 * @param meetingTitle - Title of the meeting they attended
 * @param meetingDateTime - Date/time of the meeting
 * @returns Result object with success status
 */
export async function sendAttendanceNotification({
  distributorPhone,
  recipientName,
  meetingTitle,
  meetingDateTime,
}: SendAttendanceNotificationParams): Promise<SendSMSResponse> {
  try {
    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      console.warn('[Attendance SMS] Twilio not configured, skipping SMS notification');
      return {
        success: false,
        error: 'Twilio not configured',
      };
    }

    const twilioClient = getTwilioClient();
    const fromPhoneNumber = getTwilioPhoneNumber();

    if (!twilioClient || !fromPhoneNumber) {
      console.error('[Attendance SMS] Twilio client or phone number not available');
      return {
        success: false,
        error: 'Twilio not properly configured',
      };
    }

    // Format the meeting date/time
    const meetingDate = new Date(meetingDateTime);
    const formattedDateTime = meetingDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Compose SMS message
    const messageBody = `🎉 ${recipientName} just joined your meeting "${meetingTitle}" scheduled for ${formattedDateTime}!`;

    // Send SMS via Twilio
    const message = await twilioClient.messages.create({
      to: distributorPhone,
      from: fromPhoneNumber,
      body: messageBody,
    });

    console.log('[Attendance SMS] Successfully sent:', {
      to: distributorPhone,
      messageId: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('[Attendance SMS] Error sending:', error);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}

/**
 * Validate phone number format (E.164)
 * @param phone - Phone number to validate
 * @returns true if valid E.164 format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Example: +12345678900
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

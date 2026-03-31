// =============================================
// Onboarding Email Functions
// Send booking confirmations and reminders
// =============================================

import { sendEmail } from './resend';
import { promises as fs } from 'fs';
import path from 'path';

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  bookingDate: string; // Formatted date (e.g., "Monday, March 25, 2026")
  bookingTime: string; // Formatted time (e.g., "2:00 PM")
  meetingLink?: string; // Dialpad meeting link
  repEmail?: string; // Rep's email address for CC
}

/**
 * Load and merge email templates
 */
async function loadTemplate(
  contentTemplateName: string,
  variables: Record<string, string>
): Promise<string> {
  try {
    // Load base template
    const basePath = path.join(
      process.cwd(),
      'src/lib/email/templates/base-email-template.html'
    );
    const baseTemplate = await fs.readFile(basePath, 'utf-8');

    // Load content template
    const contentPath = path.join(
      process.cwd(),
      `src/lib/email/templates/${contentTemplateName}`
    );
    const contentTemplate = await fs.readFile(contentPath, 'utf-8');

    // Merge templates
    let finalHtml = baseTemplate.replace('{{email_content}}', contentTemplate);

    // Replace all variables
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      finalHtml = finalHtml.replace(regex, variables[key]);
    });

    // Replace any remaining placeholders with empty string
    finalHtml = finalHtml.replace(/{{.*?}}/g, '');

    return finalHtml;
  } catch (error) {
    console.error('Error loading email template:', error);
    throw error;
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const meetingLink = data.meetingLink || 'https://meetings.dialpad.com/room/aicallers';

    const html = await loadTemplate('booking-confirmation.html', {
      email_title: 'Onboarding Session Confirmed',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      meeting_link: meetingLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    // Send to customer
    const customerResult = await sendEmail({
      to: data.customerEmail,
      subject: 'Your Onboarding Session is Confirmed!',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    // Send to rep if email provided
    if (data.repEmail) {
      await sendEmail({
        to: data.repEmail,
        subject: `Client Onboarding Scheduled: ${data.customerName}`,
        html,
        from: 'Apex Affinity Group <support@theapexway.net>',
      });
    }

    // Send to BotMakers
    await sendEmail({
      to: 'botmakers@theapexway.net',
      subject: `New Onboarding: ${data.customerName} - ${data.bookingDate} ${data.bookingTime}`,
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    return customerResult;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send 24-hour reminder email
 */
export async function send24HourReminder(
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const meetingLink = data.meetingLink || 'https://meetings.dialpad.com/room/aicallers';

    const html = await loadTemplate('booking-reminder-24h.html', {
      email_title: 'Your Session is Tomorrow!',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      meeting_link: meetingLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Reminder: Your Onboarding Session is Tomorrow',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    // Also send to rep if provided
    if (data.repEmail) {
      await sendEmail({
        to: data.repEmail,
        subject: `Reminder: Client Session Tomorrow - ${data.customerName}`,
        html,
        from: 'Apex Affinity Group <support@theapexway.net>',
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending 24h reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send 4-hour reminder email
 */
export async function send4HourReminder(
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const meetingLink = data.meetingLink || 'https://meetings.dialpad.com/room/aicallers';

    const html = await loadTemplate('booking-reminder-4h.html', {
      email_title: 'Your Session is in 4 Hours!',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      meeting_link: meetingLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Reminder: Your Onboarding Session in 4 Hours',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    return result;
  } catch (error) {
    console.error('Error sending 4h reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send 15-minute reminder email
 */
export async function send15MinuteReminder(
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const meetingLink = data.meetingLink || 'https://meetings.dialpad.com/room/aicallers';

    const html = await loadTemplate('booking-reminder-15m.html', {
      email_title: 'Your Session Starts in 15 Minutes!',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      meeting_link: meetingLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Starting Soon: Your Onboarding Session in 15 Minutes',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    // Also send to BotMakers for immediate alert
    await sendEmail({
      to: 'botmakers@theapexway.net',
      subject: `Session Starting: ${data.customerName} - In 15 Minutes`,
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    return result;
  } catch (error) {
    console.error('Error sending 15m reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

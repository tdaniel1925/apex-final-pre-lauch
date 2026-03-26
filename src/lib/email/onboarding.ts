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
  zoomLink?: string; // Optional - only needed for reminders
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
    const html = await loadTemplate('booking-confirmation.html', {
      email_title: 'Onboarding Session Confirmed',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Your Onboarding Session is Confirmed!',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    return result;
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
  if (!data.zoomLink) {
    return { success: false, error: 'Zoom link required for reminder' };
  }

  try {
    const html = await loadTemplate('booking-reminder-24h.html', {
      email_title: 'Your Session is Tomorrow!',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      zoom_link: data.zoomLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Reminder: Your Onboarding Session is Tomorrow',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

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
 * Send 1-hour reminder email
 */
export async function send1HourReminder(
  data: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!data.zoomLink) {
    return { success: false, error: 'Zoom link required for reminder' };
  }

  try {
    const html = await loadTemplate('booking-reminder-1h.html', {
      email_title: 'Your Session Starts in 1 Hour!',
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      zoom_link: data.zoomLink,
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    });

    const result = await sendEmail({
      to: data.customerEmail,
      subject: 'Starting Soon: Your Onboarding Session in 1 Hour',
      html,
      from: 'Apex Affinity Group <support@theapexway.net>',
    });

    return result;
  } catch (error) {
    console.error('Error sending 1h reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

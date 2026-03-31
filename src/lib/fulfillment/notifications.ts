// =============================================
// Fulfillment Notification System
// Send emails and create notifications for stage changes
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from '@/lib/email/resend';

const STAGE_LABELS: Record<string, string> = {
  service_payment_made: 'Payment Made',
  onboarding_date_set: 'Onboarding Scheduled',
  onboarding_complete: 'Onboarding Complete',
  pages_being_built: 'Building Pages',
  social_media_proofs: 'Creating Proofs',
  content_approved: 'Content Approved',
  campaigns_launched: 'Campaigns Live',
  service_completed: 'Completed',
};

interface StageChangeNotificationParams {
  fulfillmentId: string;
  distributorId: string;
  clientName: string;
  productSlug: string;
  newStage: string;
  notes?: string;
}

/**
 * Send email notification to rep about client stage change
 */
export async function sendFulfillmentStageChangeEmail({
  fulfillmentId,
  distributorId,
  clientName,
  productSlug,
  newStage,
  notes,
}: StageChangeNotificationParams) {
  const supabase = createServiceClient();

  try {
    // Get distributor details
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('first_name, last_name, email')
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      console.error('Distributor not found:', distError);
      return { success: false, error: 'Distributor not found' };
    }

    // Get product name from product slug
    const productName = formatProductName(productSlug);
    const stageLabel = STAGE_LABELS[newStage] || newStage;

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Progress Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2c5aa0; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Client Progress Update
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #212529; font-size: 16px; line-height: 1.6;">
                Hi ${distributor.first_name},
              </p>

              <p style="margin: 0 0 30px 0; color: #212529; font-size: 16px; line-height: 1.6;">
                Your client <strong>${clientName}</strong> has moved to a new stage in the fulfillment process.
              </p>

              <!-- Client Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Client:
                        </td>
                        <td style="padding: 8px 0; color: #212529; font-size: 14px; text-align: right;">
                          ${clientName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Product:
                        </td>
                        <td style="padding: 8px 0; color: #212529; font-size: 14px; text-align: right;">
                          ${productName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Current Stage:
                        </td>
                        <td style="padding: 8px 0; color: #2c5aa0; font-size: 14px; font-weight: 600; text-align: right;">
                          ${stageLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Updated:
                        </td>
                        <td style="padding: 8px 0; color: #212529; font-size: 14px; text-align: right;">
                          ${new Date().toLocaleString()}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${
                notes
                  ? `
              <!-- Admin Notes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <p style="margin: 0 0 5px 0; color: #856404; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      Admin Notes:
                    </p>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      ${notes}
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/my-clients"
                       style="display: inline-block; padding: 14px 32px; background-color: #2c5aa0; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      View Client Details
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                You can view full client details and fulfillment progress in your dashboard.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                Apex Affinity Group<br>
                Building the future of AI-powered business
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email
    const emailResult = await sendEmail({
      to: distributor.email,
      subject: `Client Progress Update: ${clientName} - ${productName}`,
      html: emailHtml,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (!emailResult.success) {
      console.error('Failed to send stage change email:', emailResult.error);
    }

    // Create activity feed entry
    await createActivityFeedEntry({
      distributorId,
      clientName,
      productSlug,
      newStage,
    });

    // Create notification
    await createNotification({
      distributorId,
      clientName,
      stageLabel,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending fulfillment notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create activity feed entry
 */
async function createActivityFeedEntry({
  distributorId,
  clientName,
  productSlug,
  newStage,
}: {
  distributorId: string;
  clientName: string;
  productSlug: string;
  newStage: string;
}) {
  const supabase = createServiceClient();

  try {
    const stageLabel = STAGE_LABELS[newStage] || newStage;
    const productName = formatProductName(productSlug);

    await supabase.from('activity_feed').insert({
      distributor_id: distributorId,
      activity_type: 'client_progress',
      title: `Client moved to ${stageLabel}`,
      description: `${clientName} - ${productName}`,
      metadata: {
        client_name: clientName,
        product_slug: productSlug,
        stage: newStage,
        stage_label: stageLabel,
      },
      link: '/dashboard/my-clients',
    });
  } catch (error) {
    console.error('Error creating activity feed entry:', error);
  }
}

/**
 * Create notification in notifications table
 */
async function createNotification({
  distributorId,
  clientName,
  stageLabel,
}: {
  distributorId: string;
  clientName: string;
  stageLabel: string;
}) {
  const supabase = createServiceClient();

  try {
    // Get distributor's auth user ID
    const { data: distributor } = await supabase
      .from('distributors')
      .select('auth_user_id')
      .eq('id', distributorId)
      .single();

    if (!distributor?.auth_user_id) {
      console.error('No auth_user_id found for distributor');
      return;
    }

    await supabase.from('notifications').insert({
      user_id: distributor.auth_user_id,
      type: 'client_progress',
      title: 'Client Progress Update',
      message: `${clientName} moved to ${stageLabel}`,
      link: '/dashboard/my-clients',
      read: false,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Format product slug to readable name
 */
function formatProductName(slug: string): string {
  const productNames: Record<string, string> = {
    'ai-employee-standard': 'AI Employee - Standard',
    'ai-employee-pro': 'AI Employee - Pro',
    'ai-employee-enterprise': 'AI Employee - Enterprise',
    'social-media-management': 'Social Media Management',
    'landing-page-builder': 'Landing Page Builder',
    'business-center': 'Business Center Subscription',
  };

  return productNames[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Send onboarding reminder emails
 */
export async function sendOnboardingReminder(
  bookingId: string,
  reminderType: '24h' | '4h' | '15m'
) {
  const supabase = createServiceClient();

  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('client_onboarding')
      .select(
        `
        *,
        distributor:distributors!client_onboarding_distributor_id_fkey(
          first_name,
          last_name,
          email
        )
      `
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return { success: false, error: 'Booking not found' };
    }

    const reminderTimes = {
      '24h': '24 hours',
      '4h': '4 hours',
      '15m': '15 minutes',
    };

    const timeUntil = reminderTimes[reminderType];

    // Send to rep
    const repEmailHtml = createReminderEmail({
      recipientName: booking.distributor.first_name,
      clientName: booking.client_name,
      onboardingDate: booking.onboarding_date,
      meetingLink: booking.meeting_link,
      timeUntil,
    });

    await sendEmail({
      to: booking.distributor.email,
      subject: `Onboarding Reminder: ${booking.client_name} in ${timeUntil}`,
      html: repEmailHtml,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    // Send to client
    const clientEmailHtml = createReminderEmail({
      recipientName: booking.client_name,
      clientName: booking.client_name,
      onboardingDate: booking.onboarding_date,
      meetingLink: booking.meeting_link,
      timeUntil,
    });

    await sendEmail({
      to: booking.client_email,
      subject: `Onboarding Session Reminder: ${timeUntil}`,
      html: clientEmailHtml,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending onboarding reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create reminder email HTML
 */
function createReminderEmail({
  recipientName,
  clientName,
  onboardingDate,
  meetingLink,
  timeUntil,
}: {
  recipientName: string;
  clientName: string;
  onboardingDate: string;
  meetingLink: string;
  timeUntil: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2c5aa0; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                Onboarding Session Reminder
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #212529; font-size: 16px; line-height: 1.6;">
                Hi ${recipientName},
              </p>

              <p style="margin: 0 0 30px 0; color: #212529; font-size: 16px; line-height: 1.6;">
                This is a reminder that your onboarding session with <strong>${clientName}</strong> is scheduled in <strong>${timeUntil}</strong>.
              </p>

              <!-- Session Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Date & Time:
                        </td>
                        <td style="padding: 8px 0; color: #212529; font-size: 14px; text-align: right;">
                          ${new Date(onboardingDate).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600;">
                          Time Until:
                        </td>
                        <td style="padding: 8px 0; color: #2c5aa0; font-size: 14px; font-weight: 600; text-align: right;">
                          ${timeUntil}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${meetingLink}"
                       style="display: inline-block; padding: 14px 32px; background-color: #2c5aa0; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Join Meeting
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                Meeting Link: <a href="${meetingLink}" style="color: #2c5aa0; text-decoration: none;">${meetingLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                Apex Affinity Group<br>
                Building the future of AI-powered business
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

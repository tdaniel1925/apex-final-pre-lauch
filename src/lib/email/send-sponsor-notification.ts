// =============================================
// Sponsor Notification Email
// Notifies sponsor when new distributor joins their downline
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { sendEmail } from './resend';
import type { Distributor } from '@/lib/types';

interface SponsorNotificationParams {
  newDistributor: Distributor;
  sponsorId: string;
}

interface SponsorNotificationResponse {
  success: boolean;
  error?: string;
}

/**
 * Send notification email to sponsor when new distributor joins
 */
export async function sendSponsorNotification({
  newDistributor,
  sponsorId,
}: SponsorNotificationParams): Promise<SponsorNotificationResponse> {
  try {
    const serviceClient = createServiceClient();

    // Get sponsor details
    const { data: sponsor, error: sponsorError } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, email, slug')
      .eq('id', sponsorId)
      .single();

    if (sponsorError || !sponsor) {
      console.error('Sponsor not found:', sponsorError);
      return {
        success: false,
        error: 'Sponsor not found',
      };
    }

    // Build email HTML
    const subject = `New Team Member: ${newDistributor.first_name} ${newDistributor.last_name} Joined Your Downline`;
    const html = buildSponsorNotificationHTML({
      sponsor,
      newDistributor,
    });

    // Send email
    const sendResult = await sendEmail({
      to: sponsor.email,
      subject,
      html,
    });

    if (!sendResult.success) {
      console.error('Failed to send sponsor notification:', sendResult.error);
      return {
        success: false,
        error: sendResult.error,
      };
    }

    // Log the notification send
    await serviceClient
      .from('email_sends')
      .insert({
        distributor_id: sponsor.id,
        template_id: null, // Not part of campaign
        campaign_id: null,
        email_address: sponsor.email,
        subject,
        body: html,
        sequence_step: null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: sendResult.id || null,
      });

    return { success: true };
  } catch (error) {
    console.error('Sponsor notification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build HTML email for sponsor notification
 */
function buildSponsorNotificationHTML({
  sponsor,
  newDistributor,
}: {
  sponsor: { first_name: string; last_name: string; slug: string };
  newDistributor: Distributor;
}): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'}/dashboard/team`;
  const newRepProfileUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3050'}/dashboard/team/${newDistributor.id}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Team Member</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1B3A7D 0%, #0f172a 100%); padding: 40px 40px 30px 40px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">
                🎉 Congratulations!
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${sponsor.first_name}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Great news! A new team member has joined your downline:
              </p>

              <!-- New Member Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 2px solid #1B3A7D; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="80" valign="top">
                          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1B3A7D 0%, #294A8C 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
                            ${newDistributor.first_name.charAt(0)}${newDistributor.last_name.charAt(0)}
                          </div>
                        </td>
                        <td valign="top">
                          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: bold; color: #1B3A7D;">
                            ${newDistributor.first_name} ${newDistributor.last_name}
                          </h3>
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                            <strong>Email:</strong> ${newDistributor.email}
                          </p>
                          ${newDistributor.phone ? `
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                            <strong>Phone:</strong> ${newDistributor.phone}
                          </p>
                          ` : ''}
                          <p style="margin: 0 0 4px 0; font-size: 14px; color: #64748b;">
                            <strong>Status:</strong> <span style="background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Active</span>
                          </p>
                          <p style="margin: 0; font-size: 14px; color: #64748b;">
                            <strong>Joined:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                As their sponsor, here's what you should do next:
              </p>

              <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #333333;">
                <li><strong>Reach out and welcome them</strong> - A personal call or message goes a long way</li>
                <li><strong>Schedule an onboarding call</strong> - Help them get started on the right foot</li>
                <li><strong>Share training resources</strong> - Point them to the training center</li>
                <li><strong>Set up their first goals</strong> - Work with them to create an action plan</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #1B3A7D; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(27, 58, 125, 0.2);">
                      View Your Team Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 1.6; color: #64748b; text-align: center;">
                Your team is growing! Keep up the great work.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; text-align: center;">
                <strong>Apex Affinity Group</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                Building success together, one team member at a time
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

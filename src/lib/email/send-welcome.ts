// =============================================
// Send Welcome Email with Login Credentials
// Called when a new distributor signs up
// =============================================

import { sendEmail } from './resend';
import type { Distributor } from '@/lib/types';

/**
 * Send welcome email to new distributor with login credentials
 * This is separate from the prospect nurture campaign system
 */
export async function sendWelcomeEmail(
  distributor: Pick<Distributor, 'id' | 'first_name' | 'last_name' | 'email'>
): Promise<{
  success: boolean;
  error?: string;
  emailId?: string;
}> {
  try {
    const { first_name, email } = distributor;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Apex Affinity Group</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #ffffff;">
              <img src="https://reachtheapex.net/apex-logo-email.png" alt="Apex Affinity Group" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                Welcome to Apex Affinity Group, ${first_name}!
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We're thrilled to have you join our team! Your journey to building a successful insurance business starts now.
              </p>

              <!-- Login Credentials Box -->
              <div style="margin: 24px 0; padding: 20px; background: #F3F4F6; border-left: 4px solid #2B4C7E; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #2B4C7E; font-size: 14px;">
                  🔑 Your Login Credentials
                </p>
                <p style="margin: 0 0 12px; color: #374151; font-size: 13px;">
                  Use these credentials to access your back office:
                </p>
                <div style="margin: 8px 0;">
                  <p style="margin: 0 0 4px; color: #6B7280; font-size: 12px; font-weight: 600;">
                    Username:
                  </p>
                  <p style="margin: 0 0 12px; font-family: monospace; font-size: 14px; color: #2B4C7E; font-weight: 600;">
                    ${email}
                  </p>
                  <p style="margin: 0 0 4px; color: #6B7280; font-size: 12px; font-weight: 600;">
                    Login URL:
                  </p>
                  <p style="margin: 0; font-size: 14px;">
                    <a href="https://reachtheapex.net/dashboard" style="color: #2B4C7E; text-decoration: none; font-weight: 600;">
                      https://reachtheapex.net/dashboard
                    </a>
                  </p>
                </div>
              </div>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Here's what you can do next:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #555555;">
                <li><strong>Complete Your Profile:</strong> Add your photo and bio to build trust with prospects</li>
                <li><strong>Get Your Replicated Site:</strong> Share your personalized link to start recruiting</li>
                <li><strong>Submit Your License:</strong> Upload your insurance license for verification</li>
                <li><strong>Build Your Team:</strong> Invite others and start earning immediately</li>
              </ul>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://reachtheapex.net/dashboard" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                If you have any questions, don't hesitate to reach out to your sponsor or our support team.
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Welcome aboard!<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
              </p>

              <p style="margin: 16px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                You received this email because you created an account with Apex Affinity Group.
              </p>

              <p style="margin: 12px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Apex Affinity Group. All rights reserved.
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

    // Send via Resend
    const result = await sendEmail({
      to: email,
      subject: `Welcome to Apex Affinity Group, ${first_name}!`,
      html,
    });

    return result;
  } catch (error) {
    console.error('[WELCOME_EMAIL] Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

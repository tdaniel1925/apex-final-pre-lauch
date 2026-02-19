// =============================================
// Test Email Script
// Sends a test email to verify email configuration
// =============================================

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { sendEmail } from '../src/lib/email/resend';

async function testEmail() {
  console.log('📧 Sending test email...\n');

  const result = await sendEmail({
    to: 'tdaniel@botmakers.ai',
    subject: 'Test Email - Apex Affinity Group',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                <!-- Logo Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
                    <img src="https://reachtheapex.net/apex-logo-email.png" alt="Apex Affinity Group" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 20px 40px 40px; color: #333333;">
                    <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                      Test Email ✅
                    </h1>

                    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                      This is a test email from the Apex Affinity Group email system.
                    </p>

                    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                      <strong>Email Configuration:</strong>
                    </p>

                    <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #555555;">
                      <li><strong>From:</strong> Apex Affinity Group &lt;noreply@reachtheapex.net&gt;</li>
                      <li><strong>To:</strong> tdaniel@botmakers.ai</li>
                      <li><strong>Provider:</strong> Resend</li>
                      <li><strong>Domain:</strong> reachtheapex.net (verified)</li>
                    </ul>

                    <div style="background: #f0f9ff; border-left: 4px solid #2B4C7E; padding: 16px; margin: 24px 0;">
                      <p style="margin: 0; font-size: 14px; color: #1e3a5f;">
                        <strong>✅ Success!</strong> If you're reading this, your email system is configured correctly and working perfectly.
                      </p>
                    </div>

                    <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                      <strong>Next Steps:</strong><br>
                      You can now send welcome emails, photo alerts, and other automated emails to your distributors.
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
                      This is a test email from the Apex Affinity Group platform.
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
    `,
  });

  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result.id);
    console.log('📬 Recipient: tdaniel@botmakers.ai');
    console.log('\n💡 Check your inbox!');
  } else {
    console.error('❌ Failed to send test email');
    console.error('Error:', result.error);
  }
}

testEmail();

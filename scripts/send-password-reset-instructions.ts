// Send password reset instructions to Phil Resch
import { sendEmail } from '../src/lib/email/resend';
import { readFileSync } from 'fs';
import { join } from 'path';

async function sendPasswordResetInstructions() {
  console.log('📧 Sending password reset instructions to Phil Resch...\n');

  // Load base template
  const baseTemplate = readFileSync(
    join(process.cwd(), 'src/lib/email/templates/base-email-template.html'),
    'utf-8'
  );

  // Create email content
  const emailContent = `
    <h2 style="color: #212529; margin: 0 0 20px; font-size: 24px; font-weight: 700; line-height: 1.3;">
      Password Reset Instructions
    </h2>

    <p style="color: #495057; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      Hello Phil,
    </p>

    <p style="color: #495057; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
      You can reset your password for your Apex Affinity Group account by following these steps:
    </p>

    <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #2c5aa0; margin: 0 0 25px;">
      <p style="color: #212529; font-size: 15px; font-weight: 600; margin: 0 0 15px;">
        Step 1: Visit the Password Reset Page
      </p>
      <p style="color: #495057; font-size: 15px; line-height: 1.7; margin: 0 0 10px;">
        Go to: <a href="https://reachtheapex.net/reset-password" style="color: #2c5aa0; text-decoration: none; font-weight: 600;">https://reachtheapex.net/reset-password</a>
      </p>

      <p style="color: #212529; font-size: 15px; font-weight: 600; margin: 20px 0 15px;">
        Step 2: Enter Your Email Address
      </p>
      <p style="color: #495057; font-size: 15px; line-height: 1.7; margin: 0 0 10px;">
        Use your registered email: <strong>phil@valorfs.com</strong>
      </p>

      <p style="color: #212529; font-size: 15px; font-weight: 600; margin: 20px 0 15px;">
        Step 3: Check Your Inbox
      </p>
      <p style="color: #495057; font-size: 15px; line-height: 1.7; margin: 0;">
        You will receive a password reset link via email within a few minutes. Click the link to create your new password.
      </p>
    </div>

    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 0 0 30px;">
      <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">
        <strong>Security Note:</strong> The password reset link will expire in 1 hour for your security. If you did not request this information, please disregard this email.
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0;">
      <tr>
        <td align="center">
          <a href="https://reachtheapex.net/reset-password" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 700;">
            Reset Password Now
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #6c757d; font-size: 14px; line-height: 1.7; margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you have any questions or need assistance, please contact our support team at <a href="mailto:support@theapexway.net" style="color: #2c5aa0; text-decoration: none;">support@theapexway.net</a>
    </p>

    <p style="color: #6c757d; font-size: 14px; line-height: 1.7; margin: 15px 0 0;">
      Best regards,<br/>
      <strong style="color: #495057;">The Apex Team</strong>
    </p>
  `;

  // Merge templates
  const emailHtml = baseTemplate
    .replace('{{email_title}}', 'Password Reset Instructions - Apex Affinity Group')
    .replace('{{email_content}}', emailContent)
    .replace('{{unsubscribe_url}}', 'https://theapexway.net/unsubscribe');

  try {
    // Send email using Resend
    const result = await sendEmail({
      from: 'Apex Support <support@theapexway.net>',
      to: 'phil@valorfs.com',
      subject: 'Password Reset Instructions - Apex Affinity Group',
      html: emailHtml,
    });

    if (!result.success) {
      console.error('❌ Failed to send email:', result.error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', result.id);
    console.log('   Recipient:', 'phil@valorfs.com');
    console.log('   Subject: Password Reset Instructions\n');

  } catch (error) {
    console.error('❌ Error sending email:', error);
    process.exit(1);
  }
}

sendPasswordResetInstructions();

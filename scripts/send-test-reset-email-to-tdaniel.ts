// Send test password reset email to tdaniel@botmakers.ai
import { createServiceClient } from '../src/lib/supabase/service';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestResetEmail() {
  console.log('📧 Sending test password reset email to tdaniel@botmakers.ai...\n');

  const supabase = createServiceClient();

  // Get Apex Vision account for test data
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id')
    .eq('email', 'tdaniel@bundelefly.com')
    .single();

  if (!distributor || !distributor.auth_user_id) {
    console.error('❌ Apex Vision account not found');
    return;
  }

  console.log('✅ Using data from:', distributor.first_name, distributor.last_name);

  // Generate test token (we won't store this one, just for email preview)
  const token = crypto.randomBytes(32).toString('hex');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  // Send Apex-branded email to tdaniel@botmakers.ai
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
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
                Reset Your Password
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Hi ${distributor.first_name},
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We received a request to reset your password for your Apex Affinity Group account.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">
                Click the button below to reset your password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                This link will expire in 1 hour for security reasons.
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Thanks,<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
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

  try {
    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity Group <aag@theapexway.net>',
      to: ['tdaniel@botmakers.ai'],
      subject: 'Reset Your Password - Apex Affinity Group',
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log('   To: tdaniel@botmakers.ai');
    console.log('   From: Apex Affinity Group <aag@theapexway.net>');
    console.log('   Email ID:', data?.id);
    console.log('\n📧 Check your inbox for the Apex-branded password reset email!');
    console.log('\n⚠️  Note: This is a test token - it won\'t actually work to reset password.');
    console.log('    This is just to show you the email design.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendTestResetEmail().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

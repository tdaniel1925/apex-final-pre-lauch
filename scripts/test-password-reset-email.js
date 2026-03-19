const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

async function testPasswordResetEmail() {
  const email = 'tdaniel@bundlefly.com';

  console.log('Testing password reset email for:', email);
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌');
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'Not set (will use localhost)');
  console.log('');

  // Get distributor
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id')
    .eq('email', email)
    .single();

  if (distError) {
    console.log('❌ Error finding distributor:', distError.message);
    return;
  }

  console.log('✅ Found distributor:', distributor.first_name, distributor.last_name);

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  console.log('Generated token:', token.substring(0, 20) + '...');

  // Store token
  const { error: tokenError } = await supabase
    .from('password_reset_tokens')
    .insert({
      user_id: distributor.auth_user_id,
      token: token,
      expires_at: expiresAt.toISOString(),
      used: false
    });

  if (tokenError) {
    console.log('❌ Error creating token:', tokenError.message);
    return;
  }

  console.log('✅ Token stored in database');

  // Build reset link - USE PRODUCTION URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reachtheapex.net';
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  console.log('Reset link:', resetLink);
  console.log('');

  // Build email HTML
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
          <tr>
            <td style="padding: 40px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <h1 style="color: #1B3A7D; font-size: 24px; margin: 0;">Apex Affinity Group</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #1B3A7D; text-align: center;">Reset Your Password</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">Hi ${distributor.first_name},</p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">We received a request to reset your password for your Apex Affinity Group account.</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">Click the button below to reset your password:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #1B3A7D; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">Reset My Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">This link will expire in 1 hour for security reasons.</p>
              <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">If you didn't request a password reset, you can safely ignore this email.</p>
              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">Thanks,<br><strong>The Apex Affinity Group Team</strong></p>
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
  console.log('Sending email via Resend...');
  try {
    const { data, error: emailError } = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: [email],
      subject: 'Reset Your Password - Apex Affinity Group',
      html: emailHtml,
    });

    if (emailError) {
      console.log('❌ Email send error:', emailError);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', data.id);
    console.log('\nCheck your inbox at:', email);
    console.log('The reset link is:', resetLink);
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testPasswordResetEmail().catch(console.error);

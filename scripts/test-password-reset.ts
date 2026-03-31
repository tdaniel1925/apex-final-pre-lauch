/**
 * Test Password Reset Flow
 *
 * Tests the complete password reset flow for Phil Resch:
 * 1. Check if account exists in distributors table
 * 2. Test sending reset email
 * 3. Verify all required data is present
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

async function testPasswordReset() {
  console.log('🔍 Testing Password Reset Flow for Phil Resch...\n');

  const philEmail = 'phil@valorfs.com';

  // Step 1: Check if Phil exists in distributors table
  console.log('Step 1: Checking distributors table...');
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id')
    .eq('email', philEmail.toLowerCase())
    .single();

  if (distError) {
    console.error('❌ Error querying distributors:', distError);
    return;
  }

  if (!distributor) {
    console.log('❌ Phil Resch NOT found in distributors table');
    console.log('   Email searched:', philEmail);
    return;
  }

  console.log('✅ Phil found in distributors table:');
  console.log('   ID:', distributor.id);
  console.log('   Name:', `${distributor.first_name} ${distributor.last_name}`);
  console.log('   Email:', distributor.email);
  console.log('   Auth User ID:', distributor.auth_user_id || '❌ MISSING!');

  if (!distributor.auth_user_id) {
    console.log('\n❌ PROBLEM: auth_user_id is NULL');
    console.log('   Phil cannot reset password without auth_user_id');
    console.log('   This links the distributor record to auth.users');
    return;
  }

  // Step 2: Check if auth user exists
  console.log('\nStep 2: Checking auth.users table...');
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
    distributor.auth_user_id
  );

  if (authError) {
    console.error('❌ Error querying auth.users:', authError);
    return;
  }

  console.log('✅ Auth user found:');
  console.log('   ID:', authUser.user.id);
  console.log('   Email:', authUser.user.email);
  console.log('   Email Confirmed:', authUser.user.email_confirmed_at ? '✅' : '❌');
  console.log('   Created:', authUser.user.created_at);

  // Step 3: Test sending email
  console.log('\nStep 3: Testing email send via Resend...');

  const testResetLink = 'https://reachtheapex.net/reset-password?token=TEST_TOKEN_123';

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <tr>
            <td style="padding: 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E;">
                TEST: Password Reset
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Hi ${distributor.first_name},
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                This is a <strong>TEST EMAIL</strong> to verify the password reset system is working.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                If you received this email, the password reset system is functioning correctly.
              </p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${testResetLink}" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Reset My Password (TEST)
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Thanks,<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

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
    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: [philEmail],
      subject: 'TEST: Password Reset - Apex Affinity Group',
      html: emailHtml,
    });

    if (result.error) {
      console.error('❌ Resend API Error:', result.error);
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log('   Email ID:', result.data?.id);
    console.log('   To:', philEmail);
    console.log('   From: Apex Affinity Group <theapex@theapexway.net>');
    console.log('\n📧 Check Phil\'s inbox (including spam folder) for the test email.');

  } catch (error) {
    console.error('❌ Error sending email:', error);
  }

  // Step 4: Check for rate limiting
  console.log('\nStep 4: Checking rate limit table...');
  const { data: rateLimits, error: rateLimitError } = await supabase
    .from('password_reset_rate_limits')
    .select('*')
    .eq('email', philEmail.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(10);

  if (rateLimitError) {
    console.log('⚠️  Could not check rate limits (table might not exist)');
  } else if (rateLimits && rateLimits.length > 0) {
    console.log(`Found ${rateLimits.length} recent password reset attempts:`);
    rateLimits.forEach((limit, i) => {
      console.log(`   ${i + 1}. ${limit.created_at} - IP: ${limit.ip_address}`);
    });
  } else {
    console.log('✅ No rate limiting issues found');
  }

  console.log('\n✅ Password reset test complete!');
  console.log('\nSummary:');
  console.log('- Account exists: ✅');
  console.log('- Auth user linked: ✅');
  console.log('- Email sent: ✅');
  console.log('\n💡 Next steps:');
  console.log('   1. Check Phil\'s inbox for the test email');
  console.log('   2. Check spam/junk folder');
  console.log('   3. If still not received, check Resend dashboard for delivery status');
}

testPasswordReset().catch(console.error);

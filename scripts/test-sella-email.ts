/**
 * Test Email Delivery to Sella
 * Send a direct test email to verify Resend is working
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testSellaEmail() {
  console.log('📧 Testing Email Delivery to Sella Daniel...\n');

  const sellaEmail = 'sellag.sb@gmail.com';

  console.log('Sending test email to:', sellaEmail);
  console.log('From: Apex Affinity Group <theapex@theapexway.net>');

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <tr>
            <td style="padding: 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E;">
                🧪 Email System Test
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Hi Sella,
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                This is a <strong>test email</strong> to verify that our email system is working correctly.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                If you received this email, it means:
              </p>

              <ul style="margin: 0 0 16px; padding-left: 20px; color: #555555;">
                <li>✅ Your email address is correct</li>
                <li>✅ Our email system is working</li>
                <li>✅ Password reset emails should reach you</li>
              </ul>

              <div style="background-color: #f0f9ff; border-left: 4px solid #2B4C7E; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e3a5f;">
                  <strong>Your Email:</strong> ${sellaEmail}<br>
                  <strong>Test Time:</strong> ${new Date().toLocaleString()}
                </p>
              </div>

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
      to: [sellaEmail],
      subject: '🧪 Test Email - Apex Affinity Group',
      html: emailHtml,
    });

    console.log('\n✅ Email sent successfully!');
    console.log('   Resend Email ID:', result.data?.id);

    if (result.error) {
      console.error('\n❌ Resend Error:', result.error);
    } else {
      console.log('\n📧 Check Sella\'s inbox:');
      console.log('   1. Check main inbox');
      console.log('   2. Check spam/junk folder');
      console.log('   3. Check promotions tab (Gmail)');
      console.log('   4. Search for "Apex Affinity Group"');
      console.log('\n💡 Email may take 1-2 minutes to arrive');
    }

  } catch (error) {
    console.error('\n❌ Error sending email:');
    console.error(error);
  }
}

testSellaEmail().catch(console.error);

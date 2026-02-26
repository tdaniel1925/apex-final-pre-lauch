// Send password reset emails to all distributors
import { createServiceClient } from '../src/lib/supabase/service';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetToAll() {
  const supabase = createServiceClient();

  console.log('📧 Sending password reset emails to all distributors...\n');

  // Get all distributors with auth accounts
  const { data: distributors, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, auth_user_id')
    .not('auth_user_id', 'is', null)
    .order('created_at', { ascending: true });

  if (error || !distributors) {
    console.error('❌ Error fetching distributors:', error);
    return;
  }

  console.log(`Found ${distributors.length} distributors with accounts\n`);

  const resetLink = 'https://reachtheapex.net/forgot-password';
  let successCount = 0;
  let errorCount = 0;

  for (const distributor of distributors) {
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Required: Reset Your Password</title>
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
                Action Required: Reset Your Password
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Hi ${distributor.first_name},
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We've updated our security system and need all distributors to reset their passwords.
              </p>

              <!-- Important Notice Box -->
              <div style="margin: 24px 0; padding: 20px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #92400E; font-size: 14px;">
                  ⚠️ This is required to access your account
                </p>
                <p style="margin: 0; color: #78350F; font-size: 13px;">
                  You won't be able to log in until you reset your password. This only takes a minute!
                </p>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #555555;">
                Click the button below to reset your password now:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Reset My Password Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Your login username is: <strong>${distributor.email}</strong>
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you have any questions, please reach out to support.
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
      const { error: sendError } = await resend.emails.send({
        from: 'Apex Affinity Group <aag@theapexway.net>',
        to: [distributor.email],
        subject: 'Action Required: Reset Your Password - Apex Affinity Group',
        html: emailHtml,
      });

      if (sendError) {
        console.error(`❌ Failed to send to ${distributor.email}:`, sendError);
        errorCount++;
      } else {
        console.log(`✅ Sent to ${distributor.first_name} ${distributor.last_name} (${distributor.email})`);
        successCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Error sending to ${distributor.email}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully sent: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📧 Total: ${distributors.length}`);
}

sendPasswordResetToAll().then(() => {
  console.log('\n✅ Bulk email send complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

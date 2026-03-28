// =============================================
// Send Phone Number Update Request
// Email to reps asking them to update phone number
// =============================================

import { sendEmail } from '../src/lib/email/resend';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PHONE_UPDATE_EMAIL_CONTENT = `
<h1 style="color: #212529; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
  📱 Action Required: Update Your Phone Number
</h1>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
  We noticed that your phone number is missing from your profile in the Apex back office system.
</p>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  To ensure you receive <strong>important SMS notifications</strong> about upcoming events, training sessions, and company updates, please take a moment to update your phone number.
</p>

<div style="background-color: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 20px; margin: 0 0 24px 0;">
  <p style="color: #2c5aa0; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
    📋 How to Update Your Phone Number:
  </p>
  <p style="color: #495057; font-size: 15px; margin: 0; line-height: 1.8;">
    1. Log in to your back office at <a href="https://reachtheapex.net" style="color: #2c5aa0; text-decoration: none; font-weight: 600;">reachtheapex.net</a><br/>
    2. Click on <strong>Settings</strong> in the navigation menu<br/>
    3. Update your <strong>Phone Number</strong> field<br/>
    4. Click <strong>Save Changes</strong>
  </p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  By keeping your phone number up to date, you'll never miss important announcements like tonight's special CEO interview!
</p>

<div style="text-align: center; margin: 32px 0;">
  <a href="https://reachtheapex.net/dashboard/settings" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 17px; font-weight: 600; box-shadow: 0 2px 4px rgba(44, 90, 160, 0.2);">
    Update My Phone Number
  </a>
</div>

<p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
  Questions? Reply to this email or contact support.
</p>
`;

async function sendPhoneUpdateTest() {
  console.log('📧 Sending Phone Number Update Test Email...\n');

  const testEmail = 'tdaniel@botmakers.ai';

  try {
    // Load base template
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    // Merge content into template
    const emailHtml = baseTemplate
      .replace('{{email_title}}', 'Update Your Phone Number')
      .replace('{{email_content}}', PHONE_UPDATE_EMAIL_CONTENT)
      .replace('{{unsubscribe_url}}', 'https://reachtheapex.net/unsubscribe');

    const result = await sendEmail({
      to: testEmail,
      subject: '📱 Action Required: Update Your Phone Number in Back Office',
      html: emailHtml,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (result.success) {
      console.log(`✅ Test email sent successfully!`);
      console.log(`   To: ${testEmail}`);
      console.log(`   Email ID: ${result.id}\n`);
    } else {
      console.error(`❌ Email failed: ${result.error}\n`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error}\n`);
  }
}

// Run script
sendPhoneUpdateTest().catch(console.error);

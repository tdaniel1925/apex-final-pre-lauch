// =============================================
// Send CEO Interview Notification
// Email + SMS to notify field about tonight's event
// =============================================

import { sendEmail } from '../src/lib/email/resend';
import { getTwilioClient, getTwilioPhoneNumber } from '../src/lib/twilio/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const CEO_INTERVIEW_EMAIL_CONTENT = `
<h1 style="color: #212529; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.3;">
  🎙️ Special CEO Interview Tonight!
</h1>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
  Join us <strong>tonight at 6:30 PM CT</strong> for an exclusive interview with our CEO, <strong>Bill Propper</strong>!
</p>

<div style="background-color: #f8f9fa; border-left: 4px solid #2c5aa0; padding: 20px; margin: 0 0 24px 0;">
  <p style="color: #2c5aa0; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
    📅 Tonight • March 24, 2026 • 6:30 PM CT
  </p>
  <p style="color: #495057; font-size: 15px; margin: 0; line-height: 1.6;">
    <strong>What We'll Cover:</strong><br/>
    ✓ The Apex Vision<br/>
    ✓ Revolutionary AI Technology<br/>
    ✓ Insurance Ladder to Success
  </p>
</div>

<p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
  This is your opportunity to hear directly from Bill about where we're headed and how YOU fit into the future of Apex.
</p>

<div style="text-align: center; margin: 32px 0;">
  <a href="https://reachtheapex.net/live" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 17px; font-weight: 600; box-shadow: 0 2px 4px rgba(44, 90, 160, 0.2);">
    Join the Interview
  </a>
</div>

<p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
  Can't make it live? Replay will be posted to rep back office next day.
</p>
`;

const CEO_INTERVIEW_SMS = `🎙️ TONIGHT 6:30 PM CT: Special CEO Interview with Bill Propper!

Join us for an exclusive discussion about:
• The Apex Vision
• Revolutionary AI Technology
• Insurance Ladder to Success

Join now: https://reachtheapex.net/live

Can't make it? Replay will be posted to rep back office next day.`;

async function sendTestNotifications() {
  console.log('🚀 Sending CEO Interview Notifications...\n');

  const testEmail = 'tdaniel@botmakers.ai';
  const testPhone = '+12815058290'; // Must include country code for Twilio

  // 1. SEND EMAIL
  console.log(`📧 Sending email to ${testEmail}...`);

  try {
    // Load base template
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    // Merge content into template
    const emailHtml = baseTemplate
      .replace('{{email_title}}', 'Special CEO Interview Tonight')
      .replace('{{email_content}}', CEO_INTERVIEW_EMAIL_CONTENT)
      .replace('{{unsubscribe_url}}', 'https://theapexway.net/unsubscribe');

    const emailResult = await sendEmail({
      to: testEmail,
      subject: '🎙️ Special CEO Interview Tonight at 6:30 PM CT',
      html: emailHtml,
      from: 'Apex Affinity Group <theapex@theapexway.net>',
    });

    if (emailResult.success) {
      console.log(`✅ Email sent successfully! ID: ${emailResult.id}\n`);
    } else {
      console.error(`❌ Email failed: ${emailResult.error}\n`);
    }
  } catch (error) {
    console.error(`❌ Email error: ${error}\n`);
  }

  // 2. SEND SMS
  console.log(`📱 Sending SMS to ${testPhone}...`);

  try {
    const twilioClient = getTwilioClient();
    const twilioPhone = getTwilioPhoneNumber();

    if (!twilioClient || !twilioPhone) {
      console.error('❌ Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env.local\n');
    } else {
      const message = await twilioClient.messages.create({
        body: CEO_INTERVIEW_SMS,
        from: twilioPhone,
        to: testPhone,
      });

      console.log(`✅ SMS sent successfully! SID: ${message.sid}\n`);
    }
  } catch (error) {
    console.error(`❌ SMS error: ${error}\n`);
  }

  console.log('✅ Test notifications complete!');
}

// Run script
sendTestNotifications().catch(console.error);

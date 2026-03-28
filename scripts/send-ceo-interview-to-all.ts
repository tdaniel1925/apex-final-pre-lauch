// =============================================
// Send CEO Interview to ALL Reps
// Email + SMS to all active and inactive reps
// =============================================

import { sendEmail } from '../src/lib/email/resend';
import { getTwilioClient, getTwilioPhoneNumber } from '../src/lib/twilio/client';
import { createServiceClient } from '../src/lib/supabase/service';
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

interface SendReport {
  totalReps: number;
  emailsSent: number;
  emailsFailed: number;
  smsSent: number;
  smsFailed: number;
  errors: Array<{ email: string; error: string }>;
  startTime: Date;
  endTime?: Date;
}

async function sendToAllReps() {
  console.log('🚀 Starting CEO Interview Mass Notification...\n');

  const report: SendReport = {
    totalReps: 0,
    emailsSent: 0,
    emailsFailed: 0,
    smsSent: 0,
    smsFailed: 0,
    errors: [],
    startTime: new Date(),
  };

  try {
    // 1. Get all members from database
    console.log('📊 Fetching all reps from database...');
    const supabase = createServiceClient();

    const { data: members, error: dbError } = await supabase
      .from('members')
      .select(`
        member_id,
        email,
        full_name,
        status,
        distributor:distributors!members_distributor_id_fkey (
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    if (!members || members.length === 0) {
      console.log('⚠️  No members found in database.');
      return;
    }

    report.totalReps = members.length;
    console.log(`✅ Found ${members.length} reps\n`);

    // 2. Load email template
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    const emailHtml = baseTemplate
      .replace('{{email_title}}', 'Special CEO Interview Tonight')
      .replace('{{email_content}}', CEO_INTERVIEW_EMAIL_CONTENT)
      .replace('{{unsubscribe_url}}', 'https://reachtheapex.net/unsubscribe');

    // 3. Setup Twilio
    const twilioClient = getTwilioClient();
    const twilioPhone = getTwilioPhoneNumber();
    const twilioConfigured = !!(twilioClient && twilioPhone);

    if (!twilioConfigured) {
      console.log('⚠️  Twilio not configured. SMS will be skipped.\n');
    }

    // 4. Send to each rep
    console.log('📤 Sending notifications...\n');

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const progress = `[${i + 1}/${members.length}]`;

      console.log(`${progress} Processing: ${member.full_name || member.email}`);

      // Send EMAIL
      if (member.email) {
        try {
          const emailResult = await sendEmail({
            to: member.email,
            subject: '🎙️ Special CEO Interview Tonight at 6:30 PM CT',
            html: emailHtml,
            from: 'Apex Affinity Group <theapex@theapexway.net>',
          });

          if (emailResult.success) {
            report.emailsSent++;
            console.log(`  ✅ Email sent`);
          } else {
            report.emailsFailed++;
            report.errors.push({ email: member.email, error: `Email: ${emailResult.error}` });
            console.log(`  ❌ Email failed: ${emailResult.error}`);
          }
        } catch (error) {
          report.emailsFailed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          report.errors.push({ email: member.email, error: `Email: ${errorMsg}` });
          console.log(`  ❌ Email error: ${errorMsg}`);
        }

        // Rate limit for Resend (10 emails/second max)
        await new Promise(resolve => setTimeout(resolve, 150));
      } else {
        console.log(`  ⚠️  No email address`);
      }

      // Send SMS
      const phoneNumber = (member as any).distributor?.phone;
      if (phoneNumber && twilioConfigured) {
        try {
          // Format phone number (add +1 if not present)
          let phone = phoneNumber.replace(/\D/g, '');
          if (!phone.startsWith('1') && phone.length === 10) {
            phone = '1' + phone;
          }
          phone = '+' + phone;

          const message = await twilioClient!.messages.create({
            body: CEO_INTERVIEW_SMS,
            from: twilioPhone!,
            to: phone,
          });

          report.smsSent++;
          console.log(`  ✅ SMS sent`);

          // Rate limit for Twilio (1 message/second recommended)
          await new Promise(resolve => setTimeout(resolve, 1100));
        } catch (error) {
          report.smsFailed++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          report.errors.push({ email: member.email, error: `SMS: ${errorMsg}` });
          console.log(`  ❌ SMS error: ${errorMsg}`);
        }
      } else if (phoneNumber && !twilioConfigured) {
        console.log(`  ⚠️  SMS skipped (Twilio not configured)`);
      } else {
        console.log(`  ⚠️  No phone number`);
      }

      console.log(''); // Blank line between members
    }

    report.endTime = new Date();

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    report.endTime = new Date();
  }

  // 5. Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 CEO INTERVIEW NOTIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`Start Time:      ${report.startTime.toLocaleString()}`);
  console.log(`End Time:        ${report.endTime?.toLocaleString()}`);
  console.log(`Duration:        ${report.endTime ? Math.round((report.endTime.getTime() - report.startTime.getTime()) / 1000) : 0} seconds`);
  console.log('');
  console.log(`Total Reps:      ${report.totalReps}`);
  console.log('');
  console.log(`✅ Emails Sent:  ${report.emailsSent}`);
  console.log(`❌ Emails Failed: ${report.emailsFailed}`);
  console.log('');
  console.log(`✅ SMS Sent:     ${report.smsSent}`);
  console.log(`❌ SMS Failed:   ${report.smsFailed}`);
  console.log('');

  if (report.errors.length > 0) {
    console.log('❌ ERRORS:');
    report.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.email}: ${err.error}`);
    });
  }

  console.log('='.repeat(60));

  // 6. Save report to file
  const reportPath = path.join(process.cwd(), 'ceo-interview-notification-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// Run script
sendToAllReps().catch(console.error);

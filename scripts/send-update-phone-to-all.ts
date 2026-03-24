// =============================================
// Send Phone Number Update Request to All
// Email all reps missing phone numbers
// =============================================

import { sendEmail } from '../src/lib/email/resend';
import { createServiceClient } from '../src/lib/supabase/service';
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

interface SendReport {
  totalReps: number;
  emailsSent: number;
  emailsFailed: number;
  errors: Array<{ email: string; error: string }>;
  startTime: Date;
  endTime?: Date;
}

async function sendPhoneUpdateToAll() {
  console.log('🚀 Starting Phone Number Update Request Campaign...\n');

  const report: SendReport = {
    totalReps: 0,
    emailsSent: 0,
    emailsFailed: 0,
    errors: [],
    startTime: new Date(),
  };

  try {
    // 1. Get all members with missing phone numbers
    console.log('📊 Fetching reps with missing phone numbers...');
    const supabase = createServiceClient();

    const { data: members, error: dbError } = await supabase
      .from('members')
      .select(`
        member_id,
        email,
        full_name,
        distributor:distributors!members_distributor_id_fkey (
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    // Filter to only members with missing or empty phone numbers
    const membersWithoutPhone = members.filter((m: any) => {
      const phone = m.distributor?.phone;
      return !phone || phone.trim() === '' || phone === '555-XXXX';
    });

    report.totalReps = membersWithoutPhone.length;
    console.log(`✅ Found ${membersWithoutPhone.length} reps without phone numbers\n`);

    if (membersWithoutPhone.length === 0) {
      console.log('✅ All reps have phone numbers! Nothing to send.');
      return;
    }

    // 2. Load email template
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    const emailHtml = baseTemplate
      .replace('{{email_title}}', 'Update Your Phone Number')
      .replace('{{email_content}}', PHONE_UPDATE_EMAIL_CONTENT)
      .replace('{{unsubscribe_url}}', 'https://reachtheapex.net/unsubscribe');

    // 3. Send to each rep
    console.log('📤 Sending emails...\n');

    for (let i = 0; i < membersWithoutPhone.length; i++) {
      const member = membersWithoutPhone[i];
      const progress = `[${i + 1}/${membersWithoutPhone.length}]`;

      console.log(`${progress} ${member.full_name || member.email}`);

      if (!member.email) {
        console.log(`  ⚠️  No email address`);
        continue;
      }

      try {
        const result = await sendEmail({
          to: member.email,
          subject: '📱 Action Required: Update Your Phone Number in Back Office',
          html: emailHtml,
          from: 'Apex Affinity Group <theapex@theapexway.net>',
        });

        if (result.success) {
          report.emailsSent++;
          console.log(`  ✅ Email sent`);
        } else {
          report.emailsFailed++;
          report.errors.push({ email: member.email, error: result.error || 'Unknown error' });
          console.log(`  ❌ Failed: ${result.error}`);
        }

        // Rate limit (150ms between emails)
        await new Promise(resolve => setTimeout(resolve, 150));

      } catch (error) {
        report.emailsFailed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        report.errors.push({ email: member.email, error: errorMsg });
        console.log(`  ❌ Error: ${errorMsg}`);
      }

      console.log('');
    }

    report.endTime = new Date();

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    report.endTime = new Date();
  }

  // 4. Generate Report
  console.log('\n' + '='.repeat(60));
  console.log('📊 PHONE UPDATE REQUEST REPORT');
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

  if (report.errors.length > 0) {
    console.log('❌ ERRORS:');
    report.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.email}: ${err.error}`);
    });
  }

  console.log('='.repeat(60));

  // 5. Save report to file
  const reportPath = path.join(process.cwd(), 'phone-update-request-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// Run script
sendPhoneUpdateToAll().catch(console.error);

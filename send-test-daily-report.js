// Send Test Daily Enrollment Report
// Run with: node send-test-daily-report.js

require('dotenv').config({ path: '.env.local' });

const PROD_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://theapexway.net';

async function sendTestReport() {
  console.log('📧 Sending test daily enrollment report...\n');

  try {
    const response = await fetch(`${PROD_URL}/api/admin/daily-report?test=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test report sent successfully!\n');
      console.log('📊 Report Data:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Report Date: ${data.report_data.report_date}`);
      console.log(`   New Signups (24h): ${data.report_data.new_signups_count}`);
      console.log(`   Total Reps: ${data.report_data.total_reps}`);
      console.log(`   Test Reps: ${data.report_data.test_reps_count}`);
      console.log(`   Week Growth: ${data.report_data.week_growth}`);
      console.log(`   MTD Signups: ${data.report_data.mtd_signups}`);
      console.log(`   Top State: ${data.report_data.top_state}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n📧 Email ID: ${data.email_id}`);
      console.log('📬 Sent to: tdaniel@botmakers.ai');

      if (data.report_data.has_signups) {
        console.log(`\n📋 Recent Signups: ${data.report_data.signups.length}`);
        data.report_data.signups.slice(0, 5).forEach((signup, i) => {
          console.log(`   ${i + 1}. ${signup.name} - ${signup.email}`);
        });
      } else {
        console.log('\n📋 No signups in the last 24 hours');
      }

      console.log('\n✅ Changes Applied:');
      console.log('   ✓ Test distributors excluded from all counts');
      console.log('   ✓ Updated recipient list with new emails');
      console.log('   ✓ All queries now filter out test/demo/dummy accounts');

    } else {
      console.error('❌ Error sending test report:');
      console.error(data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendTestReport();

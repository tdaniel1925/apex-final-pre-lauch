// =============================================
// Check Specific Email by ID
// =============================================

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkEmail() {
  const emailId = 'e53b4bea-4aab-4c4d-9bcb-8824dcebff6d'; // Latest email ID

  console.log(`🔍 Checking email: ${emailId}\n`);

  try {
    const { data, error } = await resend.emails.get(emailId);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    if (data) {
      console.log('✅ Email Details:');
      console.log(`   ID: ${data.id}`);
      console.log(`   To: ${data.to}`);
      console.log(`   From: ${data.from}`);
      console.log(`   Subject: ${data.subject}`);
      console.log(`   Status: ${data.last_event || 'unknown'}`);
      console.log(`   Created: ${new Date(data.created_at).toLocaleString()}`);

      if (data.last_event === 'delivered') {
        console.log('\n✅ Email was successfully delivered!');
        console.log('   📧 Check your inbox (and spam folder) at tdaniel@botmakers.ai');
      } else if (data.last_event === 'bounced') {
        console.log('\n❌ Email bounced');
      } else {
        console.log('\n⏳ Email is still being processed...');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkEmail();

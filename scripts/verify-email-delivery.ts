// =============================================
// Verify Email Delivery Status
// Check if the email was actually delivered
// =============================================

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyDelivery() {
  console.log('🔍 Checking recent email delivery status...\n');

  try {
    // Get recent emails
    const { data: emails, error } = await resend.emails.list({ limit: 5 });

    if (error) {
      console.error('❌ Error fetching emails:', error);
      return;
    }

    if (!emails || emails.data.length === 0) {
      console.log('📭 No recent emails found');
      return;
    }

    console.log(`Found ${emails.data.length} recent emails:\n`);

    emails.data.forEach((email: any, index: number) => {
      console.log(`${index + 1}. Email ID: ${email.id}`);
      console.log(`   To: ${email.to}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Status: ${email.last_event || 'pending'}`);
      console.log(`   Created: ${new Date(email.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check specifically for the test email
    const testEmail = emails.data.find((e: any) =>
      e.to.includes('tdaniel@botmakers.ai') &&
      e.subject.includes('Pre-Launch Journey')
    );

    if (testEmail) {
      console.log('✅ Found the test email!');
      console.log(`   Status: ${testEmail.last_event || 'sent'}`);
      console.log(`   Email ID: ${testEmail.id}`);
    } else {
      console.log('⚠️  Test email not found in recent sends');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyDelivery();

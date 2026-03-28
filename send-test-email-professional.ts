import { sendTemplateEmail } from './src/lib/email/send-template-email';

async function sendTestEmail() {
  console.log('=== SENDING PROFESSIONAL TEST EMAIL ===\n');

  const result = await sendTemplateEmail({
    to: 'tdaniel@botmakers.ai', // Your test email
    subject: 'Action Required: Update Your Phone Number',
    templateName: 'phone-number-request',
    variables: {
      email_title: 'Phone Number Update Required',
      recipient_name: 'Trent',
      unsubscribe_url: 'https://theapexway.net/unsubscribe',
    },
    from: 'theapex@theapexway.net',
  });

  console.log('\n=== RESULT ===');

  if (result.success) {
    console.log('✅ SUCCESS');
    console.log(`Message ID: ${result.messageId}`);
    console.log('\nCheck your inbox at tdaniel@botmakers.ai');
    console.log('The email has a professional, corporate design:');
    console.log('  - No emojis');
    console.log('  - No purple gradients');
    console.log('  - Navy blue and gray color scheme');
    console.log('  - Serious, professional tone');
  } else {
    console.log('❌ FAILED');
    console.log('Error:', result.error);
  }
}

sendTestEmail().catch(console.error);

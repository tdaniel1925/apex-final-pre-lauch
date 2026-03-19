const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

async function testResend() {
  console.log('🔧 Testing Resend Email Service...\n');

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Send a test email
    console.log('📧 Sending test email...');

    const { data, error } = await resend.emails.send({
      from: 'Apex Affinity <onboarding@resend.dev>', // Use Resend's test domain
      to: ['delivered@resend.dev'], // Resend's test email
      subject: 'Apex Lead Autopilot - Test Email',
      html: `
        <h1>✅ Resend is Working!</h1>
        <p>This test email confirms that your Resend integration is configured correctly.</p>
        <p><strong>Apex Lead Autopilot</strong> email features:</p>
        <ul>
          <li>Meeting Invitations</li>
          <li>Response Tracking</li>
          <li>Follow-up Reminders</li>
        </ul>
        <p>You're all set! 🎉</p>
      `,
    });

    if (error) {
      console.log('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('   Email ID:', data.id);
    console.log('\n📋 Resend Status: WORKING ✅');
    console.log('\n💡 Tips:');
    console.log('   - For production, verify your domain at resend.com');
    console.log('   - Update "from" email to use your verified domain');
    console.log('   - Current: using Resend test domain (onboarding@resend.dev)');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testResend().catch(console.error);

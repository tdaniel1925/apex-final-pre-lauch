const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY || 're_N7WUE23T_FuSdXfAbD7WodviGa3nJnPtw');

async function sendTestEmail() {
  console.log('📧 Sending test email to tdaniel@botmakers.ai...\n');

  const emailTemplate = fs.readFileSync('thank-you-training-email.html', 'utf8');

  try {
    const result = await resend.emails.send({
      from: 'Apex Affinity Group <notifications@theapexway.net>',
      to: 'tdaniel@botmakers.ai',
      subject: 'Thank You & Important Updates from Apex',
      html: emailTemplate,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.id);
    console.log('\nCheck your inbox at tdaniel@botmakers.ai');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

sendTestEmail();

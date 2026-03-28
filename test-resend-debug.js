const { Resend } = require('resend');

// Test with the actual API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    console.log('Testing Resend API response structure...\n');
    
    const result = await resend.emails.send({
      from: 'Apex Affinity Group <theapex@theapexway.net>',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Test</p>',
    });
    
    console.log('Response from Resend:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\nResult.id:', result.id);
    console.log('Result.error:', result.error);
    console.log('Full result keys:', Object.keys(result));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

testResend();

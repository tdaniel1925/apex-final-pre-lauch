// Send Test SMS to +1 251 505 8290
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

async function sendTestSMS() {
  if (!accountSid || !authToken || !fromNumber) {
    console.error('❌ Missing Twilio credentials in environment variables');
    console.error('   Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    return;
  }

  const client = twilio(accountSid, authToken);
  const testPhone = '+12815058290';

  const message = `Apex Training TONIGHT 6:30 PM CT! 🚀

Learn about your NEW AI Assistant in the back office + how to sell Pulse Products confidently.

This will help you close more sales & save time!

Join: reachtheapex.net/live

Can't attend? Recording will be posted.

See you there!
- Apex Team`;

  console.log('📱 Sending test SMS...\n');
  console.log(`To: ${testPhone}`);
  console.log(`From: ${fromNumber}\n`);
  console.log('Message:');
  console.log('-------------------');
  console.log(message);
  console.log('-------------------\n');

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: testPhone,
    });

    console.log('✅ Test SMS sent successfully!');
    console.log(`   SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Date: ${result.dateCreated}`);
  } catch (error: any) {
    console.error('❌ Failed to send SMS:', error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    if (error.moreInfo) {
      console.error(`   More Info: ${error.moreInfo}`);
    }
  }
}

sendTestSMS().catch(console.error);

// Send Training SMS to ALL Reps with Phone Numbers
import twilio from 'twilio';
import { createServiceClient } from '../src/lib/supabase/service';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

async function sendToAllReps() {
  console.log('📱 Sending training SMS to all reps with phone numbers...\n');

  if (!accountSid || !authToken || !fromNumber) {
    console.error('❌ Missing Twilio credentials in environment variables');
    console.error('   Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    return;
  }

  const supabase = createServiceClient();
  const client = twilio(accountSid, authToken);

  // Get ALL distributors with phone numbers
  const { data: distributors, error: fetchError } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, phone')
    .not('phone', 'is', null);

  if (fetchError || !distributors) {
    console.error('❌ Error fetching distributors:', fetchError);
    return;
  }

  console.log(`📊 Found ${distributors.length} reps with phone numbers\n`);

  const message = `Apex Training TONIGHT 6:30 PM CT! 🚀

Learn about your NEW AI Assistant in the back office + how to sell Pulse Products confidently.

This will help you close more sales & save time!

Join: reachtheapex.net/live

Can't attend? Recording will be posted.

See you there!
- Apex Team`;

  let smsSent = 0;
  let smsFailed = 0;

  for (const distributor of distributors) {
    const firstName = distributor.first_name || 'there';

    try {
      // Send SMS
      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: distributor.phone,
      });

      if (result.status === 'queued' || result.status === 'sent') {
        smsSent++;
        if (smsSent % 10 === 0) {
          console.log(`   📱 Sent ${smsSent} SMS messages...`);
        }
      } else {
        console.error(`❌ Failed to send to ${distributor.phone}: Status ${result.status}`);
        smsFailed++;
      }

      // Rate limiting - wait 1 second between sends (Twilio requirement)
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.error(`❌ Error sending to ${distributor.phone}:`, error.message);
      smsFailed++;
    }
  }

  console.log('\n✅ SMS sending complete!');
  console.log(`   📊 Total sent: ${smsSent}`);
  console.log(`   ❌ Failed: ${smsFailed}\n`);

  console.log('📧 Reminder: Email was already sent to all 65 reps earlier.');
  console.log('✅ Training announcement complete!');
}

sendToAllReps().catch(console.error);

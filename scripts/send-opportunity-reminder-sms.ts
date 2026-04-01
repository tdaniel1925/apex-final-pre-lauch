// Send Opportunity Meeting Reminder SMS to ALL Reps
import twilio from 'twilio';
import { createServiceClient } from '../src/lib/supabase/service';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

async function sendOpportunityReminder() {
  console.log('📱 Sending opportunity meeting reminder to all reps...\n');

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

  const message = `Reminder: 6:30 PM Opportunity Meeting TONIGHT with Johnathon, Darrell, and Trent! 🚀

It's gonna be fun and you're going to learn so much!

Coming up at 6:30. Don't miss it!

Join: reachtheapex.net/live

- Apex Team`;

  let smsSent = 0;
  let smsFailed = 0;

  for (const distributor of distributors) {
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
}

sendOpportunityReminder().catch(console.error);

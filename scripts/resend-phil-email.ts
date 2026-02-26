// Resend Phil's welcome email with fixed variables
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function resendPhilEmail() {
  const supabase = createServiceClient();

  console.log('🔍 Finding Phil Resch...\n');

  const { data: phil, error: findError } = await supabase
    .from('distributors')
    .select('*')
    .eq('first_name', 'Phil')
    .eq('last_name', 'Resch')
    .single();

  if (findError || !phil) {
    console.error('❌ Could not find Phil Resch:', findError);
    return;
  }

  console.log(`✅ Found Phil Resch`);
  console.log(`   Email: ${phil.email}`);
  console.log(`   ID: ${phil.id}\n`);

  // Delete existing campaign
  console.log('🗑️  Deleting old campaign...');
  await supabase
    .from('email_campaigns')
    .delete()
    .eq('distributor_id', phil.id);

  console.log('✅ Old campaign deleted\n');

  // Send new welcome email with fixed variable replacement
  console.log('📧 Sending welcome email with fixed variables...\n');
  const result = await enrollInCampaign(phil as Distributor);

  if (result.success) {
    console.log('✅ SUCCESS!\n');

    // Get the email that was sent
    const { data: emailSends } = await supabase
      .from('email_sends')
      .select('subject, status, sent_at')
      .eq('distributor_id', phil.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (emailSends && emailSends.length > 0) {
      console.log('📧 Email Details:');
      console.log(`   To: ${phil.email}`);
      console.log(`   Subject: ${emailSends[0].subject}`);
      console.log(`   Status: ${emailSends[0].status}`);
      console.log(`   Sent: ${emailSends[0].sent_at}`);

      // Check if variables were replaced
      if (emailSends[0].subject.includes('{') || emailSends[0].subject.includes('}')) {
        console.log('\n⚠️  WARNING: Variables still not replaced properly!');
      } else {
        console.log('\n✅ Variables replaced correctly!');
      }
    }
  } else {
    console.log('❌ Failed:', result.error);
  }
}

resendPhilEmail().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

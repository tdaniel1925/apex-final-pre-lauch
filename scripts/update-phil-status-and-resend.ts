// Update Phil's licensing status to licensed and resend email
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function updatePhilAndResend() {
  const supabase = createServiceClient();

  console.log('🔍 Finding Phil Resch...\n');

  const { data: phil, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('first_name', 'Phil')
    .eq('last_name', 'Resch')
    .single();

  if (error || !phil) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Found Phil Resch`);
  console.log(`   Current status: ${phil.licensing_status}`);

  // Update to licensed
  console.log('\n📝 Updating licensing status to "licensed"...');
  const { error: updateError } = await supabase
    .from('distributors')
    .update({ licensing_status: 'licensed' })
    .eq('id', phil.id);

  if (updateError) {
    console.error('❌ Update failed:', updateError);
    return;
  }

  console.log('✅ Status updated\n');

  // Delete old campaign
  console.log('🗑️  Deleting old campaign...');
  await supabase
    .from('email_campaigns')
    .delete()
    .eq('distributor_id', phil.id);

  console.log('✅ Campaign deleted\n');

  // Get updated distributor
  const { data: updatedPhil } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', phil.id)
    .single();

  // Send new email
  console.log('📧 Sending welcome email with correct template and variables...\n');
  const result = await enrollInCampaign(updatedPhil as Distributor);

  if (result.success) {
    console.log('✅ SUCCESS!\n');

    // Check the sent email
    const { data: emailSends } = await supabase
      .from('email_sends')
      .select('subject, status')
      .eq('distributor_id', phil.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (emailSends && emailSends.length > 0) {
      console.log('📧 Email sent to: phil@valorfs.com');
      console.log(`   Subject: ${emailSends[0].subject}`);
      console.log(`   Status: ${emailSends[0].status}`);

      // Verify variables were replaced
      if (!emailSends[0].subject.includes('{') && !emailSends[0].subject.includes('}')) {
        console.log('\n✅ Variables replaced correctly!');
      } else {
        console.log('\n⚠️  Variables still have issues');
      }
    }
  } else {
    console.log('❌ Failed:', result.error);
  }
}

updatePhilAndResend().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

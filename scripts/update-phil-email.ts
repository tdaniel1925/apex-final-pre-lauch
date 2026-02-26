// Update Phil Resch's email and resend welcome email
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function updatePhilEmail() {
  const supabase = createServiceClient();

  console.log('🔍 Finding Phil Resch...\n');

  // Find Phil by name
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
  console.log(`   Current email: ${phil.email}`);
  console.log(`   ID: ${phil.id}\n`);

  // Update email address
  console.log('📝 Updating email to phil@valorfs.com...');
  const { error: updateError } = await supabase
    .from('distributors')
    .update({ email: 'phil@valorfs.com' })
    .eq('id', phil.id);

  if (updateError) {
    console.error('❌ Failed to update email:', updateError);
    return;
  }

  console.log('✅ Email updated successfully\n');

  // Delete existing campaign so we can send a new one
  console.log('🗑️  Deleting old campaign...');
  const { error: deleteError } = await supabase
    .from('email_campaigns')
    .delete()
    .eq('distributor_id', phil.id);

  if (deleteError) {
    console.error('❌ Failed to delete old campaign:', deleteError);
    return;
  }

  console.log('✅ Old campaign deleted\n');

  // Get updated distributor record
  const { data: updatedPhil } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', phil.id)
    .single();

  if (!updatedPhil) {
    console.error('❌ Could not fetch updated record');
    return;
  }

  // Send new welcome email
  console.log('📧 Sending welcome email to new address...\n');
  const result = await enrollInCampaign(updatedPhil as Distributor);

  if (result.success) {
    console.log('✅ SUCCESS!');
    console.log(`   Welcome email sent to: phil@valorfs.com`);

    // Verify email was sent
    const { data: emailSends } = await supabase
      .from('email_sends')
      .select('subject, status, sent_at')
      .eq('distributor_id', phil.id)
      .eq('email_address', 'phil@valorfs.com')
      .order('created_at', { ascending: false })
      .limit(1);

    if (emailSends && emailSends.length > 0) {
      console.log(`\n📧 Email Details:`);
      console.log(`   Subject: ${emailSends[0].subject}`);
      console.log(`   Status: ${emailSends[0].status}`);
      console.log(`   Sent: ${emailSends[0].sent_at}`);
    }
  } else {
    console.log('❌ Failed to send email:', result.error);
  }
}

updatePhilEmail().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

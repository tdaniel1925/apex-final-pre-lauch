// Test email enrollment for existing distributor
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function testEmailEnrollment() {
  const supabase = createServiceClient();

  // Get Joanne Melton (most recent signup)
  console.log('🔍 Fetching Joanne Melton...\n');
  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('slug', 'jmelton')
    .single();

  if (error || !distributor) {
    console.error('❌ Could not find distributor:', error);
    return;
  }

  console.log('✅ Found distributor:');
  console.log(`   Name: ${distributor.first_name} ${distributor.last_name}`);
  console.log(`   Email: ${distributor.email}`);
  console.log(`   Status: ${distributor.licensing_status}`);
  console.log(`   ID: ${distributor.id}\n`);

  console.log('📧 Attempting to enroll in email campaign...\n');
  console.log('═'.repeat(60));

  const result = await enrollInCampaign(distributor as Distributor);

  console.log('═'.repeat(60));
  console.log('\n📊 Final Result:');
  console.log(`   Success: ${result.success}`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  }

  // Check if campaign was created
  console.log('\n🔍 Checking database for campaign...');
  const { data: campaign } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('distributor_id', distributor.id);

  if (campaign && campaign.length > 0) {
    console.log('✅ Campaign found in database:');
    campaign.forEach((c) => {
      console.log(`   ID: ${c.id}`);
      console.log(`   Active: ${c.is_active}`);
      console.log(`   Created: ${c.created_at}`);
    });
  } else {
    console.log('❌ No campaign found in database');
  }

  // Check for email sends
  console.log('\n🔍 Checking for email sends...');
  const { data: sends } = await supabase
    .from('email_sends')
    .select('*')
    .eq('distributor_id', distributor.id);

  if (sends && sends.length > 0) {
    console.log('✅ Email sends found:');
    sends.forEach((send) => {
      console.log(`   Subject: ${send.subject}`);
      console.log(`   Status: ${send.status}`);
      console.log(`   Sent: ${send.sent_at}`);
      if (send.failed_reason) {
        console.log(`   Error: ${send.failed_reason}`);
      }
    });
  } else {
    console.log('❌ No email sends found');
  }
}

testEmailEnrollment().then(() => {
  console.log('\n✅ Test complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

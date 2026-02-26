// Test email enrollment for Eric
import { createServiceClient } from '../src/lib/supabase/service';
import { enrollInCampaign } from '../src/lib/email/campaign-service';
import type { Distributor } from '../src/lib/types';

async function testEnrollment() {
  const supabase = createServiceClient();

  console.log('🔍 Fetching Eric Wullschleger...\n');
  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('slug', 'eric-wullschleger')
    .single();

  if (error || !distributor) {
    console.error('❌ Could not find distributor:', error);
    return;
  }

  console.log(`✅ Found: ${distributor.first_name} ${distributor.last_name}`);
  console.log(`   Email: ${distributor.email}\n`);

  console.log('📧 Enrolling in email campaign...\n');
  const result = await enrollInCampaign(distributor as Distributor);

  if (result.success) {
    console.log('✅ SUCCESS! Email sent.\n');

    // Check the email send record to see the actual subject
    const { data: sends } = await supabase
      .from('email_sends')
      .select('subject, status')
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (sends && sends.length > 0) {
      console.log('📧 Email Details:');
      console.log(`   Subject: ${sends[0].subject}`);
      console.log(`   Status: ${sends[0].status}`);

      // Check if variables were replaced
      if (sends[0].subject.includes('{') || sends[0].subject.includes('}')) {
        console.log('\n⚠️  WARNING: Variables not fully replaced!');
      } else {
        console.log('\n✅ Variables replaced correctly!');
      }
    }
  } else {
    console.log('❌ Failed:', result.error);
  }
}

testEnrollment().then(() => {
  console.log('\nDone');
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

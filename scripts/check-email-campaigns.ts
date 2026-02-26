// Check email campaigns for recent signups
import { createServiceClient } from '../src/lib/supabase/service';

async function checkEmailCampaigns() {
  const supabase = createServiceClient();

  console.log('🔍 Checking recent distributor signups and email campaigns...\n');

  // Get the 5 most recent distributors
  const { data: recentDists, error: distsError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, created_at, licensing_status')
    .order('created_at', { ascending: false })
    .limit(5);

  if (distsError) {
    console.error('❌ Error fetching distributors:', distsError);
    return;
  }

  console.log('📋 5 Most Recent Distributors:');
  console.log('=====================================');
  recentDists?.forEach((dist, index) => {
    console.log(`${index + 1}. ${dist.first_name} ${dist.last_name} (@${dist.slug})`);
    console.log(`   Email: ${dist.email}`);
    console.log(`   Status: ${dist.licensing_status}`);
    console.log(`   Signed up: ${new Date(dist.created_at).toLocaleString()}`);
    console.log(`   ID: ${dist.id}`);
    console.log('');
  });

  // Check email campaigns for each
  console.log('\n📧 Email Campaign Status:');
  console.log('=====================================');

  for (const dist of recentDists || []) {
    const { data: campaigns, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('distributor_id', dist.id);

    console.log(`\n${dist.first_name} ${dist.last_name}:`);

    if (campaignError) {
      console.log(`   ❌ Error: ${campaignError.message}`);
      continue;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('   ⚠️  NO CAMPAIGN CREATED');
      continue;
    }

    campaigns.forEach((campaign) => {
      console.log(`   ✓ Campaign ID: ${campaign.id}`);
      console.log(`   - Active: ${campaign.is_active}`);
      console.log(`   - Current Step: ${campaign.current_step}`);
      console.log(`   - Created: ${new Date(campaign.created_at).toLocaleString()}`);
    });

    // Check email sends
    const { data: sends, error: sendsError } = await supabase
      .from('email_sends')
      .select('*')
      .eq('distributor_id', dist.id);

    if (sends && sends.length > 0) {
      console.log(`   📬 Emails Sent: ${sends.length}`);
      sends.forEach((send) => {
        console.log(`      - ${send.subject}`);
        console.log(`        Status: ${send.status}`);
        console.log(`        Sent: ${new Date(send.sent_at).toLocaleString()}`);
        if (send.error) {
          console.log(`        ❌ Error: ${send.error}`);
        }
      });
    } else {
      console.log('   ⚠️  NO EMAILS SENT');
    }
  }

  // Check if there are any email templates
  console.log('\n\n📝 Available Email Templates:');
  console.log('=====================================');
  const { data: templates, error: templateError } = await supabase
    .from('email_templates')
    .select('template_key, template_name, sequence_order, licensing_status, is_active')
    .order('licensing_status')
    .order('sequence_order');

  if (templateError) {
    console.error('❌ Error fetching templates:', templateError);
  } else {
    templates?.forEach((template) => {
      console.log(`${template.is_active ? '✓' : '○'} ${template.template_name}`);
      console.log(`  Key: ${template.template_key}`);
      console.log(`  Status: ${template.licensing_status}`);
      console.log(`  Sequence: ${template.sequence_order}`);
      console.log('');
    });
  }
}

checkEmailCampaigns().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

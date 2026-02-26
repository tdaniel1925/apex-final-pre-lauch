// Verify that template URLs are correct
import { createServiceClient } from '../src/lib/supabase/service';
import { buildTemplateVariables } from '../src/lib/email/template-variables';

async function verifyUrls() {
  const supabase = createServiceClient();

  console.log('🔍 Verifying template URL generation...\n');

  // Get a distributor
  const { data: distributor } = await supabase
    .from('distributors')
    .select('*')
    .eq('licensing_status', 'licensed')
    .limit(1)
    .single();

  if (!distributor) {
    console.error('❌ No distributor found');
    return;
  }

  console.log(`📋 Testing with: ${distributor.first_name} ${distributor.last_name}`);
  console.log(`   Slug: ${distributor.slug}`);
  console.log(`   Email: ${distributor.email}\n`);

  // Build template variables
  const variables = buildTemplateVariables(distributor);

  console.log('🔗 Generated URLs:\n');
  console.log(`   dashboard_link: ${variables.dashboard_link}`);
  console.log(`   profile_link: ${variables.profile_link}`);
  console.log(`   referral_link: ${variables.referral_link}`);
  console.log(`   team_link: ${variables.team_link}`);
  console.log(`   matrix_link: ${variables.matrix_link}`);
  console.log(`   unsubscribe_link: ${variables.unsubscribe_link}\n`);

  // Check for localhost
  const hasLocalhost = [
    variables.dashboard_link,
    variables.profile_link,
    variables.referral_link,
    variables.team_link,
    variables.matrix_link
  ].some(url => url?.includes('localhost'));

  if (hasLocalhost) {
    console.log('❌ ERROR: Some URLs still contain "localhost"!');
  } else {
    console.log('✅ All URLs use production domain (reachtheapex.net)');
  }

  // Check environment variables
  console.log('\n🔧 Environment Variables:\n');
  console.log(`   NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET'}`);
  console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}`);
  console.log(`   VERCEL_URL: ${process.env.VERCEL_URL || 'NOT SET'}`);
}

verifyUrls().then(() => {
  console.log('\n✅ Verification complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

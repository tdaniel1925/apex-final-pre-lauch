// Check email_campaigns table schema
import { createServiceClient } from '../src/lib/supabase/service';

async function checkSchema() {
  const supabase = createServiceClient();

  console.log('🔍 Checking email_campaigns table schema...\n');

  // Try to select from an empty result to see available columns
  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .limit(1);

  console.log('Query result:');
  console.log('Data:', data);
  console.log('Error:', error);

  // Also check if any campaigns exist
  const { data: allCampaigns, error: allError } = await supabase
    .from('email_campaigns')
    .select('*');

  console.log('\n📊 Total campaigns in database:', allCampaigns?.length || 0);

  if (allCampaigns && allCampaigns.length > 0) {
    console.log('\nSample campaign record:');
    console.log(JSON.stringify(allCampaigns[0], null, 2));
    console.log('\nAvailable columns:');
    console.log(Object.keys(allCampaigns[0]).join(', '));
  }
}

checkSchema().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

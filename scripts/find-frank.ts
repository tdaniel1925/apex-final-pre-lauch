// Find Frank distributor
import { createServiceClient } from '../src/lib/supabase/service';

async function findFrank() {
  const supabase = createServiceClient();

  console.log('🔍 Searching for Frank...\n');

  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .ilike('first_name', '%frank%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No distributors named Frank found');
    return;
  }

  console.log(`✅ Found ${data.length} distributor(s) named Frank:\n`);
  data.forEach((d, i) => {
    console.log(`${i + 1}. ${d.first_name} ${d.last_name}`);
    console.log(`   Email: ${d.email}`);
    console.log(`   Slug: ${d.slug}`);
    console.log(`   Rep #: ${d.rep_number}`);
    console.log(`   Phone: ${d.phone || 'Not set'}`);
    console.log(`   Created: ${new Date(d.created_at).toLocaleString()}`);
    console.log(`   Auth User ID: ${d.auth_user_id || 'Not set'}`);
    console.log(`   Status: ${d.status}`);
    console.log('');
  });
}

findFrank().then(() => {
  console.log('✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

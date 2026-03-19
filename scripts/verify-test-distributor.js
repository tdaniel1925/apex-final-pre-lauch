require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log('\n🔍 Verifying test distributor setup...\n');

  // Get auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const testDistributor = authUsers?.users?.find((u) => u.email === 'test-distributor@example.com');

  if (!testDistributor) {
    console.log('❌ Test distributor auth user not found');
    return;
  }

  console.log('✅ Auth user found:');
  console.log('   ID:', testDistributor.id);
  console.log('   Email:', testDistributor.email);

  // Get distributor record
  const { data: distRecord, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('auth_user_id', testDistributor.id)
    .single();

  if (error || !distRecord) {
    console.log('\n❌ Distributor record not found for auth_user_id:', testDistributor.id);
    console.log('   Error:', error?.message);
    return;
  }

  console.log('\n✅ Distributor record found:');
  console.log('   ID:', distRecord.id);
  console.log('   Auth User ID:', distRecord.auth_user_id);
  console.log('   Email:', distRecord.email);
  console.log('   Tech Rank:', distRecord.tech_rank);
  console.log('   Slug:', distRecord.slug);

  console.log('\n✅ Distributor setup verified!');
}

verify().catch(console.error);

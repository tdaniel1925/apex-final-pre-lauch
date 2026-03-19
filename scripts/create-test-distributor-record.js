require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDistributorRecord() {
  console.log('\n🔧 Creating test distributor database record...\n');

  // Get auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const testDistributor = authUsers?.users?.find((u) => u.email === 'test-distributor@example.com');

  if (!testDistributor) {
    console.log('❌ Test distributor auth user not found');
    return;
  }

  // Check if record already exists
  const { data: existing } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', testDistributor.id)
    .maybeSingle();

  if (existing) {
    console.log('✅ Distributor record already exists');
    return;
  }

  // Create distributor record - let tech_rank and business_type use defaults
  const { data: newDistributor, error} = await supabase
    .from('distributors')
    .insert({
      auth_user_id: testDistributor.id,
      email: 'test-distributor@example.com',
      first_name: 'Test',
      last_name: 'Distributor',
      slug: 'test-distributor',
      affiliate_code: 'TEST-DIST',
      sponsor_id: null,
      phone: '555-0100',
    })
    .select()
    .single();

  if (error) {
    console.log('❌ Error creating distributor record:', error.message);
    return;
  }

  console.log('✅ Distributor record created!');
  console.log('   ID:', newDistributor.id);
  console.log('   Email:', newDistributor.email);
  console.log('   Affiliate Code:', newDistributor.affiliate_code);
}

createDistributorRecord();

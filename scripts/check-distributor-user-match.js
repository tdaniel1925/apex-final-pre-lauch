require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMatch() {
  console.log('\n🔍 Checking test-distributor user and database record match...\n');

  // 1. Get auth user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Error listing users:', listError);
    return;
  }

  const distributorAuthUser = users.find(u => u.email === 'test-distributor@example.com');

  if (!distributorAuthUser) {
    console.log('❌ No auth user found for test-distributor@example.com');
    return;
  }

  console.log('✅ Auth User Found:');
  console.log('   ID:', distributorAuthUser.id);
  console.log('   Email:', distributorAuthUser.email);

  // 2. Get distributor database record
  const { data: distRecord, error: distError } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', 'test-distributor@example.com')
    .single();

  if (distError) {
    console.log('\n❌ No distributor record found');
    console.log('   Error:', distError.message);
    return;
  }

  console.log('\n✅ Distributor Record Found:');
  console.log('   ID:', distRecord.id);
  console.log('   Email:', distRecord.email);
  console.log('   Auth User ID:', distRecord.auth_user_id);
  console.log('   Tech Rank:', distRecord.tech_rank);

  // 3. Check if they match
  console.log('\n📊 Match Status:');
  if (distributorAuthUser.id === distRecord.auth_user_id) {
    console.log('   ✅ IDs MATCH - Everything is correct!');
  } else {
    console.log('   ❌ IDS DO NOT MATCH - This is the problem!');
    console.log('   Auth User ID:    ', distributorAuthUser.id);
    console.log('   Distributor auth_user_id:', distRecord.auth_user_id);
    console.log('\n💡 Fix: Update distributor record with correct auth_user_id');
  }
}

checkMatch().catch(console.error);

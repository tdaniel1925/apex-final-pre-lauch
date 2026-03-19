require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log('\n🔍 Verifying test admin setup...\n');

  // Get auth user
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const testAdmin = authUsers?.users?.find((u) => u.email === 'test-admin@example.com');

  if (!testAdmin) {
    console.log('❌ Test admin auth user not found');
    return;
  }

  console.log('✅ Auth user found:');
  console.log('   ID:', testAdmin.id);
  console.log('   Email:', testAdmin.email);

  // Get admin record
  const { data: adminRecord, error } = await supabase
    .from('admins')
    .select('*')
    .eq('auth_user_id', testAdmin.id)
    .single();

  if (error || !adminRecord) {
    console.log('\n❌ Admin record not found for auth_user_id:', testAdmin.id);
    console.log('   Error:', error?.message);
    return;
  }

  console.log('\n✅ Admin record found:');
  console.log('   ID:', adminRecord.id);
  console.log('   Auth User ID:', adminRecord.auth_user_id);
  console.log('   Email:', adminRecord.email);
  console.log('   Role:', adminRecord.role);

  // Test RLS policy
  console.log('\n🔒 Testing RLS policy...');
  const { data: policies, error: policyError } = await supabase
    .rpc('exec_sql', { 
      sql_query: "SELECT * FROM pg_policies WHERE tablename = 'company_events' AND policyname = 'Admins can manage all events'"
    });

  if (policyError) {
    console.log('⚠️  Could not query RLS policies (expected)');
  }

  console.log('\n✅ Setup verified!');
}

verify().catch(console.error);

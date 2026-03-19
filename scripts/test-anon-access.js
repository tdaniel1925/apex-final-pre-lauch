const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAnonAccess() {
  console.log('🔍 Testing Anonymous Access...\n');

  // Create ANON client (no auth)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Try to read members table as anonymous user
  const { data, error } = await anonClient
    .from('members')
    .select('member_id')
    .limit(1);

  console.log('Data:', data);
  console.log('Error:', error);

  if (error) {
    console.log('\n✅ SUCCESS: Anonymous access is BLOCKED');
    console.log('Error message:', error.message);
  } else if (!data || data.length === 0) {
    console.log('\n✅ SUCCESS: Anonymous access returns no data');
  } else {
    console.log('\n❌ FAILED: Anonymous user can still read data!');
    console.log('This means the RLS policy did not apply correctly.');
    console.log('\nTo fix:');
    console.log('1. Check Supabase Dashboard → Authentication → Policies');
    console.log('2. Verify "member_block_anon" policy exists on members table');
    console.log('3. Make sure it says "TO anon USING (false)"');
  }
}

testAnonAccess().catch(console.error);

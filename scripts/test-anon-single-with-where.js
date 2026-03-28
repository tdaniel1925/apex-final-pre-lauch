const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAnonSingleWithWhere() {
  console.log('🔍 Testing Anonymous Access with .eq().single()...\n');

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // First get a real member_id to test with
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: member } = await serviceClient
    .from('members')
    .select('member_id')
    .limit(1)
    .single();

  console.log('Testing with member_id:', member.member_id);
  console.log('');

  // Now try to query as anonymous with .eq().single()
  const { data, error } = await anonClient
    .from('members')
    .select('member_id')
    .eq('member_id', member.member_id)
    .single();

  console.log('Data:', data);
  console.log('Error:', error);
  console.log('');
  console.log('Test condition: data === null || error !== null');
  console.log('Result:', data === null || error !== null);
  console.log('');

  if (data === null && error !== null) {
    console.log('✅ RLS is working - anonymous blocked with error');
  } else if (data === null && error === null) {
    console.log('✅ RLS is working - anonymous blocked with null data');
  } else if (data !== null) {
    console.log('❌ RLS FAILED - anonymous can read data!');
  }
}

testAnonSingleWithWhere().catch(console.error);

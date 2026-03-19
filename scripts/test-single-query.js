const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSingleQuery() {
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Simulate the test query with .single()
  const { data, error } = await anonClient
    .from('members')
    .select('member_id')
    .limit(1)
    .single();

  console.log('Data:', data);
  console.log('Error:', error);
  console.log('');
  console.log('Test condition: data === null || error !== null');
  console.log('Result:', data === null || error !== null);
}

testSingleQuery().catch(console.error);

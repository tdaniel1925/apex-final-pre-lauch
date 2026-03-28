const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testRLSDirect() {
  console.log('🔍 Testing RLS with Multiple Approaches...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Test 1: Anonymous client (should be blocked)
  console.log('TEST 1: Anonymous Client (should be blocked)');
  const anonClient = createClient(supabaseUrl, anonKey);

  const { data: anonData, error: anonError } = await anonClient
    .from('members')
    .select('member_id')
    .limit(1);

  console.log('  Data:', anonData);
  console.log('  Error:', anonError);
  console.log('  Blocked?', !anonData || anonData.length === 0 || anonError !== null);
  console.log('');

  // Test 2: Service role (should work)
  console.log('TEST 2: Service Role Client (should work)');
  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: serviceData, error: serviceError } = await serviceClient
    .from('members')
    .select('member_id')
    .limit(1);

  console.log('  Data count:', serviceData?.length || 0);
  console.log('  Error:', serviceError);
  console.log('  Works?', serviceData && serviceData.length > 0);
  console.log('');

  // Test 3: Check what role the anon client is using
  console.log('TEST 3: Check Anon Client Role');
  const { data: roleData } = await anonClient
    .rpc('current_user')
    .catch(() => ({ data: null }));

  console.log('  Current user:', roleData);
  console.log('');

  // Test 4: Try with explicit role set
  console.log('TEST 4: Force Anonymous Role');
  const { data: explicitAnonData, error: explicitAnonError } = await anonClient
    .from('members')
    .select('member_id')
    .limit(1);

  console.log('  Data:', explicitAnonData);
  console.log('  Error:', explicitAnonError);
  console.log('');

  // Summary
  console.log('═══════════════════════════════════');
  console.log('SUMMARY:');
  console.log('═══════════════════════════════════');
  console.log('Anon blocked:', !anonData || anonData.length === 0 || anonError !== null);
  console.log('Service works:', serviceData && serviceData.length > 0);

  if (anonData && anonData.length > 0) {
    console.log('\n❌ PROBLEM: Anonymous users can still read data!');
    console.log('This means RLS is not being enforced for the anon role.');
  } else {
    console.log('\n✅ SUCCESS: Anonymous users are blocked!');
  }
}

testRLSDirect().catch(console.error);

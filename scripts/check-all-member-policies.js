const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkAllPolicies() {
  console.log('🔍 Checking ALL RLS Policies on members table...\n');

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Query all policies on members table
  const { data, error } = await serviceClient
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'members')
    .order('policyname');

  if (error) {
    console.log('❌ Error:', error);
    return;
  }

  console.log(`Found ${data.length} policies on members table:\n`);

  data.forEach((policy, idx) => {
    console.log(`${idx + 1}. Policy: ${policy.policyname}`);
    console.log(`   Command: ${policy.cmd}`);
    console.log(`   Roles: ${policy.roles?.join(', ') || 'N/A'}`);
    console.log(`   Permissive: ${policy.permissive}`);
    console.log(`   USING: ${policy.qual || 'N/A'}`);
    console.log(`   WITH CHECK: ${policy.with_check || 'N/A'}`);
    console.log('');
  });

  // Check if there are any permissive policies for anon
  const anonPolicies = data.filter(p => p.roles?.includes('anon'));
  const permissiveAnonPolicies = anonPolicies.filter(p => p.permissive === 'PERMISSIVE');

  console.log('\n📊 Analysis:');
  console.log(`  Total policies: ${data.length}`);
  console.log(`  Policies for anon role: ${anonPolicies.length}`);
  console.log(`  Permissive policies for anon: ${permissiveAnonPolicies.length}`);
  console.log(`  Restrictive policies for anon: ${anonPolicies.length - permissiveAnonPolicies.length}`);

  if (permissiveAnonPolicies.length > 0) {
    console.log('\n⚠️  WARNING: Found permissive policies for anon role:');
    permissiveAnonPolicies.forEach(p => {
      console.log(`  - ${p.policyname} (${p.cmd}): ${p.qual}`);
    });
    console.log('\nThese PERMISSIVE policies allow access even with RESTRICTIVE blocking policies!');
    console.log('In PostgreSQL, PERMISSIVE policies are OR-ed together.');
    console.log('If ANY permissive policy allows access, the user gets access.');
  }
}

checkAllPolicies().catch(console.error);

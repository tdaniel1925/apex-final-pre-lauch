/**
 * Debug Johnathon Bunch signup issue
 * Check if he exists anywhere in the system
 */

import { createServiceClient } from '../src/lib/supabase/service';

const supabase = createServiceClient();

async function debugSignup() {
  console.log('🔍 Debugging Johnathon Bunch signup issue...\n');

  const targetEmail = 'johnathon.bunch@mark.com';

  // 1. Check distributors table
  console.log('1️⃣ Checking distributors table...');
  const { data: dist } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', targetEmail);

  if (dist && dist.length > 0) {
    console.log('   ✅ FOUND in distributors:', dist[0].id);
  } else {
    console.log('   ❌ NOT in distributors');
  }

  // 2. Check auth.users table
  console.log('\n2️⃣ Checking auth.users table...');
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(u => u.email === targetEmail);

  if (authUser) {
    console.log('   ✅ FOUND in auth.users:');
    console.log('      ID:', authUser.id);
    console.log('      Email:', authUser.email);
    console.log('      Created:', authUser.created_at);
    console.log('      Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
    console.log('      Last Sign In:', authUser.last_sign_in_at || 'Never');
  } else {
    console.log('   ❌ NOT in auth.users');
  }

  // 3. Check for similar emails (typos)
  console.log('\n3️⃣ Checking for similar emails...');
  const { data: similarEmails } = await supabase
    .from('distributors')
    .select('email, first_name, last_name, slug, created_at')
    .or('email.ilike.%bunch%,email.ilike.%johnathon%,email.ilike.%jonathan%');

  if (similarEmails && similarEmails.length > 0) {
    console.log('   ✅ Found similar emails:');
    similarEmails.forEach(e => {
      console.log(`      - ${e.email} (${e.first_name} ${e.last_name}) - ${e.slug}`);
    });
  } else {
    console.log('   ❌ No similar emails found');
  }

  // 4. Check members table (might be orphaned)
  console.log('\n4️⃣ Checking members table...');
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('email', targetEmail);

  if (member && member.length > 0) {
    console.log('   ✅ FOUND in members (ORPHANED):');
    console.log('      Member ID:', member[0].member_id);
    console.log('      Distributor ID:', member[0].distributor_id);
    console.log('      Status:', member[0].status);
  } else {
    console.log('   ❌ NOT in members');
  }

  // 5. Check for any email variations
  console.log('\n5️⃣ Checking email variations...');
  const variations = [
    'johnathon.bunch@mark.com',
    'jonathan.bunch@mark.com',
    'johnathonbunch@mark.com',
    'j.bunch@mark.com',
  ];

  for (const email of variations) {
    const { data } = await supabase
      .from('distributors')
      .select('email, first_name, last_name')
      .eq('email', email);

    if (data && data.length > 0) {
      console.log(`   ✅ FOUND: ${email}`);
    }
  }

  // 6. Check slug availability
  console.log('\n6️⃣ Checking potential slugs...');
  const slugs = ['johnathon-bunch', 'johnathonbunch', 'jbunch', 'johnathon'];

  for (const slug of slugs) {
    const { data } = await supabase
      .from('distributors')
      .select('slug, first_name, last_name, email')
      .eq('slug', slug);

    if (data && data.length > 0) {
      console.log(`   ⚠️  Slug "${slug}" is TAKEN by: ${data[0].first_name} ${data[0].last_name} (${data[0].email})`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (authUser && (!dist || dist.length === 0)) {
    console.log('⚠️  ISSUE: Auth user exists but NO distributor record');
    console.log('   This is an ORPHANED auth record from a failed signup.');
    console.log('   Solution: Delete auth user ID:', authUser.id);
  } else if (!authUser && (!dist || dist.length === 0)) {
    console.log('✅ Email is completely available for signup');
  } else {
    console.log('⚠️  Email is registered and active');
  }
}

debugSignup()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

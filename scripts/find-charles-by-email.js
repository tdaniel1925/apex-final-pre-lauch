require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = 'fyifromcharles@gmail.com';

async function findCharles() {
  console.log('='.repeat(60));
  console.log('SEARCHING FOR: ' + email);
  console.log('='.repeat(60));
  console.log();

  // Check distributor table
  console.log('1. Checking distributors table...');
  const { data: dist, error: distError } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', email)
    .single();

  if (distError && distError.code !== 'PGRST116') {
    console.error('Error:', distError);
  } else if (!dist) {
    console.log('   ❌ NO DISTRIBUTOR RECORD FOUND');
  } else {
    console.log('   ✅ DISTRIBUTOR FOUND:');
    console.log('      ID:', dist.id);
    console.log('      Name:', dist.first_name, dist.last_name);
    console.log('      Email:', dist.email);
    console.log('      Slug:', dist.slug);
    console.log('      Rep #:', dist.rep_number);
    console.log('      Status:', dist.status);
    console.log('      Matrix Depth:', dist.matrix_depth);
    console.log('      Matrix Position:', dist.matrix_position);
    console.log('      Sponsor ID:', dist.sponsor_id);
    console.log('      Created:', new Date(dist.created_at).toLocaleString());
  }

  console.log();

  // Check auth users
  console.log('2. Checking auth.users...');
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Error:', authError);
  } else {
    const charles = users.find(u => u.email === email);
    if (!charles) {
      console.log('   ❌ NO AUTH USER FOUND');
    } else {
      console.log('   ✅ AUTH USER FOUND:');
      console.log('      ID:', charles.id);
      console.log('      Email:', charles.email);
      console.log('      Created:', new Date(charles.created_at).toLocaleString());
      console.log('      Last Sign In:', charles.last_sign_in_at ? new Date(charles.last_sign_in_at).toLocaleString() : 'Never');
      console.log('      Email Confirmed:', charles.email_confirmed_at ? 'Yes' : 'No');
    }
  }

  console.log();
  console.log('='.repeat(60));

  // Summary
  const hasDistributor = !!dist;
  const hasAuthUser = !!users?.find(u => u.email === email);

  console.log('SUMMARY:');
  if (hasDistributor && hasAuthUser) {
    console.log('✅ Charles Potter EXISTS as complete user');
    console.log('   → Has both auth user and distributor record');
    console.log('   → Ready to use');
  } else if (hasAuthUser && !hasDistributor) {
    console.log('⚠️  Charles Potter has ORPHANED AUTH USER');
    console.log('   → Auth user exists but NO distributor record');
    console.log('   → Will cause redirect loops');
    console.log('   → Needs cleanup before signup');
  } else if (!hasAuthUser && !hasDistributor) {
    console.log('❌ Charles Potter does NOT exist');
    console.log('   → No auth user, no distributor record');
    console.log('   → Can sign up fresh');
  } else {
    console.log('⚠️  Unusual state - distributor without auth');
  }
  console.log('='.repeat(60));
}

findCharles()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const { createClient } = require('@supabase/supabase-js');

// Simulate what middleware does
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using ANON key like middleware
);

async function testMiddlewareFlow() {
  console.log('Testing middleware authentication flow...\n');

  // Step 1: Sign in
  console.log('Step 1: Signing in...');
  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'tdaniel@botmakers.ai',
    password: '4Xkilla1@'
  });

  if (signInError) {
    console.log('❌ Sign in failed:', signInError.message);
    return;
  }

  console.log('✅ Sign in successful');
  console.log('User ID:', authData.user.id);
  console.log('Email:', authData.user.email);

  // Step 2: Try to get user (what middleware does)
  console.log('\nStep 2: Getting user session (middleware check)...');
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError) {
    console.log('❌ Get user failed:', getUserError.message);
    return;
  }

  if (!user) {
    console.log('❌ No user found in session');
    return;
  }

  console.log('✅ User session found');
  console.log('User email:', user.email);

  // Step 3: Check distributor (what middleware does)
  console.log('\nStep 3: Checking distributor record with ANON key...');
  const { data: distributor, error: roleError } = await supabase
    .from('distributors')
    .select('is_admin')
    .eq('email', user.email)
    .single();

  if (roleError) {
    console.log('❌ Failed to get distributor:', roleError.message);
    console.log('Error details:', JSON.stringify(roleError, null, 2));
    console.log('\n⚠️  This is likely an RLS policy issue!');
    console.log('The middleware uses ANON key and cannot read distributors table.');
    return;
  }

  if (!distributor) {
    console.log('❌ No distributor found');
    return;
  }

  console.log('✅ Distributor found');
  console.log('Is admin:', distributor.is_admin);

  if (distributor.is_admin) {
    console.log('\n✅ WOULD ALLOW ACCESS TO /admin');
  } else {
    console.log('\n❌ WOULD REDIRECT TO /dashboard');
  }
}

testMiddlewareFlow();

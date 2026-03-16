const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAccount() {
  // Get the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  const user = authData.users.find(u => u.email === 'tdaniel@botmakers.ai');

  if (!user) {
    console.log('User not found in auth.users');
    return;
  }

  console.log('Auth User Found:');
  console.log('- ID:', user.id);
  console.log('- Email:', user.email);
  console.log('- Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
  console.log('- Last Sign In:', user.last_sign_in_at || 'Never');
  console.log('- Banned:', user.banned_until ? 'YES - BANNED' : 'No');

  // Check distributor record
  const { data: dist } = await supabase
    .from('distributors')
    .select('id, email, is_admin, auth_user_id')
    .eq('auth_user_id', user.id)
    .single();

  console.log('\nDistributor Record:');
  if (dist) {
    console.log('- Email:', dist.email);
    console.log('- Is Admin:', dist.is_admin);
  } else {
    console.log('- NOT FOUND');
  }

  // Try to sign in
  console.log('\nAttempting sign in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'tdaniel@botmakers.ai',
    password: '4Xkilla1@'
  });

  if (signInError) {
    console.log('Sign in FAILED:', signInError.message);
  } else {
    console.log('Sign in SUCCESS');
  }
}

checkAccount();

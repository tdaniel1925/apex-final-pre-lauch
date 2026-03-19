const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function resetPassword() {
  console.log('Resetting password for tdaniel@botmakers.ai...');

  // Use admin API to update user password
  const { data, error } = await supabase.auth.admin.updateUserById(
    'ab1e4182-144a-4e2e-8eda-879c1d50fc14',
    { password: '4Xkilla1@' }
  );

  if (error) {
    console.error('Error resetting password:', error);
    return;
  }

  console.log('Password reset successfully!');
  console.log('User can now log in with: tdaniel@botmakers.ai / 4Xkilla1@');

  // Test the login
  console.log('\nTesting login...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'tdaniel@botmakers.ai',
    password: '4Xkilla1@'
  });

  if (signInError) {
    console.log('Login test FAILED:', signInError.message);
  } else {
    console.log('Login test SUCCESS!');
  }
}

resetPassword();

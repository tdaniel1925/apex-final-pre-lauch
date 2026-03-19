const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword() {
  console.log('=== Resetting Password for Sella Daniel ===\n');

  const authUserId = '435a4b2c-e818-4e88-84ca-759a8a1e5786';
  const newPassword = '4Xkkilla1@';

  console.log('Updating password via Supabase Auth Admin API...');
  console.log('  Auth User ID:', authUserId);
  console.log('  Email: sellag.sb@gmail.com');
  console.log('  New Password: 4Xkkilla1@');

  const { data, error } = await supabase.auth.admin.updateUserById(
    authUserId,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Error resetting password:', error);
    return;
  }

  console.log('\n✅ Password reset successfully!');
  console.log('\nSella Daniel can now login with:');
  console.log('  Email: sellag.sb@gmail.com');
  console.log('  Password: 4Xkkilla1@');
  console.log('\nOR');
  console.log('  Username: sellad');
  console.log('  Password: 4Xkkilla1@');
}

resetPassword();

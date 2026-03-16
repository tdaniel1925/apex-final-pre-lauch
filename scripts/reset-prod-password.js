const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword() {
  const email = 'tdaniel@bundlefly.com';
  const newPassword = '4Xkilla1@'; // Your specified password

  console.log('Resetting password for:', email);

  // Get distributor
  const { data: dist, error: distError } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, auth_user_id, status')
    .eq('email', email)
    .single();

  if (distError) {
    console.log('❌ Error finding distributor:', distError.message);
    return;
  }

  console.log('✅ Found distributor:', dist.email);
  console.log('   Name:', dist.first_name, dist.last_name);
  console.log('   Status:', dist.status);
  console.log('   Auth User ID:', dist.auth_user_id || 'NONE');

  if (!dist.auth_user_id) {
    console.log('❌ No auth_user_id found. User needs to be created in auth.users first.');
    return;
  }

  // Reset password using admin API
  console.log('\nResetting password...');
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    dist.auth_user_id,
    {
      password: newPassword,
      email_confirm: true // Ensure email is confirmed
    }
  );

  if (updateError) {
    console.log('❌ Error updating password:', updateError.message);
    return;
  }

  console.log('✅ Password reset successfully!');
  console.log('\nLogin credentials:');
  console.log('  Email:', email);
  console.log('  Password:', newPassword);
  console.log('\nYou can now login at: https://reachtheapex.net/login');

  // Also get current auth user status
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(dist.auth_user_id);
  if (!authError && authUser) {
    console.log('\nAuth User Status:');
    console.log('  Email Confirmed:', authUser.user.email_confirmed_at ? 'Yes ✅' : 'No ❌');
    console.log('  Last Sign In:', authUser.user.last_sign_in_at || 'Never');
    console.log('  Created:', new Date(authUser.user.created_at).toISOString());
  }
}

resetPassword().catch(console.error);

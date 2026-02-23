// =============================================
// Reset Master Account Password
// Updates password for tdaniel@bundlefly.com
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetMasterPassword() {
  console.log('🔐 Resetting master account password...\n');

  const targetEmail = 'tdaniel@bundlefly.com';
  const newPassword = '4Xkilla1@';

  try {
    // Get the distributor
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, auth_user_id, email, first_name, last_name')
      .eq('email', targetEmail)
      .single();

    if (distError || !distributor) {
      console.error('❌ Distributor not found:', distError);
      process.exit(1);
    }

    console.log(`Found distributor: ${distributor.first_name} ${distributor.last_name}`);
    console.log(`Email: ${distributor.email}`);
    console.log(`Auth User ID: ${distributor.auth_user_id || 'NULL (need to create)'}\n`);

    let authUserId = distributor.auth_user_id;

    // If no auth user, create one
    if (!authUserId) {
      console.log('Creating auth user for master account...');

      const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
        email: targetEmail,
        password: newPassword,
        email_confirm: true,
      });

      if (createError || !newAuthUser.user) {
        console.error('❌ Error creating auth user:', createError);
        process.exit(1);
      }

      authUserId = newAuthUser.user.id;
      console.log(`✅ Created auth user: ${authUserId}`);

      // Link auth user to distributor
      const { error: updateDistError } = await supabase
        .from('distributors')
        .update({ auth_user_id: authUserId })
        .eq('id', distributor.id);

      if (updateDistError) {
        console.error('❌ Error linking auth user to distributor:', updateDistError);
        process.exit(1);
      }

      console.log('✅ Linked auth user to distributor\n');
    } else {
      // Update existing auth user password
      console.log('Updating existing auth user password...');

      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        authUserId,
        { password: newPassword }
      );

      if (updateError) {
        console.error('❌ Error updating password:', updateError);
        process.exit(1);
      }

      console.log('✅ Password updated\n');
    }

    console.log('✅ Password updated successfully!\n');
    console.log('═'.repeat(60));
    console.log('🔑 NEW LOGIN CREDENTIALS');
    console.log('═'.repeat(60));
    console.log(`Email:    ${targetEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log('═'.repeat(60));
    console.log('\n✅ You can now login at http://localhost:3050/login');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

resetMasterPassword()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

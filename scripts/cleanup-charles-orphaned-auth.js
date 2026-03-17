// =============================================
// CLEANUP Charles Potter's Orphaned Auth User
// Email: fyifromcharles@gmail.com
// Issue: Auth user exists but NO distributor record
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const email = 'fyifromcharles@gmail.com';

async function cleanupOrphanedAuth() {
  console.log('='.repeat(60));
  console.log('CLEANUP ORPHANED AUTH USER');
  console.log('Email: ' + email);
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Find the auth user
    console.log('Step 1: Finding auth user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    const authUser = users.find(u => u.email === email);

    if (!authUser) {
      console.log('✅ No auth user found with this email');
      console.log('   Charles can sign up fresh');
      return;
    }

    console.log('   ✅ Auth user found:');
    console.log('      ID:', authUser.id);
    console.log('      Email:', authUser.email);
    console.log('      Created:', new Date(authUser.created_at).toLocaleString());
    console.log('      Last Sign In:', authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : 'Never');
    console.log();

    // Step 2: Verify NO distributor exists (safety check)
    console.log('Step 2: Verifying no distributor record...');
    const { data: dist } = await supabase
      .from('distributors')
      .select('id')
      .eq('email', email)
      .single();

    if (dist) {
      console.log('⚠️  STOP! Distributor record EXISTS');
      console.log('   This is NOT an orphaned auth user');
      console.log('   Do not delete - investigate further');
      return;
    }

    console.log('   ✅ Confirmed: No distributor record (orphaned auth)');
    console.log();

    // Step 3: Delete the orphaned auth user
    console.log('Step 3: Deleting orphaned auth user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);

    if (deleteError) {
      console.error('❌ Failed to delete auth user:', deleteError);
      return;
    }

    console.log('   ✅ Successfully deleted orphaned auth user!');
    console.log();

    console.log('='.repeat(60));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('NEXT STEPS:');
    console.log('1. Charles can now sign up fresh at: https://reachtheapex.net/signup');
    console.log('2. Use the SAME email: fyifromcharles@gmail.com');
    console.log('3. Choose a unique username/slug');
    console.log('4. Complete all signup steps');
    console.log('5. After signup, we can move Donna Potter under him');
    console.log();

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupOrphanedAuth()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

// =============================================
// Cleanup Charles Potter's Orphaned Auth User
// =============================================
// Issue: Charles Potter has orphaned auth user causing redirect loops
// This script finds and deletes the orphaned auth user
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupCharlesPotter() {
  console.log('='.repeat(60));
  console.log('CHARLES POTTER ORPHANED AUTH CLEANUP');
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Search for Charles Potter in auth.users
    console.log('Step 1: Searching for Charles Potter in auth.users...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      return;
    }

    // Search for any variation of Charles Potter
    const charlesPotterUsers = users.filter(u => {
      if (!u.email) return false;
      const email = u.email.toLowerCase();
      return (email.includes('charles') && email.includes('potter')) ||
             email.includes('charlespotter') ||
             email.includes('cpotter');
    });

    console.log(`Found ${charlesPotterUsers.length} potential Charles Potter auth user(s)\n`);

    if (charlesPotterUsers.length === 0) {
      console.log('✅ No orphaned Charles Potter auth users found.');
      console.log('   Charles can sign up fresh with no issues.');
      return;
    }

    // Step 2: Check each auth user for corresponding distributor record
    for (const authUser of charlesPotterUsers) {
      console.log('-'.repeat(60));
      console.log(`Checking auth user: ${authUser.email} (ID: ${authUser.id})`);
      console.log(`  Created: ${new Date(authUser.created_at).toLocaleString()}`);

      // Check if distributor exists
      const { data: distributor, error: distError } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email, status')
        .eq('auth_user_id', authUser.id)
        .single();

      if (distError && distError.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('  ⚠️  Error checking distributor:', distError.message);
        continue;
      }

      if (distributor) {
        console.log('  ✅ Distributor exists:');
        console.log(`     Name: ${distributor.first_name} ${distributor.last_name}`);
        console.log(`     Status: ${distributor.status}`);
        console.log('     → NOT ORPHANED (no action needed)');
      } else {
        console.log('  ❌ NO DISTRIBUTOR RECORD FOUND');
        console.log('     → ORPHANED AUTH USER DETECTED');
        console.log();
        console.log('  🧹 Deleting orphaned auth user...');

        const { error: deleteError } = await supabase.auth.admin.deleteUser(authUser.id);

        if (deleteError) {
          console.error('  ❌ Failed to delete:', deleteError.message);
        } else {
          console.log('  ✅ Successfully deleted orphaned auth user');
          console.log(`     Email: ${authUser.email}`);
          console.log('     Charles can now sign up again with this email.');
        }
      }
    }

    console.log();
    console.log('='.repeat(60));
    console.log('CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log();
    console.log('Next Steps:');
    console.log('1. Have Charles Potter sign up again at: https://reachtheapex.net/signup');
    console.log('2. Make sure Donna Potter uses Charles\' referral link if she signs up again');
    console.log('3. Current Donna Potter record (Rep #489) can be updated to point to Charles after he signs up');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupCharlesPotter()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

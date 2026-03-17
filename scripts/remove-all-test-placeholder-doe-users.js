require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeAllTestPlaceholderDoeUsers() {
  console.log('='.repeat(70));
  console.log('REMOVE ALL TEST, PLACEHOLDER, AND DOE USERS');
  console.log('='.repeat(70));
  console.log();

  // Get all distributors
  const { data: allDistributors } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, auth_user_id, is_master')
    .order('rep_number', { ascending: true });

  if (!allDistributors) {
    console.log('❌ Could not fetch distributors');
    return;
  }

  // Filter test/placeholder users
  const testUsers = allDistributors.filter(d => {
    if (d.is_master) return false; // Don't delete Apex Vision

    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    const email = (d.email || '').toLowerCase();
    const slug = (d.slug || '').toLowerCase();

    // Check for test patterns
    const isTest =
      fullName.includes('test') ||
      email.includes('test') ||
      slug.includes('test') ||
      fullName.includes('placeholder') ||
      fullName.includes('doe') ||
      fullName.includes('johnny be goode') ||
      email.includes('example.com') ||
      email.includes('tester') ||
      email.includes('placeholder.com') ||
      slug.includes('placeholder');

    return isTest;
  });

  console.log(`Found ${testUsers.length} test/placeholder/doe users to remove:`);
  console.log();

  testUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.first_name} ${user.last_name} (Rep #${user.rep_number})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Slug: ${user.slug}`);
    console.log(`   ID: ${user.id}`);
    console.log();
  });

  if (testUsers.length === 0) {
    console.log('✅ No test users found - all clean!');
    return;
  }

  console.log('='.repeat(70));
  console.log('⚠️  WARNING: About to delete these users permanently!');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Get all test user distributor IDs and member IDs
  const testDistributorIds = testUsers.map(u => u.id);

  // Get member_ids for these users
  const { data: testMembers } = await supabase
    .from('members')
    .select('member_id, distributor_id')
    .in('distributor_id', testDistributorIds);

  const testMemberIds = (testMembers || []).map(m => m.member_id);

  console.log('Step 1: Checking for orphaned enrollees...');

  // Find anyone enrolled under test users
  if (testMemberIds.length > 0) {
    const { data: orphanedMembers } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id, distributor_id')
      .in('enroller_id', testMemberIds);

    if (orphanedMembers && orphanedMembers.length > 0) {
      console.log(`   ⚠️  Found ${orphanedMembers.length} members enrolled under test users`);
      console.log('   Setting their enroller_id to NULL...');

      // Set enroller_id to NULL for orphaned members
      const { error: orphanError } = await supabase
        .from('members')
        .update({ enroller_id: null })
        .in('member_id', orphanedMembers.map(m => m.member_id));

      if (orphanError) {
        console.log(`   ⚠️  Error updating orphaned members: ${orphanError.message}`);
      } else {
        console.log(`   ✅ Updated ${orphanedMembers.length} orphaned members`);
      }
    } else {
      console.log('   ✅ No orphaned enrollees found');
    }
  }
  console.log();

  // Step 2: Delete from members table
  console.log('Step 2: Deleting from members table...');
  const { error: membersError, count: membersCount } = await supabase
    .from('members')
    .delete()
    .in('distributor_id', testDistributorIds);

  if (membersError) {
    console.log(`   ⚠️  Error deleting members: ${membersError.message}`);
  } else {
    console.log(`   ✅ Deleted ${testMembers?.length || 0} member records`);
  }
  console.log();

  // Step 3: Delete from distributors table
  console.log('Step 3: Deleting from distributors table...');
  const { error: distributorsError } = await supabase
    .from('distributors')
    .delete()
    .in('id', testDistributorIds);

  if (distributorsError) {
    console.log(`   ⚠️  Error deleting distributors: ${distributorsError.message}`);
  } else {
    console.log(`   ✅ Deleted ${testUsers.length} distributor records`);
  }
  console.log();

  // Step 4: Delete auth users
  console.log('Step 4: Deleting auth users...');
  let authUsersDeleted = 0;

  for (const user of testUsers) {
    if (!user.auth_user_id) continue;

    const { error } = await supabase.auth.admin.deleteUser(user.auth_user_id);

    if (!error) {
      authUsersDeleted++;
    } else {
      console.log(`   ⚠️  Error deleting auth user for ${user.first_name} ${user.last_name}: ${error.message}`);
    }
  }

  console.log(`   ✅ Deleted ${authUsersDeleted} auth users`);
  console.log();

  console.log('='.repeat(70));
  console.log('✅ CLEANUP COMPLETE');
  console.log('='.repeat(70));
  console.log();
  console.log('Summary:');
  console.log(`- ${testMembers?.length || 0} member records deleted`);
  console.log(`- ${testUsers.length} distributor records deleted`);
  console.log(`- ${authUsersDeleted} auth users deleted`);
  console.log();
  console.log('✅ All test, placeholder, and Doe users have been removed');
  console.log();
}

removeAllTestPlaceholderDoeUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

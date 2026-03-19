require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeAllTestUsers() {
  console.log('='.repeat(70));
  console.log('REMOVE ALL TEST USERS');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Find all test users
  console.log('Step 1: Finding all test users...');
  console.log();

  const { data: testDistributors } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, auth_user_id')
    .or('first_name.ilike.%test%,last_name.ilike.%test%,email.ilike.%test%,slug.ilike.%test%')
    .order('rep_number', { ascending: true });

  if (!testDistributors || testDistributors.length === 0) {
    console.log('✅ No test users found');
    return;
  }

  console.log(`Found ${testDistributors.length} test users:`);
  console.log();
  testDistributors.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Slug: ${user.slug}`);
    console.log(`   Rep #: ${user.rep_number}`);
    console.log(`   Distributor ID: ${user.id}`);
    console.log(`   Auth User ID: ${user.auth_user_id || 'None'}`);
    console.log();
  });

  console.log('='.repeat(70));
  console.log('⚠️  WARNING: About to delete these users permanently!');
  console.log('='.repeat(70));
  console.log();

  // Step 2: Delete from members table first (foreign key constraint)
  console.log('Step 2: Deleting from members table...');
  let membersDeleted = 0;

  for (const user of testDistributors) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('distributor_id', user.id);

    if (!error) {
      membersDeleted++;
    } else {
      console.log(`   ⚠️  Error deleting member for ${user.first_name} ${user.last_name}: ${error.message}`);
    }
  }

  console.log(`   ✅ Deleted ${membersDeleted} member records`);
  console.log();

  // Step 3: Delete from distributors table
  console.log('Step 3: Deleting from distributors table...');
  let distributorsDeleted = 0;

  for (const user of testDistributors) {
    const { error } = await supabase
      .from('distributors')
      .delete()
      .eq('id', user.id);

    if (!error) {
      distributorsDeleted++;
    } else {
      console.log(`   ⚠️  Error deleting distributor ${user.first_name} ${user.last_name}: ${error.message}`);
    }
  }

  console.log(`   ✅ Deleted ${distributorsDeleted} distributor records`);
  console.log();

  // Step 4: Delete auth users
  console.log('Step 4: Deleting auth users...');
  let authUsersDeleted = 0;

  for (const user of testDistributors) {
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

  // Step 5: Clean up orphaned enrollees (if any test user was an enroller)
  console.log('Step 5: Checking for orphaned enrollees...');

  const testMemberIds = testDistributors.map(d => d.id);

  // Get members table to find member_ids for test users
  const { data: testMembers } = await supabase
    .from('members')
    .select('member_id')
    .in('distributor_id', testMemberIds);

  if (testMembers && testMembers.length > 0) {
    const testMemberIdList = testMembers.map(m => m.member_id);

    // Find anyone enrolled under test users
    const { data: orphanedMembers } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id')
      .in('enroller_id', testMemberIdList);

    if (orphanedMembers && orphanedMembers.length > 0) {
      console.log(`   ⚠️  Found ${orphanedMembers.length} members enrolled under test users:`);
      orphanedMembers.forEach(m => {
        console.log(`      - ${m.full_name}`);
      });
      console.log('   These members enroller_id will need to be reassigned');
    } else {
      console.log('   ✅ No orphaned enrollees found');
    }
  } else {
    console.log('   ✅ No orphaned enrollees found');
  }

  console.log();
  console.log('='.repeat(70));
  console.log('✅ CLEANUP COMPLETE');
  console.log('='.repeat(70));
  console.log();
  console.log('Summary:');
  console.log(`- ${membersDeleted} member records deleted`);
  console.log(`- ${distributorsDeleted} distributor records deleted`);
  console.log(`- ${authUsersDeleted} auth users deleted`);
  console.log();
  console.log('✅ All test users have been removed');
  console.log();
}

removeAllTestUsers()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

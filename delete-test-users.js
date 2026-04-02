import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestUsers() {
  console.log('========================================');
  console.log('Finding and Deleting Test Users');
  console.log('========================================\n');

  // Step 1: Find all test users
  console.log('Step 1: Finding all test users...\n');

  // Find users with test emails
  const { data: testUsers, error: findError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, slug, rep_number, auth_user_id')
    .or('email.like.%crm-test-%,email.like.%flyer-test-%,email.like.%@example.com%,first_name.eq.CRM Test,first_name.eq.Flyer Test')
    .order('created_at', { ascending: true });

  if (findError) {
    console.error('❌ Error finding test users:', findError);
    return;
  }

  if (!testUsers || testUsers.length === 0) {
    console.log('✅ No test users found to delete');
    return;
  }

  console.log(`Found ${testUsers.length} test users:\n`);
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rep #: ${user.rep_number}`);
    console.log(`   Slug: ${user.slug}`);
    console.log(`   Distributor ID: ${user.id}`);
    console.log(`   Auth User ID: ${user.auth_user_id || 'None'}`);
    console.log('');
  });

  console.log('========================================\n');

  // Step 2: Delete from auth.users first (if auth_user_id exists)
  console.log('Step 2: Deleting from auth.users table...\n');

  let authDeleteCount = 0;
  for (const user of testUsers) {
    if (user.auth_user_id) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.auth_user_id);

      if (authDeleteError) {
        console.log(`⚠️  Could not delete auth user for ${user.email}: ${authDeleteError.message}`);
      } else {
        authDeleteCount++;
        console.log(`✅ Deleted auth user for ${user.email}`);
      }
    }
  }

  console.log(`\nDeleted ${authDeleteCount} auth users\n`);
  console.log('========================================\n');

  // Step 3: Delete from members table (if exists)
  console.log('Step 3: Deleting from members table...\n');

  const distributorIds = testUsers.map(u => u.id);

  const { error: membersDeleteError, count: membersCount } = await supabase
    .from('members')
    .delete({ count: 'exact' })
    .in('distributor_id', distributorIds);

  if (membersDeleteError) {
    console.log(`⚠️  Error deleting from members: ${membersDeleteError.message}`);
  } else {
    console.log(`✅ Deleted ${membersCount || 0} member records\n`);
  }

  // Step 4: Delete from activity_feed (actor or target)
  console.log('Step 4: Deleting from activity_feed...\n');

  const { error: activityDeleteError, count: activityCount } = await supabase
    .from('activity_feed')
    .delete({ count: 'exact' })
    .or(distributorIds.map(id => `actor_id.eq.${id},target_id.eq.${id}`).join(','));

  if (activityDeleteError) {
    console.log(`⚠️  Error deleting from activity_feed: ${activityDeleteError.message}`);
  } else {
    console.log(`✅ Deleted ${activityCount || 0} activity feed records\n`);
  }

  // Step 5: Delete from service_access
  console.log('Step 5: Deleting from service_access...\n');

  const { error: serviceDeleteError, count: serviceCount } = await supabase
    .from('service_access')
    .delete({ count: 'exact' })
    .in('distributor_id', distributorIds);

  if (serviceDeleteError) {
    console.log(`⚠️  Error deleting from service_access: ${serviceDeleteError.message}`);
  } else {
    console.log(`✅ Deleted ${serviceCount || 0} service access records\n`);
  }

  // Step 6: Delete from distributors table
  console.log('Step 6: Deleting from distributors table...\n');

  const { error: distDeleteError, count: distCount } = await supabase
    .from('distributors')
    .delete({ count: 'exact' })
    .in('id', distributorIds);

  if (distDeleteError) {
    console.error('❌ Error deleting from distributors:', distDeleteError);
    return;
  }

  console.log(`✅ Deleted ${distCount || 0} distributor records\n`);

  console.log('========================================');
  console.log('Deletion Summary:');
  console.log('========================================');
  console.log(`Auth Users:        ${authDeleteCount}`);
  console.log(`Members:           ${membersCount || 0}`);
  console.log(`Activity Feed:     ${activityCount || 0}`);
  console.log(`Service Access:    ${serviceCount || 0}`);
  console.log(`Distributors:      ${distCount || 0}`);
  console.log('========================================');
  console.log('\n✅ All test users have been deleted!');
}

deleteTestUsers();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteTestUsersV2() {
  console.log('========================================');
  console.log('Finding and Deleting Test Users (V2)');
  console.log('========================================\n');

  // Step 1: Find all test users
  console.log('Step 1: Finding all test users...\n');

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

  console.log(`Found ${testUsers.length} test users to delete\n`);

  const distributorIds = testUsers.map(u => u.id);

  // Delete in the correct order to handle foreign key constraints

  // 1. Delete from crm_contacts (if they have any)
  console.log('Deleting from crm_contacts...');
  const { error: contactsError } = await supabase
    .from('crm_contacts')
    .delete()
    .in('distributor_id', distributorIds);
  if (contactsError) console.log(`⚠️  ${contactsError.message}`);

  // 2. Delete from crm_activities
  console.log('Deleting from crm_activities...');
  const { error: activitiesError } = await supabase
    .from('crm_activities')
    .delete()
    .in('distributor_id', distributorIds);
  if (activitiesError) console.log(`⚠️  ${activitiesError.message}`);

  // 3. Delete from crm_tasks
  console.log('Deleting from crm_tasks...');
  const { error: tasksError } = await supabase
    .from('crm_tasks')
    .delete()
    .in('distributor_id', distributorIds);
  if (tasksError) console.log(`⚠️  ${tasksError.message}`);

  // 4. Delete from autopilot_leads
  console.log('Deleting from autopilot_leads...');
  const { error: leadsError } = await supabase
    .from('autopilot_leads')
    .delete()
    .in('distributor_id', distributorIds);
  if (leadsError) console.log(`⚠️  ${leadsError.message}`);

  // 5. Delete from earnings_ledger
  console.log('Deleting from earnings_ledger...');
  const { error: earningsError } = await supabase
    .from('earnings_ledger')
    .delete()
    .in('distributor_id', distributorIds);
  if (earningsError) console.log(`⚠️  ${earningsError.message}`);

  // 6. Delete from activity_feed
  console.log('Deleting from activity_feed...');
  for (const id of distributorIds) {
    await supabase.from('activity_feed').delete().eq('actor_id', id);
    await supabase.from('activity_feed').delete().eq('target_id', id);
  }

  // 7. Delete from service_access
  console.log('Deleting from service_access...');
  const { error: serviceError } = await supabase
    .from('service_access')
    .delete()
    .in('distributor_id', distributorIds);
  if (serviceError) console.log(`⚠️  ${serviceError.message}`);

  // 8. Delete from members
  console.log('Deleting from members...');
  const { error: membersError } = await supabase
    .from('members')
    .delete()
    .in('distributor_id', distributorIds);
  if (membersError) console.log(`⚠️  ${membersError.message}`);

  // 9. Finally delete from distributors
  console.log('Deleting from distributors...');
  const { error: distError } = await supabase
    .from('distributors')
    .delete()
    .in('id', distributorIds);

  if (distError) {
    console.error('❌ Error deleting distributors:', distError);
  } else {
    console.log('✅ Distributors deleted successfully');
  }

  // Verify deletion
  console.log('\nVerifying deletion...');
  const { data: remaining, error: verifyError } = await supabase
    .from('distributors')
    .select('id, email')
    .or('email.like.%crm-test-%,email.like.%flyer-test-%,email.like.%@example.com%');

  if (remaining && remaining.length > 0) {
    console.log(`⚠️  ${remaining.length} test users still remain:`);
    remaining.forEach(r => console.log(`   - ${r.email}`));
  } else {
    console.log('✅ All test users successfully deleted!');
  }

  console.log('\n========================================');
  console.log('Deletion Complete');
  console.log('========================================');
}

deleteTestUsersV2();

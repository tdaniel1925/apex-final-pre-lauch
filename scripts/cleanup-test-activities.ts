// =============================================
// Cleanup Test Activities Script
// Removes all test/dummy activity entries
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';

async function cleanupTestActivities() {
  const supabase = createServiceClient();

  console.log('🧹 Cleaning up test/dummy activity entries...\n');

  // Test activity IDs identified in audit
  const testActivityIds = [
    '599bda06-91ab-4851-a01c-f0a09477bdfb', // Rep5 Test
    'fad9c301-657f-40ae-a5cf-127a4237bed9', // Rep5 Test
    '166b300d-5e5c-4979-ac03-b840a64529e4', // Rep4 Test
    'ed9e3141-b07b-4b03-bb0a-042d67202f76', // Rep4 Test
    'bd120776-7502-4a1e-9e20-a05a1c2662d8', // Rep3 Test
    '6077ad67-f43a-441f-961b-308ed427d299', // Rep3 Test
    '7121a96a-2830-4864-8941-bd91a934c8f6', // Rep2 Test
    'e3d6b919-1faf-4e6d-a3a8-12d881e5f935', // Rep2 Test
    'f4a8fdfc-a4fa-4d07-99fe-34ea5c37b3c2', // Rep1 Test
    'af9968ec-0526-4aaa-8d3c-ec492ea70b9a', // Rep1 Test
    'd22db96a-4dc0-4cb7-9a08-40be68f776da', // TestUser Debug
    '51293dbd-1abc-4224-aeb2-0c3361338b91', // John TestUser
    '78a90826-4d1f-462c-9e77-8747c5bec240', // John TestUser
    'dad7112c-fa61-426d-95fa-fc4e98d3e229', // John TestUser
  ];

  // 1. Show what will be deleted
  const { data: activitiesToDelete, error: fetchError } = await supabase
    .from('activity_feed')
    .select(`
      id,
      event_type,
      event_title,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(first_name, last_name)
    `)
    .in('id', testActivityIds);

  if (fetchError) {
    console.error('❌ Error fetching test activities:', fetchError);
    return;
  }

  console.log(`📋 Found ${activitiesToDelete?.length || 0} test activities to delete:\n`);

  activitiesToDelete?.forEach((activity: any, index: number) => {
    console.log(`${index + 1}. ${activity.event_title}`);
    console.log(`   Actor: ${activity.actor?.first_name || 'N/A'} ${activity.actor?.last_name || ''}`);
    console.log(`   Type: ${activity.event_type}`);
    console.log(`   Created: ${activity.created_at}`);
    console.log('');
  });

  // 2. Delete the activities
  console.log('🗑️  Deleting test activities...\n');

  const { error: deleteError } = await supabase
    .from('activity_feed')
    .delete()
    .in('id', testActivityIds);

  if (deleteError) {
    console.error('❌ Error deleting activities:', deleteError);
    return;
  }

  console.log('✅ Successfully deleted all test activities\n');

  // 3. Verify deletion
  const { count: remainingTestCount } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true })
    .in('id', testActivityIds);

  if (remainingTestCount === 0) {
    console.log('✅ Verification: All test activities removed\n');
  } else {
    console.log(`⚠️  Warning: ${remainingTestCount} test activities still remain\n`);
  }

  // 4. Show new total
  const { count: totalCount } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 New total activity count: ${totalCount}\n`);
  console.log('🎉 Cleanup complete!\n');
}

cleanupTestActivities().catch(console.error);

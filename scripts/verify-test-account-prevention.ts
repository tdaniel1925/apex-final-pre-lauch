// =============================================
// Verify Test Account Prevention
// Check if is_test_account column exists and triggers are updated
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';

async function verifyTestAccountPrevention() {
  const supabase = createServiceClient();

  console.log('🔍 Verifying test account prevention measures...\n');

  // 1. Check if is_test_account column exists by trying a direct query
  const { data: testQuery, error: testError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, is_test_account')
    .limit(5);

  if (testError) {
    console.log('❌ is_test_account column does NOT exist');
    console.log('   Migration has NOT been applied yet\n');
    console.log('📝 Next Steps:');
    console.log('   The migration file exists but needs to be applied manually.');
    console.log('   You can apply it by running the SQL directly in Supabase Dashboard:\n');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click "SQL Editor"');
    console.log('   4. Copy/paste the contents of:');
    console.log('      supabase/migrations/20260319000001_prevent_test_data_in_activity_feed.sql\n');
    return;
  }

  console.log('✅ is_test_account column exists!\n');

  // 2. Check how many test accounts are marked
  const { count: testAccountCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('is_test_account', true);

  console.log(`📊 Test Accounts Marked: ${testAccountCount || 0}\n`);

  // 3. Show test accounts
  const { data: testAccounts } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, created_at')
    .eq('is_test_account', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (testAccounts && testAccounts.length > 0) {
    console.log('📋 Test Accounts Found:\n');
    testAccounts.forEach((account: any, index: number) => {
      console.log(`${index + 1}. ${account.first_name} ${account.last_name}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Created: ${account.created_at}`);
      console.log('');
    });
  } else {
    console.log('✅ No test accounts currently marked\n');
  }

  // 4. Final verification - run check script again
  console.log('🔍 Running final activity feed check...\n');

  const { count: totalActivities } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total Activities After Cleanup: ${totalActivities || 0}\n`);

  // Check for any remaining test patterns
  const dummyPatterns = ['test', 'dummy', 'demo'];

  const { data: recentActivities } = await supabase
    .from('activity_feed')
    .select(`
      id,
      event_title,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const stillSuspicious = recentActivities?.filter((activity: any) => {
    const title = activity.event_title?.toLowerCase() || '';
    const actorName = `${activity.actor?.first_name || ''} ${activity.actor?.last_name || ''}`.toLowerCase();

    return dummyPatterns.some(pattern =>
      title.includes(pattern) || actorName.includes(pattern)
    );
  });

  if (stillSuspicious && stillSuspicious.length > 0) {
    console.log(`⚠️  Warning: Found ${stillSuspicious.length} activities that still match test patterns:\n`);
    stillSuspicious.forEach((activity: any, index: number) => {
      console.log(`${index + 1}. ${activity.event_title}`);
      console.log(`   Actor: ${activity.actor?.first_name || 'N/A'} ${activity.actor?.last_name || ''}`);
      console.log('');
    });
  } else {
    console.log('✅ No test patterns found in recent activities\n');
  }

  console.log('✅ Verification Complete!\n');
  console.log('Summary:');
  console.log(`  - is_test_account column: ${testError ? '❌ Missing' : '✅ Exists'}`);
  console.log(`  - Test accounts marked: ${testAccountCount || 0}`);
  console.log(`  - Total activities: ${totalActivities || 0}`);
  console.log(`  - Test activities remaining: ${stillSuspicious?.length || 0}`);
}

verifyTestAccountPrevention().catch(console.error);

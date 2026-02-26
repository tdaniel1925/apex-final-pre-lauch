// Test activity feed system
import { createServiceClient } from '../src/lib/supabase/service';

async function testActivityFeed() {
  const supabase = createServiceClient();

  console.log('🔍 Testing Activity Feed System...\n');

  // Get Phil Resch (a sponsor with downline)
  const { data: phil, error: philError } = await supabase
    .from('distributors')
    .select('*')
    .eq('first_name', 'Phil')
    .eq('last_name', 'Resch')
    .single();

  if (philError || !phil) {
    console.error('❌ Could not find Phil Resch:', philError);
    return;
  }

  console.log(`✅ Found Phil Resch (ID: ${phil.id})`);
  console.log(`   Rep #${phil.rep_number}\n`);

  // Fetch activities for Phil's organization
  console.log('📊 Fetching activities for Phil\'s organization...\n');

  const { data: activities, error: activitiesError } = await supabase
    .from('activity_feed')
    .select(`
      id,
      event_type,
      event_title,
      event_description,
      depth_from_root,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(
        first_name,
        last_name,
        slug
      )
    `)
    .eq('organization_root_id', phil.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (activitiesError) {
    console.error('❌ Error fetching activities:', activitiesError);
    return;
  }

  console.log(`✅ Found ${activities?.length || 0} activities\n`);

  if (activities && activities.length > 0) {
    console.log('📋 Recent Activities:\n');
    console.log('='.repeat(80));

    activities.forEach((activity: any, index) => {
      const actorName = activity.actor
        ? `${activity.actor.first_name} ${activity.actor.last_name}`
        : 'Unknown';

      const icon = activity.event_type === 'signup' ? '✅' : activity.event_type === 'rank_advancement' ? '🎉' : '🏆';

      console.log(`${index + 1}. ${icon} ${activity.event_title}`);
      console.log(`   Actor: ${actorName} (@${activity.actor?.slug || 'unknown'})`);
      console.log(`   Depth: Level ${activity.depth_from_root}`);
      console.log(`   Time: ${new Date(activity.created_at).toLocaleString()}`);
      console.log(`   Type: ${activity.event_type}`);
      if (activity.event_description) {
        console.log(`   Description: ${activity.event_description}`);
      }
      console.log('');
    });

    console.log('='.repeat(80));
  } else {
    console.log('⚠️  No activities found for Phil\'s organization');
    console.log('   This could mean:');
    console.log('   1. Phil has no downline yet');
    console.log('   2. The backfill process didn\'t run');
    console.log('   3. There\'s an issue with the triggers\n');
  }

  // Test activity counts by type
  console.log('\n📊 Activity Breakdown:\n');

  const { data: signups } = await supabase
    .from('activity_feed')
    .select('id', { count: 'exact' })
    .eq('organization_root_id', phil.id)
    .eq('event_type', 'signup');

  const { data: ranks } = await supabase
    .from('activity_feed')
    .select('id', { count: 'exact' })
    .eq('organization_root_id', phil.id)
    .eq('event_type', 'rank_advancement');

  const { data: matrixFills } = await supabase
    .from('activity_feed')
    .select('id', { count: 'exact' })
    .eq('organization_root_id', phil.id)
    .eq('event_type', 'matrix_filled');

  console.log(`✅ Signups: ${signups?.length || 0}`);
  console.log(`🎉 Rank Advancements: ${ranks?.length || 0}`);
  console.log(`🏆 Matrix Fills: ${matrixFills?.length || 0}`);

  // Test depth distribution
  console.log('\n📊 Activity by Depth:\n');

  for (let depth = 1; depth <= 7; depth++) {
    const { data: depthActivities } = await supabase
      .from('activity_feed')
      .select('id', { count: 'exact' })
      .eq('organization_root_id', phil.id)
      .eq('depth_from_root', depth);

    if (depthActivities && depthActivities.length > 0) {
      console.log(`   Level ${depth}: ${depthActivities.length} activities`);
    }
  }

  console.log('\n✅ Activity Feed Test Complete!');
}

testActivityFeed().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

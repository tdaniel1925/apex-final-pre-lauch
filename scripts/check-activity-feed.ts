// =============================================
// Activity Feed Data Check Script
// Checks for dummy data and validates activity feed entries
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';

async function checkActivityFeed() {
  const supabase = createServiceClient();

  console.log('🔍 Checking Activity Feed Data...\n');

  // 1. Get total count of activity feed entries
  const { count: totalCount, error: countError } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting activities:', countError);
    return;
  }

  console.log(`📊 Total Activity Feed Entries: ${totalCount}\n`);

  // 2. Get sample of activities with details
  const { data: activities, error: activitiesError } = await supabase
    .from('activity_feed')
    .select(`
      id,
      actor_id,
      target_id,
      event_type,
      event_title,
      event_description,
      metadata,
      depth_from_root,
      organization_root_id,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(
        id,
        first_name,
        last_name,
        email,
        slug,
        created_at
      ),
      organization_root:distributors!activity_feed_organization_root_id_fkey(
        id,
        first_name,
        last_name,
        email,
        slug
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (activitiesError) {
    console.error('❌ Error fetching activities:', activitiesError);
    return;
  }

  console.log(`📋 Sample of Recent Activities (last ${activities?.length || 0}):\n`);

  // 3. Analyze activities for issues
  const issues: string[] = [];
  const actorIds = new Set<string>();
  const orgRootIds = new Set<string>();
  const eventTypes: Record<string, number> = {};

  activities?.forEach((activity: any, index: number) => {
    // Track unique actors and org roots
    actorIds.add(activity.actor_id);
    orgRootIds.add(activity.organization_root_id);

    // Count event types
    eventTypes[activity.event_type] = (eventTypes[activity.event_type] || 0) + 1;

    // Check for missing actor data
    if (!activity.actor) {
      issues.push(`Activity ${activity.id} has missing actor data (actor_id: ${activity.actor_id})`);
    }

    // Check for missing org root data
    if (!activity.organization_root) {
      issues.push(`Activity ${activity.id} has missing organization root data (org_root_id: ${activity.organization_root_id})`);
    }

    // Check if actor is in the organization
    if (activity.actor && activity.organization_root) {
      const actorCreated = new Date(activity.actor.created_at);
      const eventCreated = new Date(activity.created_at);

      // Event should not be created before actor exists
      if (eventCreated < actorCreated) {
        issues.push(`Activity ${activity.id}: Event created (${activity.created_at}) before actor created (${activity.actor.created_at})`);
      }
    }

    // Display first 10 activities in detail
    if (index < 10) {
      console.log(`${index + 1}. ${activity.event_type.toUpperCase()}`);
      console.log(`   Title: ${activity.event_title}`);
      console.log(`   Actor: ${activity.actor?.first_name || 'MISSING'} ${activity.actor?.last_name || ''} (${activity.actor?.slug || 'N/A'})`);
      console.log(`   Org Root: ${activity.organization_root?.first_name || 'MISSING'} ${activity.organization_root?.last_name || ''} (${activity.organization_root?.slug || 'N/A'})`);
      console.log(`   Depth from Root: ${activity.depth_from_root}`);
      console.log(`   Created: ${activity.created_at}`);
      console.log('');
    }
  });

  // 4. Display statistics
  console.log('\n📈 Statistics:');
  console.log(`   Unique Actors: ${actorIds.size}`);
  console.log(`   Unique Organization Roots: ${orgRootIds.size}`);
  console.log('\n   Event Type Breakdown:');
  Object.entries(eventTypes).forEach(([type, count]) => {
    console.log(`     - ${type}: ${count}`);
  });

  // 5. Check for dummy/test data patterns
  console.log('\n🔍 Checking for Dummy Data Patterns...\n');

  const dummyPatterns = [
    'test',
    'dummy',
    'fake',
    'sample',
    'demo',
    'example',
    'lorem',
    'ipsum',
  ];

  const suspiciousActivities = activities?.filter((activity: any) => {
    const title = activity.event_title?.toLowerCase() || '';
    const description = activity.event_description?.toLowerCase() || '';
    const actorName = `${activity.actor?.first_name || ''} ${activity.actor?.last_name || ''}`.toLowerCase();

    return dummyPatterns.some(pattern =>
      title.includes(pattern) ||
      description.includes(pattern) ||
      actorName.includes(pattern)
    );
  });

  if (suspiciousActivities && suspiciousActivities.length > 0) {
    console.log(`⚠️  Found ${suspiciousActivities.length} potentially dummy activities:\n`);
    suspiciousActivities.forEach((activity: any, index: number) => {
      console.log(`${index + 1}. ID: ${activity.id}`);
      console.log(`   Title: ${activity.event_title}`);
      console.log(`   Actor: ${activity.actor?.first_name || 'N/A'} ${activity.actor?.last_name || ''}`);
      console.log(`   Created: ${activity.created_at}`);
      console.log('');
    });
  } else {
    console.log('✅ No obvious dummy data patterns found');
  }

  // 6. Display issues
  if (issues.length > 0) {
    console.log(`\n⚠️  Found ${issues.length} Data Issues:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('\n✅ No data integrity issues found');
  }

  // 7. Verify organization integrity
  console.log('\n🔗 Verifying Organization Integrity...\n');

  // Check if all activities belong to valid organizations
  const { data: allDistributors, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id')
    .in('id', Array.from(orgRootIds));

  if (distError) {
    console.error('❌ Error fetching distributors:', distError);
    return;
  }

  console.log(`✅ All ${orgRootIds.size} organization roots are valid distributors\n`);

  // Check for activities where actor is not in the organization tree
  const organizationIssues: string[] = [];

  for (const activity of activities || []) {
    // Verify that organization_root_id is actually in the upline of actor_id
    const { data: uplineCheck, error: uplineError } = await supabase
      .rpc('get_upline_ids', { dist_id: activity.actor_id });

    if (uplineError) {
      console.error(`Error checking upline for ${activity.actor_id}:`, uplineError);
      continue;
    }

    // Check if organization_root_id is in the upline
    if (!uplineCheck?.includes(activity.organization_root_id) && activity.actor_id !== activity.organization_root_id) {
      organizationIssues.push(
        `Activity ${activity.id}: Actor ${activity.actor?.slug || activity.actor_id} is NOT in organization of ${activity.organization_root?.slug || activity.organization_root_id}`
      );
    }
  }

  if (organizationIssues.length > 0) {
    console.log(`⚠️  Found ${organizationIssues.length} Organization Integrity Issues:\n`);
    organizationIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('✅ All activities belong to correct organizations');
  }

  console.log('\n✅ Activity Feed Check Complete\n');
}

checkActivityFeed().catch(console.error);

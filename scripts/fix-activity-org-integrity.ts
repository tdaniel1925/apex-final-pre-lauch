// =============================================
// Fix Activity Organization Integrity Script
// Removes activities that don't belong to the correct organization
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';

async function fixActivityOrgIntegrity() {
  const supabase = createServiceClient();

  console.log('🔧 Fixing activity organization integrity issues...\n');

  // Activity IDs with organization integrity issues identified in audit
  const problematicActivityIds = [
    'ea201311-b653-471f-a983-308ebd1ecc17', // rep-rep2b not in apex-vision
    'afd29622-300d-44c7-bca4-5caa6ad21558', // rep-rep1a not in apex-vision
    'f14cb957-b306-4491-ad4a-7baae700a928', // cpotter not in deanna
    'd08e4b83-6db7-4f65-ad9c-4bc223783378', // cpotter not in sellad
    '929f96e0-7960-4689-9fed-1541e5e94062', // shalldlsjkdf not in apex-vision
    '7bfc4906-fcb5-4e8b-855c-3c88a3703466', // dessiah-m not in apex-vision
    '85c38ece-b31d-4246-9792-fb2a14fd67a2', // eric-wullschleger not in apex-vision
    '717dd047-8df7-4ca1-820e-cb1d128fb9e5', // john-jacob not in apex-vision
    '02f43308-b8f9-499a-ba30-c983cf49e69c', // david-townsend not in phil-resch
    'bad0d3eb-1a1c-4654-840f-06d41e403c75', // hannah-townsend not in phil-resch
  ];

  // 1. Show what will be deleted
  const { data: activitiesToDelete, error: fetchError } = await supabase
    .from('activity_feed')
    .select(`
      id,
      event_type,
      event_title,
      created_at,
      actor:distributors!activity_feed_actor_id_fkey(first_name, last_name, slug),
      organization_root:distributors!activity_feed_organization_root_id_fkey(first_name, last_name, slug)
    `)
    .in('id', problematicActivityIds);

  if (fetchError) {
    console.error('❌ Error fetching problematic activities:', fetchError);
    return;
  }

  console.log(`📋 Found ${activitiesToDelete?.length || 0} activities with organization issues:\n`);

  activitiesToDelete?.forEach((activity: any, index: number) => {
    console.log(`${index + 1}. ${activity.event_title}`);
    console.log(`   Actor: ${activity.actor?.slug || 'N/A'} (${activity.actor?.first_name || ''} ${activity.actor?.last_name || ''})`);
    console.log(`   Showing in org: ${activity.organization_root?.slug || 'N/A'} (${activity.organization_root?.first_name || ''} ${activity.organization_root?.last_name || ''})`);
    console.log(`   Type: ${activity.event_type}`);
    console.log(`   Created: ${activity.created_at}`);
    console.log('');
  });

  // 2. Delete the activities
  console.log('🗑️  Deleting misplaced activities...\n');

  const { error: deleteError } = await supabase
    .from('activity_feed')
    .delete()
    .in('id', problematicActivityIds);

  if (deleteError) {
    console.error('❌ Error deleting activities:', deleteError);
    return;
  }

  console.log('✅ Successfully deleted all misplaced activities\n');

  // 3. Verify deletion
  const { count: remainingCount } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true })
    .in('id', problematicActivityIds);

  if (remainingCount === 0) {
    console.log('✅ Verification: All misplaced activities removed\n');
  } else {
    console.log(`⚠️  Warning: ${remainingCount} misplaced activities still remain\n`);
  }

  // 4. Show new total
  const { count: totalCount } = await supabase
    .from('activity_feed')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 New total activity count: ${totalCount}\n`);
  console.log('🎉 Cleanup complete!\n');
}

fixActivityOrgIntegrity().catch(console.error);

/**
 * Cleanup Orphaned Member Records
 *
 * Finds and deletes member records that don't have corresponding distributor records.
 * This can happen when signup rollback fails partway through.
 */

import * as dotenv from 'dotenv';
import { createServiceClient } from '../src/lib/supabase/service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function cleanupOrphanedMembers() {
  console.log('🧹 Cleaning up orphaned member records...\n');

  const supabase = createServiceClient();

  // Find members without corresponding distributors
  const { data: orphanedMembers, error: queryError } = await supabase
    .from('members')
    .select('distributor_id, email, member_id, created_at')
    .returns<Array<{
      distributor_id: string;
      email: string;
      member_id: string;
      created_at: string;
    }>>();

  if (queryError) {
    console.error('❌ Error querying members:', queryError);
    process.exit(1);
  }

  if (!orphanedMembers || orphanedMembers.length === 0) {
    console.log('✅ No orphaned members found');
    process.exit(0);
  }

  console.log(`Found ${orphanedMembers.length} member records. Checking for orphans...\n`);

  let orphanedCount = 0;
  let deletedCount = 0;

  for (const member of orphanedMembers) {
    // Check if distributor exists
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('id', member.distributor_id)
      .single();

    if (distError || !distributor) {
      orphanedCount++;
      console.log(`❌ Orphaned member found:`);
      console.log(`   Member ID: ${member.member_id}`);
      console.log(`   Email: ${member.email}`);
      console.log(`   Distributor ID: ${member.distributor_id}`);
      console.log(`   Created: ${member.created_at}`);

      // Delete orphaned member
      const { error: deleteError } = await supabase
        .from('members')
        .delete()
        .eq('distributor_id', member.distributor_id);

      if (deleteError) {
        console.log(`   ⚠️  Failed to delete: ${deleteError.message}`);
      } else {
        deletedCount++;
        console.log(`   ✅ Deleted\n`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`📊 Cleanup Summary:`);
  console.log(`   Total members checked: ${orphanedMembers.length}`);
  console.log(`   Orphaned members found: ${orphanedCount}`);
  console.log(`   Successfully deleted: ${deletedCount}`);
  console.log('═══════════════════════════════════════\n');

  if (deletedCount > 0) {
    console.log('✅ Cleanup complete!');
  } else {
    console.log('✅ No cleanup needed');
  }
}

// Run cleanup
cleanupOrphanedMembers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });

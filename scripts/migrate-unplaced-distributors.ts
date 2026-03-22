/**
 * Migration Script: Place Unplaced Distributors in Matrix
 *
 * Places 22 unplaced distributors into the Tech Ladder 5×7 matrix
 * using the spillover placement algorithm (breadth-first search).
 *
 * REF: UNPLACED-DISTRIBUTORS-MIGRATION.md
 *
 * Usage: npx ts-node scripts/migrate-unplaced-distributors.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// =============================================
// TYPES
// =============================================

interface UnplacedMember {
  member_id: string;
  full_name: string;
  email: string;
  enroller_id: string | null;
  enrollment_date: string;
}

interface MatrixPlacement {
  parent_id: string;
  position: number;
  depth: number;
}

// =============================================
// CONFIGURATION
// =============================================

const MATRIX_WIDTH = 5;
const MAX_DEPTH = 7;
const DRY_RUN = process.env.DRY_RUN === 'true'; // Set DRY_RUN=true to preview changes

// =============================================
// SUPABASE CLIENT
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in .env.local');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =============================================
// SPILLOVER PLACEMENT ALGORITHM
// =============================================

async function findNextAvailablePosition(
  sponsorId: string
): Promise<MatrixPlacement | null> {
  const queue: Array<{ member_id: string; depth: number }> = [
    { member_id: sponsorId, depth: 0 },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Get children of current node
    // NOTE: We check ALL children (even deleted) to see which positions are occupied
    // But only add active children to the queue for further searching
    const { data: allChildren, error } = await supabase
      .from('distributors')
      .select('id, matrix_position, matrix_depth, status')
      .eq('matrix_parent_id', current.member_id)
      .order('matrix_position', { ascending: true });

    const children = allChildren?.filter(c => c.status === 'active') || [];

    if (error) {
      console.error('❌ Error querying children:', error);
      return null;
    }

    // Check if position available (< 5 children)
    // IMPORTANT: Check ALL children (including deleted) for occupied positions
    if (!allChildren || allChildren.length < MATRIX_WIDTH) {
      // Find first available position (1-5) checking ALL children
      const occupiedPositions = new Set(allChildren?.map(c => c.matrix_position) || []);
      let nextPosition = 1;

      for (let pos = 1; pos <= MATRIX_WIDTH; pos++) {
        if (!occupiedPositions.has(pos)) {
          nextPosition = pos;
          break;
        }
      }

      return {
        parent_id: current.member_id,
        position: nextPosition,
        depth: current.depth + 1,
      };
    }

    // Add children to queue if not at max depth
    if (current.depth + 1 < MAX_DEPTH) {
      for (const child of children) {
        queue.push({
          member_id: child.id,
          depth: current.depth + 1,
        });
      }
    }
  }

  return null; // Matrix full
}

// =============================================
// MIGRATION FUNCTIONS
// =============================================

async function getUnplacedMembers(): Promise<UnplacedMember[]> {
  const { data, error } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, sponsor_id, created_at')
    .is('matrix_parent_id', null)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching unplaced members:', error);
    return [];
  }

  // Map distributors to members format
  return (data || []).map(d => ({
    member_id: d.id,
    full_name: `${d.first_name} ${d.last_name}`.trim(),
    email: d.email,
    enroller_id: d.sponsor_id,
    enrollment_date: d.created_at
  }));
}

async function placeMemberInMatrix(
  member: UnplacedMember,
  placement: MatrixPlacement
): Promise<boolean> {
  if (DRY_RUN) {
    console.log(`   [DRY RUN] Would update distributor with placement`);
    return true;
  }

  const { error } = await supabase
    .from('distributors')
    .update({
      matrix_parent_id: placement.parent_id,
      matrix_position: placement.position,
      matrix_depth: placement.depth,
      updated_at: new Date().toISOString(),
    })
    .eq('id', member.member_id);

  if (error) {
    console.error(`❌ Error updating distributor ${member.full_name}:`, error);
    return false;
  }

  return true;
}

async function getParentName(parentId: string): Promise<string> {
  const { data, error } = await supabase
    .from('distributors')
    .select('first_name, last_name')
    .eq('id', parentId)
    .single();

  if (error || !data) return 'Unknown';
  return `${data.first_name} ${data.last_name}`.trim();
}

// =============================================
// MAIN MIGRATION
// =============================================

async function migrateUnplacedDistributors() {
  console.log('');
  console.log('================================================');
  console.log('   Tech Ladder Matrix - Unplaced Distributors Migration');
  console.log('================================================');
  console.log('');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
    console.log('');
  }

  // Step 1: Get all unplaced members
  console.log('📊 Fetching unplaced members...');
  const unplacedMembers = await getUnplacedMembers();

  console.log(`   Found ${unplacedMembers.length} unplaced members`);
  console.log('');

  if (unplacedMembers.length === 0) {
    console.log('✅ No unplaced members found. All members are already in the matrix!');
    console.log('');
    return;
  }

  // Step 2: Process each member in enrollment order
  console.log('🔄 Processing members in enrollment order...');
  console.log('');

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < unplacedMembers.length; i++) {
    const member = unplacedMembers[i];

    console.log(`[${i + 1}/${unplacedMembers.length}] ${member.full_name}`);
    console.log(`   Email: ${member.email}`);
    console.log(`   Enrolled: ${new Date(member.enrollment_date).toLocaleDateString()}`);

    // If no enroller, skip (needs manual intervention)
    if (!member.enroller_id) {
      console.log('   ⚠️  No enroller ID - SKIPPING (needs manual placement)');
      console.log('');
      failureCount++;
      continue;
    }

    // Find next available position under sponsor
    console.log(`   Finding position under sponsor...`);
    const placement = await findNextAvailablePosition(member.enroller_id);

    if (!placement) {
      console.log('   ❌ No available positions (matrix full)');
      console.log('');
      failureCount++;
      continue;
    }

    const parentName = await getParentName(placement.parent_id);
    console.log(`   ✓ Found: Position ${placement.position} under "${parentName}" at depth ${placement.depth}`);

    // Place member in matrix
    const success = await placeMemberInMatrix(member, placement);

    if (success) {
      console.log(`   ✅ ${DRY_RUN ? 'Would place' : 'Placed'} successfully`);
      successCount++;
    } else {
      console.log(`   ❌ Failed to place`);
      failureCount++;
    }

    console.log('');
  }

  // Step 3: Summary
  console.log('================================================');
  console.log('   MIGRATION SUMMARY');
  console.log('================================================');
  console.log('');
  console.log(`Total members processed: ${unplacedMembers.length}`);
  console.log(`✅ Successfully placed: ${successCount}`);
  console.log(`❌ Failed to place: ${failureCount}`);
  console.log('');

  if (DRY_RUN) {
    console.log('ℹ️  This was a DRY RUN. To apply changes, run:');
    console.log('   npx ts-node scripts/migrate-unplaced-distributors.ts');
    console.log('');
  } else {
    console.log('✅ Migration complete!');
    console.log('');
  }
}

// =============================================
// VERIFICATION FUNCTION
// =============================================

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  console.log('');

  // Check for remaining unplaced members
  const unplacedMembers = await getUnplacedMembers();

  if (unplacedMembers.length === 0) {
    console.log('✅ Verification passed: All members are placed in the matrix');
    console.log('');
  } else {
    console.log(`⚠️  ${unplacedMembers.length} members still unplaced:`);
    console.log('');

    for (const member of unplacedMembers) {
      console.log(`   - ${member.full_name} (${member.email})`);
      console.log(`     Reason: ${member.enroller_id ? 'Migration failed' : 'No enroller ID'}`);
    }
    console.log('');
  }

  // Check for position conflicts
  console.log('🔍 Checking for position conflicts...');

  const { data: conflicts } = await supabase.rpc('check_matrix_position_conflicts');

  if (conflicts && conflicts.length > 0) {
    console.log(`❌ Found ${conflicts.length} position conflicts:`);
    console.log(conflicts);
  } else {
    console.log('✅ No position conflicts found');
  }

  console.log('');
}

// =============================================
// ROLLBACK FUNCTION
// =============================================

async function rollbackMigration() {
  console.log('⚠️  ROLLBACK: Removing matrix placements...');
  console.log('');

  if (DRY_RUN) {
    console.log('ℹ️  DRY RUN MODE - Would remove all matrix placements');
    return;
  }

  // WARNING: This will remove ALL matrix placements!
  const { error } = await supabase
    .from('distributors')
    .update({
      matrix_parent_id: null,
      matrix_position: null,
      matrix_depth: 0,
    })
    .not('matrix_parent_id', 'is', null);

  if (error) {
    console.log('❌ Rollback failed:', error);
  } else {
    console.log('✅ Rollback complete');
  }
  console.log('');
}

// =============================================
// CLI INTERFACE
// =============================================

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'verify':
      await verifyMigration();
      break;

    case 'rollback':
      console.log('⚠️  WARNING: This will remove ALL matrix placements!');
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await rollbackMigration();
      break;

    default:
      await migrateUnplacedDistributors();
      break;
  }

  process.exit(0);
}

// Run migration
main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

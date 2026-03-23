/**
 * Test Enrollment Depth Calculation
 * Verifies the new enrollment tree depth calculation
 */

import { createServiceClient } from '../src/lib/supabase/service';

async function calculateEnrollmentDepth(distributorId: string, visited = new Set<string>()): Promise<number> {
  // Prevent infinite loops
  if (visited.has(distributorId) || visited.size > 20) {
    return 0;
  }
  visited.add(distributorId);

  const supabase = createServiceClient();

  // Get sponsor
  const { data } = await supabase
    .from('distributors')
    .select('sponsor_id')
    .eq('id', distributorId)
    .neq('status', 'deleted')
    .single();

  // If no sponsor (root level), depth is 0
  if (!data || !data.sponsor_id) {
    return 0;
  }

  // Depth is 1 + parent's depth
  const parentDepth = await calculateEnrollmentDepth(data.sponsor_id, visited);
  return parentDepth + 1;
}

async function testEnrollmentDepth() {
  const supabase = createServiceClient();

  console.log('=== Testing Enrollment Depth Calculation ===\n');

  // Get all distributors
  const { data: distributors } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id, matrix_depth')
    .neq('status', 'deleted')
    .not('sponsor_id', 'is', null)
    .order('matrix_depth', { ascending: true });

  console.log('📊 Comparing matrix_depth vs enrollment_depth:\n');

  const depthMap = new Map<number, number>();
  let matches = 0;
  let mismatches = 0;

  for (const dist of distributors || []) {
    const enrollmentDepth = await calculateEnrollmentDepth(dist.id);
    const match = dist.matrix_depth === enrollmentDepth;

    if (match) {
      matches++;
    } else {
      mismatches++;
      if (mismatches <= 10) {
        console.log(
          `  ${match ? '✅' : '❌'} ${dist.first_name} ${dist.last_name}: matrix_depth=${dist.matrix_depth}, enrollment_depth=${enrollmentDepth}`
        );
      }
    }

    // Count by enrollment depth
    depthMap.set(enrollmentDepth, (depthMap.get(enrollmentDepth) || 0) + 1);
  }

  console.log(`\n  Matches: ${matches}`);
  console.log(`  Mismatches: ${mismatches}${mismatches > 10 ? ' (showing first 10)' : ''}\n`);

  console.log('📊 Distributor Counts by Enrollment Depth:\n');
  Array.from(depthMap.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([depth, count]) => {
      const maxCapacity = Math.pow(5, depth);
      const percentage = Math.round((count / maxCapacity) * 100);
      const status = count > maxCapacity ? '❌ OVERFLOW' : '✅';
      console.log(`  Level ${depth}: ${count}/${maxCapacity} (${percentage}%) ${status}`);
    });

  console.log('\n=== Test Complete ===');
  process.exit(0);
}

testEnrollmentDepth().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});

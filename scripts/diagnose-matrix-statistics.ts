/**
 * Diagnose Matrix Statistics Data Inconsistencies
 * Checks for source of truth violations in matrix calculations
 */

import { createServiceClient } from '../src/lib/supabase/service';

async function diagnoseMatrixStatistics() {
  const supabase = createServiceClient();

  console.log('=== Matrix Statistics Diagnostic Report ===\n');

  // 1. Check distributor counts by matrix_depth
  console.log('📊 Distributor Counts by matrix_depth:');
  const { data: depthCounts } = await supabase
    .from('distributors')
    .select('matrix_depth')
    .neq('status', 'deleted');

  const depthMap = new Map<number | null, number>();
  depthCounts?.forEach((d) => {
    const depth = d.matrix_depth;
    depthMap.set(depth, (depthMap.get(depth) || 0) + 1);
  });

  Array.from(depthMap.entries())
    .sort((a, b) => (a[0] || -99) - (b[0] || -99))
    .forEach(([depth, count]) => {
      console.log(`  Level ${depth === null ? 'NULL' : depth}: ${count} distributors`);
    });

  console.log('');

  // 2. Check RPC function result
  console.log('📊 RPC Function Result (get_matrix_statistics):');
  const { data: rpcStats } = await supabase.rpc('get_matrix_statistics');
  console.log('  RPC Stats:', JSON.stringify(rpcStats, null, 2));
  console.log('');

  // 3. Calculate expected level capacities
  console.log('📊 Expected vs Actual by Level:');
  console.log('  (Based on 5^level matrix structure)');

  const maxDepth = Math.max(...Array.from(depthMap.keys()).filter((k) => k !== null && k >= 1) as number[]);

  for (let level = 1; level <= maxDepth; level++) {
    const expectedCapacity = Math.pow(5, level);
    const actualFilled = depthMap.get(level) || 0;
    const percentage = Math.round((actualFilled / expectedCapacity) * 100);
    const status = actualFilled > expectedCapacity ? '❌ OVERFLOW' : '✅';

    console.log(`  Level ${level}: ${actualFilled}/${expectedCapacity} (${percentage}%) ${status}`);
  }
  console.log('');

  // 4. Check for sponsor_id vs matrix_parent_id inconsistencies
  console.log('🔍 Source of Truth Violations:');
  console.log('  Checking sponsor_id vs matrix_parent_id...');

  const { data: distributors } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, sponsor_id, matrix_parent_id, matrix_depth')
    .neq('status', 'deleted')
    .gte('matrix_depth', 1)
    .limit(100);

  let sponsorMatches = 0;
  let sponsorMismatches = 0;

  distributors?.forEach((d) => {
    if (d.sponsor_id === d.matrix_parent_id) {
      sponsorMatches++;
    } else {
      sponsorMismatches++;
      if (sponsorMismatches <= 5) {
        console.log(`    ⚠️  ${d.first_name} ${d.last_name} (Level ${d.matrix_depth}): sponsor_id !== matrix_parent_id`);
      }
    }
  });

  console.log(`  Matches: ${sponsorMatches}`);
  console.log(`  Mismatches: ${sponsorMismatches}${sponsorMismatches > 5 ? ' (showing first 5)' : ''}`);
  console.log('');

  // 5. Check for NULL matrix_depth or matrix_parent_id
  console.log('🔍 Data Quality Issues:');

  const { count: nullDepthCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'deleted')
    .is('matrix_depth', null);

  const { count: nullParentCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'deleted')
    .neq('is_master', true)
    .is('matrix_parent_id', null);

  console.log(`  Distributors with NULL matrix_depth: ${nullDepthCount || 0}`);
  console.log(`  Distributors with NULL matrix_parent_id (non-master): ${nullParentCount || 0}`);
  console.log('');

  // 6. Count using sponsor_id (enrollment tree)
  console.log('✅ Enrollment Tree Count (using sponsor_id):');
  const { count: enrollmentCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'deleted')
    .not('sponsor_id', 'is', null);

  console.log(`  Total enrolled distributors: ${enrollmentCount || 0}`);
  console.log('');

  console.log('=== End of Diagnostic Report ===');
  process.exit(0);
}

diagnoseMatrixStatistics().catch((error) => {
  console.error('Diagnostic failed:', error);
  process.exit(1);
});

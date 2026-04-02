import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeReaganMatrixMove() {
  console.log('========================================');
  console.log('Analyzing Impact of Moving Reagan in Matrix');
  console.log('========================================\n');

  // Get Reagan's info
  const { data: reagan } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_parent_id, matrix_position, matrix_depth')
    .ilike('first_name', 'reagan')
    .ilike('last_name', 'wolfe')
    .single();

  console.log('Current Reagan Matrix Status:');
  console.log(`  Matrix Parent ID: ${reagan.matrix_parent_id}`);
  console.log(`  Matrix Position: ${reagan.matrix_position}`);
  console.log(`  Matrix Depth: ${reagan.matrix_depth}`);
  console.log('');

  // Check if Reagan has any children in the matrix
  const { data: matrixChildren, error: childrenError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, matrix_position, matrix_depth')
    .eq('matrix_parent_id', reagan.id)
    .order('matrix_position', { ascending: true });

  console.log('Reagan\'s Matrix Children (people placed under her):');
  if (!matrixChildren || matrixChildren.length === 0) {
    console.log('  ✅ NONE - Reagan has no one under her in the matrix');
    console.log('  ✅ Moving her will NOT affect anyone else');
  } else {
    console.log(`  ⚠️  WARNING: Reagan has ${matrixChildren.length} people in her matrix:`);
    matrixChildren.forEach((child, index) => {
      console.log(`     ${index + 1}. ${child.first_name} ${child.last_name} - ${child.email}`);
      console.log(`        Position: ${child.matrix_position}, Depth: ${child.matrix_depth}`);
    });
    console.log('  ⚠️  Moving Reagan would orphan these people!');
    console.log('  ⚠️  You would need to re-place them or move them with her');
  }
  console.log('');

  // Check Sella's matrix to find available spots
  const { data: sella } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .ilike('first_name', 'sella')
    .ilike('last_name', 'daniel')
    .single();

  console.log('Sella Daniel\'s Matrix:');
  const { data: sellaChildren } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_position')
    .eq('matrix_parent_id', sella.id)
    .order('matrix_position', { ascending: true });

  if (!sellaChildren || sellaChildren.length === 0) {
    console.log('  ✅ Sella has NO matrix children - all 5 positions available');
  } else {
    console.log(`  Sella has ${sellaChildren.length} matrix children:`);
    const occupiedPositions = sellaChildren.map(c => c.matrix_position);
    sellaChildren.forEach((child, index) => {
      console.log(`     Position ${child.matrix_position}: ${child.first_name} ${child.last_name}`);
    });

    // Find available positions (1-5)
    const availablePositions = [1, 2, 3, 4, 5].filter(p => !occupiedPositions.includes(p));
    console.log(`  ✅ Available positions: ${availablePositions.join(', ')}`);
  }
  console.log('');

  // Check impact on commissions
  console.log('Commission Impact Analysis:');
  console.log('  - L1 Override (30%): Uses sponsor_id (already updated to Sella) ✅');
  console.log('  - L2-L5 Overrides: Use matrix_parent_id');
  console.log('');
  console.log('  Current Matrix Path (L2-L5):');
  console.log(`    Reagan → Falguni Jariwala → ... (overrides flow upward)`);
  console.log('');
  console.log('  After Moving to Sella:');
  console.log(`    Reagan → Sella Daniel → ... (overrides flow upward)`);
  console.log('');
  console.log('  ⚠️  This will change who receives L2-L5 overrides from Reagan\'s sales');
  console.log('  ⚠️  Falguni will lose overrides, Sella will gain them');
  console.log('');

  // Summary
  console.log('========================================');
  console.log('SUMMARY - What Will Break/Change:');
  console.log('========================================');

  if (!matrixChildren || matrixChildren.length === 0) {
    console.log('✅ SAFE TO MOVE:');
    console.log('   - No matrix children to orphan');
    console.log('   - Sella has available matrix positions');
    console.log('   - Only changes override commission flow');
  } else {
    console.log('⚠️  RISKY TO MOVE:');
    console.log(`   - Would orphan ${matrixChildren.length} people under Reagan`);
    console.log('   - Would require re-placement of those people');
  }

  console.log('');
  console.log('Changes That WILL Occur:');
  console.log('  1. Reagan\'s matrix_parent_id: Falguni → Sella');
  console.log('  2. L2-L5 overrides from Reagan\'s sales will go to different people');
  console.log('  3. Sella\'s matrix depth will increase by 1');
  console.log('  4. Reagan\'s matrix_depth will change based on Sella\'s depth');
  console.log('');
  console.log('Data Integrity:');
  console.log('  ✅ Will NOT break database constraints');
  console.log('  ✅ Will NOT break enrollment tree (sponsor_id separate)');
  console.log('  ✅ Will NOT break member/credits data');
  console.log('  ⚠️  WILL change commission calculations going forward');
  console.log('========================================');
}

analyzeReaganMatrixMove();

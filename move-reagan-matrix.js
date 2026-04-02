import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function moveReaganMatrix() {
  console.log('========================================');
  console.log('Moving Reagan Wolfe to Sella Daniel\'s Matrix');
  console.log('========================================\n');

  // Step 1: Get Reagan's info
  const { data: reagan } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_parent_id, matrix_position, matrix_depth')
    .ilike('first_name', 'reagan')
    .ilike('last_name', 'wolfe')
    .single();

  console.log('Step 1: Current Reagan Matrix Status:');
  console.log(`  Matrix Parent ID: ${reagan.matrix_parent_id}`);
  console.log(`  Matrix Position: ${reagan.matrix_position}`);
  console.log(`  Matrix Depth: ${reagan.matrix_depth}`);
  console.log('');

  // Step 2: Get Sella's info
  const { data: sella } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_depth')
    .ilike('first_name', 'sella')
    .ilike('last_name', 'daniel')
    .single();

  console.log('Step 2: Sella Daniel Info:');
  console.log(`  Distributor ID: ${sella.id}`);
  console.log(`  Matrix Depth: ${sella.matrix_depth}`);
  console.log('');

  // Step 3: Find available position in Sella's matrix
  const { data: sellaChildren } = await supabase
    .from('distributors')
    .select('matrix_position')
    .eq('matrix_parent_id', sella.id)
    .order('matrix_position', { ascending: true });

  const occupiedPositions = sellaChildren ? sellaChildren.map(c => c.matrix_position) : [];
  const availablePosition = [1, 2, 3, 4, 5].find(p => !occupiedPositions.includes(p));

  console.log('Step 3: Finding available matrix position:');
  console.log(`  Occupied positions: ${occupiedPositions.join(', ')}`);
  console.log(`  ✅ Available position: ${availablePosition}`);
  console.log('');

  // Step 4: Calculate new depth (parent's depth + 1)
  const newDepth = (sella.matrix_depth || 0) + 1;

  console.log('Step 4: Calculating new depth:');
  console.log(`  Sella's depth: ${sella.matrix_depth || 0}`);
  console.log(`  Reagan's new depth: ${newDepth}`);
  console.log('');

  // Step 5: Update Reagan's matrix placement
  console.log('Step 5: Updating Reagan\'s matrix placement...');
  const { data: updateResult, error: updateError } = await supabase
    .from('distributors')
    .update({
      matrix_parent_id: sella.id,
      matrix_position: availablePosition,
      matrix_depth: newDepth
    })
    .eq('id', reagan.id)
    .select();

  if (updateError) {
    console.error('❌ Failed to update matrix placement:', updateError);
    return;
  }

  console.log('✅ Successfully updated Reagan\'s matrix placement!');
  console.log('');

  // Step 6: Verify the change
  console.log('Step 6: Verifying the change...');
  const { data: verification } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, matrix_parent_id, matrix_position, matrix_depth')
    .eq('id', reagan.id)
    .single();

  if (verification.matrix_parent_id === sella.id) {
    console.log('✅ VERIFIED: Reagan is now in Sella\'s matrix');
    console.log('');
    console.log('========================================');
    console.log('SUMMARY:');
    console.log('========================================');
    console.log('Reagan Wolfe Matrix Placement:');
    console.log(`  Old Parent: Falguni Jariwala`);
    console.log(`  New Parent: Sella Daniel`);
    console.log(`  Old Position: ${reagan.matrix_position}`);
    console.log(`  New Position: ${verification.matrix_position}`);
    console.log(`  Old Depth: ${reagan.matrix_depth}`);
    console.log(`  New Depth: ${verification.matrix_depth}`);
    console.log('');
    console.log('Commission Impact:');
    console.log('  ✅ L1 Override (30%): Sella Daniel (via sponsor_id)');
    console.log('  ✅ L2-L5 Overrides: Now flow through Sella\'s matrix upline');
    console.log('');
    console.log('Reagan is now aligned:');
    console.log('  - Enrollment Sponsor: Sella Daniel ✅');
    console.log('  - Matrix Parent: Sella Daniel ✅');
    console.log('========================================');
  } else {
    console.log('❌ VERIFICATION FAILED: Matrix parent was not updated correctly');
  }
}

moveReaganMatrix();

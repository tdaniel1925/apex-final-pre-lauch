/**
 * Fix Brian's Matrix Position
 *
 * This script fixes Brian's matrix_parent_id to point to Charles
 * so Brian will appear in Charles's Matrix view
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('FIX BRIAN\'S MATRIX POSITION', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  // Step 1: Find Charles
  log('Step 1: Finding Charles Potter...', 'blue');
  const { data: charlesData } = await supabase
    .from('distributors')
    .select('*')
    .ilike('first_name', 'charles')
    .ilike('last_name', 'potter')
    .limit(1);

  if (!charlesData || charlesData.length === 0) {
    log('❌ Charles Potter not found', 'red');
    process.exit(1);
  }

  const charles = charlesData[0];
  log(`✓ Found Charles: ${charles.first_name} ${charles.last_name} (${charles.email})`, 'green');
  log(`  ID: ${charles.id}`, 'cyan');
  log(`  Matrix Depth: ${charles.matrix_depth}`, 'cyan');

  // Step 2: Find Brian
  log('\nStep 2: Finding Brian...', 'blue');
  const { data: brianData } = await supabase
    .from('distributors')
    .select('*')
    .ilike('first_name', 'brian')
    .limit(1);

  if (!brianData || brianData.length === 0) {
    log('❌ Brian not found', 'red');
    process.exit(1);
  }

  const brian = brianData[0];
  log(`✓ Found Brian: ${brian.first_name} ${brian.last_name} (${brian.email})`, 'green');
  log(`  ID: ${brian.id}`, 'cyan');
  log(`  Current Matrix Parent ID: ${brian.matrix_parent_id}`, 'cyan');
  log(`  Current Matrix Depth: ${brian.matrix_depth}`, 'cyan');
  log(`  Current Sponsor ID: ${brian.sponsor_id}`, 'cyan');

  // Step 3: Check if Brian is already under Charles
  if (brian.matrix_parent_id === charles.id) {
    log('\n✓ Brian is already under Charles in the matrix!', 'green');
    log('No fix needed.', 'green');
    return;
  }

  // Step 4: Check how many children Charles currently has
  log('\nStep 3: Checking Charles\'s current matrix children...', 'blue');
  const { data: currentChildren, count } = await supabase
    .from('distributors')
    .select('*', { count: 'exact' })
    .eq('matrix_parent_id', charles.id)
    .neq('status', 'deleted');

  log(`Charles currently has ${count || 0} matrix children`, 'cyan');

  if (count && count >= 5) {
    log('⚠️  Charles already has 5 children (matrix is full)', 'yellow');
    log('Cannot place Brian under Charles without removing another child.', 'yellow');
    process.exit(1);
  }

  currentChildren?.forEach((child, index) => {
    log(`  ${index + 1}. ${child.first_name} ${child.last_name} (Position ${child.matrix_position})`, 'reset');
  });

  // Step 5: Calculate new position for Brian
  const newPosition = (count || 0) + 1;
  const newDepth = (charles.matrix_depth || 0) + 1;

  log('\nStep 4: Preparing to update Brian\'s position...', 'blue');
  log(`New Matrix Parent: Charles (${charles.id})`, 'cyan');
  log(`New Matrix Position: ${newPosition}`, 'cyan');
  log(`New Matrix Depth: ${newDepth}`, 'cyan');

  // Step 6: Confirm before updating
  log('\n⚠️  WARNING: This will update Brian\'s matrix position in the database.', 'yellow');
  log('Press Ctrl+C to cancel, or continue to apply the fix...', 'yellow');

  // Wait 3 seconds before proceeding
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 7: Update Brian's position
  log('\nStep 5: Updating Brian\'s matrix position...', 'blue');

  const { data: updateData, error: updateError } = await supabase
    .from('distributors')
    .update({
      matrix_parent_id: charles.id,
      matrix_depth: newDepth,
      matrix_position: newPosition,
    })
    .eq('id', brian.id)
    .select()
    .single();

  if (updateError) {
    log(`❌ Error updating Brian: ${updateError.message}`, 'red');
    process.exit(1);
  }

  log('✓ Brian\'s position updated successfully!', 'green');

  // Step 8: Verify the update
  log('\nStep 6: Verifying update...', 'blue');
  const { data: verifyData } = await supabase
    .from('distributors')
    .select('*')
    .eq('id', brian.id)
    .single();

  if (verifyData) {
    log('✓ Verification successful:', 'green');
    log(`  Matrix Parent ID: ${verifyData.matrix_parent_id} ${verifyData.matrix_parent_id === charles.id ? '✓' : '✗'}`, 'cyan');
    log(`  Matrix Depth: ${verifyData.matrix_depth}`, 'cyan');
    log(`  Matrix Position: ${verifyData.matrix_position}`, 'cyan');
    log(`  Sponsor ID: ${verifyData.sponsor_id}`, 'cyan');
  }

  // Step 9: Verify Charles can now see Brian
  log('\nStep 7: Verifying Charles can see Brian in matrix...', 'blue');
  const { data: charlesChildren } = await supabase
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', charles.id)
    .order('matrix_position', { ascending: true });

  const brianInChildren = charlesChildren?.some(child => child.id === brian.id);

  if (brianInChildren) {
    log('✓ SUCCESS! Brian now appears in Charles\'s matrix children!', 'green');
    log('\nCharles\'s matrix children:', 'cyan');
    charlesChildren?.forEach((child, index) => {
      const isBrian = child.id === brian.id;
      log(
        `  ${index + 1}. ${child.first_name} ${child.last_name} (Position ${child.matrix_position})${isBrian ? ' ← BRIAN' : ''}`,
        isBrian ? 'green' : 'reset'
      );
    });
  } else {
    log('✗ Brian still not in Charles\'s matrix children', 'red');
    log('Something went wrong. Please check the database manually.', 'red');
  }

  log('\n' + '='.repeat(60), 'cyan');
  log('FIX COMPLETE', 'bright');
  log('='.repeat(60) + '\n', 'cyan');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

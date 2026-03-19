/**
 * Matrix Query Test Script
 *
 * Purpose: Query Charles Potter's matrix data directly and verify Brian appears
 *
 * This script:
 * 1. Queries Charles Potter's distributor record
 * 2. Queries all reps with matrix_parent_id = Charles's ID
 * 3. Queries recursively to get full matrix tree
 * 4. Compares with what Matrix view shows
 * 5. Outputs discrepancies
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function subheader(message) {
  log('\n' + '-'.repeat(60), 'blue');
  log(message, 'blue');
  log('-'.repeat(60), 'blue');
}

async function queryCharles() {
  header('Step 1: Query Charles Potter');

  // Try different possible emails for Charles
  const possibleEmails = [
    'charles@example.com',
    'charles.potter@example.com',
    'cpotter@example.com',
  ];

  let charles = null;
  let queryError = null;

  for (const email of possibleEmails) {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (!error && data && data.length > 0) {
      charles = data[0];
      log(`Found Charles using email: ${email}`, 'cyan');
      break;
    } else if (error) {
      queryError = error;
    }
  }

  // If still not found, try by name
  if (!charles) {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .ilike('first_name', 'charles')
      .ilike('last_name', 'potter')
      .limit(1);

    if (!error && data && data.length > 0) {
      charles = data[0];
      log(`Found Charles using name search`, 'cyan');
    } else if (error) {
      queryError = error;
    }
  }

  if (queryError && !charles) {
    log(`❌ Error querying Charles: ${queryError.message}`, 'red');
    return null;
  }

  if (!charles) {
    log('❌ Charles Potter not found in database', 'red');
    return null;
  }

  log('✓ Charles Potter found:', 'green');
  console.log({
    id: charles.id,
    name: `${charles.first_name} ${charles.last_name}`,
    email: charles.email,
    slug: charles.slug,
    status: charles.status,
    matrix_depth: charles.matrix_depth,
    matrix_position: charles.matrix_position,
    matrix_parent_id: charles.matrix_parent_id,
    sponsor_id: charles.sponsor_id,
    is_master: charles.is_master,
  });

  return charles;
}

async function queryBrian() {
  header('Step 2: Query Brian');

  // Try different possible emails for Brian
  const possibleEmails = [
    'brian@example.com',
    'brian.test@example.com',
  ];

  let brian = null;
  let queryError = null;

  for (const email of possibleEmails) {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (!error && data && data.length > 0) {
      brian = data[0];
      log(`Found Brian using email: ${email}`, 'cyan');
      break;
    } else if (error) {
      queryError = error;
    }
  }

  // If still not found, try by name
  if (!brian) {
    const { data, error } = await supabase
      .from('distributors')
      .select('*')
      .ilike('first_name', 'brian')
      .limit(1);

    if (!error && data && data.length > 0) {
      brian = data[0];
      log(`Found Brian using name search`, 'cyan');
    } else if (error) {
      queryError = error;
    }
  }

  if (queryError && !brian) {
    log(`❌ Error querying Brian: ${queryError.message}`, 'red');
    return null;
  }

  if (!brian) {
    log('❌ Brian not found in database', 'red');
    return null;
  }

  log('✓ Brian found:', 'green');
  console.log({
    id: brian.id,
    name: `${brian.first_name} ${brian.last_name}`,
    email: brian.email,
    slug: brian.slug,
    status: brian.status,
    matrix_depth: brian.matrix_depth,
    matrix_position: brian.matrix_position,
    matrix_parent_id: brian.matrix_parent_id,
    sponsor_id: brian.sponsor_id,
  });

  return brian;
}

async function verifyRelationship(charles, brian) {
  header('Step 3: Verify Charles-Brian Relationship');

  let issuesFound = [];

  // Check sponsor relationship
  if (brian.sponsor_id === charles.id) {
    log('✓ Brian is sponsored by Charles (sponsor_id matches)', 'green');
  } else {
    log('✗ Brian is NOT sponsored by Charles', 'red');
    log(`  Expected sponsor_id: ${charles.id}`, 'yellow');
    log(`  Actual sponsor_id: ${brian.sponsor_id}`, 'yellow');
    issuesFound.push({
      field: 'sponsor_id',
      expected: charles.id,
      actual: brian.sponsor_id,
    });
  }

  // Check matrix parent relationship
  if (brian.matrix_parent_id === charles.id) {
    log('✓ Brian is under Charles in matrix (matrix_parent_id matches)', 'green');
  } else {
    log('✗ Brian is NOT under Charles in matrix', 'red');
    log(`  Expected matrix_parent_id: ${charles.id}`, 'yellow');
    log(`  Actual matrix_parent_id: ${brian.matrix_parent_id}`, 'yellow');
    issuesFound.push({
      field: 'matrix_parent_id',
      expected: charles.id,
      actual: brian.matrix_parent_id,
    });
  }

  // Check matrix depth (should be Charles + 1)
  const expectedDepth = (charles.matrix_depth || 0) + 1;
  if (brian.matrix_depth === expectedDepth) {
    log(`✓ Brian has correct matrix depth: ${brian.matrix_depth}`, 'green');
  } else {
    log('✗ Brian has incorrect matrix depth', 'red');
    log(`  Expected depth: ${expectedDepth}`, 'yellow');
    log(`  Actual depth: ${brian.matrix_depth}`, 'yellow');
    issuesFound.push({
      field: 'matrix_depth',
      expected: expectedDepth,
      actual: brian.matrix_depth,
    });
  }

  // Check matrix position (should be 1-5)
  if (brian.matrix_position >= 1 && brian.matrix_position <= 5) {
    log(`✓ Brian has valid matrix position: ${brian.matrix_position}`, 'green');
  } else {
    log('✗ Brian has invalid matrix position', 'red');
    log(`  Valid range: 1-5`, 'yellow');
    log(`  Actual position: ${brian.matrix_position}`, 'yellow');
    issuesFound.push({
      field: 'matrix_position',
      expected: '1-5',
      actual: brian.matrix_position,
    });
  }

  return issuesFound;
}

async function queryCharlesMatrixChildren(charlesId) {
  header('Step 4: Query All Matrix Children of Charles');

  const { data: children, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', charlesId)
    .neq('status', 'deleted')
    .order('matrix_position', { ascending: true });

  if (error) {
    log(`❌ Error querying matrix children: ${error.message}`, 'red');
    return [];
  }

  if (!children || children.length === 0) {
    log('⚠️  Charles has NO matrix children', 'yellow');
    return [];
  }

  log(`✓ Charles has ${children.length} direct matrix children:`, 'green');

  children.forEach((child, index) => {
    const isBrian = child.email === 'brian@example.com';
    const color = isBrian ? 'green' : 'reset';
    log(
      `  ${index + 1}. ${child.first_name} ${child.last_name} ` +
      `(Position ${child.matrix_position}, Depth ${child.matrix_depth}, ` +
      `Email: ${child.email})${isBrian ? ' ← BRIAN' : ''}`,
      color
    );
  });

  return children;
}

async function queryMatrixTreeRecursive(parentId, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];

  const { data: children } = await supabase
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', parentId)
    .neq('status', 'deleted')
    .order('matrix_position', { ascending: true });

  if (!children || children.length === 0) return [];

  const tree = [];
  for (const child of children) {
    const node = {
      ...child,
      depth,
      children: await queryMatrixTreeRecursive(child.id, depth + 1, maxDepth),
    };
    tree.push(node);
  }

  return tree;
}

async function displayMatrixTree(tree, prefix = '', isLast = true) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const isLastChild = i === tree.length - 1;
    const connector = isLastChild ? '└─' : '├─';
    const isBrian = node.email === 'brian@example.com';
    const color = isBrian ? 'green' : 'reset';

    log(
      `${prefix}${connector} ${node.first_name} ${node.last_name} ` +
      `(Pos ${node.matrix_position}, Depth ${node.matrix_depth})${isBrian ? ' ← BRIAN' : ''}`,
      color
    );

    if (node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLastChild ? '  ' : '│ ');
      await displayMatrixTree(node.children, newPrefix, isLastChild);
    }
  }
}

async function queryFullMatrixTree(charles) {
  header('Step 5: Query Full Matrix Tree (Recursive, Max Depth 3)');

  const tree = await queryMatrixTreeRecursive(charles.id);

  if (tree.length === 0) {
    log('⚠️  Charles has no matrix tree', 'yellow');
    return tree;
  }

  log(`\nMatrix Tree for ${charles.first_name} ${charles.last_name}:`, 'bright');
  await displayMatrixTree(tree);

  return tree;
}

function checkForBrianInTree(tree, brianId) {
  for (const node of tree) {
    if (node.id === brianId) {
      return true;
    }
    if (node.children && node.children.length > 0) {
      if (checkForBrianInTree(node.children, brianId)) {
        return true;
      }
    }
  }
  return false;
}

async function generateFixSuggestions(issues, charles, brian) {
  if (issues.length === 0) return;

  header('Step 6: Fix Suggestions');

  log('Issues found that need to be fixed:', 'red');
  issues.forEach((issue, index) => {
    log(`\n${index + 1}. Field: ${issue.field}`, 'yellow');
    log(`   Expected: ${issue.expected}`, 'yellow');
    log(`   Actual: ${issue.actual}`, 'yellow');
  });

  log('\n\nSQL Fix Command:', 'cyan');
  log('Run this SQL in Supabase SQL Editor to fix Brian\'s relationship:', 'cyan');

  const sqlCommand = `
UPDATE distributors
SET
  sponsor_id = '${charles.id}',
  matrix_parent_id = '${charles.id}',
  matrix_depth = ${(charles.matrix_depth || 0) + 1}
WHERE email = 'brian@example.com';
`.trim();

  log('\n' + sqlCommand, 'green');

  log('\n\nOR use the Supabase client in Node.js:', 'cyan');
  const nodeCommand = `
const { data, error } = await supabase
  .from('distributors')
  .update({
    sponsor_id: '${charles.id}',
    matrix_parent_id: '${charles.id}',
    matrix_depth: ${(charles.matrix_depth || 0) + 1},
  })
  .eq('email', 'brian@example.com');
`.trim();

  log('\n' + nodeCommand, 'green');
}

async function main() {
  log('\n' + '═'.repeat(60), 'bright');
  log('MATRIX QUERY TEST SCRIPT', 'bright');
  log('Testing Charles Potter → Brian relationship', 'bright');
  log('═'.repeat(60) + '\n', 'bright');

  // Step 1: Query Charles
  const charles = await queryCharles();
  if (!charles) {
    log('\n❌ Cannot proceed without Charles Potter in database', 'red');
    process.exit(1);
  }

  // Step 2: Query Brian
  const brian = await queryBrian();
  if (!brian) {
    log('\n⚠️  Brian not found - cannot verify relationship', 'yellow');
    log('Continuing with matrix children query...', 'yellow');
  }

  // Step 3: Verify relationship (if Brian exists)
  let issues = [];
  if (brian) {
    issues = await verifyRelationship(charles, brian);
  }

  // Step 4: Query Charles's direct matrix children
  const children = await queryCharlesMatrixChildren(charles.id);

  // Check if Brian is in the children list
  if (brian) {
    const brianInChildren = children.some(child => child.id === brian.id);
    if (brianInChildren) {
      log('\n✓ Brian FOUND in Charles\'s direct matrix children', 'green');
    } else {
      log('\n✗ Brian NOT FOUND in Charles\'s direct matrix children', 'red');
      log('This means Brian will NOT appear in Charles\'s Matrix view!', 'red');
    }
  }

  // Step 5: Query full matrix tree
  const tree = await queryFullMatrixTree(charles);

  // Check if Brian is anywhere in the tree
  if (brian) {
    const brianInTree = checkForBrianInTree(tree, brian.id);
    if (brianInTree) {
      log('\n✓ Brian FOUND somewhere in Charles\'s matrix tree', 'green');
    } else {
      log('\n✗ Brian NOT FOUND in Charles\'s matrix tree', 'red');
    }
  }

  // Step 6: Generate fix suggestions if issues found
  if (issues.length > 0 && brian) {
    await generateFixSuggestions(issues, charles, brian);
  }

  // Final summary
  header('Summary');

  if (issues.length === 0 && brian && children.some(child => child.id === brian.id)) {
    log('✓ Everything looks good! Brian should appear in Charles\'s Matrix view.', 'green');
  } else if (!brian) {
    log('⚠️  Brian not found in database', 'yellow');
  } else {
    log('✗ Issues found - Brian will NOT appear correctly in Matrix view', 'red');
    log(`   Total issues: ${issues.length}`, 'red');
  }

  log('\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

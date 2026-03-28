#!/usr/bin/env node

// =============================================
// PRE-COMMIT HOOK: Source of Truth Validator
// Prevents matrix_parent_id usage in team display code
// =============================================

const fs = require('fs');
const path = require('path');

// Files that have been staged for commit
const stagedFiles = process.argv.slice(2);

// Patterns to detect
const FORBIDDEN_PATTERNS = [
  {
    pattern: /['"]matrix_parent_id['"]\s*,/g,
    message: '🚨 FORBIDDEN: Using matrix_parent_id in queries',
    suggestion: 'Use sponsor_id (enrollment tree) instead'
  },
  {
    pattern: /\.eq\(\s*['"]matrix_parent_id['"]/g,
    message: '🚨 FORBIDDEN: Using .eq(\'matrix_parent_id\')',
    suggestion: 'Use sponsor_id (enrollment tree) instead'
  },
  {
    pattern: /\.in\(\s*['"]matrix_parent_id['"]/g,
    message: '🚨 FORBIDDEN: Using .in(\'matrix_parent_id\')',
    suggestion: 'Use sponsor_id (enrollment tree) instead'
  },
  {
    pattern: /\.filter\(\s*['"]matrix_parent_id['"]/g,
    message: '🚨 FORBIDDEN: Using .filter(\'matrix_parent_id\')',
    suggestion: 'Use sponsor_id (enrollment tree) instead'
  }
];

// Files that are ALLOWED to use matrix_parent_id (matrix visualization & placement)
// See CLAUDE.md "ALLOWED EXCEPTIONS" section for full list
const ALLOWED_FILES = [
  'src/lib/matrix/placement-algorithm.ts',
  'src/lib/genealogy/tree-utils.ts',  // Core dual-tree utilities (MUST use both trees)
  'src/app/api/admin/matrix/tree/route.ts',
  'src/app/dashboard/matrix/',
  'src/app/api/dashboard/matrix-position/route.ts',
  'src/app/api/admin/matrix/place.ts',
  'src/app/api/admin/matrix/place-existing.ts',
  'src/app/api/admin/matrix/create-and-place.ts',
  'src/components/admin/matrix/PlacementTool.tsx'
];

let violations = [];

// Check each staged file
for (const file of stagedFiles) {
  // Only check TypeScript/JavaScript files in relevant directories
  if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;
  if (!file.match(/(src\/app|src\/components|src\/lib)/)) continue;

  // Skip allowed files (admin placement tools)
  if (ALLOWED_FILES.some(allowed => file.includes(allowed))) {
    console.log(`✓ Skipping ${file} (allowed to use matrix_parent_id)`);
    continue;
  }

  // Read file content
  const content = fs.readFileSync(file, 'utf8');

  // Check for forbidden patterns
  for (const { pattern, message, suggestion } of FORBIDDEN_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      violations.push({
        file,
        message,
        suggestion,
        matches: matches.length
      });
    }
  }
}

// Report violations
if (violations.length > 0) {
  console.error('\n❌ SOURCE OF TRUTH VIOLATION DETECTED\n');
  console.error('═'.repeat(60));

  for (const violation of violations) {
    console.error(`\n📁 File: ${violation.file}`);
    console.error(`   ${violation.message}`);
    console.error(`   💡 ${violation.suggestion}`);
    console.error(`   Found ${violation.matches} occurrence(s)`);
  }

  console.error('\n═'.repeat(60));
  console.error('\n📖 RULE: Team hierarchy must use sponsor_id (enrollment tree)');
  console.error('   ❌ NEVER use matrix_parent_id for team display');
  console.error('   ✅ ALWAYS use sponsor_id for enrollment hierarchy');
  console.error('\n   See: tests/integration/source-of-truth.test.ts');
  console.error('   See: SINGLE-SOURCE-OF-TRUTH.md\n');

  process.exit(1);
}

console.log('✅ Source of truth validation passed');
process.exit(0);

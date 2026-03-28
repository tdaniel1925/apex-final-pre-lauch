import { glob } from 'glob';
import * as fs from 'fs/promises';

/**
 * AUTO-FIX ALL SOURCE OF TRUTH VIOLATIONS
 *
 * This script automatically fixes the remaining violations found in the audit.
 *
 * CRITICAL FILES TO FIX:
 * 1. src/app/dashboard/team/page.tsx - Using members.enroller_id
 * 2. src/lib/compensation/override-resolution.ts - Mixing enrollment/matrix
 * 3. src/lib/compensation/override-calculator.ts - Mixing enrollment/matrix
 * 4. src/app/api/admin/matrix/tree/route.ts - Cached BV fields
 */

interface Fix {
  file: string;
  description: string;
  applied: boolean;
  error?: string;
}

const fixes: Fix[] = [];

async function fixAllViolations() {
  console.log('\n🔧 AUTO-FIX: Source of Truth Violations\n');

  // Fix 1: Team page using wrong enrollment source
  await fixTeamPage();

  // Fix 2: Matrix tree using cached BV
  await fixMatrixTreeBV();

  // Fix 3: Compensation files (mark for manual review - too complex)
  await flagCompensationFiles();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80) + '\n');

  const applied = fixes.filter(f => f.applied).length;
  const failed = fixes.filter(f => !f.applied).length;

  console.log(`✅ Applied: ${applied}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📋 Total: ${fixes.length}\n`);

  fixes.forEach(fix => {
    const icon = fix.applied ? '✅' : '❌';
    console.log(`${icon} ${fix.file}`);
    console.log(`   ${fix.description}`);
    if (fix.error) {
      console.log(`   Error: ${fix.error}`);
    }
    console.log();
  });

  // Save report
  await fs.writeFile(
    'SOURCE-OF-TRUTH-FIX-REPORT.md',
    generateReport()
  );

  console.log('📄 Detailed report: SOURCE-OF-TRUTH-FIX-REPORT.md\n');
}

async function fixTeamPage() {
  const file = 'src/app/dashboard/team/page.tsx';
  console.log(`\n1️⃣ Fixing ${file}...\n`);

  try {
    const content = await fs.readFile(file, 'utf-8');

    // Check if already fixed
    if (!content.includes('.from(\'members\')') || !content.includes('enroller_id')) {
      console.log('   ℹ️  Already fixed or not found\n');
      fixes.push({
        file,
        description: 'Already fixed or pattern not found',
        applied: true,
      });
      return;
    }

    // This file is complex - needs manual review
    // Flag it instead of auto-fixing
    console.log('   ⚠️  Complex file - requires manual review\n');
    console.log('   The team page needs to:');
    console.log('   - Query distributors.sponsor_id instead of members.enroller_id');
    console.log('   - JOIN to members table for member data');
    console.log('   - Update component to handle new data structure\n');

    fixes.push({
      file,
      description: 'MANUAL FIX REQUIRED: Change members.enroller_id to distributors.sponsor_id',
      applied: false,
      error: 'Requires manual review due to complexity',
    });
  } catch (error) {
    fixes.push({
      file,
      description: 'Failed to process',
      applied: false,
      error: String(error),
    });
  }
}

async function fixMatrixTreeBV() {
  const file = 'src/app/api/admin/matrix/tree/route.ts';
  console.log(`\n2️⃣ Fixing ${file}...\n`);

  try {
    let content = await fs.readFile(file, 'utf-8');

    // Check if needs fixing
    if (!content.includes('personal_bv_monthly') && !content.includes('group_bv_monthly')) {
      console.log('   ℹ️  Already fixed or not found\n');
      fixes.push({
        file,
        description: 'Already fixed',
        applied: true,
      });
      return;
    }

    // Replace the interface definition
    const oldInterface = `interface TreeNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  personal_bv_monthly?: number | null;
  group_bv_monthly?: number | null;
  created_at: string;
  children?: TreeNode[];
  childCount?: number;
}`;

    const newInterface = `interface TreeNode {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  rep_number: string | null;
  status: string;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  created_at: string;
  children?: TreeNode[];
  childCount?: number;
  member?: {
    personal_credits_monthly: number | null;
    team_credits_monthly: number | null;
  } | null;
}`;

    if (content.includes(oldInterface)) {
      content = content.replace(oldInterface, newInterface);

      // Add member JOIN to query
      const oldSelect = `.select('*')`;
      const newSelect = `.select(\`
        *,
        member:members!members_distributor_id_fkey (
          personal_credits_monthly,
          team_credits_monthly
        )
      \`)`;

      content = content.replace(oldSelect, newSelect);

      await fs.writeFile(file, content, 'utf-8');

      console.log('   ✅ Fixed: Removed cached BV fields, added member JOIN\n');
      fixes.push({
        file,
        description: 'Removed cached BV fields, added JOIN to members table',
        applied: true,
      });
    } else {
      console.log('   ⚠️  Pattern not found - may have different structure\n');
      fixes.push({
        file,
        description: 'Pattern not found',
        applied: false,
        error: 'File structure different than expected',
      });
    }
  } catch (error) {
    fixes.push({
      file,
      description: 'Failed to process',
      applied: false,
      error: String(error),
    });
  }
}

async function flagCompensationFiles() {
  const files = [
    'src/lib/compensation/override-resolution.ts',
    'src/lib/compensation/override-calculator.ts',
  ];

  console.log(`\n3️⃣ Flagging compensation files for manual review...\n`);

  for (const file of files) {
    console.log(`   ⚠️  ${file}`);
    console.log('   CRITICAL: This file mixes enrollment tree with matrix placement');
    console.log('   Must be reviewed and fixed manually to avoid wrong commissions\n');

    fixes.push({
      file,
      description: 'CRITICAL MANUAL FIX REQUIRED: Separates L1 (sponsor_id) from L2-L5 (matrix_parent_id)',
      applied: false,
      error: 'Too complex for auto-fix - requires careful manual refactoring',
    });
  }
}

function generateReport(): string {
  let report = '# Source of Truth Fix Report\n\n';
  report += `**Generated:** ${new Date().toLocaleString()}\n\n`;

  const applied = fixes.filter(f => f.applied).length;
  const failed = fixes.filter(f => !f.applied).length;

  report += '## Summary\n\n';
  report += `- ✅ **Applied:** ${applied}\n`;
  report += `- ❌ **Failed/Manual:** ${failed}\n`;
  report += `- 📋 **Total:** ${fixes.length}\n\n`;

  report += '## Fixes Applied\n\n';
  fixes.filter(f => f.applied).forEach(fix => {
    report += `### ✅ ${fix.file}\n\n`;
    report += `**Description:** ${fix.description}\n\n`;
  });

  report += '## Manual Fixes Required\n\n';
  fixes.filter(f => !f.applied).forEach(fix => {
    report += `### ❌ ${fix.file}\n\n`;
    report += `**Description:** ${fix.description}\n\n`;
    if (fix.error) {
      report += `**Reason:** ${fix.error}\n\n`;
    }
  });

  report += '## Next Steps\n\n';
  report += '1. Review and manually fix flagged compensation files\n';
  report += '2. Review team page query structure\n';
  report += '3. Run tests to verify fixes\n';
  report += '4. Commit changes\n\n';

  return report;
}

// Run the fixes
fixAllViolations().catch(console.error);

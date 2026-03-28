import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Audit script to find all code that incorrectly uses members.enroller_id
 * instead of distributors.sponsor_id for enrollment tree data
 *
 * SINGLE SOURCE OF TRUTH RULE:
 * - Enrollment tree → distributors.sponsor_id ✅
 * - Member enrollment → members.enroller_id (insurance system only) ⚠️
 */

interface Finding {
  file: string;
  line: number;
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  issue: string;
  fix: string;
}

async function auditEnrollmentDependencies() {
  console.log('\n=== ENROLLMENT DEPENDENCY AUDIT ===\n');
  console.log('Checking for violations of single source of truth...\n');

  const findings: Finding[] = [];

  // Get all TypeScript/JavaScript files
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check 1: Using members.enroller_id for enrollment counts/queries
      if (
        line.includes("from('members')") &&
        (content.includes('enroller_id') || line.includes('enroller_id'))
      ) {
        // Check if this is in a context that should use distributors instead
        const contextLines = lines.slice(Math.max(0, i - 5), i + 5).join('\n');

        if (
          contextLines.includes('L1') ||
          contextLines.includes('enrollees') ||
          contextLines.includes('downline') ||
          contextLines.includes('sponsor') ||
          contextLines.includes('team')
        ) {
          findings.push({
            file,
            line: lineNumber,
            code: line.trim(),
            severity: 'ERROR',
            issue: 'Using members.enroller_id for enrollment tree data',
            fix: "Use distributors.sponsor_id instead (single source of truth)",
          });
        }
      }

      // Check 2: References to enrollment_stats table (doesn't exist)
      if (line.includes("'enrollment_stats'") || line.includes('"enrollment_stats"')) {
        findings.push({
          file,
          line: lineNumber,
          code: line.trim(),
          severity: 'ERROR',
          issue: 'Referencing non-existent enrollment_stats table',
          fix: 'Query distributors.sponsor_id directly or create the table',
        });
      }

      // Check 3: References to distributor_stats table for enrollment
      if (
        (line.includes("'distributor_stats'") || line.includes('"distributor_stats"')) &&
        (contextLines?.includes('enroll') || contextLines?.includes('L1'))
      ) {
        const contextLines = lines.slice(Math.max(0, i - 5), i + 5).join('\n');

        findings.push({
          file,
          line: lineNumber,
          code: line.trim(),
          severity: 'WARNING',
          issue: 'May be using cached enrollment stats',
          fix: 'Verify this is synchronized with distributors.sponsor_id',
        });
      }

      // Check 4: Comments or docs mentioning enrollment_stats
      if (line.includes('enrollment_stats') && (line.trim().startsWith('//') || line.trim().startsWith('*'))) {
        findings.push({
          file,
          line: lineNumber,
          code: line.trim(),
          severity: 'INFO',
          issue: 'Documentation references enrollment_stats',
          fix: 'Update docs to reflect correct source of truth',
        });
      }
    }
  }

  // Group findings by severity
  const errors = findings.filter(f => f.severity === 'ERROR');
  const warnings = findings.filter(f => f.severity === 'WARNING');
  const infos = findings.filter(f => f.severity === 'INFO');

  // Print results
  console.log(`\n🔴 ERRORS (${errors.length}) - Must fix\n`);
  errors.forEach(f => {
    console.log(`   ${path.relative(process.cwd(), f.file)}:${f.line}`);
    console.log(`   ❌ ${f.issue}`);
    console.log(`   💡 ${f.fix}`);
    console.log(`   📝 ${f.code}`);
    console.log();
  });

  console.log(`\n🟡 WARNINGS (${warnings.length}) - Should review\n`);
  warnings.forEach(f => {
    console.log(`   ${path.relative(process.cwd(), f.file)}:${f.line}`);
    console.log(`   ⚠️  ${f.issue}`);
    console.log(`   💡 ${f.fix}`);
    console.log();
  });

  console.log(`\n🔵 INFO (${infos.length}) - Documentation updates\n`);
  infos.forEach(f => {
    console.log(`   ${path.relative(process.cwd(), f.file)}:${f.line}`);
    console.log(`   ℹ️  ${f.issue}`);
    console.log();
  });

  console.log(`\n=== SUMMARY ===\n`);
  console.log(`Total findings: ${findings.length}`);
  console.log(`  🔴 Errors: ${errors.length}`);
  console.log(`  🟡 Warnings: ${warnings.length}`);
  console.log(`  🔵 Info: ${infos.length}`);

  console.log(`\n=== SINGLE SOURCE OF TRUTH RULES ===\n`);
  console.log(`✅ Enrollment tree (sponsor/downline) → distributors.sponsor_id`);
  console.log(`⚠️  Insurance enrollment → members.enroller_id (separate system)`);
  console.log(`❌ Do NOT mix these two systems!`);
  console.log();

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: findings.length,
      errors: errors.length,
      warnings: warnings.length,
      info: infos.length,
    },
    findings,
  };

  await fs.writeFile(
    'ENROLLMENT-DEPENDENCY-AUDIT.json',
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Detailed report saved to: ENROLLMENT-DEPENDENCY-AUDIT.json\n`);
}

auditEnrollmentDependencies().catch(console.error);

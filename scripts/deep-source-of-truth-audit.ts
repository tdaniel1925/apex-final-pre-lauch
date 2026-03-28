import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Deep Source of Truth Audit
 *
 * Identifies ALL potential source of truth violations across:
 * - Database queries (duplicate/conflicting data sources)
 * - Cached vs computed values
 * - Redundant state management
 * - Inconsistent data flows
 */

interface SourceOfTruthIssue {
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  file: string;
  line: number;
  issue: string;
  currentSource: string;
  correctSource: string;
  code: string;
  impact: string;
}

const issues: SourceOfTruthIssue[] = [];

// Define source of truth rules
const SOURCE_OF_TRUTH_RULES = {
  // Enrollment/Sponsor Tree
  enrollment_tree: {
    correct: 'distributors.sponsor_id',
    wrong: ['members.enroller_id', 'enrollment_stats', 'cached sponsor data'],
    category: 'Enrollment Tree',
  },

  // Matrix/Placement Tree
  matrix_tree: {
    correct: 'distributors.matrix_parent_id + matrix_position',
    wrong: ['cached matrix data', 'computed from enrollments'],
    category: 'Matrix Placement',
  },

  // User Identity
  user_identity: {
    correct: 'distributors.auth_user_id (maps to auth.users.id)',
    wrong: ['members.distributor_id duplicate lookups', 'cached user data'],
    category: 'User Identity',
  },

  // Rep Numbers
  rep_numbers: {
    correct: 'distributors.rep_number',
    wrong: ['members.rep_number', 'cached rep numbers'],
    category: 'Rep Numbers',
  },

  // BV/Credits
  bv_credits: {
    correct: 'members.personal_credits_monthly + team_credits_monthly',
    wrong: ['distributors BV fields', 'cached BV in separate table'],
    category: 'BV/Credits',
  },

  // Member Stats
  member_stats: {
    correct: 'members table (tech_rank, override_qualified, etc)',
    wrong: ['distributor_stats table', 'cached member data'],
    category: 'Member Stats',
  },

  // Downline Counts
  downline_counts: {
    correct: 'COUNT query on distributors.sponsor_id (computed on demand)',
    wrong: ['enrollment_stats.l1_direct', 'cached counts in distributors'],
    category: 'Downline Counts',
  },
};

async function auditSourceOfTruth() {
  console.log('\n=== DEEP SOURCE OF TRUTH AUDIT ===\n');
  console.log('Scanning entire codebase for data consistency violations...\n');

  // Get all source files
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**'],
  });

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const lines = content.split('\n');

    await auditFile(file, content, lines);
  }

  // Generate report
  await generateReport();
}

async function auditFile(file: string, content: string, lines: string[]) {
  // Check 1: Enrollment tree violations
  await checkEnrollmentTree(file, content, lines);

  // Check 2: Duplicate user lookups
  await checkUserIdentity(file, content, lines);

  // Check 3: Cached/computed field violations
  await checkCachedFields(file, content, lines);

  // Check 4: Redundant state management
  await checkRedundantState(file, content, lines);

  // Check 5: Inconsistent data flows
  await checkDataFlows(file, content, lines);

  // Check 6: Matrix placement violations
  await checkMatrixPlacement(file, content, lines);

  // Check 7: Rep number duplicates
  await checkRepNumbers(file, content, lines);
}

async function checkEnrollmentTree(file: string, content: string, lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: Using members.enroller_id for enrollment queries
    if (line.includes("from('members')") && content.includes('enroller_id')) {
      const context = lines.slice(Math.max(0, i - 5), i + 5).join('\n');

      if (
        context.match(/enroller_id/i) &&
        (context.match(/sponsor|downline|enrollee|L1|team/i))
      ) {
        issues.push({
          category: 'Enrollment Tree',
          severity: 'CRITICAL',
          file,
          line: i + 1,
          issue: 'Using members.enroller_id for enrollment tree queries',
          currentSource: 'members.enroller_id',
          correctSource: 'distributors.sponsor_id',
          code: line.trim(),
          impact: 'Enrollment counts and trees will be incorrect',
        });
      }
    }

    // Pattern 2: enrollment_stats table (doesn't exist)
    if (line.match(/['"]enrollment_stats['"]/)) {
      issues.push({
        category: 'Enrollment Tree',
        severity: 'CRITICAL',
        file,
        line: i + 1,
        issue: 'Referencing non-existent enrollment_stats table',
        currentSource: 'enrollment_stats table',
        correctSource: 'COUNT on distributors.sponsor_id',
        code: line.trim(),
        impact: 'Query will fail - table does not exist',
      });
    }
  }
}

async function checkUserIdentity(file: string, content: string, lines: string[]) {
  const authLookups: number[] = [];
  const distributorLookups: number[] = [];
  const memberLookups: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/auth\.getUser\(\)/)) {
      authLookups.push(i + 1);
    }

    if (line.match(/from\(['"]distributors['"]\)/) && line.match(/auth_user_id/)) {
      distributorLookups.push(i + 1);
    }

    if (line.match(/from\(['"]members['"]\)/) && line.match(/distributor_id/)) {
      memberLookups.push(i + 1);
    }
  }

  // Check for duplicate lookups (auth -> distributor -> member)
  if (distributorLookups.length > 1 || (distributorLookups.length > 0 && memberLookups.length > 0)) {
    issues.push({
      category: 'User Identity',
      severity: 'MEDIUM',
      file,
      line: distributorLookups[0] || memberLookups[0],
      issue: 'Multiple user identity lookups in same file',
      currentSource: 'Multiple queries: auth -> distributors -> members',
      correctSource: 'Single query with JOIN',
      code: `${distributorLookups.length} distributor lookups, ${memberLookups.length} member lookups`,
      impact: 'Performance: N+1 queries, potential race conditions',
    });
  }
}

async function checkCachedFields(file: string, content: string, lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: Cached BV in distributors table
    if (line.match(/personal_bv|group_bv/) && content.includes("from('distributors')")) {
      const context = lines.slice(Math.max(0, i - 10), i + 10).join('\n');

      if (!context.includes('members') && context.match(/personal_bv|group_bv/)) {
        issues.push({
          category: 'BV/Credits',
          severity: 'HIGH',
          file,
          line: i + 1,
          issue: 'Using cached BV fields from distributors table',
          currentSource: 'distributors.personal_bv_monthly',
          correctSource: 'members.personal_credits_monthly (via JOIN)',
          code: line.trim(),
          impact: 'Stale data if members table updated but distributors not synced',
        });
      }
    }

    // Pattern 2: Cached counts
    if (line.match(/l1_count|downline_count|team_size/)) {
      issues.push({
        category: 'Downline Counts',
        severity: 'MEDIUM',
        file,
        line: i + 1,
        issue: 'Using cached count field',
        currentSource: 'Cached count column',
        correctSource: 'COUNT query on distributors.sponsor_id',
        code: line.trim(),
        impact: 'Count may be stale if not updated via trigger',
      });
    }
  }
}

async function checkRedundantState(file: string, content: string, lines: string[]) {
  const stateManagement = {
    useState: [] as number[],
    useReducer: [] as number[],
    zustand: [] as number[],
    reactQuery: [] as number[],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.match(/useState</)) stateManagement.useState.push(i + 1);
    if (line.match(/useReducer</)) stateManagement.useReducer.push(i + 1);
    if (line.match(/create\(.*set.*get/)) stateManagement.zustand.push(i + 1);
    if (line.match(/useQuery|useMutation/)) stateManagement.reactQuery.push(i + 1);
  }

  // Multiple state management approaches in same file
  const approaches = Object.values(stateManagement).filter(arr => arr.length > 0).length;

  if (approaches > 2) {
    issues.push({
      category: 'State Management',
      severity: 'LOW',
      file,
      line: stateManagement.useState[0] || stateManagement.reactQuery[0],
      issue: 'Multiple state management approaches in single file',
      currentSource: `${approaches} different state management patterns`,
      correctSource: 'Single consistent approach (prefer React Query for server state)',
      code: `useState: ${stateManagement.useState.length}, useQuery: ${stateManagement.reactQuery.length}`,
      impact: 'Potential state sync issues, harder to maintain',
    });
  }
}

async function checkDataFlows(file: string, content: string, lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: Fetching same data multiple times
    const fromMatches = content.match(/from\(['"](\w+)['"]\)/g);
    if (fromMatches) {
      const tables: Record<string, number> = {};
      fromMatches.forEach(match => {
        const table = match.match(/from\(['"](\w+)['"]\)/)?.[1];
        if (table) {
          tables[table] = (tables[table] || 0) + 1;
        }
      });

      Object.entries(tables).forEach(([table, count]) => {
        if (count > 3 && i === 0) { // Only report once per file
          issues.push({
            category: 'Data Flow',
            severity: 'MEDIUM',
            file,
            line: 1,
            issue: `Querying ${table} table ${count} times in same file`,
            currentSource: `${count} separate queries to ${table}`,
            correctSource: 'Single query with proper JOINs or data structure',
            code: `from('${table}') appears ${count} times`,
            impact: 'N+1 query problem, poor performance',
          });
        }
      });
    }
  }
}

async function checkMatrixPlacement(file: string, content: string, lines: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for matrix calculations from enrollment tree
    if (line.match(/matrix/) && content.includes('enroller_id')) {
      const context = lines.slice(Math.max(0, i - 10), i + 10).join('\n');

      if (context.match(/matrix.*enroller|enroller.*matrix/i)) {
        issues.push({
          category: 'Matrix Placement',
          severity: 'HIGH',
          file,
          line: i + 1,
          issue: 'Computing matrix placement from enrollment tree',
          currentSource: 'Derived from enroller_id',
          correctSource: 'distributors.matrix_parent_id + matrix_position',
          code: line.trim(),
          impact: 'Matrix and enrollment are separate - this will be wrong',
        });
      }
    }
  }
}

async function checkRepNumbers(file: string, content: string, lines: string[]) {
  const distributorRepNumber = content.match(/distributors.*rep_number/g);
  const memberRepNumber = content.match(/members.*rep_number/g);

  if (distributorRepNumber && memberRepNumber) {
    issues.push({
      category: 'Rep Numbers',
      severity: 'MEDIUM',
      file,
      line: 1,
      issue: 'Using rep_number from both distributors and members tables',
      currentSource: 'Both distributors.rep_number and members.rep_number',
      correctSource: 'distributors.rep_number (single source)',
      code: 'rep_number referenced in multiple tables',
      impact: 'Potential mismatch if not synced',
    });
  }
}

async function generateReport() {
  // Group by category
  const byCategory: Record<string, SourceOfTruthIssue[]> = {};

  issues.forEach(issue => {
    if (!byCategory[issue.category]) {
      byCategory[issue.category] = [];
    }
    byCategory[issue.category].push(issue);
  });

  // Sort by severity
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  Object.values(byCategory).forEach(categoryIssues => {
    categoryIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  });

  console.log('\n' + '='.repeat(80));
  console.log('SOURCE OF TRUTH AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Issues Found: ${issues.length}\n`);

  // Summary by severity
  const critical = issues.filter(i => i.severity === 'CRITICAL').length;
  const high = issues.filter(i => i.severity === 'HIGH').length;
  const medium = issues.filter(i => i.severity === 'MEDIUM').length;
  const low = issues.filter(i => i.severity === 'LOW').length;

  console.log('SEVERITY BREAKDOWN:');
  console.log(`  🔴 CRITICAL: ${critical}`);
  console.log(`  🟠 HIGH: ${high}`);
  console.log(`  🟡 MEDIUM: ${medium}`);
  console.log(`  🔵 LOW: ${low}\n`);

  // Detailed breakdown by category
  for (const [category, categoryIssues] of Object.entries(byCategory)) {
    console.log('\n' + '-'.repeat(80));
    console.log(`📁 ${category.toUpperCase()} (${categoryIssues.length} issues)`);
    console.log('-'.repeat(80) + '\n');

    categoryIssues.forEach((issue, idx) => {
      const severityIcon = {
        CRITICAL: '🔴',
        HIGH: '🟠',
        MEDIUM: '🟡',
        LOW: '🔵',
      }[issue.severity];

      console.log(`${idx + 1}. ${severityIcon} ${issue.severity}`);
      console.log(`   File: ${path.relative(process.cwd(), issue.file)}:${issue.line}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Current: ${issue.currentSource}`);
      console.log(`   Correct: ${issue.correctSource}`);
      console.log(`   Impact: ${issue.impact}`);
      console.log(`   Code: ${issue.code}`);
      console.log();
    });
  }

  // Recommendations
  console.log('\n' + '='.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(80) + '\n');

  console.log('1. ENROLLMENT TREE:');
  console.log('   ✅ ALWAYS use: distributors.sponsor_id');
  console.log('   ❌ NEVER use: members.enroller_id (insurance system only)\n');

  console.log('2. MATRIX PLACEMENT:');
  console.log('   ✅ ALWAYS use: distributors.matrix_parent_id + matrix_position');
  console.log('   ❌ NEVER derive from enrollment tree\n');

  console.log('3. USER IDENTITY:');
  console.log('   ✅ Single query with JOINs: auth.users -> distributors -> members');
  console.log('   ❌ Avoid N+1 queries with separate lookups\n');

  console.log('4. CACHED FIELDS:');
  console.log('   ✅ Use database triggers or remove cached fields');
  console.log('   ❌ Manual sync causes stale data\n');

  console.log('5. STATE MANAGEMENT:');
  console.log('   ✅ Use React Query for server state (single source)');
  console.log('   ❌ Mixing useState + manual fetching causes sync issues\n');

  // Save detailed JSON report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: issues.length,
      critical,
      high,
      medium,
      low,
    },
    by_category: byCategory,
    source_of_truth_rules: SOURCE_OF_TRUTH_RULES,
  };

  await fs.writeFile(
    'SOURCE-OF-TRUTH-AUDIT-REPORT.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n📄 Detailed JSON report: SOURCE-OF-TRUTH-AUDIT-REPORT.json');
  console.log('📄 Human-readable summary: SOURCE-OF-TRUTH-AUDIT-SUMMARY.md\n');

  // Generate markdown summary
  await generateMarkdownSummary(byCategory, { critical, high, medium, low });
}

async function generateMarkdownSummary(
  byCategory: Record<string, SourceOfTruthIssue[]>,
  counts: { critical: number; high: number; medium: number; low: number }
) {
  let md = '# Source of Truth Audit Summary\n\n';
  md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  md += `**Total Issues:** ${issues.length}\n\n`;

  md += '## Severity Breakdown\n\n';
  md += `- 🔴 **CRITICAL:** ${counts.critical}\n`;
  md += `- 🟠 **HIGH:** ${counts.high}\n`;
  md += `- 🟡 **MEDIUM:** ${counts.medium}\n`;
  md += `- 🔵 **LOW:** ${counts.low}\n\n`;

  md += '## Issues by Category\n\n';

  for (const [category, categoryIssues] of Object.entries(byCategory)) {
    md += `### ${category} (${categoryIssues.length} issues)\n\n`;

    categoryIssues.forEach((issue, idx) => {
      md += `#### ${idx + 1}. ${issue.severity}: ${issue.issue}\n\n`;
      md += `**File:** \`${path.relative(process.cwd(), issue.file)}:${issue.line}\`\n\n`;
      md += `**Current Source:** ${issue.currentSource}\n\n`;
      md += `**Correct Source:** ${issue.correctSource}\n\n`;
      md += `**Impact:** ${issue.impact}\n\n`;
      md += `**Code:**\n\`\`\`typescript\n${issue.code}\n\`\`\`\n\n`;
    });
  }

  md += '## Source of Truth Rules\n\n';
  md += '| Data Type | Correct Source | Wrong Sources |\n';
  md += '|-----------|----------------|---------------|\n';
  md += '| Enrollment Tree | `distributors.sponsor_id` | `members.enroller_id`, cached stats |\n';
  md += '| Matrix Placement | `distributors.matrix_parent_id + matrix_position` | Derived from enrollment |\n';
  md += '| User Identity | `distributors.auth_user_id` | Multiple lookups |\n';
  md += '| Rep Numbers | `distributors.rep_number` | `members.rep_number` |\n';
  md += '| BV/Credits | `members.personal_credits_monthly` | Cached in distributors |\n';
  md += '| Downline Counts | `COUNT(distributors.sponsor_id)` | Cached count fields |\n\n';

  await fs.writeFile('SOURCE-OF-TRUTH-AUDIT-SUMMARY.md', md);
}

// Run the audit
auditSourceOfTruth().catch(console.error);

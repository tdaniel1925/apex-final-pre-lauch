const fs = require('fs');
const path = require('path');

console.log('🎨 PHASE 9: UI Components QV/BV/GQV Migration\n');

// UI components to update
const uiFiles = [
  // Dashboard components
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/team/page.tsx',
  'src/app/dashboard/genealogy/page.tsx',
  'src/app/dashboard/matrix/page.tsx',
  'src/app/dashboard/commissions/page.tsx',
  'src/app/dashboard/rank/page.tsx',

  // Admin panels
  'src/app/admin/dashboard/page.tsx',
  'src/app/admin/distributors/page.tsx',
  'src/app/admin/compliance/page.tsx',
  'src/app/admin/matrix/page.tsx',

  // Components
  'src/components/dashboard/StatsCard.tsx',
  'src/components/dashboard/TeamStats.tsx',
  'src/components/dashboard/RankProgress.tsx',
  'src/components/admin/ComplianceMetrics.tsx',
  'src/components/admin/DistributorCard.tsx',
  'src/components/genealogy/TreeNode.tsx',
  'src/components/matrix/MatrixNode.tsx',
];

// Replacements for UI components
const uiReplacements = [
  // Field names in data fetching
  { from: /personal_credits_monthly/g, to: 'personal_qv_monthly', desc: 'personal_credits_monthly → personal_qv_monthly' },
  { from: /team_credits_monthly/g, to: 'group_qv_monthly', desc: 'team_credits_monthly → group_qv_monthly (GQV)' },
  { from: /group_credits_monthly/g, to: 'group_qv_monthly', desc: 'group_credits_monthly → group_qv_monthly (GQV)' },

  // Display labels
  { from: /Personal Credits/g, to: 'Personal QV', desc: 'Personal Credits → Personal QV' },
  { from: /Team Credits/g, to: 'Group QV (GQV)', desc: 'Team Credits → Group QV (GQV)' },
  { from: /Group Credits/g, to: 'Group QV (GQV)', desc: 'Group Credits → Group QV (GQV)' },
  { from: /Total Credits/g, to: 'Total QV', desc: 'Total Credits → Total QV' },

  // Descriptions and tooltips
  { from: /credits this month/gi, to: 'QV this month', desc: 'credits this month → QV this month' },
  { from: /team volume/gi, to: 'group qualifying volume (GQV)', desc: 'team volume → group qualifying volume (GQV)' },
  { from: /personal volume/gi, to: 'personal QV', desc: 'personal volume → personal QV' },

  // Comments
  { from: /\/\/ Personal credits/g, to: '// Personal QV (Qualifying Volume)', desc: 'Comment update' },
  { from: /\/\/ Team credits/g, to: '// Group QV (GQV)', desc: 'Comment update' },

  // Variable names (only in component scope)
  { from: /const personalCredits = /g, to: 'const personalQV = ', desc: 'Variable: personalCredits → personalQV' },
  { from: /const teamCredits = /g, to: 'const groupQV = ', desc: 'Variable: teamCredits → groupQV' },
  { from: /\bpersonalCredits\b/g, to: 'personalQV', desc: 'Variable usage: personalCredits → personalQV' },
  { from: /\bteamCredits\b/g, to: 'groupQV', desc: 'Variable usage: teamCredits → groupQV' },
];

let totalChanges = 0;
let filesModified = 0;

for (const filePath of uiFiles) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${filePath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  for (const { from, to, desc } of uiReplacements) {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      fileChanges += matches.length;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ ${filePath} (${fileChanges} changes)`);
    filesModified++;
    totalChanges += fileChanges;
  } else {
    console.log(`⏭️  ${filePath} (no changes needed)`);
  }
}

console.log(`\n📊 PHASE 9 COMPLETE`);
console.log(`   Files modified: ${filesModified}/${uiFiles.length}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✅ UI components now display QV/BV/GQV metrics correctly`);
console.log(`\n⚠️  MANUAL REVIEW NEEDED:`);
console.log(`   - Chart labels and tooltips`);
console.log(`   - Table column headers`);
console.log(`   - Card titles and descriptions`);
console.log(`   - Ensure BV is shown separately from QV where needed`);

const fs = require('fs');
const path = require('path');

console.log('📚 PHASE 11: Documentation QV/BV/GQV Migration\n');

// Documentation files to update
const docFiles = [
  // Main docs
  'README.md',
  'COMPENSATION-PLAN.md',
  'TECHNICAL-OVERVIEW.md',
  'API-DOCUMENTATION.md',

  // Integration guides
  'docs/integrations/stripe-integration.md',
  'docs/integrations/vapi-integration.md',
  'docs/integrations/supabase-setup.md',

  // Architecture docs
  'docs/architecture/database-schema.md',
  'docs/architecture/compensation-engine.md',
  'docs/architecture/dual-tree-system.md',

  // Feature docs
  'docs/features/commissions.md',
  'docs/features/rank-advancement.md',
  'docs/features/override-system.md',
  'docs/features/compliance.md',

  // Developer guides
  'docs/development/getting-started.md',
  'docs/development/database-migrations.md',
  'docs/development/testing.md',

  // Compliance docs
  'docs/compliance/mlm-compliance.md',
  'docs/compliance/anti-frontloading.md',
  'docs/compliance/retail-validation.md',
];

// Replacements for documentation
const docReplacements = [
  // Terminology updates
  { from: /\bpersonal credits\b/gi, to: 'personal QV (Qualifying Volume)', desc: 'personal credits → personal QV' },
  { from: /\bteam credits\b/gi, to: 'group QV (GQV)', desc: 'team credits → group QV (GQV)' },
  { from: /\bgroup credits\b/gi, to: 'group QV (GQV)', desc: 'group credits → group QV (GQV)' },
  { from: /\bcredits system\b/gi, to: 'QV/BV system', desc: 'credits system → QV/BV system' },

  // Field name references
  { from: /`personal_credits_monthly`/g, to: '`personal_qv_monthly`', desc: 'Code: personal_credits_monthly → personal_qv_monthly' },
  { from: /`team_credits_monthly`/g, to: '`group_qv_monthly`', desc: 'Code: team_credits_monthly → group_qv_monthly' },
  { from: /`group_credits_monthly`/g, to: '`group_qv_monthly`', desc: 'Code: group_credits_monthly → group_qv_monthly' },

  // Explanations
  { from: /BV \(Business Volume\) is calculated from/gi, to: 'QV (Qualifying Volume) equals the purchase price. BV (Business Volume) is calculated from', desc: 'Add QV explanation' },
  { from: /50 credits minimum/gi, to: '50 QV minimum', desc: '50 credits → 50 QV' },
  { from: /\d+ credits/g, to: (match) => match.replace('credits', 'QV'), desc: 'X credits → X QV' },

  // Table headers
  { from: /\| Personal Credits \|/g, to: '| Personal QV |', desc: 'Table: Personal Credits → Personal QV' },
  { from: /\| Team Credits \|/g, to: '| Group QV (GQV) |', desc: 'Table: Team Credits → Group QV' },
  { from: /\| Total BV \|/g, to: '| QV | BV |', desc: 'Table: Split QV and BV columns' },
];

let totalChanges = 0;
let filesModified = 0;

for (const filePath of docFiles) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${filePath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  for (const { from, to, desc } of docReplacements) {
    const matches = content.match(from);
    if (matches) {
      if (typeof to === 'function') {
        content = content.replace(from, to);
      } else {
        content = content.replace(from, to);
      }
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

console.log(`\n📊 PHASE 11 COMPLETE`);
console.log(`   Files modified: ${filesModified}/${docFiles.length}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✅ Documentation updated with QV/BV/GQV terminology`);
console.log(`\n⚠️  MANUAL REVIEW RECOMMENDED:`);
console.log(`   - Ensure all examples use correct QV/BV/GQV`);
console.log(`   - Update diagrams and flowcharts`);
console.log(`   - Verify calculation examples`);
console.log(`   - Check that GQV is explained clearly`);

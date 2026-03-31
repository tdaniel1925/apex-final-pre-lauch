const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 BATCH UPDATE: QV/BV/GQV System Migration\n');
console.log('This script will update ALL TypeScript files with QV/BV terminology\n');

// Files to update
const filesToUpdate = [
  // Phase 5: Order Processing
  'src/app/api/webhooks/stripe/route.ts',
  'src/app/api/checkout/route.ts',
  'src/app/api/cart/add/route.ts',
  'src/lib/integrations/webhooks/process-sale.ts',

  // Phase 6: Compliance
  'src/lib/compliance/anti-frontloading.ts',
  'src/lib/compliance/retail-validation.ts',
  'src/lib/compliance/email-alerts.ts',

  // Phase 7: API Routes
  'src/app/api/dashboard/team/route.ts',
  'src/app/api/dashboard/downline/route.ts',
  'src/app/api/dashboard/ai-chat/route.ts',
  'src/app/api/distributor/[id]/details/route.ts',
  'src/app/api/admin/matrix/tree/route.ts',
  'src/app/api/admin/compliance/overview/route.ts',
  'src/app/api/matrix/hybrid/route.ts',
  'src/lib/stripe/autopilot-helpers.ts',

  // Phase 8: Core Compensation Files
  'src/lib/compensation/override-calculator.ts',
  'src/lib/compensation/override-resolution.ts',
  'src/lib/compensation/config.ts',
  'src/lib/compensation/rank.ts',
  'src/lib/compensation/bonus-programs.ts',
];

// Replacements to make
const replacements = [
  // Database field names
  { from: /personal_credits_monthly/g, to: 'personal_qv_monthly', desc: 'personal_credits_monthly → personal_qv_monthly' },
  { from: /group_credits_monthly/g, to: 'group_qv_monthly', desc: 'group_credits_monthly → group_qv_monthly (GQV)' },
  { from: /team_credits_monthly/g, to: 'group_qv_monthly', desc: 'team_credits_monthly → group_qv_monthly (GQV)' },

  // Comments and strings
  { from: /personal credits/gi, to: 'personal QV', desc: 'personal credits → personal QV' },
  { from: /team credits/gi, to: 'group QV', desc: 'team credits → group QV' },
  { from: /group credits/gi, to: 'group QV (GQV)', desc: 'group credits → group QV (GQV)' },
  { from: /(\d+) credits/gi, to: '$1 QV', desc: 'X credits → X QV' },

  // BV references
  { from: /total_bv(?!_calculated)/g, to: 'total_qv', desc: 'total_bv → total_qv (for qualifying volume)' },

  // Override qualification
  { from: />= 50\s*\/\/.*credit/gi, to: '>= 50  // QV minimum for overrides', desc: '50 credit minimum → 50 QV minimum' },
];

let totalChanges = 0;
let filesModified = 0;

for (const filePath of filesToUpdate) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${filePath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  for (const { from, to, desc } of replacements) {
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

console.log(`\n📊 BATCH UPDATE COMPLETE`);
console.log(`   Files modified: ${filesModified}/${filesToUpdate.length}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n⚠️  IMPORTANT: Manual review still needed for:`);
console.log(`   - Import statements (may need to add qv-bv-calculator)`);
console.log(`   - Complex logic that mixes QV and BV`);
console.log(`   - Commission calculations (ensure using BV, not QV)`);
console.log(`\n✅ Run \`npm run build\` to check for TypeScript errors`);

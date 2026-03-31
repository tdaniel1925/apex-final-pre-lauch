const fs = require('fs');
const path = require('path');

console.log('🧪 PHASE 10: Tests QV/BV/GQV Migration\n');

// Test files to update
const testFiles = [
  // Unit tests
  'src/lib/compensation/__tests__/bv-calculator.test.ts',
  'src/lib/compensation/__tests__/override-calculator.test.ts',
  'src/lib/compensation/__tests__/rank.test.ts',
  'src/lib/compliance/__tests__/anti-frontloading.test.ts',
  'src/lib/compliance/__tests__/retail-validation.test.ts',

  // Integration tests
  'tests/integration/checkout.test.ts',
  'tests/integration/webhooks.test.ts',
  'tests/integration/commissions.test.ts',

  // E2E tests
  'tests/e2e/purchase-flow.spec.ts',
  'tests/e2e/dashboard.spec.ts',
];

// Replacements for test files
const testReplacements = [
  // Field names in test data
  { from: /personal_credits_monthly/g, to: 'personal_qv_monthly', desc: 'personal_credits_monthly → personal_qv_monthly' },
  { from: /team_credits_monthly/g, to: 'group_qv_monthly', desc: 'team_credits_monthly → group_qv_monthly (GQV)' },
  { from: /group_credits_monthly/g, to: 'group_qv_monthly', desc: 'group_credits_monthly → group_qv_monthly (GQV)' },

  // Test descriptions
  { from: /should calculate credits/gi, to: 'should calculate QV and BV', desc: 'Test: credits → QV and BV' },
  { from: /should credit BV to member/gi, to: 'should credit QV and BV to member', desc: 'Test: BV → QV and BV' },
  { from: /credits must be >= 50/gi, to: 'QV must be >= 50', desc: 'Test: credits → QV' },
  { from: /personal credits/gi, to: 'personal QV', desc: 'Test: personal credits → personal QV' },
  { from: /team credits/gi, to: 'group QV (GQV)', desc: 'Test: team credits → group QV (GQV)' },

  // Mock data field names
  { from: /personalCredits: /g, to: 'personalQV: ', desc: 'Mock: personalCredits → personalQV' },
  { from: /teamCredits: /g, to: 'groupQV: ', desc: 'Mock: teamCredits → groupQV' },

  // Assertions
  { from: /expect\(.*\.personal_credits_monthly\)/g, to: (match) => match.replace('personal_credits_monthly', 'personal_qv_monthly'), desc: 'Assertion: personal_credits_monthly → personal_qv_monthly' },
  { from: /expect\(.*\.team_credits_monthly\)/g, to: (match) => match.replace('team_credits_monthly', 'group_qv_monthly'), desc: 'Assertion: team_credits_monthly → group_qv_monthly' },

  // Comments
  { from: /\/\/ Test.*credits/gi, to: (match) => match.replace(/credits/gi, 'QV'), desc: 'Comment: credits → QV' },
];

let totalChanges = 0;
let filesModified = 0;

for (const filePath of testFiles) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  SKIP: ${filePath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  let fileChanges = 0;

  for (const { from, to, desc } of testReplacements) {
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

console.log(`\n📊 PHASE 10 COMPLETE`);
console.log(`   Files modified: ${filesModified}/${testFiles.length}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✅ Tests updated to validate QV/BV/GQV system`);
console.log(`\n⚠️  ADDITIONAL TESTS NEEDED:`);
console.log(`   - Test QV calculation (purchase price → QV)`);
console.log(`   - Test BV waterfall calculation`);
console.log(`   - Test GQV aggregation (sum of team QV)`);
console.log(`   - Test override qualification (50 QV minimum)`);
console.log(`   - Test rank qualification (QV/GQV thresholds)`);
console.log(`\n🏃 Run tests: npm test`);

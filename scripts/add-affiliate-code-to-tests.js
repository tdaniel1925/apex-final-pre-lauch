/**
 * Script to add affiliate_code to all distributor inserts in tests
 */

const fs = require('fs');

const testFiles = [
  'tests/e2e/autopilot-invitations.spec.ts',
  'tests/e2e/autopilot-social.spec.ts',
  'tests/e2e/autopilot-flyers.spec.ts',
  'tests/e2e/autopilot-crm.spec.ts',
  'tests/e2e/autopilot-team-broadcasts.spec.ts',
  'tests/e2e/autopilot-team-training.spec.ts',
];

function fixFile(filePath) {
  console.log(`Adding affiliate_code to ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Add affiliate_code after phone, before slug or sponsor_id
  let newContent = content;

  // Pattern: phone: '5551234567',\n        slug:
  newContent = newContent.replace(
    /(\s+phone:\s*'[^']+',)(\s+slug:)/g,
    '$1\n        affiliate_code: \'TEST\' + Date.now().toString().substring(8),$2'
  );

  // Pattern: phone: '5551234567',\n        sponsor_id: (for cases with sponsor but no slug)
  newContent = newContent.replace(
    /(\s+phone:\s*'[^']+',)(\s+sponsor_id:)/g,
    (match) => {
      if (!match.includes('affiliate_code:')) {
        return match.replace(',', ',\n        affiliate_code: \'TEST\' + Date.now().toString().substring(8),');
      }
      return match;
    }
  );

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
}

// Run fixes
testFiles.forEach(fixFile);

console.log('\n✅ All test files processed!');

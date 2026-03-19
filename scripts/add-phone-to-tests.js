/**
 * Script to add phone field to all distributor inserts in tests
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'tests/e2e/autopilot-invitations.spec.ts',
  'tests/e2e/autopilot-social.spec.ts',
  'tests/e2e/autopilot-flyers.spec.ts',
  'tests/e2e/autopilot-crm.spec.ts',
  'tests/e2e/autopilot-team-broadcasts.spec.ts',
  'tests/e2e/autopilot-team-training.spec.ts',
];

function addPhoneField(content) {
  // Add phone after email, before slug (if not already present)
  return content.replace(
    /(email:\s*\w+,)\s+(slug:)/g,
    (match, emailPart, slugPart) => {
      // Don't add if phone already exists
      if (content.includes('phone:')) {
        return match;
      }
      return `${emailPart}\n        phone: '5551234567',\n        ${slugPart}`;
    }
  );
}

function fixFile(filePath) {
  console.log(`Adding phone field to ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Simple regex to add phone after email in distributor inserts
  let newContent = content;

  // Pattern 1: email: testEmail,\n        slug:
  newContent = newContent.replace(
    /(\s+email:\s*testEmail,)(\s+slug:)/g,
    '$1\n        phone: \'5551234567\',$2'
  );

  // Pattern 2: email: sponsorEmail,\n        slug:
  newContent = newContent.replace(
    /(\s+email:\s*sponsorEmail,)(\s+slug:)/g,
    '$1\n        phone: \'5551234567\',$2'
  );

  // Pattern 3: email: rep1Email,\n        slug:
  newContent = newContent.replace(
    /(\s+email:\s*rep1Email,)(\s+slug:)/g,
    '$1\n        phone: \'5551234568\',$2'
  );

  // Pattern 4: email: rep2Email,\n        slug:
  newContent = newContent.replace(
    /(\s+email:\s*rep2Email,)(\s+slug:)/g,
    '$1\n        phone: \'5551234569\',$2'
  );

  // Pattern 5: email: downlineEmail,\n        slug:
  newContent = newContent.replace(
    /(\s+email:\s*downlineEmail,)(\s+slug:)/g,
    '$1\n        phone: \'5551234570\',$2'
  );

  // Pattern 6: email: downlineEmail,\n        sponsor_id: (for cases without slug between)
  newContent = newContent.replace(
    /(\s+email:\s*downlineEmail,)(\s+sponsor_id:)/g,
    (match) => {
      if (!match.includes('phone:')) {
        return match.replace(',', ',\n        phone: \'5551234570\',');
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

/**
 * Script to fix all Autopilot E2E tests
 * Adds missing slug field to distributor creation
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

function generateSlugLine(testType) {
  return `slug: \`${testType}-\${Date.now()}\`,`;
}

function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix distributor inserts that are missing slug
  // Pattern: .insert({ auth_user_id:... email: testEmail,  })
  content = content.replace(
    /(\.insert\(\{\s+auth_user_id:[\s\S]*?email:\s*\w+,)(\s+\})/g,
    (match, p1, p2) => {
      // Check if slug already exists
      if (match.includes('slug:')) {
        return match;
      }
      // Add slug before the closing brace
      return p1 + '\n        slug: `test-' + Date.now() + '-${Math.random().toString(36).substring(7)}`,\n      }';
    }
  );

  // More targeted fix for each type
  const patterns = [
    {
      // Autopilot test pattern
      search: /auth_user_id:\s*testAuthUserId,\s+first_name:\s*'Autopilot',\s+last_name:\s*'Test',\s+email:\s*testEmail,\s+slug:\s*`autopilot-test-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: testAuthUserId,
        first_name: 'Autopilot',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        slug: \`autopilot-test-\${Date.now()}\`,
      }`
    },
    {
      // Social test pattern
      search: /auth_user_id:\s*testAuthUserId,\s+first_name:\s*'Social',\s+last_name:\s*'Test',\s+email:\s*testEmail,\s+slug:\s*`social-test-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: testAuthUserId,
        first_name: 'Social',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        slug: \`social-test-\${Date.now()}\`,
      }`
    },
    {
      // Flyer test pattern
      search: /auth_user_id:\s*testAuthUserId,\s+first_name:\s*'Flyer',\s+last_name:\s*'Test',\s+email:\s*testEmail,\s+slug:\s*`flyer-test-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: testAuthUserId,
        first_name: 'Flyer',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        slug: \`flyer-test-\${Date.now()}\`,
      }`
    },
    {
      // CRM test pattern
      search: /auth_user_id:\s*testAuthUserId,\s+first_name:\s*'CRM',\s+last_name:\s*'Test',\s+email:\s*testEmail,\s+slug:\s*`crm-test-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: testAuthUserId,
        first_name: 'CRM',
        last_name: 'Test',
        email: testEmail,
        phone: '5551234567',
        slug: \`crm-test-\${Date.now()}\`,
      }`
    },
    {
      // Sponsor pattern
      search: /auth_user_id:\s*sponsorAuthUserId,\s+first_name:\s*'Sponsor',\s+last_name:\s*'Test',\s+email:\s*sponsorEmail,\s+slug:\s*`sponsor-test-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: sponsorAuthUserId,
        first_name: 'Sponsor',
        last_name: 'Test',
        email: sponsorEmail,
        phone: '5551234567',
        slug: \`sponsor-test-\${Date.now()}\`,
      }`
    },
    {
      // Sponsor Training pattern
      search: /auth_user_id:\s*sponsorAuthUserId,\s+first_name:\s*'Sponsor',\s+last_name:\s*'Training',\s+email:\s*sponsorEmail,\s+slug:\s*`sponsor-training-\$\{Date\.now\(\)\}`,\s+\}/,
      replace: `auth_user_id: sponsorAuthUserId,
        first_name: 'Sponsor',
        last_name: 'Training',
        email: sponsorEmail,
        phone: '5551234567',
        slug: \`sponsor-training-\${Date.now()}\`,
      }`
    },
    {
      // Rep1 pattern
      search: /auth_user_id:\s*rep1Auth!\s*\.\s*user!\s*\.\s*id,\s+first_name:\s*'Rep',\s+last_name:\s*'One',\s+email:\s*rep1Email,\s+sponsor_id:\s*sponsorDistributorId,\s+\}/,
      replace: `auth_user_id: rep1Auth!.user!.id,
        first_name: 'Rep',
        last_name: 'One',
        email: rep1Email,
        slug: \`rep1-\${Date.now()}\`,
        sponsor_id: sponsorDistributorId,
      }`
    },
    {
      // Rep2 pattern
      search: /auth_user_id:\s*rep2Auth!\s*\.\s*user!\s*\.\s*id,\s+first_name:\s*'Rep',\s+last_name:\s*'Two',\s+email:\s*rep2Email,\s+sponsor_id:\s*sponsorDistributorId,\s+\}/,
      replace: `auth_user_id: rep2Auth!.user!.id,
        first_name: 'Rep',
        last_name: 'Two',
        email: rep2Email,
        slug: \`rep2-\${Date.now()}\`,
        sponsor_id: sponsorDistributorId,
      }`
    },
    {
      // Downline pattern
      search: /auth_user_id:\s*downlineAuth!\s*\.\s*user!\s*\.\s*id,\s+first_name:\s*'Downline',\s+last_name:\s*'Member',\s+email:\s*downlineEmail,\s+sponsor_id:\s*sponsorDistributorId,\s+\}/,
      replace: `auth_user_id: downlineAuth!.user!.id,
        first_name: 'Downline',
        last_name: 'Member',
        email: downlineEmail,
        slug: \`downline-\${Date.now()}\`,
        sponsor_id: sponsorDistributorId,
      }`
    },
  ];

  patterns.forEach(pattern => {
    content = content.replace(pattern.search, pattern.replace);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${filePath}`);
}

// Run fixes
testFiles.forEach(fixFile);

console.log('\n✅ All test files fixed!');

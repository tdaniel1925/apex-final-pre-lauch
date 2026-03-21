// Quick test to verify SmartOffice v2 page and components exist

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

const requiredFiles = [
  'src/app/admin/smartoffice-v2/page.tsx',
  'src/components/admin/SmartOfficeV2Client.tsx',
  'src/app/api/admin/smartoffice/sync/route.ts',
  'src/app/api/admin/smartoffice/stats/route.ts',
];

console.log('🔍 Checking SmartOffice v2 Implementation...\n');

let allExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(projectRoot, file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allExist = false;
  }
}

console.log('\n📊 Summary:');
if (allExist) {
  console.log('✅ All SmartOffice v2 files exist');
  console.log('🌐 Visit: http://localhost:3050/admin/smartoffice-v2');
  console.log('\n🎯 Expected Features:');
  console.log('  - Large "Run Full Sync" button prominently displayed');
  console.log('  - 4 stat cards (Agents, Policies, Commissions, Last Sync)');
  console.log('  - 4 tabs (Agents, Policies, Configuration, Sync Logs)');
  console.log('  - Success/error messages for sync operations');
  console.log('  - Empty states with call-to-action buttons');
} else {
  console.log('❌ Some files are missing');
  process.exit(1);
}

console.log('\n✅ SmartOffice v2 is ready for testing!');

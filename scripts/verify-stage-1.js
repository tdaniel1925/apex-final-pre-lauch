// =============================================
// Stage 1 Verification Script
// Checks that all required files and env vars exist
// =============================================

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Stage 1 completion...\n');

// Files that should exist after Stage 1
const requiredFiles = [
  'src/lib/supabase/client.ts',
  'src/lib/supabase/server.ts',
  'src/lib/supabase/middleware.ts',
  'src/lib/types/index.ts',
  'src/app/api/test/db/route.ts',
  'src/middleware.ts',
  '.env.local',
  'supabase/migrations/001_create_distributors.sql',
];

// Environment variables that should be set
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
];

let allChecksPass = true;

// =============================================
// Check Required Files
// =============================================
console.log('📁 Checking required files...');
requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allChecksPass = false;
  }
});

// =============================================
// Check Environment Variables
// =============================================
console.log('\n🔐 Checking environment variables...');

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach((line) => {
    const trimmedLine = line.trim();
    // Skip comments and empty lines
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, value] = trimmedLine.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });

  requiredEnvVars.forEach((envVar) => {
    if (envVars[envVar]) {
      console.log(`  ✅ ${envVar}`);
    } else {
      console.log(`  ❌ ${envVar} - NOT SET`);
      allChecksPass = false;
    }
  });
} else {
  console.log('  ❌ .env.local file not found');
  allChecksPass = false;
}

// =============================================
// Check Dependencies
// =============================================
console.log('\n📦 Checking installed dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const requiredDependencies = ['@supabase/supabase-js', '@supabase/ssr'];
const requiredDevDependencies = ['tsx', 'dotenv'];

requiredDependencies.forEach((dep) => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep}`);
  } else {
    console.log(`  ❌ ${dep} - NOT INSTALLED`);
    allChecksPass = false;
  }
});

requiredDevDependencies.forEach((dep) => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep} (dev)`);
  } else {
    console.log(`  ❌ ${dep} - NOT INSTALLED`);
    allChecksPass = false;
  }
});

// =============================================
// Final Results
// =============================================
console.log('\n' + '='.repeat(50));

if (allChecksPass) {
  console.log('✅ Stage 1 verification PASSED');
  console.log('\nNext steps:');
  console.log('  1. Ensure database migration has been run in Supabase');
  console.log('  2. Run: npm run seed:master (once created in Task 5)');
  console.log('  3. Test API: http://localhost:3050/api/test/db');
  console.log('\nYou can proceed to Task 5!');
  process.exit(0);
} else {
  console.log('❌ Stage 1 verification FAILED');
  console.log('\nFix the issues above before continuing.');
  process.exit(1);
}

// =============================================
// E2E Test Setup Script
// Creates test users and applies migrations for E2E tests
// =============================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test user credentials
const TEST_ADMIN_EMAIL = 'test-admin@example.com';
const TEST_ADMIN_PASSWORD = 'TestAdmin123!';
const TEST_DISTRIBUTOR_EMAIL = 'test-distributor@example.com';
const TEST_DISTRIBUTOR_PASSWORD = 'TestDist123!';

async function applyMigration() {
  console.log('\n📦 Applying company_events migration...');

  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    '20260319000010_company_events_system.sql'
  );

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Check if table already exists
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'company_events');

    if (tables && tables.length > 0) {
      console.log('✅ company_events table already exists');
      return true;
    }

    // Execute migration - note: Supabase client doesn't support raw SQL execution
    // We need to use the admin API or psql
    console.log('⚠️  Cannot execute migration via Supabase client');
    console.log('   Please apply migration manually:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Run: supabase/migrations/20260319000010_company_events_system.sql');
    console.log('   OR use: npx supabase db push');
    return false;
  } catch (error) {
    console.error('❌ Error checking migration:', error.message);
    return false;
  }
}

async function createTestAdmin() {
  console.log('\n👤 Creating test admin user...');

  try {
    // Check if admin already exists
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const adminExists = existingAuth?.users?.some((u) => u.email === TEST_ADMIN_EMAIL);

    if (adminExists) {
      console.log('✅ Test admin already exists:', TEST_ADMIN_EMAIL);
      return true;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Admin',
      },
    });

    if (authError) {
      console.error('❌ Error creating admin auth:', authError.message);
      return false;
    }

    console.log('✅ Created admin auth user');

    // Create admin record
    const { error: adminError } = await supabase.from('admins').insert({
      auth_user_id: authData.user.id,
      email: TEST_ADMIN_EMAIL,
      first_name: 'Test',
      last_name: 'Admin',
      role: 'super_admin',
    });

    if (adminError) {
      console.error('❌ Error creating admin record:', adminError.message);
      return false;
    }

    console.log('✅ Created admin record');
    console.log('   Email:', TEST_ADMIN_EMAIL);
    console.log('   Password:', TEST_ADMIN_PASSWORD);
    return true;
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    return false;
  }
}

async function createTestDistributor() {
  console.log('\n👤 Creating test distributor user...');

  try {
    // Check if distributor already exists
    const { data: existingAuth } = await supabase.auth.admin.listUsers();
    const distExists = existingAuth?.users?.some((u) => u.email === TEST_DISTRIBUTOR_EMAIL);

    if (distExists) {
      console.log('✅ Test distributor already exists:', TEST_DISTRIBUTOR_EMAIL);
      return true;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_DISTRIBUTOR_EMAIL,
      password: TEST_DISTRIBUTOR_PASSWORD,
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Distributor',
      },
    });

    if (authError) {
      console.error('❌ Error creating distributor auth:', authError.message);
      return false;
    }

    console.log('✅ Created distributor auth user');

    // Create distributor record
    const { error: distError } = await supabase.from('distributors').insert({
      auth_user_id: authData.user.id,
      email: TEST_DISTRIBUTOR_EMAIL,
      first_name: 'Test',
      last_name: 'Distributor',
      slug: 'test-distributor',
      sponsor_id: null,
      tech_rank: 1,
      business_type: 'personal',
      phone: '555-0100',
    });

    if (distError) {
      console.error('❌ Error creating distributor record:', distError.message);
      return false;
    }

    console.log('✅ Created distributor record');
    console.log('   Email:', TEST_DISTRIBUTOR_EMAIL);
    console.log('   Password:', TEST_DISTRIBUTOR_PASSWORD);
    return true;
  } catch (error) {
    console.error('❌ Error creating distributor:', error.message);
    return false;
  }
}

async function updateEnvFile() {
  console.log('\n⚙️  Updating .env.local with test credentials...');

  const envPath = path.join(__dirname, '..', '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local not found, creating...');
  }

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Remove existing test credentials
  envContent = envContent
    .split('\n')
    .filter(
      (line) =>
        !line.startsWith('TEST_ADMIN_EMAIL') &&
        !line.startsWith('TEST_ADMIN_PASSWORD') &&
        !line.startsWith('TEST_DISTRIBUTOR_EMAIL') &&
        !line.startsWith('TEST_DISTRIBUTOR_PASSWORD')
    )
    .join('\n');

  // Add test credentials
  const testVars = `
# E2E Test Credentials
TEST_ADMIN_EMAIL=${TEST_ADMIN_EMAIL}
TEST_ADMIN_PASSWORD=${TEST_ADMIN_PASSWORD}
TEST_DISTRIBUTOR_EMAIL=${TEST_DISTRIBUTOR_EMAIL}
TEST_DISTRIBUTOR_PASSWORD=${TEST_DISTRIBUTOR_PASSWORD}
`;

  envContent = envContent.trim() + '\n' + testVars;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local with test credentials');
}

async function main() {
  console.log('🚀 E2E Test Setup');
  console.log('='.repeat(50));

  const migrationApplied = await applyMigration();
  const adminCreated = await createTestAdmin();
  const distCreated = await createTestDistributor();

  if (adminCreated && distCreated) {
    await updateEnvFile();
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Setup Summary:');
  console.log('  Migration:', migrationApplied ? '✅' : '⚠️  Manual step required');
  console.log('  Admin User:', adminCreated ? '✅' : '❌');
  console.log('  Distributor User:', distCreated ? '✅' : '❌');

  if (!migrationApplied) {
    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('   Run this command to apply migrations:');
    console.log('   npx supabase db push');
    console.log('\n   Or apply manually in Supabase Dashboard > SQL Editor');
  }

  if (adminCreated && distCreated) {
    console.log('\n✅ Ready to run E2E tests!');
    console.log('   Run: npm run test:e2e');
  }
}

main().catch(console.error);

/**
 * MIGRATION APPLICATION SCRIPT
 * Applies pending migrations to Supabase database
 * Run with: node scripts/apply-migrations.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Execute SQL with proper error handling
 */
async function executeSql(sql, description) {
  console.log(`\n🔧 ${description}...`);

  try {
    // For DDL statements, we need to use the REST API directly
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      console.log(`   Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: stmt + ';'
      });

      if (error) {
        // Check if it's a "already exists" error that we can ignore
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.message.includes('constraint') && error.message.includes('already')
        ) {
          console.log(`   ⚠️  Skipped (already exists): ${error.message.substring(0, 100)}`);
          continue;
        }

        throw error;
      }
    }

    console.log(`   ✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.error(`   ❌ ${description} - FAILED`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Check if a migration has been applied
 */
async function checkMigration(migrationName) {
  console.log(`\n📋 Checking if migration ${migrationName} has been applied...`);

  // Try to query the schema_migrations table (Supabase standard)
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
    .eq('version', migrationName)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.log(`   ⚠️  Could not check migration status (table may not exist)`);
    return false;
  }

  if (data) {
    console.log(`   ✅ Migration already applied`);
    return true;
  }

  console.log(`   📝 Migration not yet applied`);
  return false;
}

/**
 * Record migration in schema_migrations table
 */
async function recordMigration(migrationName) {
  console.log(`\n📝 Recording migration ${migrationName}...`);

  // Try to create schema_migrations table if it doesn't exist
  await executeSql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `, 'Creating schema_migrations table');

  // Insert migration record
  const { error } = await supabase
    .from('schema_migrations')
    .insert({ version: migrationName });

  if (error && !error.message.includes('duplicate')) {
    console.error(`   ❌ Failed to record migration: ${error.message}`);
    return false;
  }

  console.log(`   ✅ Migration recorded`);
  return true;
}

/**
 * Verify migration success
 */
async function verifyColumns() {
  console.log(`\n🔍 Verifying new columns exist...`);

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'distributors'
        AND column_name IN (
          'registration_type',
          'business_type',
          'tax_id_type',
          'date_of_birth',
          'dba_name',
          'business_website'
        )
      ORDER BY column_name;
    `
  });

  if (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }

  console.log(`   ✅ Columns verified:`);
  if (data && data.length > 0) {
    data.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type})`);
    });
  }

  return true;
}

/**
 * Verify function exists
 */
async function verifyFunction() {
  console.log(`\n🔍 Verifying create_distributor_atomic function...`);

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_string: `
      SELECT
        proname,
        pronargs,
        pg_get_function_identity_arguments(oid) as args
      FROM pg_proc
      WHERE proname = 'create_distributor_atomic';
    `
  });

  if (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }

  if (data && data.length > 0) {
    console.log(`   ✅ Function exists with ${data[0].pronargs} parameters`);
    return true;
  }

  console.error(`   ❌ Function not found`);
  return false;
}

/**
 * Main migration runner
 */
async function main() {
  console.log('🚀 MIGRATION APPLICATION SCRIPT');
  console.log('================================\n');
  console.log(`📍 Environment: ${supabaseUrl}`);

  const migrations = [
    {
      name: '20260318000002_business_registration_support',
      file: 'supabase/migrations/20260318000002_business_registration_support.sql',
      description: 'Business Registration Support'
    },
    {
      name: '20260318000003_fix_atomic_signup_function',
      file: 'supabase/migrations/20260318000003_fix_atomic_signup_function.sql',
      description: 'Fix Atomic Signup Function'
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const migration of migrations) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Migration: ${migration.description}`);
    console.log(`${'='.repeat(60)}`);

    // Check if already applied
    const alreadyApplied = await checkMigration(migration.name);
    if (alreadyApplied) {
      console.log(`   ⏭️  Skipping (already applied)`);
      successCount++;
      continue;
    }

    // Read migration file
    const migrationPath = path.join(__dirname, '..', migration.file);
    if (!fs.existsSync(migrationPath)) {
      console.error(`   ❌ Migration file not found: ${migrationPath}`);
      failureCount++;
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    const success = await executeSql(sql, `Applying ${migration.description}`);

    if (success) {
      await recordMigration(migration.name);
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Verify results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 VERIFICATION`);
  console.log(`${'='.repeat(60)}`);

  await verifyColumns();
  await verifyFunction();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Successful migrations: ${successCount}`);
  console.log(`❌ Failed migrations: ${failureCount}`);

  if (failureCount === 0) {
    console.log(`\n🎉 All migrations applied successfully!`);
    console.log(`🚦 Database is ready for signup tests.`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some migrations failed. Review errors above.`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 FATAL ERROR:', error);
  process.exit(1);
});

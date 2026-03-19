/**
 * DIRECT MIGRATION APPLICATION SCRIPT
 * Applies migrations directly via PostgreSQL connection
 * Run with: node scripts/apply-migrations-direct.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

/**
 * Execute SQL file
 */
async function executeSqlFile(client, filePath, description) {
  console.log(`\n🔧 ${description}...`);

  try {
    const sql = fs.readFileSync(filePath, 'utf8');

    // Execute the SQL
    await client.query(sql);

    console.log(`   ✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    // Check if it's a harmless error we can ignore
    if (
      error.message.includes('already exists') ||
      error.message.includes('duplicate key')
    ) {
      console.log(`   ⚠️  ${description} - ALREADY EXISTS (continuing)`);
      return true;
    }

    console.error(`   ❌ ${description} - FAILED`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

/**
 * Verify columns exist
 */
async function verifyColumns(client) {
  console.log(`\n🔍 Verifying new columns exist...`);

  try {
    const result = await client.query(`
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
    `);

    console.log(`   ✅ Found ${result.rows.length} columns:`);
    result.rows.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    return result.rows.length === 6;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify function exists
 */
async function verifyFunction(client) {
  console.log(`\n🔍 Verifying create_distributor_atomic function...`);

  try {
    const result = await client.query(`
      SELECT
        proname,
        pronargs,
        pg_get_function_identity_arguments(oid) as args
      FROM pg_proc
      WHERE proname = 'create_distributor_atomic';
    `);

    if (result.rows.length > 0) {
      console.log(`   ✅ Function exists:`);
      console.log(`      - Name: ${result.rows[0].proname}`);
      console.log(`      - Parameters: ${result.rows[0].pronargs}`);
      console.log(`      - Signature: ${result.rows[0].args.substring(0, 100)}...`);
      return true;
    }

    console.error(`   ❌ Function not found`);
    return false;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Test insert statement (prepare only, don't execute)
 */
async function testInsert(client) {
  console.log(`\n🔍 Testing INSERT statement preparation...`);

  try {
    await client.query(`
      PREPARE test_insert AS
      INSERT INTO distributors (
        auth_user_id,
        first_name,
        last_name,
        email,
        slug,
        affiliate_code,
        phone,
        registration_type,
        business_type,
        tax_id_type,
        date_of_birth,
        dba_name,
        business_website,
        address_line1,
        city,
        state,
        zip
      ) VALUES (
        gen_random_uuid(),
        'Test',
        'User',
        'test@example.com',
        'test-user-' || floor(random() * 1000000)::text,
        'test-code-' || floor(random() * 1000000)::text,
        '5551234567',
        'business',
        'llc',
        'ein',
        '1990-01-01',
        'Test DBA',
        'https://test.com',
        '123 Test St',
        'Test City',
        'TX',
        '12345'
      );
    `);

    await client.query('DEALLOCATE test_insert;');

    console.log(`   ✅ INSERT statement prepared successfully`);
    console.log(`   ✅ All new columns are accessible`);
    return true;
  } catch (error) {
    console.error(`   ❌ INSERT test failed: ${error.message}`);
    return false;
  }
}

/**
 * Main migration runner
 */
async function main() {
  console.log('🚀 DIRECT MIGRATION APPLICATION SCRIPT');
  console.log('=====================================\n');
  console.log(`📍 Database: ${DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    // Connect to database
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('   ✅ Connected');

    // Apply migrations
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 APPLYING MIGRATIONS`);
    console.log(`${'='.repeat(60)}`);

    const migrations = [
      {
        file: path.join(__dirname, '..', 'supabase/migrations/20260318000002_business_registration_support.sql'),
        description: 'Business Registration Support'
      },
      {
        file: path.join(__dirname, '..', 'supabase/migrations/20260318000003_fix_atomic_signup_function.sql'),
        description: 'Fix Atomic Signup Function'
      }
    ];

    let successCount = 0;
    let failureCount = 0;

    for (const migration of migrations) {
      const success = await executeSqlFile(client, migration.file, migration.description);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // Verify results
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 VERIFICATION`);
    console.log(`${'='.repeat(60)}`);

    const columnsOk = await verifyColumns(client);
    const functionOk = await verifyFunction(client);
    const insertOk = await testInsert(client);

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Successful migrations: ${successCount}`);
    console.log(`❌ Failed migrations: ${failureCount}`);
    console.log(`✅ Columns verified: ${columnsOk ? 'YES' : 'NO'}`);
    console.log(`✅ Function verified: ${functionOk ? 'YES' : 'NO'}`);
    console.log(`✅ Insert test passed: ${insertOk ? 'YES' : 'NO'}`);

    if (failureCount === 0 && columnsOk && functionOk && insertOk) {
      console.log(`\n🎉 All migrations applied successfully!`);
      console.log(`🚦 Database is ready for signup tests.`);

      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Run signup tests: npm test -- signup`);
      console.log(`   2. Test personal registration flow`);
      console.log(`   3. Test business registration flow`);
      console.log(`   4. Verify RLS policies work correctly`);

      process.exit(0);
    } else {
      console.log(`\n⚠️  Some checks failed. Review errors above.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  } finally {
    // Disconnect
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the script
main().catch(error => {
  console.error('\n💥 UNHANDLED ERROR:', error);
  process.exit(1);
});

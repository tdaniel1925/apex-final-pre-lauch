/**
 * APPLY APEX LEAD AUTOPILOT MIGRATION
 * Applies the comprehensive Lead Autopilot database schema
 * Run with: node scripts/apply-autopilot-migration.js
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
 * Verify tables exist
 */
async function verifyTables(client) {
  console.log(`\n🔍 Verifying tables exist...`);

  const expectedTables = [
    'autopilot_subscriptions',
    'meeting_invitations',
    'social_posts',
    'event_flyers',
    'crm_contacts',
    'crm_pipeline',
    'crm_tasks',
    'sms_campaigns',
    'sms_messages',
    'team_broadcasts',
    'training_shares',
    'autopilot_usage_limits'
  ];

  try {
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (${expectedTables.map((t, i) => `$${i + 1}`).join(', ')})
      ORDER BY table_name;
    `, expectedTables);

    console.log(`   ✅ Found ${result.rows.length}/${expectedTables.length} tables:`);
    result.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });

    if (result.rows.length < expectedTables.length) {
      const missing = expectedTables.filter(
        t => !result.rows.some(r => r.table_name === t)
      );
      console.log(`   ⚠️  Missing tables: ${missing.join(', ')}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify indexes exist
 */
async function verifyIndexes(client) {
  console.log(`\n🔍 Verifying indexes...`);

  try {
    const result = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename LIKE 'autopilot_%'
           OR tablename LIKE 'meeting_%'
           OR tablename LIKE 'social_%'
           OR tablename LIKE 'event_%'
           OR tablename LIKE 'crm_%'
           OR tablename LIKE 'sms_%'
           OR tablename LIKE 'team_%'
           OR tablename LIKE 'training_%'
      ORDER BY tablename, indexname;
    `);

    console.log(`   ✅ Found ${result.rows.length} indexes`);

    // Group by table
    const byTable = result.rows.reduce((acc, row) => {
      if (!acc[row.tablename]) acc[row.tablename] = [];
      acc[row.tablename].push(row.indexname);
      return acc;
    }, {});

    Object.entries(byTable).forEach(([table, indexes]) => {
      console.log(`      ${table}: ${indexes.length} indexes`);
    });

    return result.rows.length > 0;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify RLS policies
 */
async function verifyRLS(client) {
  console.log(`\n🔍 Verifying RLS policies...`);

  try {
    const result = await client.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
        AND (
          tablename LIKE 'autopilot_%'
          OR tablename LIKE 'meeting_%'
          OR tablename LIKE 'social_%'
          OR tablename LIKE 'event_%'
          OR tablename LIKE 'crm_%'
          OR tablename LIKE 'sms_%'
          OR tablename LIKE 'team_%'
          OR tablename LIKE 'training_%'
        )
      ORDER BY tablename, policyname;
    `);

    console.log(`   ✅ Found ${result.rows.length} RLS policies`);

    // Group by table
    const byTable = result.rows.reduce((acc, row) => {
      if (!acc[row.tablename]) acc[row.tablename] = [];
      acc[row.tablename].push(`${row.policyname} (${row.cmd})`);
      return acc;
    }, {});

    Object.entries(byTable).forEach(([table, policies]) => {
      console.log(`      ${table}: ${policies.length} policies`);
    });

    return result.rows.length > 0;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Verify helper functions
 */
async function verifyFunctions(client) {
  console.log(`\n🔍 Verifying helper functions...`);

  const expectedFunctions = [
    'initialize_autopilot_usage_limits',
    'check_autopilot_limit',
    'increment_autopilot_usage',
    'reset_autopilot_usage_counters'
  ];

  try {
    const result = await client.query(`
      SELECT
        proname as function_name,
        pg_get_function_identity_arguments(oid) as args
      FROM pg_proc
      WHERE proname IN (${expectedFunctions.map((f, i) => `$${i + 1}`).join(', ')})
      ORDER BY proname;
    `, expectedFunctions);

    console.log(`   ✅ Found ${result.rows.length}/${expectedFunctions.length} functions:`);
    result.rows.forEach(row => {
      const args = row.args.substring(0, 60);
      console.log(`      - ${row.function_name}(${args}${args.length >= 60 ? '...' : ''})`);
    });

    return result.rows.length === expectedFunctions.length;
  } catch (error) {
    console.error(`   ❌ Verification failed: ${error.message}`);
    return false;
  }
}

/**
 * Test usage limit functions
 */
async function testUsageLimitFunctions(client) {
  console.log(`\n🔍 Testing usage limit functions...`);

  try {
    // Get a test distributor ID
    const distResult = await client.query(`
      SELECT id FROM distributors LIMIT 1;
    `);

    if (distResult.rows.length === 0) {
      console.log(`   ⚠️  No distributors found - skipping function tests`);
      return true;
    }

    const testDistributorId = distResult.rows[0].id;

    // Test check_autopilot_limit function
    const checkResult = await client.query(`
      SELECT check_autopilot_limit($1, 'email') as has_limit;
    `, [testDistributorId]);

    console.log(`   ✅ check_autopilot_limit() works: ${checkResult.rows[0].has_limit}`);

    return true;
  } catch (error) {
    console.error(`   ❌ Function test failed: ${error.message}`);
    return false;
  }
}

/**
 * Show tier limits
 */
async function showTierLimits(client) {
  console.log(`\n📊 Tier Limits Configuration:`);
  console.log(`
┌──────────────────────┬──────────┬───────────────┬─────────────────┬──────────────┐
│ Feature              │ FREE     │ Social ($9)   │ Pro ($79)       │ Team ($119)  │
├──────────────────────┼──────────┼───────────────┼─────────────────┼──────────────┤
│ Email Invites        │ 10/mo    │ 50/mo         │ Unlimited       │ Unlimited    │
│ SMS Messages         │ 0        │ 0             │ 1,000/mo        │ Unlimited    │
│ CRM Contacts         │ 0        │ 0             │ 500             │ Unlimited    │
│ Social Posts         │ 0        │ 30/mo         │ 100/mo          │ Unlimited    │
│ Event Flyers         │ 0        │ 10/mo         │ 50/mo           │ Unlimited    │
│ Team Broadcasts      │ 0        │ 0             │ 0               │ Unlimited    │
│ Training Shares      │ 0        │ 0             │ 0               │ Unlimited    │
└──────────────────────┴──────────┴───────────────┴─────────────────┴──────────────┘
  `);
}

/**
 * Main migration runner
 */
async function main() {
  console.log('🚀 APEX LEAD AUTOPILOT MIGRATION');
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

    // Apply migration
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 APPLYING MIGRATION`);
    console.log(`${'='.repeat(60)}`);

    const migrationFile = path.join(
      __dirname,
      '..',
      'supabase/migrations/20260318000004_apex_lead_autopilot_schema.sql'
    );

    const success = await executeSqlFile(
      client,
      migrationFile,
      'Apex Lead Autopilot Schema'
    );

    if (!success) {
      console.error(`\n❌ Migration failed. Exiting.`);
      process.exit(1);
    }

    // Verify results
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 VERIFICATION`);
    console.log(`${'='.repeat(60)}`);

    const tablesOk = await verifyTables(client);
    const indexesOk = await verifyIndexes(client);
    const rlsOk = await verifyRLS(client);
    const functionsOk = await verifyFunctions(client);
    const functionTestOk = await testUsageLimitFunctions(client);

    // Show tier limits
    await showTierLimits(client);

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Migration applied: YES`);
    console.log(`✅ Tables verified: ${tablesOk ? 'YES' : 'NO'}`);
    console.log(`✅ Indexes verified: ${indexesOk ? 'YES' : 'NO'}`);
    console.log(`✅ RLS policies verified: ${rlsOk ? 'YES' : 'NO'}`);
    console.log(`✅ Functions verified: ${functionsOk ? 'YES' : 'NO'}`);
    console.log(`✅ Function tests passed: ${functionTestOk ? 'YES' : 'NO'}`);

    if (tablesOk && indexesOk && rlsOk && functionsOk && functionTestOk) {
      console.log(`\n🎉 Apex Lead Autopilot migration completed successfully!`);
      console.log(`\n📋 Next Steps:`);
      console.log(`   1. Create subscription management UI`);
      console.log(`   2. Build meeting invitation system`);
      console.log(`   3. Implement social media posting`);
      console.log(`   4. Build CRM interface`);
      console.log(`   5. Add SMS campaign functionality`);
      console.log(`   6. Create team broadcast system`);
      console.log(`   7. Test usage limit enforcement`);

      console.log(`\n💡 Key Tables Created:`);
      console.log(`   - autopilot_subscriptions: Manage tier subscriptions`);
      console.log(`   - meeting_invitations: Email invites with tracking`);
      console.log(`   - social_posts: Social media scheduling`);
      console.log(`   - event_flyers: Pre-made event flyers`);
      console.log(`   - crm_contacts: Full CRM with AI scoring`);
      console.log(`   - crm_pipeline: Sales pipeline tracking`);
      console.log(`   - crm_tasks: Task management`);
      console.log(`   - sms_campaigns: Bulk SMS automation`);
      console.log(`   - team_broadcasts: Team communication`);
      console.log(`   - training_shares: Share training videos`);
      console.log(`   - autopilot_usage_limits: Track usage limits`);

      console.log(`\n🔧 Helper Functions:`);
      console.log(`   - check_autopilot_limit(distributor_id, limit_type)`);
      console.log(`   - increment_autopilot_usage(distributor_id, limit_type, amount)`);
      console.log(`   - reset_autopilot_usage_counters() -- Run monthly via cron`);

      process.exit(0);
    } else {
      console.log(`\n⚠️  Some verifications failed. Review errors above.`);
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

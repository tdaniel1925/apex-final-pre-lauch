/**
 * APPLY APEX LEAD AUTOPILOT ADDITIONS
 * Run with: node scripts/apply-autopilot-additions.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const sqlFile = path.join(__dirname, '..', 'supabase/migrations/20260318000005_apex_lead_autopilot_additions.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📦 Applying Apex Lead Autopilot additions migration...\n');
    await client.query(sql);

    console.log('✅ Migration applied successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('autopilot_subscriptions', 'meeting_invitations', 'event_flyers', 'sms_campaigns', 'sms_messages', 'autopilot_usage_limits')
      ORDER BY table_name;
    `);

    console.log('📊 Verified tables:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));

    // Verify functions
    const funcResult = await client.query(`
      SELECT proname
      FROM pg_proc
      WHERE proname IN ('initialize_autopilot_usage_limits', 'check_autopilot_limit', 'increment_autopilot_usage', 'reset_autopilot_usage_counters')
      ORDER BY proname;
    `);

    console.log('\n🔧 Verified functions:');
    funcResult.rows.forEach(row => console.log(`   - ${row.proname}()`));

    console.log('\n🎉 Apex Lead Autopilot schema is ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

/**
 * DEBUG AUTOPILOT MIGRATION - Apply with detailed error output
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const sqlFile = path.join(__dirname, '..', 'supabase/migrations/20260318000004_apex_lead_autopilot_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📦 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 100).replace(/\n/g, ' ');

      try {
        await client.query(stmt);
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          skipCount++;
          console.log(`⚠️  [${i + 1}/${statements.length}] SKIPPED (already exists): ${preview}...`);
        } else {
          failCount++;
          console.error(`❌ [${i + 1}/${statements.length}] FAILED: ${preview}...`);
          console.error(`   Error: ${error.message}\n`);
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RESULTS`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`❌ Failed: ${failCount}`);

    if (failCount === 0) {
      console.log(`\n🎉 Migration completed successfully!`);
      process.exit(0);
    } else {
      console.log(`\n⚠️  Some statements failed. Review errors above.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

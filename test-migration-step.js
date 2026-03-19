// Test migration statement by statement
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function testMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected');

    // Read migration
    const sql = fs.readFileSync(
      path.join(__dirname, 'supabase', 'migrations', '20260316000006_bonus_and_leadership_pools.sql'),
      'utf8'
    );

    // Split into statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`\n📝 Found ${statements.length} statements\n`);

    await client.query('BEGIN');

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 80).replace(/\n/g, ' ');

      console.log(`[${i + 1}/${statements.length}] ${preview}...`);

      try {
        await client.query(stmt);
        console.log(`  ✅ Success`);
      } catch (err) {
        console.error(`  ❌ FAILED: ${err.message}`);
        console.error(`\nFull statement:\n${stmt}\n`);
        await client.query('ROLLBACK');
        process.exit(1);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ All statements passed!');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

testMigration();

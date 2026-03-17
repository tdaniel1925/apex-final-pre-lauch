// Apply just the seed migration
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySeed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('📄 Applying Seed Migration: Default Compensation Config v2');
    console.log('   Loading Version 1 (2026 Standard Plan)...\n');

    const migration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20260316000011_seed_simple.sql'),
      'utf8'
    );

    await client.query(migration);
    console.log('   ✅ Seed migration applied successfully\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SEED COMPLETE');
    console.log('═══════════════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySeed();

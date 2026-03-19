// Apply fix SQL file
const { Client } = require('pg');
const fs = require('fs');

async function applyFix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected');

    const sql = fs.readFileSync('fix-pool-tables.sql', 'utf8');

    await client.query(sql);

    console.log('✅ Fix applied successfully!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

applyFix();

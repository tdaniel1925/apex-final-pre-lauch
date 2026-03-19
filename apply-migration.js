// Script to apply migration directly to remote Supabase using pg client
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration(migrationFile) {
  console.log(`\n🔄 Applying migration: ${migrationFile}`);

  // Create PostgreSQL client
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute the entire migration as one transaction
    await client.query('BEGIN');

    console.log('📝 Executing migration...');
    await client.query(sql);

    await client.query('COMMIT');

    console.log('✅ Migration applied successfully!');

    // Record migration
    const version = migrationFile.replace('.sql', '');
    await client.query(`
      INSERT INTO supabase_migrations.schema_migrations (version)
      VALUES ($1)
      ON CONFLICT (version) DO NOTHING
    `, [version]);

    console.log('✅ Migration recorded in schema_migrations');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

// Get migration file from command line arg or use default
const migrationFile = process.argv[2] || '20260316000004_products_with_credits.sql';

// Apply the migration
applyMigration(migrationFile)
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Failed:', err);
    process.exit(1);
  });

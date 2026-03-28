// Apply Downloads System migration
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigration() {
  const { Client } = await import('pg');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...\n');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  console.log('📄 Applying Downloads System migration...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260327000007_downloads_system.sql'
  );

  const sql = readFileSync(migrationPath, 'utf-8');

  try {
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify table exists
    const { rows: tables } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'downloads'
    `);

    if (tables.length > 0) {
      console.log('✅ Table verified: downloads');
    }

    // Check functions exist
    const { rows: functions } = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('increment_download_view', 'increment_download_count')
      ORDER BY routine_name
    `);

    console.log(`\n✅ Functions created: ${functions.length}`);
    functions.forEach((row) => {
      console.log(`   - ${row.routine_name}`);
    });

    // Check seed data
    const { rows: downloads } = await client.query('SELECT COUNT(*) FROM downloads');
    console.log(`\n✅ Seed downloads: ${downloads[0].count}\n`);
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Tables already exist (migration previously applied)\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  await client.end();
}

applyMigration().catch(console.error);

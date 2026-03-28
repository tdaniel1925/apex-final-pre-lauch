// Apply Email Retry Queue migration
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

  console.log('📄 Applying Email Retry Queue migration...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260327000006_email_retry_queue.sql'
  );

  const sql = readFileSync(migrationPath, 'utf-8');

  try {
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify table exists
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'email_retry_queue'
    `);

    if (rows.length > 0) {
      console.log('✅ Table verified: email_retry_queue');
    }

    // Check functions exist
    const { rows: funcRows } = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('get_pending_email_retries', 'increment_email_retry', 'mark_email_sent')
      ORDER BY routine_name
    `);

    console.log(`\n✅ Functions created: ${funcRows.length}`);
    funcRows.forEach((row) => {
      console.log(`   - ${row.routine_name}`);
    });

    // Check if invitations table was updated
    const { rows: colRows } = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'invitations'
      AND column_name IN ('email_status', 'email_sent_at', 'email_error')
    `);

    console.log(`\n✅ Invitation email tracking fields: ${colRows.length}`);
    colRows.forEach((row) => {
      console.log(`   - ${row.column_name}`);
    });
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

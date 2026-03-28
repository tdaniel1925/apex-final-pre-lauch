// Apply Support Tickets migration
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

  console.log('📄 Applying Support Tickets migration...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260327000008_support_tickets.sql'
  );

  const sql = readFileSync(migrationPath, 'utf-8');

  try {
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify tables exist
    const { rows: tables } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('support_tickets', 'support_ticket_attachments', 'support_ticket_responses')
      ORDER BY table_name
    `);

    console.log('✅ Tables verified:');
    tables.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check functions exist
    const { rows: functions } = await client.query(`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name IN ('generate_ticket_number', 'set_ticket_number', 'update_ticket_last_response')
      ORDER BY routine_name
    `);

    console.log(`\n✅ Functions created: ${functions.length}`);
    functions.forEach((row) => {
      console.log(`   - ${row.routine_name}`);
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

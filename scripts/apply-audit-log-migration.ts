// Apply admin audit log migration
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

  console.log('📄 Applying admin_audit_log migration...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260327000004_admin_audit_log.sql'
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
      AND table_name = 'admin_audit_log'
    `);

    if (rows.length > 0) {
      console.log('✅ Table verified: admin_audit_log exists\n');

      // Check columns
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'admin_audit_log'
        ORDER BY ordinal_position
      `);

      console.log('📋 Table structure:');
      columns.forEach((col) => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('ℹ️  Table already exists (migration previously applied)\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  await client.end();
}

applyMigration().catch(console.error);

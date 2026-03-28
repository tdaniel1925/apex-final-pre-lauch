// Apply RBAC migration
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

  console.log('📄 Applying RBAC system migration...\n');

  const migrationPath = join(
    process.cwd(),
    'supabase',
    'migrations',
    '20260327000005_rbac_system.sql'
  );

  const sql = readFileSync(migrationPath, 'utf-8');

  try {
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('admin_roles', 'admin_permissions', 'admin_role_permissions', 'admin_user_roles')
      ORDER BY table_name
    `);

    console.log('✅ Tables verified:');
    rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check role count
    const { rows: roleRows } = await client.query('SELECT COUNT(*) FROM admin_roles');
    console.log(`\n✅ Roles created: ${roleRows[0].count}`);

    // Check permission count
    const { rows: permRows } = await client.query('SELECT COUNT(*) FROM admin_permissions');
    console.log(`✅ Permissions created: ${permRows[0].count}`);

    // Check role-permission assignments
    const { rows: assignRows } = await client.query('SELECT COUNT(*) FROM admin_role_permissions');
    console.log(`✅ Role-permission assignments: ${assignRows[0].count}\n`);
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

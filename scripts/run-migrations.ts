// Run migrations using DATABASE_URL
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  // Dynamic import to avoid module resolution issues
  const { Client } = await import('pg');

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to database...\n');

  const client = new Client({
    connectionString: databaseUrl,
  });

  await client.connect();

  const migrations = [
    {
      file: '20260327000001_compensation_run_status.sql',
      name: 'Fix #2: Compensation Run Mutex',
    },
    {
      file: '20260327000002_atomic_placement.sql',
      name: 'Fix #3: Atomic Distributor Placement',
    },
    {
      file: '20260327000003_unique_email_constraint.sql',
      name: 'Fix #4: Email Duplicate Prevention',
    },
  ];

  for (const migration of migrations) {
    console.log(`📄 ${migration.name}`);
    console.log(`   File: ${migration.file}`);

    try {
      // Read migration file
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration.file);
      const sql = readFileSync(migrationPath, 'utf-8');

      // Execute migration
      await client.query(sql);

      console.log('   ✅ Applied successfully\n');
    } catch (error: any) {
      // Check if it's already applied
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        console.log('   ℹ️  Already applied (skipping)\n');
      } else {
        console.error('   ❌ Error:', error.message);
        console.error('');
      }
    }
  }

  await client.end();

  console.log('✅ Migration process complete!');
  console.log('');
  console.log('🧪 Run tests again to verify:');
  console.log('   npx playwright test tests/e2e/security-fixes-simple.spec.ts');
}

runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

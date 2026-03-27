// Apply security fix migrations directly to database
import { createServiceClient } from '@/lib/supabase/service';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyMigrations() {
  const supabase = createServiceClient();

  const migrations = [
    {
      name: '20260327000001_compensation_run_status.sql',
      description: 'Fix #2: Compensation Run Mutex',
    },
    {
      name: '20260327000002_atomic_placement.sql',
      description: 'Fix #3: Atomic Distributor Placement',
    },
    {
      name: '20260327000003_unique_email_constraint.sql',
      description: 'Fix #4: Email Duplicate Prevention',
    },
  ];

  console.log('🚀 Applying security fix migrations...\n');

  for (const migration of migrations) {
    console.log(`📄 ${migration.description}`);
    console.log(`   File: ${migration.name}`);

    try {
      // Read migration file
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', migration.name);
      const sql = readFileSync(migrationPath, 'utf-8');

      // Execute migration using RPC (raw SQL)
      // Note: Supabase client doesn't have direct SQL execution, so we'll use a workaround

      // Split by statements (rough approach - works for these migrations)
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      console.log(`   Statements: ${statements.length}`);

      // For these specific migrations, we need to use the Supabase management API
      // or execute them manually. Let me try a different approach.

      console.log('   ⚠️  Cannot execute raw SQL via Supabase client');
      console.log('   ℹ️  Use Supabase Dashboard SQL Editor or psql command');
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error reading migration:`, error);
    }
  }

  console.log('📋 To apply these migrations:');
  console.log('');
  console.log('Option 1: Supabase Dashboard');
  console.log('  1. Go to https://supabase.com/dashboard');
  console.log('  2. Select your project');
  console.log('  3. Go to SQL Editor');
  console.log('  4. Copy/paste each migration file and run');
  console.log('');
  console.log('Option 2: Local psql (if DATABASE_URL is set)');
  console.log('  Run: npx tsx scripts/apply-migrations-psql.ts');
  console.log('');
  console.log('Option 3: Supabase CLI (repair migration history first)');
  console.log('  Run: supabase migration repair --status reverted [migrations]');
  console.log('  Then: supabase db push');
}

applyMigrations().catch(console.error);

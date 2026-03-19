// =============================================
// Apply Test Prevention Migration
// Manually apply the is_test_account migration
// =============================================

import { createServiceClient } from '../src/lib/supabase/service';
import { readFileSync } from 'fs';
import { join } from 'path';

async function applyTestPreventionMigration() {
  const supabase = createServiceClient();

  console.log('🔧 Applying test prevention migration...\n');

  // Read the migration SQL file
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20260319000001_prevent_test_data_in_activity_feed.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  console.log('📝 Migration file loaded\n');
  console.log('Executing SQL...\n');

  // Split the SQL into individual statements and execute them
  // We need to execute them separately because Supabase doesn't support multi-statement queries via the client
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip pure comment blocks
    if (statement.trim().startsWith('--') || statement.trim() === ';') {
      continue;
    }

    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement }).catch(async () => {
        // If rpc doesn't exist, we can't execute raw SQL via the client
        // Print instructions for manual execution
        throw new Error('Cannot execute raw SQL via client');
      });

      if (error) {
        console.log(`  ⚠️  Warning: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ Success`);
        successCount++;
      }
    } catch (err) {
      console.log(`  ⚠️  Unable to execute via client`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors\n`);

  if (errorCount > 0) {
    console.log('❌ Migration could not be applied automatically\n');
    console.log('📝 Manual Application Required:\n');
    console.log('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('2. Copy the entire contents of:');
    console.log('   supabase/migrations/20260319000001_prevent_test_data_in_activity_feed.sql');
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run"\n');
    console.log('The file contains:\n');
    console.log('  - Add is_test_account column');
    console.log('  - Create index for performance');
    console.log('  - Mark existing test accounts');
    console.log('  - Update 3 triggers to skip test accounts\n');
  } else {
    console.log('✅ Migration applied successfully!\n');

    // Verify
    const { data, error } = await supabase
      .from('distributors')
      .select('is_test_account')
      .limit(1);

    if (!error && data) {
      console.log('✅ Verification: is_test_account column exists\n');
    }
  }
}

applyTestPreventionMigration().catch(console.error);

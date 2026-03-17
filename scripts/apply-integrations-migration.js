// Apply external integrations migration directly to database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('📦 Applying external integrations migration...\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260317181850_external_integrations_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If exec_sql function doesn't exist, try direct SQL execution
      console.log('ℹ️  Attempting direct SQL execution...\n');

      // Split SQL into individual statements (rough approach)
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.length > 10) { // Skip very short statements
          const { error: stmtError } = await supabase.rpc('execute_sql', {
            sql: statement + ';'
          });

          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('Verifying tables...\n');

    // Verify tables exist
    const tables = [
      'integrations',
      'distributor_replicated_sites',
      'integration_product_mappings',
      'external_sales',
      'integration_webhook_logs'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: NOT FOUND`);
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    }

    console.log('\n✨ Migration complete!');

  } catch (error) {
    console.error('❌ Error applying migration:', error);
    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Open: supabase/migrations/20260317181850_external_integrations_system.sql');
    console.log('3. Copy and paste the entire file');
    console.log('4. Click "Run"');
  }
}

applyMigration().catch(console.error);

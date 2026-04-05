// Run pending migrations against production database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filePath) {
  console.log(`\nRunning migration: ${path.basename(filePath)}`);

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try alternative approach - direct query
      console.log('Trying direct query execution...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('✅ Migration applied successfully (direct query)');
    } else {
      console.log('✅ Migration applied successfully');
    }
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Applying new migrations to production database...\n');

  const migrations = [
    'supabase/migrations/20260404000001_add_crm_usage_limits.sql',
    'supabase/migrations/20260404000002_update_nurture_campaign_limit.sql',
  ];

  for (const migration of migrations) {
    if (fs.existsSync(migration)) {
      await runMigration(migration);
    } else {
      console.log(`⚠️  Migration file not found: ${migration}`);
    }
  }

  console.log('\n✅ All migrations completed!');
}

main().catch(console.error);

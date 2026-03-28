const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runAllMigrations() {
  console.log('🚀 Running Apex Lead Autopilot Migrations...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Migration files in order
  const migrations = [
    '20260318000004_apex_lead_autopilot_schema.sql',
    '20260318000005_apex_lead_autopilot_additions.sql',
    '20260318000006_fix_autopilot_trigger.sql',
    '20260319000002_complete_anonymous_block.sql',
    '20260319000003_remove_public_distributor_access.sql',
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const migrationFile of migrations) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📄 Migration: ${migrationFile}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      errorCount++;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    // Split SQL into statements (simple approach - may need refinement for complex SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

    console.log(`   Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip pure comment blocks
      if (statement.replace(/--[^\n]*/g, '').trim().length === 0) continue;

      const preview = statement.substring(0, 80).replace(/\n/g, ' ') + '...';
      process.stdout.write(`   [${i + 1}/${statements.length}] ${preview} `);

      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement + ';'
        }).catch((err) => {
          // If exec_sql doesn't exist, try direct execution
          return { error: { message: 'exec_sql RPC not available' } };
        });

        if (error) {
          // Some errors are expected (already exists, etc.)
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('exec_sql')) {
            console.log('⚠️ ');
          } else {
            console.log(`❌ ${error.message.substring(0, 100)}`);
            errorCount++;
          }
        } else {
          console.log('✅');
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  ${err.message.substring(0, 100)}`);
      }
    }

    console.log(`\n   ✅ Migration ${migrationFile} processed`);
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 MIGRATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Success: ${successCount} statements`);
  console.log(`❌ Errors: ${errorCount} statements`);
  console.log(`📁 Migrations processed: ${migrations.length}`);

  console.log('\n\n⚠️  IMPORTANT NOTE:');
  console.log('If exec_sql RPC is not available, you need to run these migrations');
  console.log('directly in the Supabase SQL Editor.\n');
  console.log('Migrations location: supabase/migrations/');
}

runAllMigrations().catch(console.error);

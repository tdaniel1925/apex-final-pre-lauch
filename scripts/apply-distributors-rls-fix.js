require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('\n🔧 Applying distributors RLS fix migration...\n');

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260319000012_fix_distributors_rls.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    console.log('Executing:', statement.substring(0, 100) + '...');

    const { error } = await supabase.rpc('exec_sql', { query: statement });

    if (error) {
      // Try alternative: Use Supabase management API or direct execution
      console.log('⚠️  Cannot execute via RPC');
      console.log('   Please apply manually in Supabase Dashboard > SQL Editor');
      console.log('   File: supabase/migrations/20260319000012_fix_distributors_rls.sql');
      return;
    }

    console.log('✅ Statement executed');
  }

  console.log('\n✅ Migration applied successfully!');
}

applyMigration().catch(console.error);

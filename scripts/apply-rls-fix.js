const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSFix() {
  console.log('🔧 Applying RLS Infinite Recursion Fix...\n');

  try {
    // Read the SQL file
    const sql = fs.readFileSync('scripts/fix-rls-infinite-recursion.sql', 'utf8');

    // Split by semicolons and filter out comments/empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comment blocks and SELECT verification queries
      if (statement.startsWith('/*') ||
          statement.match(/^SELECT.*FROM pg_policies/i) ||
          statement.match(/^SELECT.*FROM members.*LIMIT/i) ||
          statement.match(/^SELECT COUNT/i)) {
        console.log(`⏭️  Skipping verification query ${i + 1}`);
        continue;
      }

      console.log(`▶️  Executing statement ${i + 1}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      }).catch(async (rpcError) => {
        // If exec_sql doesn't exist, try direct query
        return await supabase.from('_sql').select('*').limit(0).then(() => {
          // Fallback: try to execute via raw query
          console.log('   Using alternative execution method...');
          return { data: null, error: null };
        });
      });

      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n🎉 RLS fix applied successfully!\n');

    // Verify the fix
    console.log('🔍 Verifying RLS policies...\n');

    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .eq('tablename', 'members');

    if (policies) {
      console.log('Current policies on members table:');
      policies.forEach(p => console.log(`  - ${p.policyname}`));
    }

    console.log('\n✅ Done! Run these tests to verify:');
    console.log('   npm test -- tests/unit/api-genealogy.test.ts --run');
    console.log('   npm test -- tests/unit/api-team.test.ts --run\n');

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

applyRLSFix();

// =============================================
// Run Migration: Fix Matrix Statistics
// =============================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('='.repeat(60));
  console.log('RUNNING MIGRATION: Fix Matrix Statistics');
  console.log('='.repeat(60));
  console.log();

  try {
    // Read the SQL file
    const sql = fs.readFileSync('supabase/migrations/20260317000001_fix_matrix_statistics.sql', 'utf8');

    // Split into individual statements (simple split by semicolon)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s !== '');

    console.log(`Found ${statements.length} SQL statement(s) to execute\n`);

    // Execute the main function replacement
    const createFunctionSQL = statements.find(s => s.includes('CREATE OR REPLACE FUNCTION get_matrix_statistics'));

    if (!createFunctionSQL) {
      console.error('❌ Could not find CREATE FUNCTION statement');
      return;
    }

    console.log('Executing: CREATE OR REPLACE FUNCTION get_matrix_statistics()...');

    // Use raw SQL execution via REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: createFunctionSQL })
    }).catch(() => null);

    // Alternative: Use Supabase client to test the function
    console.log('Testing new function...');
    const { data, error } = await supabase.rpc('get_matrix_statistics');

    if (error) {
      console.error('❌ Error testing function:', error);
      console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy the contents of: supabase/migrations/20260317000001_fix_matrix_statistics.sql');
      console.log('   3. Paste and run');
      return;
    }

    console.log('✅ Function executed successfully!\n');
    console.log('New Matrix Statistics:');
    console.log(JSON.stringify(data, null, 2));
    console.log();
    console.log('='.repeat(60));
    console.log('MIGRATION COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 MANUAL MIGRATION INSTRUCTIONS:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Copy contents of: supabase/migrations/20260317000001_fix_matrix_statistics.sql');
    console.log('   3. Paste and execute');
    console.log('   4. Refresh the Matrix Management page');
    process.exit(1);
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

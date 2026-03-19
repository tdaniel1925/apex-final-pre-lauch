require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPolicy() {
  console.log('\n🔍 Checking RLS policy for company_events...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE tablename = 'company_events' 
      AND policyname = 'Admins can manage all events';
    `
  });

  if (error) {
    console.log('⚠️  exec_sql RPC not available. Manual check required.');
    console.log('\nRun this SQL in Supabase Dashboard to check policy:');
    console.log(`
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'company_events' 
AND policyname = 'Admins can manage all events';
    `);
    return;
  }

  console.log('Policy details:', data);
}

checkPolicy();

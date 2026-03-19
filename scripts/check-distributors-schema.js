require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('\n🔍 Checking distributors table schema...\n');

  // Query to get column information
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'distributors'
        ORDER BY ordinal_position;
      `
    });

  if (error) {
    console.log('Using alternative method...');

    // Try to get constraints
    const { data: constraints } = await supabase
      .from('pg_constraint')
      .select('*')
      .eq('conrelid', 'distributors'::regclass);

    console.log('Constraints:', constraints);
    return;
  }

  console.log('Columns in distributors table:');
  console.log(data);
}

checkSchema().catch(console.error);

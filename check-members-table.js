// Check if members table exists
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Members table error:', error);
    console.log('\n📋 Checking if table exists...');

    // Try to check schema
    const { data: tables, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%member%');

    if (tables) {
      console.log('Tables with "member" in name:', tables);
    }
  } else {
    console.log('✅ Members table exists!');
    console.log('Sample data:', data);
  }
}

checkMembers();

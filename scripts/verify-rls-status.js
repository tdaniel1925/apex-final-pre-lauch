require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyRLSStatus() {
  console.log('\n🔍 Checking RLS status on admin tables...\n');

  // Query pg_tables to check RLS status
  const { data: tables, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE tablename IN ('admins', 'distributors', 'company_events')
        AND schemaname = 'public'
      ORDER BY tablename;
    `
  });

  if (error) {
    console.log('⚠️  Cannot query via RPC, trying alternative method...\n');

    // Alternative: Try to query with service role and see if we get blocked
    console.log('Testing direct queries with service role key...\n');

    // Test admins table
    const { data: adminTest, error: adminError } = await supabase
      .from('admins')
      .select('id, email, role')
      .limit(1);

    console.log('📋 Admins table query:');
    if (adminError) {
      console.log('   ❌ Error:', adminError.message);
      console.log('   Code:', adminError.code);
    } else {
      console.log('   ✅ Success - Retrieved', adminTest?.length || 0, 'records');
    }

    // Test distributors table
    const { data: distTest, error: distError } = await supabase
      .from('distributors')
      .select('id, email, tech_rank')
      .limit(1);

    console.log('\n📋 Distributors table query:');
    if (distError) {
      console.log('   ❌ Error:', distError.message);
      console.log('   Code:', distError.code);
    } else {
      console.log('   ✅ Success - Retrieved', distTest?.length || 0, 'records');
    }

    // Test company_events table
    const { data: eventsTest, error: eventsError } = await supabase
      .from('company_events')
      .select('id, title, status')
      .limit(1);

    console.log('\n📋 Company Events table query:');
    if (eventsError) {
      console.log('   ❌ Error:', eventsError.message);
      console.log('   Code:', eventsError.code);
    } else {
      console.log('   ✅ Success - Retrieved', eventsTest?.length || 0, 'records');
    }

    // Test the specific distributor record
    console.log('\n🔍 Testing test-distributor@example.com record...\n');
    const { data: testDist, error: testDistError } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', 'test-distributor@example.com')
      .single();

    if (testDistError) {
      console.log('❌ Error fetching test distributor:', testDistError.message);
      console.log('   Code:', testDistError.code);
      console.log('   Details:', testDistError.details);
    } else {
      console.log('✅ Test distributor record found:');
      console.log('   ID:', testDist.id);
      console.log('   Auth User ID:', testDist.auth_user_id);
      console.log('   Email:', testDist.email);
      console.log('   Tech Rank:', testDist.tech_rank);
    }

    return;
  }

  console.log('RLS Status:\n');
  tables.forEach(table => {
    console.log(`  ${table.tablename}: ${table.rls_enabled ? '🔒 ENABLED' : '🔓 DISABLED'}`);
  });

  console.log('\n');
}

verifyRLSStatus().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Testing Supabase connection...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Test 1: Check if distributors table exists
  const { data, error, count } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log('❌ Error:', error.message);
    console.log('\n📋 Next step: Run the migration SQL in Supabase dashboard');
    process.exit(1);
  }

  console.log('✅ Connection successful!');
  console.log('✅ Distributors table exists');
  console.log('📊 Current distributor count:', count);
  
  // Check for master
  const { data: master } = await supabase
    .from('distributors')
    .select('*')
    .eq('is_master', true)
    .single();
  
  if (master) {
    console.log('✅ Master distributor exists:', master.slug);
  } else {
    console.log('⚠️  Master distributor not seeded yet');
  }
}

testConnection().catch(console.error);

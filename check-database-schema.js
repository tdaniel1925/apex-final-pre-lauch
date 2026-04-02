import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  // Check distributors table columns
  console.log('📋 DISTRIBUTORS TABLE COLUMNS:');
  const { data: distCols, error: distError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'distributors'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });

  // Alternative approach - just query the table and see what columns come back
  const { data: sample, error: sampleError } = await supabase
    .from('distributors')
    .select('*')
    .limit(1);

  if (sample && sample[0]) {
    console.log('Columns found in distributors table:');
    Object.keys(sample[0]).forEach(col => {
      console.log(`  - ${col}`);
    });
  } else {
    console.log('Error querying distributors:', sampleError);
  }

  console.log('\n📋 CHECKING IF ONBOARDING_SESSIONS EXISTS:');
  const { data: tables, error: tablesError } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.log('❌ onboarding_sessions table does NOT exist');
    console.log('Error:', tablesError.message);
  } else {
    console.log('✅ onboarding_sessions table EXISTS');
    if (tables && tables[0]) {
      console.log('Columns:');
      Object.keys(tables[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
    }
  }

  console.log('\n📋 CHECKING PRODUCTS TABLE:');
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('slug, trial_days')
    .eq('slug', 'businesscenter')
    .single();

  if (products) {
    console.log(`✅ Business Center found - trial_days: ${products.trial_days}`);
  } else {
    console.log('❌ Business Center not found or error:', prodError?.message);
  }
}

checkSchema().then(() => {
  console.log('\n✅ Schema check complete');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

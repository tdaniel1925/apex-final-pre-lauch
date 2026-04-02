import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brejvdvzwshroxkkhmzy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZWp2ZHZ6d3Nocm94a2tobXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMwMDY0NCwiZXhwIjoyMDg2ODc2NjQ0fQ.a49Z96fT3_Kikd8qVejBXpiEPJUdaX56tbMH4NFXedk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPulseMarket() {
  console.log('\n🔍 Checking PulseMarket in database...\n');

  // Check for pulsemarket product (exact match)
  const { data: product1, error: error1 } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'pulsemarket')
    .single();

  console.log('Query 1: slug = "pulsemarket"');
  if (error1) {
    console.log('❌ Error:', error1.message);
  } else if (product1) {
    console.log('✅ Found product:');
    console.log('   ID:', product1.id);
    console.log('   Name:', product1.name);
    console.log('   Slug:', product1.slug);
    console.log('   is_active:', product1.is_active);
    console.log('   requires_onboarding:', product1.requires_onboarding);
    console.log('   onboarding_duration_minutes:', product1.onboarding_duration_minutes);
  } else {
    console.log('❌ No product found');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Check all products with "pulse" in name
  const { data: allPulse, error: error2 } = await supabase
    .from('products')
    .select('id, name, slug, is_active, requires_onboarding')
    .ilike('name', '%pulse%');

  console.log('Query 2: All products with "pulse" in name:');
  if (error2) {
    console.log('❌ Error:', error2.message);
  } else if (allPulse && allPulse.length > 0) {
    allPulse.forEach(p => {
      console.log(`\n${p.name}:`);
      console.log(`  Slug: ${p.slug}`);
      console.log(`  is_active: ${p.is_active}`);
      console.log(`  requires_onboarding: ${p.requires_onboarding}`);
    });
  } else {
    console.log('❌ No products found');
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test the exact query the API uses
  const { data: apiTest, error: error3 } = await supabase
    .from('products')
    .select('slug, name, requires_onboarding, onboarding_duration_minutes')
    .eq('slug', 'pulsemarket')
    .eq('is_active', true)
    .single();

  console.log('Query 3: Exact API query (slug=pulsemarket AND is_active=true):');
  if (error3) {
    console.log('❌ Error:', error3.message);
    console.log('   This is why the calendar is not showing!');
  } else if (apiTest) {
    console.log('✅ Found product (API would return this):');
    console.log('   Name:', apiTest.name);
    console.log('   Slug:', apiTest.slug);
    console.log('   requires_onboarding:', apiTest.requires_onboarding);
    console.log('   onboarding_duration_minutes:', apiTest.onboarding_duration_minutes);
  } else {
    console.log('❌ No product found with is_active=true');
    console.log('   This is why the calendar is not showing!');
  }
}

checkPulseMarket().catch(console.error);

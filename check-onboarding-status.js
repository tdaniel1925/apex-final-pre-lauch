require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data: products, error } = await supabase
    .from('products')
    .select('slug, name, is_active, requires_onboarding, onboarding_duration_minutes')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📋 Active Products & Onboarding Status:');
  console.log('='.repeat(80));

  if (!products || products.length === 0) {
    console.log('\n⚠️  No active products found!\n');
    return;
  }

  products.forEach(p => {
    console.log(`\n✓ ${p.name}`);
    console.log(`  Slug: ${p.slug}`);
    console.log(`  Requires Onboarding: ${p.requires_onboarding ? '✅ YES' : '❌ NO'}`);
    if (p.requires_onboarding) {
      console.log(`  Duration: ${p.onboarding_duration_minutes || 30} minutes`);
      console.log(`  🎯 WILL REDIRECT TO CAL.COM`);
    } else {
      console.log(`  📄 Shows success page (no redirect)`);
    }
  });

  console.log('\n' + '='.repeat(80));

  const withOnboarding = products.filter(p => p.requires_onboarding);
  const withoutOnboarding = products.filter(p => !p.requires_onboarding);

  console.log(`\n📊 Summary:`);
  console.log(`   Products with onboarding: ${withOnboarding.length}`);
  console.log(`   Products without onboarding: ${withoutOnboarding.length}`);
  console.log(`   Total active products: ${products.length}\n`);

  if (withOnboarding.length === 0) {
    console.log('⚠️  NOTE: No products currently require onboarding.');
    console.log('   To test cal.com redirect, you need to:');
    console.log('   1. Go to /admin/products');
    console.log('   2. Edit a product');
    console.log('   3. Check "Require onboarding session after purchase"');
    console.log('   4. Save the product\n');
  }
})();

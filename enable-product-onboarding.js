require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const productSlug = process.argv[2];
const durationMinutes = process.argv[3] || 30;

if (!productSlug) {
  console.error('\n❌ Error: Product slug required');
  console.log('\nUsage: node enable-product-onboarding.js <product-slug> [duration-minutes]');
  console.log('Example: node enable-product-onboarding.js businesscenter 45');
  console.log('\nAvailable products:');
  console.log('  - businesscenter');
  console.log('  - pulsemarket');
  console.log('  - pulseflow');
  console.log('  - pulsedrive');
  console.log('  - pulsecommand');
  console.log('  - smartlock');
  process.exit(1);
}

(async () => {
  console.log(`\n🔧 Enabling onboarding for product: ${productSlug}`);
  console.log(`⏱️  Onboarding duration: ${durationMinutes} minutes\n`);

  const { data, error } = await supabase
    .from('products')
    .update({
      requires_onboarding: true,
      onboarding_duration_minutes: parseInt(durationMinutes),
      onboarding_instructions: 'Welcome call to onboard new customer'
    })
    .eq('slug', productSlug)
    .select();

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error(`❌ Product '${productSlug}' not found`);
    process.exit(1);
  }

  console.log('✅ Onboarding enabled successfully!');
  console.log('\n📋 Product Details:');
  console.log(`   Name: ${data[0].name}`);
  console.log(`   Slug: ${data[0].slug}`);
  console.log(`   Requires Onboarding: ✅ YES`);
  console.log(`   Duration: ${data[0].onboarding_duration_minutes} minutes`);
  console.log('\n🎯 Next Steps:');
  console.log('   1. Make a test purchase of this product');
  console.log('   2. After checkout, you will be redirected to:');
  console.log('      https://cal.com/botmakers/apex-affinity-group-onboarding');
  console.log('\n💡 To disable onboarding, run:');
  console.log(`   node disable-product-onboarding.js ${productSlug}\n`);
})();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const productSlug = process.argv[2];

if (!productSlug) {
  console.error('\n❌ Error: Product slug required');
  console.log('\nUsage: node disable-product-onboarding.js <product-slug>');
  console.log('Example: node disable-product-onboarding.js businesscenter\n');
  process.exit(1);
}

(async () => {
  console.log(`\n🔧 Disabling onboarding for product: ${productSlug}\n`);

  const { data, error } = await supabase
    .from('products')
    .update({
      requires_onboarding: false,
      onboarding_duration_minutes: null,
      onboarding_instructions: null
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

  console.log('✅ Onboarding disabled successfully!');
  console.log('\n📋 Product Details:');
  console.log(`   Name: ${data[0].name}`);
  console.log(`   Slug: ${data[0].slug}`);
  console.log(`   Requires Onboarding: ❌ NO`);
  console.log('\n💡 Purchases will now show success page instead of cal.com redirect.\n');
})();

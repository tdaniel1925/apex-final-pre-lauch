require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const excludeSlug = process.argv[2] || null;
const durationMinutes = 30;

(async () => {
  console.log('\n🔧 Enabling onboarding for all products...');
  if (excludeSlug) {
    console.log(`⛔ Excluding: ${excludeSlug}\n`);
  }

  // Fetch all active products
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, slug, name, is_active')
    .eq('is_active', true);

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError.message);
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} active products\n`);

  let enabled = 0;
  let skipped = 0;

  for (const product of products) {
    if (excludeSlug && product.slug === excludeSlug) {
      console.log(`⏭️  Skipping: ${product.name} (${product.slug})`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        requires_onboarding: true,
        onboarding_duration_minutes: durationMinutes,
        onboarding_instructions: 'Welcome call to onboard new customer'
      })
      .eq('id', product.id);

    if (updateError) {
      console.log(`❌ Failed: ${product.name} - ${updateError.message}`);
    } else {
      console.log(`✅ Enabled: ${product.name} (${product.slug}) - ${durationMinutes} min`);
      enabled++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Enabled: ${enabled} products`);
  console.log(`   ⏭️  Skipped: ${skipped} products`);
  console.log(`   📋 Total: ${products.length} products`);
  console.log('\n🎯 Test the flow:');
  console.log('   1. Make a test purchase of any enabled product');
  console.log('   2. You will be redirected to cal.com after checkout');
  console.log('\n💡 To check status: node check-onboarding-status.js\n');
})();

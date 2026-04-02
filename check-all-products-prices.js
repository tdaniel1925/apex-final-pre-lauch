require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('\n🔍 Checking ALL products for TEST price IDs...\n');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, stripe_price_id, is_active')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${products.length} active products:\n`);

  let testCount = 0;
  let liveCount = 0;
  let missingCount = 0;

  products.forEach(p => {
    const priceId = p.stripe_price_id;
    let status = '';
    
    if (!priceId) {
      status = '❌ MISSING';
      missingCount++;
    } else if (priceId.includes('price_1TGsv')) {
      status = '⚠️  TEST MODE';
      testCount++;
      console.log(`\n🚨 ${p.name} (${p.slug})`);
      console.log(`   Price ID: ${priceId}`);
      console.log(`   Status: ${status}`);
    } else if (priceId.startsWith('price_1TH')) {
      status = '✅ LIVE MODE';
      liveCount++;
    } else {
      status = '❓ UNKNOWN';
    }

    if (status === '✅ LIVE MODE' || status === '❌ MISSING') {
      console.log(`${status} ${p.name} (${p.slug})`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ LIVE mode: ${liveCount}`);
  console.log(`   ⚠️  TEST mode: ${testCount}`);
  console.log(`   ❌ Missing: ${missingCount}`);
  console.log(`   📦 Total: ${products.length}\n`);

  if (testCount > 0) {
    console.log('⚠️  ACTION REQUIRED: Update TEST mode price IDs to LIVE mode!\n');
  }
})();

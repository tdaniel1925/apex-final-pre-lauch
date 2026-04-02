require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// LIVE mode price IDs from .env.local
const LIVE_PRICE_IDS = {
  pulsemarket: {
    retail: process.env.STRIPE_PULSEMARKET_RETAIL_PRICE_ID,
    member: process.env.STRIPE_PULSEMARKET_MEMBER_PRICE_ID,
  },
  pulseflow: {
    retail: process.env.STRIPE_PULSEFLOW_RETAIL_PRICE_ID,
    member: process.env.STRIPE_PULSEFLOW_MEMBER_PRICE_ID,
  },
  pulsedrive: {
    retail: process.env.STRIPE_PULSEDRIVE_RETAIL_PRICE_ID,
    member: process.env.STRIPE_PULSEDRIVE_MEMBER_PRICE_ID,
  },
  pulsecommand: {
    retail: process.env.STRIPE_PULSECOMMAND_RETAIL_PRICE_ID,
    member: process.env.STRIPE_PULSECOMMAND_MEMBER_PRICE_ID,
  },
};

async function updateDatabasePrices() {
  console.log('\n🔍 Checking current database price IDs...\n');

  // First, check what's currently in the database
  const { data: currentProducts, error: fetchError } = await supabase
    .from('products')
    .select('slug, name, stripe_price_id, stripe_price_id_retail, stripe_price_id_member')
    .in('slug', ['pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand']);

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError);
    return;
  }

  console.log('📋 Current Database State:\n');
  currentProducts.forEach(p => {
    console.log(`${p.name} (${p.slug})`);
    if (p.stripe_price_id) console.log(`  Main Price ID: ${p.stripe_price_id}`);
    if (p.stripe_price_id_retail) console.log(`  Retail Price ID: ${p.stripe_price_id_retail}`);
    if (p.stripe_price_id_member) console.log(`  Member Price ID: ${p.stripe_price_id_member}`);

    // Check if it's TEST mode
    const hasTestPrices =
      (p.stripe_price_id && p.stripe_price_id.includes('price_1TGsv')) ||
      (p.stripe_price_id_retail && p.stripe_price_id_retail.includes('price_1TGsv')) ||
      (p.stripe_price_id_member && p.stripe_price_id_member.includes('price_1TGsv'));

    if (hasTestPrices) {
      console.log(`  ⚠️  WARNING: Contains TEST mode price IDs!`);
    }
    console.log('');
  });

  console.log('\n' + '='.repeat(80));
  console.log('🔄 Updating to LIVE mode price IDs...\n');

  let updateCount = 0;
  let errorCount = 0;

  for (const [slug, priceIds] of Object.entries(LIVE_PRICE_IDS)) {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          stripe_price_id_retail: priceIds.retail,
          stripe_price_id_member: priceIds.member,
          stripe_price_id: priceIds.member, // Default to member pricing
        })
        .eq('slug', slug);

      if (error) {
        console.error(`❌ Error updating ${slug}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Updated ${slug}:`);
        console.log(`   Retail: ${priceIds.retail}`);
        console.log(`   Member: ${priceIds.member}`);
        updateCount++;
      }
    } catch (err) {
      console.error(`❌ Error updating ${slug}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Updated ${updateCount} products`);
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} errors occurred`);
  }

  // Verify updates
  console.log('\n🔍 Verifying updates...\n');
  const { data: updatedProducts } = await supabase
    .from('products')
    .select('slug, name, stripe_price_id_retail, stripe_price_id_member')
    .in('slug', ['pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand']);

  updatedProducts.forEach(p => {
    const isLiveRetail = p.stripe_price_id_retail && p.stripe_price_id_retail.startsWith('price_1THm');
    const isLiveMember = p.stripe_price_id_member && p.stripe_price_id_member.startsWith('price_1THm');

    console.log(`${p.name}:`);
    console.log(`  Retail: ${p.stripe_price_id_retail} ${isLiveRetail ? '✅ LIVE' : '❌ TEST'}`);
    console.log(`  Member: ${p.stripe_price_id_member} ${isLiveMember ? '✅ LIVE' : '❌ TEST'}`);
  });

  console.log('\n🎉 Database update complete!\n');
}

updateDatabasePrices().catch(console.error);

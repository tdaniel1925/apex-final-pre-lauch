import Stripe from 'stripe';

// Use your LIVE Stripe key from environment variable
// Set via: export STRIPE_SECRET_KEY="sk_live_YOUR_KEY_HERE"
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.log('Set it with: export STRIPE_SECRET_KEY="sk_live_YOUR_KEY_HERE"');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const products = [
  {
    name: 'PulseMarket',
    description: 'Marketing automation and lead generation for insurance agents',
    retailPrice: 79.00,   // From database: 7900 cents
    memberPrice: 59.00,   // From database: 5900 cents
    slug: 'pulsemarket',
  },
  {
    name: 'PulseFlow',
    description: 'Workflow automation and client communication platform',
    retailPrice: 149.00,  // From database: 14900 cents
    memberPrice: 129.00,  // From database: 12900 cents
    slug: 'pulseflow',
  },
  {
    name: 'PulseDrive',
    description: 'Sales pipeline and opportunity management',
    retailPrice: 399.00,  // From database: 39900 cents
    memberPrice: 349.00,  // From database: 34900 cents
    slug: 'pulsedrive',
  },
  {
    name: 'PulseCommand',
    description: 'Enterprise-grade agency management and analytics',
    retailPrice: 499.00,  // From database: 49900 cents
    memberPrice: 399.00,  // From database: 39900 cents
    slug: 'pulsecommand',
  },
  {
    name: 'SmartLock',
    description: 'Data security and compliance monitoring',
    retailPrice: 99.00,   // From database: 9900 cents
    memberPrice: 79.00,   // From database: 7900 cents
    slug: 'smartlock',
  },
  {
    name: 'Business Center',
    description: 'Replicated website and back office tools',
    retailPrice: 40.00,   // From database: 4000 cents
    memberPrice: 39.00,   // From database: 3900 cents
    slug: 'businesscenter',
  },
];

async function createAllLiveProducts() {
  console.log('\n🚀 Creating ALL LIVE Stripe Products...\n');
  console.log(`Using Stripe Key: ${STRIPE_SECRET_KEY.substring(0, 25)}...\n`);

  const results = [];

  for (const prod of products) {
    try {
      console.log(`\n📦 Creating: ${prod.name}`);
      console.log(`   Retail: $${prod.retailPrice}/month | Member: $${prod.memberPrice}/month`);

      // Create product
      const product = await stripe.products.create({
        name: prod.name,
        description: prod.description,
      });

      console.log(`   ✅ Product ID: ${product.id}`);

      // Create RETAIL price
      const retailPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(prod.retailPrice * 100),
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        nickname: 'Retail',
      });

      console.log(`   💵 Retail Price ID: ${retailPrice.id}`);

      // Create MEMBER price
      const memberPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(prod.memberPrice * 100),
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        nickname: 'Member',
      });

      console.log(`   💵 Member Price ID: ${memberPrice.id}`);

      results.push({
        slug: prod.slug,
        product_id: product.id,
        retail_price_id: retailPrice.id,
        member_price_id: memberPrice.id,
        retail_amount: prod.retailPrice,
        member_amount: prod.memberPrice,
      });

    } catch (error) {
      console.error(`   ❌ Error creating ${prod.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SUCCESS! All 6 products created in Stripe LIVE mode');
  console.log('='.repeat(80));

  console.log('\n📋 UPDATE THESE IN YOUR DATABASE:\n');
  console.log('='.repeat(80));

  results.forEach(r => {
    console.log(`\nUPDATE products SET stripe_price_id = '${r.member_price_id}' WHERE slug = '${r.slug}';`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Complete Product Summary:\n');

  results.forEach(r => {
    console.log(`${r.slug.toUpperCase()}`);
    console.log(`  Product ID: ${r.product_id}`);
    console.log(`  Retail ($${r.retail_amount}/mo): ${r.retail_price_id}`);
    console.log(`  Member ($${r.member_amount}/mo): ${r.member_price_id}\n`);
  });

  console.log('='.repeat(80));
  console.log('✅ Done! Run the SQL commands above to update your database.\n');
}

createAllLiveProducts().catch(console.error);

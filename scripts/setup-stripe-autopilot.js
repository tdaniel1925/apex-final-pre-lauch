const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config({ path: '.env.local' });

async function setupAutopilotProducts() {
  console.log('🔧 Setting up Apex Lead Autopilot Stripe Products...\n');

  const products = [
    {
      name: 'Apex Lead Autopilot - Social Connector',
      description: 'Boost your reach with social media posting and custom event flyers',
      price: 900, // $9.00
      lookupKey: 'autopilot_social_connector',
      envVar: 'STRIPE_AUTOPILOT_SOCIAL_PRICE_ID',
    },
    {
      name: 'Apex Lead Autopilot - Pro',
      description: 'Complete CRM with SMS campaigns and AI-powered lead scoring',
      price: 7900, // $79.00
      lookupKey: 'autopilot_lead_pro',
      envVar: 'STRIPE_AUTOPILOT_PRO_PRICE_ID',
      trialDays: 14,
    },
    {
      name: 'Apex Lead Autopilot - Team Edition',
      description: 'Unlimited everything plus team collaboration and training library',
      price: 11900, // $119.00
      lookupKey: 'autopilot_team_edition',
      envVar: 'STRIPE_AUTOPILOT_TEAM_PRICE_ID',
    },
  ];

  const priceIds = {};

  for (const productData of products) {
    try {
      console.log(`\n📦 Creating: ${productData.name}`);
      console.log(`   Price: $${(productData.price / 100).toFixed(2)}/month`);

      // Create product
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      const priceParams = {
        product: product.id,
        unit_amount: productData.price,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        lookup_key: productData.lookupKey,
      };

      // Add trial period if specified
      if (productData.trialDays) {
        priceParams.recurring.trial_period_days = productData.trialDays;
        console.log(`   🎁 Trial: ${productData.trialDays} days`);
      }

      const price = await stripe.prices.create(priceParams);

      console.log(`   ✅ Price created: ${price.id}`);
      priceIds[productData.envVar] = price.id;

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);

      // If product already exists, try to find it
      if (error.message.includes('already exists')) {
        console.log(`   🔍 Product might already exist, searching...`);
        const existingProducts = await stripe.products.list({ limit: 100 });
        const existing = existingProducts.data.find(p => p.name === productData.name);

        if (existing) {
          console.log(`   ✅ Found existing product: ${existing.id}`);

          // Get the price for this product
          const prices = await stripe.prices.list({ product: existing.id });
          if (prices.data.length > 0) {
            const existingPrice = prices.data[0];
            console.log(`   ✅ Found existing price: ${existingPrice.id}`);
            priceIds[productData.envVar] = existingPrice.id;
          }
        }
      }
    }
  }

  console.log('\n\n✅ All products created!\n');
  console.log('📋 Add these to your .env.local file:\n');
  console.log('# Apex Lead Autopilot Stripe Price IDs');
  for (const [envVar, priceId] of Object.entries(priceIds)) {
    console.log(`${envVar}=${priceId}`);
  }

  console.log('\n\n🔗 Now setting up webhook endpoint...\n');

  // Create webhook endpoint
  try {
    const webhook = await stripe.webhookEndpoints.create({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/stripe-autopilot`,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
    });

    console.log(`✅ Webhook endpoint created: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Secret: ${webhook.secret}`);
    console.log('\n📋 Add this to your .env.local file:\n');
    console.log(`STRIPE_AUTOPILOT_WEBHOOK_SECRET=${webhook.secret}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Webhook endpoint might already exist');
      console.log('   Check Stripe Dashboard → Developers → Webhooks');
    } else {
      console.log(`❌ Webhook error: ${error.message}`);
    }
  }

  console.log('\n\n🎉 Stripe setup complete!\n');

  return priceIds;
}

setupAutopilotProducts().catch(console.error);

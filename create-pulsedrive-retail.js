// Create new PulseDrive retail price at $399/month
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

async function createPulseDriveRetailPrice() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║        CREATING PULSEDRIVE RETAIL PRICE - $399/MONTH              ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get the product (should exist from previous setup)
    const products = await stripe.products.search({
      query: "name:'PulseDrive'",
    });

    let product;
    if (products.data.length === 0) {
      console.log('❌ PulseDrive product not found in Stripe. Creating...');
      product = await stripe.products.create({
        name: 'PulseDrive',
        description: 'Advanced AI marketing automation with podcasts and comprehensive features',
      });
      console.log(`✅ Created product: ${product.id}`);
    } else {
      product = products.data[0];
      console.log(`✅ Found existing product: ${product.id}`);
    }

    // Create the $399/month retail price
    const retailPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 39900, // $399.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'PulseDrive Retail - $399/month',
    });

    console.log('\n✅ SUCCESS! Created PulseDrive Retail Price:');
    console.log(`   Price ID: ${retailPrice.id}`);
    console.log(`   Amount: $${retailPrice.unit_amount / 100}/month`);
    console.log(`   Type: Recurring subscription`);
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                   UPDATED ENVIRONMENT VARIABLES                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    console.log('Add this to Vercel:');
    console.log('');
    console.log(`STRIPE_PULSEDRIVE_RETAIL_PRICE_ID=${retailPrice.id}`);
    console.log('STRIPE_PULSEDRIVE_MEMBER_PRICE_ID=price_1THWPL0UcCrfpyRUxs4VSi1X');
    console.log('');
    console.log('Also update:');
    console.log('STRIPE_PULSECOMMAND_MEMBER_PRICE_ID=price_1THWPM0UcCrfpyRUEklBuWMA');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPulseDriveRetailPrice();

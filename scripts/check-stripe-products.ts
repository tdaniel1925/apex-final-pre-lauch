import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function checkStripeProducts() {
  console.log('🔍 Checking Stripe products...\n');

  try {
    // List all products
    const products = await stripe.products.list({ limit: 100, active: true });

    console.log(`Found ${products.data.length} active products:\n`);

    const pulseProducts = ['pulsemarket', 'pulseflow', 'pulsedrive', 'pulsecommand'];
    const foundProducts: Record<string, any> = {};

    for (const product of products.data) {
      console.log(`📦 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Active: ${product.active}`);

      // Check for Pulse products
      const productNameLower = product.name.toLowerCase().replace(/\s+/g, '');
      if (pulseProducts.some(p => productNameLower.includes(p))) {
        foundProducts[productNameLower] = product;

        // Get prices for this product
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        console.log(`   Prices:`);
        for (const price of prices.data) {
          const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
          console.log(`     - ${price.id}: $${amount}/${price.recurring?.interval || 'one-time'}`);
        }
      }
      console.log('');
    }

    console.log('\n📋 Summary:');
    console.log(`PulseMarket ($59/mo): ${foundProducts['pulsemarket'] ? '✅ Found' : '❌ Not Found'}`);
    console.log(`PulseFlow ($129/mo): ${foundProducts['pulseflow'] ? '✅ Found' : '❌ Not Found'}`);
    console.log(`PulseDrive ($219/mo): ${foundProducts['pulsedrive'] ? '✅ Found' : '❌ Not Found'}`);
    console.log(`PulseCommand ($349/mo): ${foundProducts['pulsecommand'] ? '✅ Found' : '❌ Not Found'}`);

  } catch (error) {
    console.error('❌ Error checking Stripe products:', error);
  }
}

checkStripeProducts();

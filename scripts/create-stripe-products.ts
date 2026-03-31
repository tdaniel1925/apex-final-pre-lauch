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

interface ProductConfig {
  name: string;
  slug: string;
  description: string;
  retailPrice: number; // in cents
  memberPrice: number; // in cents
  bv: number;
}

const products: ProductConfig[] = [
  {
    name: 'PulseMarket',
    slug: 'pulsemarket',
    description: 'Social media automation and content distribution platform',
    retailPrice: 7900, // $79
    memberPrice: 5900, // $59
    bv: 59,
  },
  {
    name: 'PulseFlow',
    slug: 'pulseflow',
    description: 'Advanced workflow automation and CRM integration',
    retailPrice: 14900, // $149
    memberPrice: 12900, // $129
    bv: 129,
  },
  {
    name: 'PulseDrive',
    slug: 'pulsedrive',
    description: 'Complete sales enablement and lead generation suite',
    retailPrice: 29900, // $299
    memberPrice: 25900, // $259
    bv: 259,
  },
  {
    name: 'PulseCommand',
    slug: 'pulsecommand',
    description: 'Enterprise-grade automation and AI-powered business intelligence',
    retailPrice: 49900, // $499
    memberPrice: 42900, // $429
    bv: 429,
  },
];

async function createStripeProducts() {
  console.log('🚀 Creating Stripe products and prices...\n');

  const envUpdates: string[] = [];

  for (const productConfig of products) {
    console.log(`\n📦 Creating ${productConfig.name}...`);

    try {
      // Create the product
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        metadata: {
          slug: productConfig.slug,
          bv: productConfig.bv.toString(),
        },
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create retail price (default)
      const retailPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: productConfig.retailPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          price_type: 'retail',
          bv: productConfig.bv.toString(),
        },
      });

      console.log(`   ✅ Retail price created: ${retailPrice.id} ($${(productConfig.retailPrice / 100).toFixed(2)}/mo)`);

      // Create member price
      const memberPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: productConfig.memberPrice,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          price_type: 'member',
          bv: productConfig.bv.toString(),
        },
      });

      console.log(`   ✅ Member price created: ${memberPrice.id} ($${(productConfig.memberPrice / 100).toFixed(2)}/mo)`);

      // Create promotion code for member pricing
      const coupon = await stripe.coupons.create({
        name: `${productConfig.name} Member Discount`,
        amount_off: productConfig.retailPrice - productConfig.memberPrice,
        currency: 'usd',
        duration: 'forever',
        metadata: {
          product_slug: productConfig.slug,
        },
      });

      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: `${productConfig.slug.toUpperCase()}_MEMBER`,
        metadata: {
          product_slug: productConfig.slug,
        },
      });

      console.log(`   ✅ Promotion code created: ${promotionCode.code} (saves $${((productConfig.retailPrice - productConfig.memberPrice) / 100).toFixed(2)})`);

      // Store env variable updates
      const envVarName = `STRIPE_${productConfig.slug.toUpperCase()}_RETAIL_PRICE_ID`;
      const memberEnvVarName = `STRIPE_${productConfig.slug.toUpperCase()}_MEMBER_PRICE_ID`;
      const promoEnvVarName = `STRIPE_${productConfig.slug.toUpperCase()}_PROMO_CODE`;

      envUpdates.push(`${envVarName}=${retailPrice.id}`);
      envUpdates.push(`${memberEnvVarName}=${memberPrice.id}`);
      envUpdates.push(`${promoEnvVarName}=${promotionCode.code}`);

      console.log(`\n   📝 Add to .env.local:`);
      console.log(`   ${envVarName}=${retailPrice.id}`);
      console.log(`   ${memberEnvVarName}=${memberPrice.id}`);
      console.log(`   ${promoEnvVarName}=${promotionCode.code}`);

    } catch (error: any) {
      console.error(`   ❌ Error creating ${productConfig.name}:`, error.message);
    }
  }

  console.log('\n\n🎉 All products created successfully!\n');
  console.log('📋 Copy these lines to your .env.local file:\n');
  console.log('# Pulse Products Stripe Configuration');
  envUpdates.forEach(line => console.log(line));
}

createStripeProducts();

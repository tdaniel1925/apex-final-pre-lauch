import Stripe from 'stripe';
import 'dotenv/config';

// Use LIVE secret key from environment
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith('sk_live_')) {
  console.error('❌ Error: STRIPE_SECRET_KEY must be a LIVE key (sk_live_...)');
  console.log('Current key:', STRIPE_SECRET_KEY?.substring(0, 10) + '...');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function createLiveWebhook() {
  console.log('\n🔗 Creating Stripe LIVE Webhook Endpoint...\n');

  try {
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://reachtheapex.net/api/webhooks/stripe',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
      description: 'Apex Affinity Live Webhook',
    });

    console.log('✅ Webhook endpoint created successfully!\n');
    console.log('='.repeat(80));
    console.log('\n📋 Webhook Details:\n');
    console.log(`ID: ${webhook.id}`);
    console.log(`URL: ${webhook.url}`);
    console.log(`Status: ${webhook.status}`);
    console.log(`\nEnabled Events:`);
    webhook.enabled_events.forEach(event => console.log(`  - ${event}`));

    console.log('\n' + '='.repeat(80));
    console.log('\n🔐 WEBHOOK SIGNING SECRET:\n');
    console.log(webhook.secret);
    console.log('\n' + '='.repeat(80));

    console.log('\n📝 Add this to your .env.local:\n');
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Done! Remember to restart your dev server after updating .env.local\n');

  } catch (error) {
    console.error('❌ Error creating webhook:', error.message);
    process.exit(1);
  }
}

createLiveWebhook();

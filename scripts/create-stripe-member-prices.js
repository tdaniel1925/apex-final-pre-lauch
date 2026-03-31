const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createMemberPrices() {
  console.log('🔧 Creating Updated Stripe Member Prices\n');

  try {
    // PulseDrive Member Price: $249
    console.log('Creating PulseDrive Member Price ($249)...');
    const pulseDriveMember = await stripe.prices.create({
      unit_amount: 24900, // $249.00
      currency: 'usd',
      product_data: {
        name: 'PulseDrive (Member Price)',
      },
      metadata: {
        price_type: 'member',
        product_slug: 'pulsedrive',
        qv: '249',
        bv: '116.48',
      },
    });
    console.log(`✅ PulseDrive Member: ${pulseDriveMember.id}`);
    console.log(`   Add to .env.local: STRIPE_PULSEDRIVE_MEMBER_PRICE_ID=${pulseDriveMember.id}\n`);

    // PulseCommand Member Price: $399
    console.log('Creating PulseCommand Member Price ($399)...');
    const pulseCommandMember = await stripe.prices.create({
      unit_amount: 39900, // $399.00
      currency: 'usd',
      product_data: {
        name: 'PulseCommand (Member Price)',
      },
      metadata: {
        price_type: 'member',
        product_slug: 'pulsecommand',
        qv: '399',
        bv: '186.62',
      },
    });
    console.log(`✅ PulseCommand Member: ${pulseCommandMember.id}`);
    console.log(`   Add to .env.local: STRIPE_PULSECOMMAND_MEMBER_PRICE_ID=${pulseCommandMember.id}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COPY THESE TO .env.local:\n');
    console.log(`STRIPE_PULSEDRIVE_MEMBER_PRICE_ID=${pulseDriveMember.id}`);
    console.log(`STRIPE_PULSECOMMAND_MEMBER_PRICE_ID=${pulseCommandMember.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Stripe member prices created successfully!');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('   1. Copy the price IDs above to .env.local');
    console.log('   2. Update database products table with new wholesale_price_cents');
    console.log('   3. Test checkout with new member prices');

  } catch (error) {
    console.error('❌ Error creating Stripe prices:', error.message);
    process.exit(1);
  }
}

createMemberPrices();

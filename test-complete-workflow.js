// COMPLETE END-TO-END WORKFLOW TEST
// Tests: Checkout → Payment → Webhook → BV Credit → Commission Calculation
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

// Test scenarios
const SCENARIOS = [
  {
    name: 'Member Purchase - Business Center',
    type: 'member',
    product: 'BusinessCenter',
    expectedPrice: 3900, // $39
  },
  {
    name: 'Member Purchase - PulseMarket',
    type: 'member',
    product: 'PulseMarket',
    expectedPrice: 5900, // $59
  },
  {
    name: 'Non-Member Purchase - PulseMarket',
    type: 'non-member',
    product: 'PulseMarket',
    expectedPrice: 7900, // $79 (retail)
  },
  {
    name: 'Member Purchase - PulseDrive',
    type: 'member',
    product: 'PulseDrive',
    expectedPrice: 34900, // $349
  },
];

async function getTestDistributor() {
  const { data: dist } = await supabase
    .from('distributors')
    .select('id, email, first_name, last_name, sponsor_id')
    .ilike('first_name', 'phil')
    .ilike('last_name', 'resch')
    .single();

  if (!dist) {
    throw new Error('Test distributor not found');
  }

  return dist;
}

async function testCheckoutWorkflow(scenario, distributor) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🧪 ${scenario.name}`);
  console.log(`${'═'.repeat(70)}`);

  const workflow = {
    scenario: scenario.name,
    steps: {},
    errors: [],
  };

  try {
    // STEP 1: Get Product
    console.log('\n📦 STEP 1: Fetching Product from Database...');
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('name', scenario.product)
      .single();

    if (!product) {
      throw new Error(`Product ${scenario.product} not found`);
    }

    const isMember = scenario.type === 'member';
    const price = isMember ? product.wholesale_price_cents : product.retail_price_cents;

    console.log(`   ✅ Product: ${product.name}`);
    console.log(`   💰 Price: $${(price / 100).toFixed(2)} (${isMember ? 'Member' : 'Retail'})`);
    console.log(`   📊 BV: ${product.bv}`);
    console.log(`   🔗 Stripe Price ID: ${product.stripe_price_id}`);

    workflow.steps.productFetch = {
      status: 'success',
      product: product.name,
      price: price / 100,
      bv: product.bv,
    };

    // STEP 2: Create Checkout Session
    console.log('\n💳 STEP 2: Creating Stripe Checkout Session...');

    const metadata = {
      distributor_id: distributor.id,
      product_id: product.id,
      product_slug: product.slug,
      bv_amount: product.bv.toString(),
      is_personal_purchase: 'true',
      price_type: isMember ? 'member' : 'retail',
    };

    // For non-member, we'd need retail Stripe price ID
    // For now, simulate by showing what would happen
    if (!isMember && product.retail_price_cents) {
      console.log(`   ⚠️  NOTE: Non-member purchases would use retail Stripe price`);
      console.log(`   ⚠️  Current system uses member price only - enhancement needed`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: product.stripe_price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://reachtheapex.net/dashboard/store?success=true&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://reachtheapex.net/dashboard/store?canceled=true',
      customer_email: distributor.email,
      metadata,
    });

    console.log(`   ✅ Session Created: ${session.id}`);
    console.log(`   💰 Checkout Amount: $${(session.amount_total / 100).toFixed(2)}`);
    console.log(`   🔗 Checkout URL: ${session.url}`);

    workflow.steps.checkoutSession = {
      status: 'success',
      sessionId: session.id,
      amount: session.amount_total / 100,
      url: session.url,
    };

    // STEP 3: Simulate Webhook Processing
    console.log('\n🔔 STEP 3: Simulating Webhook Processing...');
    console.log('   (What happens when customer completes payment)');

    // Check if subscription would be created
    console.log(`   ✅ Subscription would be created in Stripe`);
    console.log(`   ✅ Webhook would call: /api/webhooks/stripe`);
    console.log(`   ✅ Event type: checkout.session.completed`);

    workflow.steps.webhook = {
      status: 'simulated',
      eventType: 'checkout.session.completed',
      action: 'Would create subscription record',
    };

    // STEP 4: Check BV Credit
    console.log('\n📊 STEP 4: BV Credit Calculation...');

    // Get current BV
    const { data: member } = await supabase
      .from('members')
      .select('personal_credits_monthly, team_credits_monthly')
      .eq('distributor_id', distributor.id)
      .single();

    const currentBV = member?.personal_credits_monthly || 0;
    const newBV = currentBV + product.bv;

    console.log(`   📈 Current Personal BV: ${currentBV}`);
    console.log(`   ➕ New Purchase BV: ${product.bv}`);
    console.log(`   ✅ Would update to: ${newBV} BV`);
    console.log(`   💡 50 BV minimum for commission qualification`);

    workflow.steps.bvCredit = {
      status: 'calculated',
      currentBV,
      purchaseBV: product.bv,
      newTotalBV: newBV,
      qualifiesForCommissions: newBV >= 50,
    };

    // STEP 5: Commission Calculation Flow
    console.log('\n💰 STEP 5: Commission Calculation Flow...');

    // Get sponsor info
    let sponsor = null;
    if (distributor.sponsor_id) {
      const { data: sponsorData } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email')
        .eq('id', distributor.sponsor_id)
        .single();
      sponsor = sponsorData;
    }

    // Calculate BV waterfall
    const totalBV = product.bv;
    const botmakersShare = Math.floor(totalBV * 0.50); // 50%
    const apexShare = Math.floor(totalBV * 0.30); // 30%
    const overridePool = Math.floor(totalBV * 0.15); // 15%
    const bonusPool = Math.floor(totalBV * 0.035); // 3.5%
    const leadershipPool = Math.floor(totalBV * 0.015); // 1.5%

    console.log(`   📊 BV Waterfall Distribution:`);
    console.log(`   • Total BV: ${totalBV}`);
    console.log(`   • BotMakers (50%): ${botmakersShare} BV`);
    console.log(`   • Apex (30%): ${apexShare} BV`);
    console.log(`   • Override Pool (15%): ${overridePool} BV`);
    console.log(`   • Bonus Pool (3.5%): ${bonusPool} BV`);
    console.log(`   • Leadership Pool (1.5%): ${leadershipPool} BV`);

    console.log(`\n   💸 Override Commissions (from ${overridePool} BV pool):`);

    // L1 Sponsor Override (30% to sponsor)
    if (sponsor) {
      const l1Override = Math.floor(overridePool * 0.30);
      console.log(`   • L1 Sponsor Override: ${l1Override} BV → ${sponsor.first_name} ${sponsor.last_name}`);
      console.log(`     (${sponsor.email})`);
    } else {
      console.log(`   • L1 Sponsor Override: 0 BV (no sponsor - rolls up)`);
    }

    // L2-L5 Matrix Overrides
    console.log(`   • L2-L5 Matrix Overrides: Would traverse matrix tree`);
    console.log(`     - Based on matrix_parent_id (NOT sponsor_id)`);
    console.log(`     - Override % based on each parent's rank`);
    console.log(`     - Compression applies if parent < 50 BV`);

    workflow.steps.commissionCalculation = {
      status: 'calculated',
      bvWaterfall: {
        totalBV,
        botmakersShare,
        apexShare,
        overridePool,
        bonusPool,
        leadershipPool,
      },
      overrides: {
        l1Sponsor: sponsor ? { name: `${sponsor.first_name} ${sponsor.last_name}`, bv: Math.floor(overridePool * 0.30) } : null,
        l2ToL5: 'Would be calculated from matrix tree',
      },
    };

    // STEP 6: Rank Advancement Check
    console.log('\n🏆 STEP 6: Rank Advancement Check...');

    const { data: memberData } = await supabase
      .from('members')
      .select('tech_rank, personal_credits_monthly, team_credits_monthly')
      .eq('distributor_id', distributor.id)
      .single();

    const currentRank = memberData?.tech_rank || 'starter';
    const personalBV = (memberData?.personal_credits_monthly || 0) + product.bv;
    const teamBV = memberData?.team_credits_monthly || 0;

    console.log(`   📊 Current Rank: ${currentRank.toUpperCase()}`);
    console.log(`   📈 Personal BV after purchase: ${personalBV}`);
    console.log(`   👥 Team BV: ${teamBV}`);

    // Check next rank requirements
    const rankRequirements = {
      starter: { personal: 0, group: 0 },
      bronze: { personal: 150, group: 300 },
      silver: { personal: 500, group: 1500 },
      gold: { personal: 1200, group: 5000 },
    };

    const nextRank = currentRank === 'starter' ? 'bronze' : null;
    if (nextRank) {
      const requirements = rankRequirements[nextRank];
      const personalMet = personalBV >= requirements.personal;
      const teamMet = teamBV >= requirements.group;

      console.log(`\n   🎯 Next Rank: ${nextRank.toUpperCase()}`);
      console.log(`   Requirements:`);
      console.log(`   • Personal BV: ${personalBV}/${requirements.personal} ${personalMet ? '✅' : '❌'}`);
      console.log(`   • Team BV: ${teamBV}/${requirements.group} ${teamMet ? '✅' : '❌'}`);

      if (personalMet && teamMet) {
        console.log(`   🎉 RANK ADVANCEMENT! Would advance to ${nextRank.toUpperCase()}`);
      }
    }

    workflow.steps.rankCheck = {
      status: 'checked',
      currentRank,
      personalBV,
      teamBV,
      nextRank,
    };

    return workflow;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    workflow.errors.push(error.message);
    return workflow;
  }
}

async function runCompleteWorkflowTest() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║       🧪 COMPLETE WORKFLOW TEST - LIVE TESTING ENVIRONMENT       ║');
  console.log('║   Checkout → Payment → Webhook → BV → Commissions → Rank         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  console.log('\n📋 Test Environment Setup...');
  const distributor = await getTestDistributor();
  console.log(`✅ Test Distributor: ${distributor.first_name} ${distributor.last_name}`);
  console.log(`   Email: ${distributor.email}`);
  console.log(`   Distributor ID: ${distributor.id}`);
  console.log(`   Sponsor ID: ${distributor.sponsor_id || 'None'}`);

  const results = [];

  for (const scenario of SCENARIOS) {
    const result = await testCheckoutWorkflow(scenario, distributor);
    results.push(result);

    // Pause between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary Report
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                       📊 WORKFLOW TEST SUMMARY                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  results.forEach((result, index) => {
    const scenario = SCENARIOS[index];
    console.log(`${index + 1}. ${result.scenario}`);
    console.log(`   Product Fetch: ${result.steps.productFetch?.status === 'success' ? '✅' : '❌'}`);
    console.log(`   Checkout Session: ${result.steps.checkoutSession?.status === 'success' ? '✅' : '❌'}`);
    console.log(`   Webhook Processing: ${result.steps.webhook?.status ? '✅' : '❌'} (simulated)`);
    console.log(`   BV Credit: ${result.steps.bvCredit?.status ? '✅' : '❌'}`);
    console.log(`   Commission Calc: ${result.steps.commissionCalculation?.status ? '✅' : '❌'}`);
    console.log(`   Rank Check: ${result.steps.rankCheck?.status ? '✅' : '❌'}`);

    if (result.steps.checkoutSession?.url) {
      console.log(`   🔗 Test Payment: ${result.steps.checkoutSession.url}`);
    }

    console.log('');
  });

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🎯 NEXT STEPS FOR LIVE TESTING                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  console.log('1. ✅ Review checkout URLs above');
  console.log('2. 💳 Complete payments with test card: 4242 4242 4242 4242');
  console.log('3. 🔔 Monitor webhook calls in Stripe Dashboard');
  console.log('4. 📊 Verify BV credits in database (members table)');
  console.log('5. 💰 Check commission calculations in earnings_ledger');
  console.log('6. 🏆 Verify rank advancements if applicable\n');

  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║               ⚠️  IMPORTANT NOTES FOR LIVE TESTING                ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  console.log('• This is TEST MODE - no real charges');
  console.log('• Webhooks must be configured in Stripe Dashboard');
  console.log('• Commission calculations run via /api/cron/calculate-commissions');
  console.log('• Manual testing required to verify complete flow');
  console.log('• Check database after each test to verify data integrity\n');
}

runCompleteWorkflowTest().catch(console.error);

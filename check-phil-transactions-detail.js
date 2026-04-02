/**
 * Deep dive: Phil Resch's 7 transactions
 * Check if they're retail sales, test data, or what
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigate() {
  console.log('\n🔍 DEEP DIVE: Phil Resch Transactions\n');
  console.log('='.repeat(70));

  // Find Phil Resch
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, slug, first_name, last_name')
    .eq('slug', 'phil-resch')
    .single();

  if (!distributor) {
    console.log('❌ Phil Resch not found');
    return;
  }

  console.log(`\n✅ Found: ${distributor.first_name} ${distributor.last_name}\n`);

  // Get all transactions with full metadata
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  if (!transactions || transactions.length === 0) {
    console.log('❌ No transactions found');
    return;
  }

  console.log(`📊 Found ${transactions.length} transaction(s):\n`);

  let personalSales = 0;
  let retailSales = 0;
  let testSales = 0;

  transactions.forEach((tx, index) => {
    const isRetail = tx.metadata?.is_retail === true;
    const isTest = tx.metadata?.test_transaction === true;

    console.log(`Transaction #${index + 1}:`);
    console.log(`   ID: ${tx.id}`);
    console.log(`   Date: ${new Date(tx.created_at).toLocaleString()}`);
    console.log(`   Product: ${tx.product_slug}`);
    console.log(`   Amount: $${tx.amount}`);
    console.log(`   Type: ${tx.transaction_type}`);
    console.log(`   Metadata:`);
    console.log(`      is_retail: ${isRetail ? '✅ YES' : '❌ NO'}`);
    console.log(`      test_transaction: ${isTest ? '✅ YES' : '❌ NO'}`);
    console.log(`      payment_intent: ${tx.metadata?.payment_intent_id || 'N/A'}`);
    console.log('');

    if (isTest) {
      testSales++;
    } else if (isRetail) {
      retailSales++;
    } else {
      personalSales++;
    }
  });

  console.log('='.repeat(70));
  console.log('\n📊 SUMMARY:\n');
  console.log(`   Total Transactions: ${transactions.length}`);
  console.log(`   Personal Sales: ${personalSales}`);
  console.log(`   Retail Sales: ${retailSales}`);
  console.log(`   Test Sales: ${testSales}`);
  console.log('');

  // Get member PV
  const { data: member } = await supabase
    .from('members')
    .select('personal_credits_monthly, team_credits_monthly')
    .eq('distributor_id', distributor.id)
    .single();

  if (member) {
    console.log(`   Member PV: ${member.personal_credits_monthly}`);
    console.log(`   Member GV: ${member.team_credits_monthly}`);
    console.log('');
  }

  // Check pulsecommand product
  console.log('📦 PulseCommand Product Details:\n');
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'pulsecommand')
    .single();

  if (product) {
    console.log(`   Name: ${product.name}`);
    console.log(`   Wholesale Price: $${product.wholesale_price_cents / 100}`);
    console.log(`   Retail Price: $${product.retail_price_cents / 100}`);
    console.log(`   Active: ${product.is_active}`);
    console.log('');

    // Calculate BV using waterfall
    const { WATERFALL_CONFIG } = await import('./src/lib/compensation/config.js');
    const retailPrice = product.wholesale_price_cents;
    const botmakersFee = Math.round(retailPrice * WATERFALL_CONFIG.BOTMAKERS_FEE_PCT);
    const afterBotmakers = retailPrice - botmakersFee;
    const apexTake = Math.round(afterBotmakers * WATERFALL_CONFIG.APEX_TAKE_PCT);
    const afterApex = afterBotmakers - apexTake;
    const leadershipPool = Math.round(afterApex * WATERFALL_CONFIG.LEADERSHIP_POOL_PCT);
    const afterLeadership = afterApex - leadershipPool;
    const bonusPool = Math.round(afterLeadership * WATERFALL_CONFIG.BONUS_POOL_PCT);
    const bv = afterLeadership - bonusPool;

    console.log(`   Calculated BV: $${(bv / 100).toFixed(2)} (${bv} cents)`);
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('\n🔍 ANALYSIS:\n');

  if (testSales === transactions.length) {
    console.log('⚠️  ALL transactions are TEST DATA');
    console.log('   → These were created during testing/development');
    console.log('   → Should NOT count toward real PV');
    console.log('   → Likely need to be cleaned up or member PV reset');
  } else if (retailSales > 0) {
    console.log(`⚠️  ${retailSales} transactions are RETAIL SALES`);
    console.log('   → Retail sales do NOT contribute to personal PV');
    console.log('   → Only personal purchases count toward PV');
    console.log(`   → ${personalSales} personal sales should contribute to PV`);
  }

  if (member && member.personal_credits_monthly !== transactions.length * (product?.wholesale_price_cents || 0) / 100) {
    console.log('\n⚠️  PV MISMATCH DETECTED:');
    console.log(`   Expected (if all personal): $${transactions.length * (product?.wholesale_price_cents || 0) / 100}`);
    console.log(`   Actual PV: ${member.personal_credits_monthly}`);
    console.log('');
    console.log('   Possible reasons:');
    console.log('   1. Some transactions are retail (don\'t count)');
    console.log('   2. Some transactions are test data');
    console.log('   3. PV was set manually');
    console.log('   4. Transactions were duplicates/errors');
  }

  console.log('\n');
}

investigate();

#!/usr/bin/env tsx

/**
 * Check Compliance Status
 *
 * Utility to quickly check anti-frontloading and 70% retail compliance
 * for a distributor. Useful for verifying integration test results.
 *
 * Usage: npm run check-compliance <distributor-email>
 */

import { createClient } from '@supabase/supabase-js';
import { checkAntiFrontloading, getDistributorPurchaseHistory } from '../src/lib/compliance/anti-frontloading';
import { check70PercentRetail, checkOverrideQualificationWithRetail } from '../src/lib/compliance/retail-validation';

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌ Usage: npm run check-compliance <distributor-email>\n');
    console.error('Example: npm run check-compliance test-rep-001@example.com\n');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log(`\n🔍 Checking compliance for: ${email}\n`);

  // Get distributor
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      status,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        override_qualified
      )
    `)
    .eq('email', email)
    .single();

  if (distError || !distributor) {
    console.error(`❌ Distributor not found: ${email}\n`);
    process.exit(1);
  }

  const member = Array.isArray(distributor.member) ? distributor.member[0] : distributor.member;

  console.log('👤 Distributor Info:');
  console.log(`  Name: ${distributor.first_name} ${distributor.last_name}`);
  console.log(`  Status: ${distributor.status}`);
  console.log(`  Rank: ${member?.tech_rank || 'N/A'}`);
  console.log(`  Personal Credits: ${member?.personal_credits_monthly || 0}`);
  console.log(`  Team Credits: ${member?.team_credits_monthly || 0}`);
  console.log(`  Override Qualified: ${member?.override_qualified ? '✅ Yes' : '❌ No'}`);

  // Check anti-frontloading
  console.log('\n📦 Anti-Frontloading Check:');
  console.log('  (Checking purchase history for this month)');

  const purchaseHistory = await getDistributorPurchaseHistory(distributor.id);

  if (purchaseHistory.length === 0) {
    console.log('  ✅ No self-purchases this month');
  } else {
    console.log(`  Found ${purchaseHistory.length} product(s) purchased:`);
    purchaseHistory.forEach(product => {
      const status = product.purchase_count === 1 ? '✅ Compliant' : '⚠️ Multiple purchases';
      console.log(`    - ${product.product_name}: ${product.purchase_count} purchase(s) ${status}`);
      console.log(`      First: ${new Date(product.first_purchase_date!).toLocaleDateString()}`);
      if (product.purchase_count > 1) {
        console.log(`      ⚠️ Only first purchase counted toward BV (anti-frontloading rule)`);
      }
    });
  }

  // Check 70% retail requirement
  console.log('\n🏪 70% Retail Requirement:');

  const retailCheck = await check70PercentRetail(distributor.id);

  console.log(`  Total BV: $${retailCheck.total_bv.toFixed(2)}`);
  console.log(`  Retail BV: $${retailCheck.retail_bv.toFixed(2)}`);
  console.log(`  Self-Purchase BV: $${retailCheck.self_purchase_bv.toFixed(2)}`);
  console.log(`  Retail %: ${retailCheck.retail_percentage.toFixed(1)}%`);
  console.log(`  Required: ${retailCheck.required_retail_percentage}%`);

  if (retailCheck.compliant) {
    console.log(`  ✅ COMPLIANT (${retailCheck.retail_percentage.toFixed(1)}% ≥ 70%)`);
  } else {
    console.log(`  ❌ NON-COMPLIANT (${retailCheck.retail_percentage.toFixed(1)}% < 70%)`);
    console.log(`  Need $${retailCheck.shortfall_bv.toFixed(2)} more retail BV`);
  }

  // Check override qualification
  console.log('\n💰 Override Qualification:');

  const overrideQual = await checkOverrideQualificationWithRetail(distributor.id);

  console.log(`  BV Check: ${overrideQual.bv_check.passed ? '✅' : '❌'} (${overrideQual.bv_check.bv} BV, need 50)`);
  console.log(`  Retail Check: ${overrideQual.retail_check.passed ? '✅' : '❌'} (${overrideQual.retail_check.percentage.toFixed(1)}%, need 70%)`);

  if (overrideQual.qualified) {
    console.log(`  ✅ QUALIFIED FOR OVERRIDES`);
  } else {
    console.log(`  ❌ NOT QUALIFIED`);
    console.log(`  Reason: ${overrideQual.reason}`);
  }

  // Get orders for this month
  console.log('\n📊 Recent Orders (This Month):');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount_cents,
      total_bv,
      status,
      created_at,
      customer_id
    `)
    .eq('rep_id', distributor.id)
    .gte('created_at', startOfMonth.toISOString())
    .order('created_at', { ascending: false });

  if (orders && orders.length > 0) {
    console.log(`  Found ${orders.length} order(s):`);
    for (const order of orders) {
      const amount = (order.total_amount_cents / 100).toFixed(2);
      const bv = order.total_bv?.toFixed(2) || '0.00';
      const date = new Date(order.created_at).toLocaleDateString();
      const isSelfPurchase = order.customer_id === distributor.id;
      const type = isSelfPurchase ? '(Self)' : '(Retail)';
      console.log(`    - ${date}: $${amount} (${bv} BV) ${type} - ${order.status}`);
    }
  } else {
    console.log('  No orders this month');
  }

  console.log('\n✨ Compliance check complete!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

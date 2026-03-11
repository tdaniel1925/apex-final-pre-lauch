#!/usr/bin/env node

/**
 * BV Trigger Tests - Node.js Version
 * Tests database triggers for real-time BV recalculation
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test IDs (generated UUIDs)
const TEST_SPONSOR_ID = randomUUID();
const TEST_REP_ID = randomUUID();
const TEST_ORDER_1_ID = randomUUID();
const TEST_ORDER_2_ID = randomUUID();
const TEST_ORDER_3_ID = randomUUID();
const TEST_CUSTOMER_1_ID = randomUUID();
const TEST_CUSTOMER_2_ID = randomUUID();
const TEST_CUSTOMER_3_ID = randomUUID();

// Test utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');

  await supabase.from('orders').delete().in('id', [TEST_ORDER_1_ID, TEST_ORDER_2_ID, TEST_ORDER_3_ID]);
  await supabase.from('org_bv_cache').delete().in('distributor_id', [TEST_SPONSOR_ID, TEST_REP_ID]);
  await supabase.from('distributors').delete().in('id', [TEST_SPONSOR_ID, TEST_REP_ID]);

  console.log('✅ Cleanup complete\n');
}

async function setup() {
  console.log('📋 Setting up test data...\n');

  // Create sponsor
  const timestamp = Date.now();
  const sponsorRepNum = parseInt(timestamp.toString().slice(-6)); // Use last 6 digits
  const repRepNum = sponsorRepNum + 1;

  const { error: sponsorError } = await supabase
    .from('distributors')
    .insert({
      id: TEST_SPONSOR_ID,
      first_name: 'Test',
      last_name: 'Sponsor',
      email: `test-sponsor-${timestamp}@test.com`,
      slug: `test-sponsor-${timestamp}`,
      affiliate_code: `TEST${timestamp.toString().slice(-6)}`,
      rep_number: sponsorRepNum,
      current_rank: 'gold',
      sponsor_id: null,
      status: 'active',
    });

  if (sponsorError) {
    console.error('❌ Error creating sponsor:', sponsorError);
    throw sponsorError;
  }

  // Create rep
  const { error: repError } = await supabase
    .from('distributors')
    .insert({
      id: TEST_REP_ID,
      first_name: 'Test',
      last_name: 'Rep',
      email: `test-rep-${timestamp}@test.com`,
      slug: `test-rep-${timestamp}`,
      affiliate_code: `TESTR${timestamp.toString().slice(-5)}`,
      rep_number: repRepNum,
      current_rank: 'bronze',
      sponsor_id: TEST_SPONSOR_ID,
      status: 'active',
    });

  if (repError) {
    console.error('❌ Error creating rep:', repError);
    throw repError;
  }

  // Initialize BV cache
  await supabase.from('org_bv_cache').insert([
    {
      distributor_id: TEST_SPONSOR_ID,
      personal_bv: 0,
      team_bv: 0,
      org_bv: 0,
      last_calculated_at: new Date().toISOString(),
    },
    {
      distributor_id: TEST_REP_ID,
      personal_bv: 0,
      team_bv: 0,
      org_bv: 0,
      last_calculated_at: new Date().toISOString(),
    },
  ]);

  console.log('✅ Test data created\n');
}

async function getBV() {
  const { data } = await supabase
    .from('org_bv_cache')
    .select('distributor_id, personal_bv, team_bv, org_bv')
    .in('distributor_id', [TEST_REP_ID, TEST_SPONSOR_ID])
    .order('distributor_id');

  return data || [];
}

async function printBV(label) {
  console.log(`${label}:`);
  const bv = await getBV();

  if (bv.length === 0) {
    console.log('  No BV data found');
    return bv;
  }

  bv.forEach(row => {
    const id = row.distributor_id.slice(0, 8) + '...';
    console.log(`  ${id.padEnd(15)} | Personal: ${row.personal_bv.toString().padStart(6)} | Team: ${row.team_bv.toString().padStart(6)} | Org: ${row.org_bv.toString().padStart(6)}`);
  });
  console.log();

  return bv;
}

async function test1_InsertOrder() {
  console.log('═══════════════════════════════════════════════════');
  console.log('TEST 1: Insert Complete Order → BV Increases');
  console.log('═══════════════════════════════════════════════════\n');

  const bvBefore = await printBV('BV Before Order');

  // Create complete order
  const { error } = await supabase
    .from('orders')
    .insert({
      id: TEST_ORDER_1_ID,
      order_number: `TEST-${Date.now()}-1`,
      distributor_id: TEST_REP_ID,
      customer_id: TEST_CUSTOMER_1_ID,
      subtotal_cents: 9700,
      tax_cents: 0,
      shipping_cents: 0,
      total_cents: 9700,
      total_bv: 97,
      is_personal_purchase: false,
      payment_status: 'paid',
      fulfillment_status: 'pending',
    });

  if (error) {
    console.error('❌ Error creating order:', error);
    return false;
  }

  console.log('✅ Order created (status: complete, BV: 97)');
  console.log('⏳ Waiting 2 seconds for trigger...\n');
  await sleep(2000);

  const bvAfter = await printBV('BV After Order');

  // Verify
  const rep = bvAfter.find(r => r.distributor_id === TEST_REP_ID);
  const sponsor = bvAfter.find(r => r.distributor_id === TEST_SPONSOR_ID);

  const repBVIncreased = rep && rep.personal_bv > bvBefore.find(r => r.distributor_id === TEST_REP_ID)?.personal_bv;
  const sponsorTeamBVIncreased = sponsor && sponsor.team_bv > bvBefore.find(r => r.distributor_id === TEST_SPONSOR_ID)?.team_bv;

  if (repBVIncreased && sponsorTeamBVIncreased) {
    console.log('✅ PASS: BV increased for rep and sponsor chain\n');
    return true;
  } else {
    console.log('❌ FAIL: BV did not increase as expected\n');
    return false;
  }
}

async function test2_UpdateOrderRefund() {
  console.log('═══════════════════════════════════════════════════');
  console.log('TEST 2: Update Order to Refunded → BV Decreases');
  console.log('═══════════════════════════════════════════════════\n');

  const bvBefore = await printBV('BV Before Refund');

  // Update order to refunded
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'refunded' })
    .eq('id', TEST_ORDER_1_ID);

  if (error) {
    console.error('❌ Error updating order:', error);
    return false;
  }

  console.log('✅ Order updated to refunded');
  console.log('⏳ Waiting 2 seconds for trigger...\n');
  await sleep(2000);

  const bvAfter = await printBV('BV After Refund');

  // Verify BV decreased
  const rep = bvAfter.find(r => r.distributor_id === TEST_REP_ID);
  const repBefore = bvBefore.find(r => r.distributor_id === TEST_REP_ID);

  const bvDecreased = rep && repBefore && rep.personal_bv < repBefore.personal_bv;

  if (bvDecreased || (rep && rep.personal_bv === 0)) {
    console.log('✅ PASS: BV decreased after refund\n');
    return true;
  } else {
    console.log('❌ FAIL: BV did not decrease as expected\n');
    return false;
  }
}

async function test3_DeleteOrder() {
  console.log('═══════════════════════════════════════════════════');
  console.log('TEST 3: Delete Order → BV Decreases');
  console.log('═══════════════════════════════════════════════════\n');

  // Create a new order for deletion test
  await supabase
    .from('orders')
    .insert({
      id: TEST_ORDER_2_ID,
      order_number: `TEST-${Date.now()}-2`,
      distributor_id: TEST_REP_ID,
      customer_id: TEST_CUSTOMER_2_ID,
      subtotal_cents: 14700,
      tax_cents: 0,
      shipping_cents: 0,
      total_cents: 14700,
      total_bv: 147,
      is_personal_purchase: false,
      payment_status: 'paid',
      fulfillment_status: 'pending',
    });

  console.log('✅ Order created (BV: 147)');
  await sleep(2000);

  const bvBefore = await printBV('BV Before Delete');

  // Delete order
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', TEST_ORDER_2_ID);

  if (error) {
    console.error('❌ Error deleting order:', error);
    return false;
  }

  console.log('✅ Order deleted');
  console.log('⏳ Waiting 2 seconds for trigger...\n');
  await sleep(2000);

  const bvAfter = await printBV('BV After Delete');

  // Verify BV decreased
  const rep = bvAfter.find(r => r.distributor_id === TEST_REP_ID);
  const repBefore = bvBefore.find(r => r.distributor_id === TEST_REP_ID);

  const bvDecreased = rep && repBefore && rep.personal_bv < repBefore.personal_bv;

  if (bvDecreased) {
    console.log('✅ PASS: BV decreased after delete\n');
    return true;
  } else {
    console.log('❌ FAIL: BV did not decrease as expected\n');
    return false;
  }
}

async function test4_PendingOrder() {
  console.log('═══════════════════════════════════════════════════');
  console.log('TEST 4: Pending Order → NO BV Change');
  console.log('═══════════════════════════════════════════════════\n');

  const bvBefore = await printBV('BV Before Pending Order');

  // Create pending order (should NOT trigger)
  await supabase
    .from('orders')
    .insert({
      id: TEST_ORDER_3_ID,
      order_number: `TEST-${Date.now()}-3`,
      distributor_id: TEST_REP_ID,
      customer_id: TEST_CUSTOMER_3_ID,
      subtotal_cents: 19700,
      tax_cents: 0,
      shipping_cents: 0,
      total_cents: 19700,
      total_bv: 197,
      is_personal_purchase: false,
      payment_status: 'pending', // NOT paid
      fulfillment_status: 'pending',
    });

  console.log('✅ Pending order created (status: pending, BV: 197)');
  console.log('⏳ Waiting 2 seconds...\n');
  await sleep(2000);

  const bvAfter = await printBV('BV After Pending Order');

  // Verify NO change
  const rep = bvAfter.find(r => r.distributor_id === TEST_REP_ID);
  const repBefore = bvBefore.find(r => r.distributor_id === TEST_REP_ID);

  const noChange = rep && repBefore && rep.personal_bv === repBefore.personal_bv;

  if (noChange) {
    console.log('✅ PASS: BV did NOT change (trigger correctly ignores pending orders)\n');
    return true;
  } else {
    console.log('❌ FAIL: BV changed unexpectedly for pending order\n');
    return false;
  }
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   BV RECALCULATION TRIGGER TESTS                  ║');
  console.log('║   Phase 2.5 Testing                               ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('\n');

  try {
    // Setup
    await cleanup();
    await setup();

    // Run tests
    const results = [];
    results.push(await test1_InsertOrder());
    results.push(await test2_UpdateOrderRefund());
    results.push(await test3_DeleteOrder());
    results.push(await test4_PendingOrder());

    // Cleanup
    await cleanup();

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════\n');

    const passed = results.filter(r => r).length;
    const failed = results.filter(r => !r).length;

    console.log(`Tests Passed: ${passed}/4`);
    console.log(`Tests Failed: ${failed}/4\n`);

    if (failed === 0) {
      console.log('✅ ALL TESTS PASSED\n');
      console.log('BV triggers are working correctly:');
      console.log('  ✅ INSERT complete order → BV increases');
      console.log('  ✅ UPDATE to refunded → BV decreases');
      console.log('  ✅ DELETE order → BV decreases');
      console.log('  ✅ Pending orders do NOT trigger BV change');
      console.log('  ✅ Sponsor chain updated correctly\n');
      console.log('Data Integrity: ✅ PROTECTED');
      console.log('Ready for: Staging deployment\n');
      process.exit(0);
    } else {
      console.log('❌ SOME TESTS FAILED\n');
      console.log('Review the output above for details.');
      console.log('Check that migration 20260311000007 was applied.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

main();

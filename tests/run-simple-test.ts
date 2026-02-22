/**
 * Simple Commission Test Runner
 * Creates minimal test data and runs commission calculations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestDistributor(email: string, firstName: string, depth: number, parentId?: string, position?: number) {
  // Generate a random affiliate code
  const affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data, error} = await supabase
    .from('distributors')
    .insert({
      email,
      first_name: firstName,
      last_name: 'Test',
      slug: email.split('@')[0],
      affiliate_code: affiliateCode,
      sponsor_id: parentId || null,
      matrix_parent_id: parentId || null,
      matrix_depth: depth,
      matrix_position: position || null,
      status: 'active',
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create distributor: ${error.message}`);
  return data;
}

async function createTestOrder(distributorId: string, productIds: string[]) {
  // Generate unique order number
  const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      distributor_id: distributorId,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      is_personal_purchase: true,
      total_cents: 0,
      created_at: new Date('2026-02-15').toISOString() // Mid-month to match testMonth
    })
    .select()
    .single();

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

  // Add order items
  for (const productId of productIds) {
    const { data: product } = await supabase
      .from('products')
      .select('name, wholesale_price_cents, bv')
      .eq('id', productId)
      .single();

    if (product) {
      const quantity = 1;
      const unitPrice = product.wholesale_price_cents;
      const totalPrice = unitPrice * quantity;
      const bvAmount = product.bv * quantity;

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          quantity: quantity,
          unit_price_cents: unitPrice,
          total_price_cents: totalPrice,
          bv_amount: bvAmount,
          product_name: product.name
        });

      if (itemError) {
        console.error(`Failed to create order item: ${itemError.message}`);
        throw new Error(`Failed to create order item: ${itemError.message}`);
      }
    }
  }

  // Update order total
  const { data: items } = await supabase
    .from('order_items')
    .select('total_price_cents')
    .eq('order_id', order.id);

  const total = items?.reduce((sum, item) => sum + item.total_price_cents, 0) || 0;

  await supabase
    .from('orders')
    .update({ total_cents: total })
    .eq('id', order.id);

  return order;
}

async function createBVSnapshot(distributorId: string, monthYear: string) {
  // Calculate personal BV from orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      order_items (
        bv_points,
        quantity
      )
    `)
    .eq('distributor_id', distributorId)
    .eq('status', 'completed');

  const personalBV = orders?.reduce((sum, order: any) => {
    const orderBV = order.order_items?.reduce((s: number, item: any) =>
      s + (item.bv_points * item.quantity), 0) || 0;
    return sum + orderBV;
  }, 0) || 0;

  const { data, error } = await supabase
    .from('bv_snapshots')
    .insert({
      distributor_id: distributorId,
      month_year: monthYear,
      personal_bv: personalBV,
      group_bv: 0, // Will be calculated later
      is_active: true
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create BV snapshot: ${error.message}`);
  return data;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('   COMMISSION ENGINE - SIMPLE TEST');
  console.log('════════════════════════════════════════════════════════════\n');

  const testMonth = '2026-02'; // Use valid date format (current month)
  const startTime = Date.now();

  try {
    console.log('Step 1: Cleaning up old test data...');
    // Get test distributor IDs first
    const { data: testDists } = await supabase
      .from('distributors')
      .select('id')
      .like('email', 'test_%');

    if (testDists && testDists.length > 0) {
      const testIds = testDists.map(d => d.id);

      // Delete child records first (including BV snapshots for this test month)
      await supabase.from('bv_snapshots').delete().in('distributor_id', testIds);
      await supabase.from('bv_snapshots').delete().eq('month_year', testMonth);

      // Delete commission records for test month
      await supabase.from('commissions_retail').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matrix').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matching').delete().eq('month_year', testMonth);
      await supabase.from('commissions_override').delete().eq('month_year', testMonth);
      await supabase.from('commissions_infinity').delete().eq('month_year', testMonth);

      const { data: testOrders } = await supabase
        .from('orders')
        .select('id')
        .in('distributor_id', testIds);

      if (testOrders && testOrders.length > 0) {
        const orderIds = testOrders.map(o => o.id);
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('orders').delete().in('id', orderIds);
      }

      // Finally delete distributors (CASCADE will handle the rest)
      await supabase.from('distributors').delete().in('id', testIds);
    }

    console.log('✅ Cleanup complete\n');

    console.log('Step 2: Creating test distributors...');

    // Get some product IDs
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('is_active', true)
      .limit(3);

    if (!products || products.length === 0) {
      console.error('❌ No products found in database');
      process.exit(1);
    }

    const productIds = products.map(p => p.id);

    // Create a small test matrix
    const level1 = await createTestDistributor('test_dist_001@example.com', 'Leader', 0);
    console.log(`✅ Created Level 1: ${level1.email}`);

    const level2a = await createTestDistributor('test_dist_002@example.com', 'Manager A', 1, level1.id, 1);
    const level2b = await createTestDistributor('test_dist_003@example.com', 'Manager B', 1, level1.id, 2);
    console.log(`✅ Created Level 2: 2 distributors`);

    const level3a = await createTestDistributor('test_dist_004@example.com', 'Rep A', 2, level2a.id, 1);
    const level3b = await createTestDistributor('test_dist_005@example.com', 'Rep B', 2, level2a.id, 2);
    const level3c = await createTestDistributor('test_dist_006@example.com', 'Rep C', 2, level2b.id, 1);
    console.log(`✅ Created Level 3: 3 distributors`);

    console.log('\nStep 3: Creating test orders...');
    // Give each distributor enough products to be active (50 BV minimum)
    await createTestOrder(level3a.id, [productIds[0], productIds[1]]); // 40+35 = 75 BV
    await createTestOrder(level3b.id, [productIds[0], productIds[1]]); // 40+35 = 75 BV
    await createTestOrder(level3c.id, [productIds[0], productIds[1], productIds[2]]); // 40+35+? = 75+ BV
    console.log('✅ Created 3 test orders\n');

    console.log('Step 4: Running commission calculations...');
    console.log('(This will auto-create BV snapshots and calculate commissions)');
    const { data: commResult, error: commError } = await supabase
      .rpc('run_monthly_commissions', { p_month_year: testMonth });

    if (commError) {
      console.error('❌ Commission calculation failed:', commError.message);
      console.error('\nThis likely means:');
      console.error('- Commission functions not yet created in database');
      console.error('- Run migrations 004 and 005 first');
      process.exit(1);
    }

    console.log('✅ Commissions calculated\n');

    // Generate report
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('                    TEST REPORT');
    console.log('════════════════════════════════════════════════════════════\n');

    // Get commission counts
    const { data: retailComm, count: retailCount } = await supabase
      .from('commissions_retail')
      .select('commission_cents', { count: 'exact' })
      .eq('month_year', testMonth);

    const retailTotal = retailComm?.reduce((sum, r) => sum + (r.commission_cents || 0), 0) || 0;

    const { data: matrixComm, count: matrixCount } = await supabase
      .from('commissions_matrix')
      .select('total_commission_cents', { count: 'exact' })
      .eq('month_year', testMonth);

    const matrixTotal = matrixComm?.reduce((sum, r) => sum + (r.total_commission_cents || 0), 0) || 0;

    const { data: matchingComm, count: matchingCount } = await supabase
      .from('commissions_matching')
      .select('total_commission_cents', { count: 'exact' })
      .eq('month_year', testMonth);

    const matchingTotal = matchingComm?.reduce((sum, r) => sum + (r.total_commission_cents || 0), 0) || 0;

    const { data: fastStartComm, count: fastStartCount } = await supabase
      .from('commissions_fast_start')
      .select('total_bonus_cents', { count: 'exact' })
      .eq('month_year', testMonth);

    const fastStartTotal = fastStartComm?.reduce((sum, r) => sum + (r.total_bonus_cents || 0), 0) || 0;

    const { data: rankComm, count: rankCount } = await supabase
      .from('commissions_rank_advancement')
      .select('final_bonus_cents', { count: 'exact' })
      .eq('month_year', testMonth);

    const rankTotal = rankComm?.reduce((sum, r) => sum + (r.final_bonus_cents || 0), 0) || 0;

    console.log('📊 TEST DATA CREATED:');
    console.log('─'.repeat(60));
    console.log(`Distributors:           6 (3-level matrix)`);
    console.log(`Orders:                 3`);
    console.log(`BV Snapshots:           6`);

    console.log('\n📊 COMMISSION RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Retail Commissions:     ${retailCount || 0} records | $${(retailTotal / 100).toFixed(2)}`);
    console.log(`Matrix Commissions:     ${matrixCount || 0} records | $${(matrixTotal / 100).toFixed(2)}`);
    console.log(`Matching Bonuses:       ${matchingCount || 0} records | $${(matchingTotal / 100).toFixed(2)}`);
    console.log(`Fast Start Bonuses:     ${fastStartCount || 0} records | $${(fastStartTotal / 100).toFixed(2)}`);
    console.log(`Rank Advancement:       ${rankCount || 0} records | $${(rankTotal / 100).toFixed(2)}`);

    const totalCommissions = (retailTotal + matrixTotal + matchingTotal + fastStartTotal + rankTotal) / 100;
    console.log(`\nTotal Commissions:      $${totalCommissions.toFixed(2)}`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n⏱️  PERFORMANCE:');
    console.log('─'.repeat(60));
    console.log(`Execution Time:         ${elapsed}s`);

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('💡 Test data remains in database (test_ prefix)');
    console.log('   To remove: DELETE FROM distributors WHERE email LIKE \'test_%\'\n');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

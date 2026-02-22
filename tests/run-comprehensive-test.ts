/**
 * Comprehensive Commission Engine Test
 * Creates realistic multi-level matrix and tests all commission types
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const testMonth = '2026-02';

async function createDistributor(
  firstName: string,
  lastName: string,
  email: string,
  depth: number,
  sponsorId?: string,
  matrixParentId?: string,
  position?: number,
  yearsAgo: number = 1
) {
  const affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data, error } = await supabase
    .from('distributors')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      slug: email.split('@')[0],
      affiliate_code: affiliateCode,
      sponsor_id: sponsorId || null,
      matrix_parent_id: matrixParentId || null,
      matrix_depth: depth,
      matrix_position: position || null,
      status: 'active',
      created_at: new Date(Date.now() - yearsAgo * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create distributor: ${error.message}`);
  return data;
}

async function createCustomer(email: string, referredBy: string) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      email,
      first_name: 'Test',
      last_name: 'Customer',
      referred_by_distributor_id: referredBy
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create customer: ${error.message}`);
  return data;
}

async function promoteDistributor(distributorId: string, rank: string) {
  const { error } = await supabase
    .from('distributors')
    .update({
      current_rank: rank,
      rank_achieved_at: new Date().toISOString()
    })
    .eq('id', distributorId);

  if (error) throw new Error(`Failed to promote distributor: ${error.message}`);
}

async function createOrder(distributorId?: string, customerId?: string, productIds: string[] = [], quantity: number = 1, isRetail: boolean = false) {
  const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      distributor_id: distributorId || null,
      customer_id: customerId || null,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      is_personal_purchase: !isRetail,
      total_cents: 0,
      created_at: new Date('2026-02-15').toISOString()
    })
    .select()
    .single();

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

  // Add order items
  let totalCents = 0;
  for (const productId of productIds) {
    const { data: product } = await supabase
      .from('products')
      .select('name, wholesale_price_cents, retail_price_cents, bv')
      .eq('id', productId)
      .single();

    if (product) {
      const unitPrice = isRetail ? product.retail_price_cents : product.wholesale_price_cents;
      const totalPrice = unitPrice * quantity;
      const bvAmount = product.bv * quantity;
      totalCents += totalPrice;

      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          quantity,
          unit_price_cents: unitPrice,
          total_price_cents: totalPrice,
          bv_amount: bvAmount,
          product_name: product.name
        });
    }
  }

  // Update order total
  await supabase
    .from('orders')
    .update({ total_cents: totalCents })
    .eq('id', order.id);

  return order;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('   COMMISSION ENGINE - COMPREHENSIVE TEST');
  console.log('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // Step 1: Cleanup
    console.log('Step 1: Cleaning up old test data...');
    const { data: oldDists } = await supabase
      .from('distributors')
      .select('id')
      .like('email', 'test_%');

    if (oldDists && oldDists.length > 0) {
      const testIds = oldDists.map(d => d.id);

      // Delete commissions
      await supabase.from('commissions_retail').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matrix').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matching').delete().eq('month_year', testMonth);
      await supabase.from('commissions_override').delete().eq('month_year', testMonth);
      await supabase.from('commissions_infinity').delete().eq('month_year', testMonth);
      await supabase.from('commissions_fast_start').delete().eq('month_year', testMonth);
      await supabase.from('commissions_rank_advancement').delete().eq('month_year', testMonth);

      // Delete BV snapshots
      await supabase.from('bv_snapshots').delete().in('distributor_id', testIds);
      await supabase.from('bv_snapshots').delete().eq('month_year', testMonth);

      // Delete distributor orders
      const { data: orders } = await supabase.from('orders').select('id').in('distributor_id', testIds);
      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('orders').delete().in('id', orderIds);
      }

      // Delete distributors
      await supabase.from('distributors').delete().in('id', testIds);
    }

    // Delete test customers and their orders
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .like('email', 'test_%');

    if (customers && customers.length > 0) {
      const customerIds = customers.map(c => c.id);

      // Delete customer orders
      const { data: custOrders } = await supabase.from('orders').select('id').in('customer_id', customerIds);
      if (custOrders && custOrders.length > 0) {
        const orderIds = custOrders.map(o => o.id);
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('orders').delete().in('id', orderIds);
      }

      // Delete customers
      await supabase.from('customers').delete().in('id', customerIds);
    }

    console.log('✅ Cleanup complete\n');

    // Get products
    console.log('Step 2: Getting products...');
    const { data: products } = await supabase
      .from('products')
      .select('id, name, bv')
      .eq('is_active', true)
      .limit(10);

    if (!products || products.length < 3) {
      throw new Error('Need at least 3 products in database');
    }

    const productIds = products.map(p => p.id);
    console.log(`✅ Found ${products.length} products\n`);

    // Step 3: Create multi-level matrix (30 distributors)
    console.log('Step 3: Creating distributor matrix...');

    // Level 1: Top leader
    const level1 = await createDistributor('Leader', 'Top', 'test_leader@example.com', 0, undefined, undefined, undefined, 3);
    console.log(`✅ Level 1: ${level1.email}`);

    // Level 2: 5 managers under top leader
    const level2 = [];
    for (let i = 1; i <= 5; i++) {
      const dist = await createDistributor(`Manager`, `L2-${i}`, `test_mgr_l2_${i}@example.com`, 1, level1.id, level1.id, i, 2);
      level2.push(dist);
    }
    console.log(`✅ Level 2: ${level2.length} managers`);

    // Level 3: 5 distributors under each Level 2 manager (25 total)
    const level3 = [];
    for (let i = 0; i < level2.length; i++) {
      for (let j = 1; j <= 5; j++) {
        const dist = await createDistributor(`Rep`, `L3-${i+1}-${j}`, `test_rep_l3_${i+1}_${j}@example.com`, 2, level2[i].id, level2[i].id, j, 1);
        level3.push(dist);
      }
    }
    console.log(`✅ Level 3: ${level3.length} representatives`);

    const totalDists = 1 + level2.length + level3.length;
    console.log(`\n✅ Created ${totalDists} distributors total\n`);

    // Step 4: Create orders for active status
    console.log('Step 4: Creating orders (giving everyone 100+ BV)...');
    let orderCount = 0;

    // Give all Level 3 reps 3 products each (100+ BV)
    for (const dist of level3) {
      await createOrder(dist.id, undefined, [productIds[0], productIds[1], productIds[2]], 1, false);
      orderCount++;
    }

    // Give Level 2 managers 2 products each
    for (const dist of level2) {
      await createOrder(dist.id, undefined, [productIds[0], productIds[1]], 1, false);
      orderCount++;
    }

    // Give top leader 3 products
    await createOrder(level1.id, undefined, [productIds[0], productIds[1], productIds[2]], 1, false);
    orderCount++;

    console.log(`[OK] Created ${orderCount} wholesale orders\n`);

    // Step 4.5: Promote some distributors to higher ranks
    console.log('Step 4.5: Promoting distributors to higher ranks...');
    await promoteDistributor(level1.id, 'royal_diamond');
    await promoteDistributor(level2[0].id, 'crown_diamond');
    await promoteDistributor(level2[1].id, 'diamond');
    await promoteDistributor(level2[2].id, 'platinum');
    await promoteDistributor(level2[3].id, 'gold');
    console.log(`[OK] Promoted 5 distributors to higher ranks\n`);

    // Step 4.6: Create retail customers and orders
    console.log('Step 4.6: Creating retail customers and orders...');
    let customerCount = 0;
    let retailOrderCount = 0;

    for (let i = 0; i < 5; i++) {
      const dist = level3[i];
      const customer = await createCustomer(`test_customer_${i}@example.com`, dist.id);
      customerCount++;

      // Create retail order
      await createOrder(undefined, customer.id, [productIds[0], productIds[1]], 1, true);
      retailOrderCount++;
    }

    console.log(`[OK] Created ${customerCount} retail customers`);
    console.log(`[OK] Created ${retailOrderCount} retail orders\n`);

    // Step 5: Run commissions
    console.log('Step 5: Running commission calculations (this may take a moment)...');
    const { data: commResult, error: commError } = await supabase
      .rpc('run_monthly_commissions', { p_month_year: testMonth });

    if (commError) {
      throw new Error(`Commission calculation failed: ${commError.message}`);
    }

    console.log('✅ Commissions calculated\n');

    // Step 6: Generate report
    console.log('Step 6: Generating results...\n');

    const commissionTypes = [
      { table: 'commissions_retail', label: 'Retail Commissions', field: 'commission_amount_cents' },
      { table: 'commissions_matrix', label: 'Matrix Commissions', field: 'total_commission_cents' },
      { table: 'commissions_matching', label: 'Matching Bonuses', field: 'total_commission_cents' },
      { table: 'commissions_override', label: 'Override Bonuses', field: 'total_commission_cents' },
      { table: 'commissions_infinity', label: 'Infinity Bonus', field: 'bonus_cents' },
      { table: 'commissions_fast_start', label: 'Fast Start Bonuses', field: 'total_bonus_cents' },
      { table: 'commissions_rank_advancement', label: 'Rank Advancement', field: 'final_bonus_cents' },
      { table: 'commissions_car', label: 'Car Bonuses', field: 'bonus_cents' },
      { table: 'commissions_vacation', label: 'Vacation Bonuses', field: 'bonus_cents' }
    ];

    let totalCommissions = 0;
    const results = [];

    for (const type of commissionTypes) {
      const { data, count } = await supabase
        .from(type.table)
        .select(type.field, { count: 'exact' })
        .eq('month_year', testMonth);

      const total = data?.reduce((sum, r) => sum + (r[type.field] || 0), 0) || 0;
      totalCommissions += total;

      results.push({
        label: type.label,
        count: count || 0,
        total: total / 100
      });
    }

    // Get total revenue
    const { data: orderData } = await supabase
      .from('orders')
      .select('total_cents')
      .like('order_number', 'TEST-%');

    const totalRevenue = orderData?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;

    // Check BV snapshots
    const { data: bvData } = await supabase
      .from('bv_snapshots')
      .select('personal_bv, group_bv, is_active')
      .eq('month_year', testMonth)
      .order('group_bv', { ascending: false });

    const activeDists = bvData?.filter(b => b.is_active).length || 0;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    // Final Report
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('                 COMPREHENSIVE TEST REPORT');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('📊 TEST DATA:');
    console.log('─'.repeat(60));
    console.log(`Distributors:           ${totalDists} (3-level matrix)`);
    console.log(`Active Distributors:    ${activeDists} (50+ BV)`);
    console.log(`Orders:                 ${orderCount}`);
    console.log(`Test Month:             ${testMonth}`);

    console.log('\n💰 COMMISSION RESULTS:');
    console.log('─'.repeat(60));

    for (const result of results) {
      const label = result.label.padEnd(25);
      const count = String(result.count).padStart(3);
      const amount = `$${result.total.toFixed(2)}`.padStart(12);
      console.log(`${label} ${count} records | ${amount}`);
    }

    console.log('─'.repeat(60));
    console.log(`${'TOTAL COMMISSIONS:'.padEnd(25)} ${' '.repeat(11)} $${(totalCommissions / 100).toFixed(2)}`);

    console.log('\n📈 FINANCIAL HEALTH:');
    console.log('─'.repeat(60));
    console.log(`Total Revenue:          $${(totalRevenue / 100).toFixed(2)}`);
    console.log(`Total Commissions:      $${(totalCommissions / 100).toFixed(2)}`);

    const payoutRatio = totalRevenue > 0 ? (totalCommissions / totalRevenue * 100) : 0;
    console.log(`Payout Ratio:           ${payoutRatio.toFixed(2)}%`);

    let healthStatus = '';
    if (payoutRatio < 45) healthStatus = '✅ EXCELLENT (Under 45%)';
    else if (payoutRatio < 50) healthStatus = '✅ GOOD (45-50%)';
    else if (payoutRatio < 55) healthStatus = '✅ ACCEPTABLE (50-55%)';
    else if (payoutRatio < 60) healthStatus = '⚠️ WARNING (55-60%)';
    else healthStatus = '❌ DANGER (Over 60%)';

    console.log(`Health Status:          ${healthStatus}`);

    console.log('\n⏱️  PERFORMANCE:');
    console.log('─'.repeat(60));
    console.log(`Execution Time:         ${elapsed}s`);

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ COMPREHENSIVE TEST COMPLETED');
    console.log('════════════════════════════════════════════════════════════\n');

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

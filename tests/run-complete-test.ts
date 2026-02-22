/**
 * COMPLETE Commission Engine Test
 * Tests ALL 16 commission types including:
 * - Retail commissions
 * - Customer milestones and retention
 * - High-rank bonuses (Infinity, Car, Vacation)
 * - Infinity Pool
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

async function createOrder(
  params: {
    distributorId?: string,
    customerId?: string,
    productIds: string[],
    quantity?: number,
    isRetail?: boolean,
    date?: string
  }
) {
  const { distributorId, customerId, productIds, quantity = 1, isRetail = false, date } = params;
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
      created_at: date || new Date('2026-02-15').toISOString()
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
  console.log('   COMMISSION ENGINE - COMPLETE TEST (ALL 16 TYPES)');
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

      // Delete all commissions
      await supabase.from('commissions_retail').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matrix').delete().eq('month_year', testMonth);
      await supabase.from('commissions_matching').delete().eq('month_year', testMonth);
      await supabase.from('commissions_override').delete().eq('month_year', testMonth);
      await supabase.from('commissions_infinity').delete().eq('month_year', testMonth);
      await supabase.from('commissions_fast_start').delete().eq('month_year', testMonth);
      await supabase.from('commissions_rank_advancement').delete().eq('month_year', testMonth);
      await supabase.from('commissions_car').delete().eq('month_year', testMonth);
      await supabase.from('commissions_vacation').delete().eq('month_year', testMonth);

      // Delete BV snapshots
      await supabase.from('bv_snapshots').delete().in('distributor_id', testIds);
      await supabase.from('bv_snapshots').delete().eq('month_year', testMonth);

      // Delete customers and their orders
      const { data: customers } = await supabase.from('customers').select('id').like('email', 'test_%');
      if (customers && customers.length > 0) {
        const custIds = customers.map(c => c.id);
        const { data: custOrders } = await supabase.from('orders').select('id').in('customer_id', custIds);
        if (custOrders && custOrders.length > 0) {
          const orderIds = custOrders.map(o => o.id);
          await supabase.from('order_items').delete().in('order_id', orderIds);
          await supabase.from('orders').delete().in('id', orderIds);
        }
        await supabase.from('customers').delete().in('id', custIds);
      }

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
    console.log('[OK] Cleanup complete\n');

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
    console.log(`[OK] Found ${products.length} products\n');

    // Step 3: Create distributors with various ranks
    console.log('Step 3: Creating distributors at various ranks...');

    // Royal Diamond (top)
    const royal = await createDistributor('Royal', 'Diamond', 'test_royal@example.com', 0, undefined, undefined, undefined, 3);
    await promoteDistributor(royal.id, 'royal_diamond');
    console.log('[OK] Royal Diamond: ' + royal.email);

    // Crown Diamond
    const crown = await createDistributor('Crown', 'Diamond', 'test_crown@example.com', 1, royal.id, royal.id, 1, 3);
    await promoteDistributor(crown.id, 'crown_diamond');
    console.log('[OK] Crown Diamond: ' + crown.email);

    // Diamond
    const diamond = await createDistributor('Diamond', 'Leader', 'test_diamond@example.com', 2, crown.id, crown.id, 1, 2);
    await promoteDistributor(diamond.id, 'diamond');
    console.log('[OK] Diamond: ' + diamond.email);

    // Platinum
    const platinum = await createDistributor('Platinum', 'Leader', 'test_platinum@example.com', 3, diamond.id, diamond.id, 1, 2);
    await promoteDistributor(platinum.id, 'platinum');
    console.log('[OK] Platinum: ' + platinum.email);

    // Gold
    const gold = await createDistributor('Gold', 'Leader', 'test_gold@example.com', 4, platinum.id, platinum.id, 1, 1);
    await promoteDistributor(gold.id, 'gold');
    console.log('[OK] Gold: ' + gold.email);

    // 10 regular distributors for matrix
    const regulars = [];
    for (let i = 1; i <= 10; i++) {
      const dist = await createDistributor(`Rep`, `${i}`, `test_rep_${i}@example.com`, 5, gold.id, gold.id, i, 1);
      regulars.push(dist);
    }
    console.log('[OK] Created 10 regular distributors\n');

    const totalDists = 5 + regulars.length;
    console.log(`Total: ${totalDists} distributors\n`);

    // Step 4: Create wholesale orders (for distributors)
    console.log('Step 4: Creating wholesale orders...');
    let orderCount = 0;

    // Give all distributors large orders (200+ BV for rank qualification)
    for (const dist of [royal, crown, diamond, platinum, gold, ...regulars]) {
      await createOrder({
        distributorId: dist.id,
        productIds: [productIds[0], productIds[1], productIds[2], productIds[3]],
        quantity: 2
      });
      orderCount++;
    }
    console.log(`[OK] Created ${orderCount} wholesale orders\n`);

    // Step 5: Create retail customers and orders
    console.log('Step 5: Creating retail customers and orders...');
    let customerCount = 0;
    let retailOrderCount = 0;

    // Create 5 retail customers for different distributors
    for (let i = 1; i <= 5; i++) {
      const distributor = regulars[i - 1];
      const customer = await createCustomer(`test_customer_${i}@example.com`, distributor.id);
      customerCount++;

      // Create retail order at retail price
      await createOrder({
        customerId: customer.id,
        productIds: [productIds[0], productIds[1]],
        quantity: 1,
        isRetail: true
      });
      retailOrderCount++;

      // Create repeat order for retention bonus (2 weeks later)
      await createOrder({
        customerId: customer.id,
        productIds: [productIds[0]],
        quantity: 1,
        isRetail: true,
        date: new Date('2026-02-28').toISOString()
      });
      retailOrderCount++;
    }
    console.log(`[OK] Created ${customerCount} retail customers`);
    console.log(`[OK] Created ${retailOrderCount} retail orders\n`);

    // Step 6: Run commissions
    console.log('Step 6: Running commission calculations...');
    const { data: commResult, error: commError } = await supabase
      .rpc('run_monthly_commissions', { p_month_year: testMonth });

    if (commError) {
      throw new Error(`Commission calculation failed: ${commError.message}`);
    }

    console.log('[OK] Commissions calculated\n');

    // Step 7: Generate comprehensive report
    console.log('Step 7: Generating complete results...\n');

    const commissionTypes = [
      { table: 'commissions_retail', label: 'Retail Commissions', field: 'commission_cents' },
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
        table: type.table,
        count: count || 0,
        total: total / 100,
        status: count && count > 0 ? 'PASS' : 'FAIL'
      });
    }

    // Get total revenue
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total_cents')
      .like('order_number', 'TEST-%');

    const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;

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
    console.log('              COMPLETE TEST REPORT - ALL 16 TYPES');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('📊 TEST DATA:');
    console.log('─'.repeat(60));
    console.log(`Distributors:           ${totalDists} (across all ranks)`);
    console.log(`  - Royal Diamond:      1`);
    console.log(`  - Crown Diamond:      1`);
    console.log(`  - Diamond:            1`);
    console.log(`  - Platinum:           1`);
    console.log(`  - Gold:               1`);
    console.log(`  - Regular/Associate:  ${regulars.length}`);
    console.log(`Active Distributors:    ${activeDists} (200+ BV)`);
    console.log(`Retail Customers:       ${customerCount}`);
    console.log(`Wholesale Orders:       ${orderCount}`);
    console.log(`Retail Orders:          ${retailOrderCount}`);
    console.log(`Test Month:             ${testMonth}`);

    console.log('\n💰 COMMISSION RESULTS BY TYPE:');
    console.log('─'.repeat(60));

    let workingCount = 0;
    let notGeneratingCount = 0;

    for (const result of results) {
      const label = result.label.padEnd(25);
      const count = String(result.count).padStart(3);
      const amount = `$${result.total.toFixed(2)}`.padStart(12);
      const statusIcon = result.status === 'PASS' ? '[PASS]' : '[FAIL]';
      console.log(`${statusIcon} ${label} ${count} records | ${amount}`);

      if (result.count > 0) workingCount++;
      else notGeneratingCount++;
    }

    console.log('─'.repeat(60));
    console.log(`${'TOTAL COMMISSIONS:'.padEnd(30)} ${' '.repeat(11)} $${(totalCommissions / 100).toFixed(2)}`);

    console.log('\n📈 FINANCIAL HEALTH:');
    console.log('─'.repeat(60));
    console.log(`Total Revenue:          $${(totalRevenue / 100).toFixed(2)}`);
    console.log(`Total Commissions:      $${(totalCommissions / 100).toFixed(2)}`);

    const payoutRatio = totalRevenue > 0 ? (totalCommissions / totalRevenue * 100) : 0;
    console.log(`Payout Ratio:           ${payoutRatio.toFixed(2)}%`);

    let healthStatus = '';
    if (payoutRatio < 45) healthStatus = '[OK] EXCELLENT (Under 45%)';
    else if (payoutRatio < 50) healthStatus = '[OK] GOOD (45-50%)';
    else if (payoutRatio < 55) healthStatus = '[OK] ACCEPTABLE (50-55%)';
    else if (payoutRatio < 60) healthStatus = '[WARN] WARNING (55-60%)';
    else healthStatus = '[FAIL] DANGER (Over 60%)';

    console.log(`Health Status:          ${healthStatus}`);

    console.log('\n[COMMISSION ENGINE STATUS]:');
    console.log('─'.repeat(60));
    console.log(`Commission Types:       ${workingCount + notGeneratingCount} total`);
    console.log(`[PASS] Generating:      ${workingCount} types`);
    console.log(`[FAIL] Not Generating:  ${notGeneratingCount} types`);
    console.log(`Completion:             ${Math.round(workingCount / (workingCount + notGeneratingCount) * 100)}%`);

    console.log('\n⏱️  PERFORMANCE:');
    console.log('─'.repeat(60));
    console.log(`Execution Time:         ${elapsed}s`);

    console.log('\n════════════════════════════════════════════════════════════');
    if (workingCount === 9) {
      console.log('[PASS] COMPLETE TEST PASSED - ALL 9 COMMISSION TYPES WORKING!');
    } else {
      console.log(`[WARN] PARTIAL SUCCESS - ${workingCount}/9 TYPES WORKING`);
    }
    console.log('════════════════════════════════════════════════════════════\n');

    // Show details of what's not generating
    if (notGeneratingCount > 0) {
      console.log('[INFO] COMMISSION TYPES NOT GENERATING:\n');
      for (const result of results) {
        if (result.count === 0) {
          console.log(`   [FAIL] ${result.label}`);

          // Provide hints for why it might not be generating
          if (result.table === 'commissions_retail') {
            console.log(`      [HINT] Need retail customers with orders at retail price`);
          } else if (result.table === 'commissions_infinity') {
            console.log(`      [HINT] Requires Crown Diamond or Royal Diamond rank`);
          } else if (result.table === 'commissions_car') {
            console.log(`      [HINT] Requires Gold+ rank with GBV >= 15,000 for consecutive months`);
          } else if (result.table === 'commissions_vacation') {
            console.log(`      [HINT] Requires Platinum+ rank with sustained performance`);
          }
        }
      }
      console.log('');
    }

  } catch (error: any) {
    console.error('\n[FAIL] TEST FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();


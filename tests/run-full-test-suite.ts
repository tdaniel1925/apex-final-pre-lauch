/**
 * Full Commission Engine Test Suite
 * Executes comprehensive tests with 150+ distributors
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const testMonth = '2026-02'; // Use valid test month

async function executeSqlFile(filename: string) {
  const filepath = path.join(__dirname, 'commission-engine', filename);
  console.log(`\n📄 Executing: ${filename}`);
  console.log('═'.repeat(60));

  try {
    // Use supabase db execute to run the SQL file
    const command = `npx supabase db execute < "${filepath}"`;
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Success\n');
  } catch (error: any) {
    console.error(`❌ Error executing ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('   APEX COMMISSION ENGINE - FULL TEST SUITE');
  console.log('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // Step 1: Cleanup old test data first
    console.log('STEP 1/6: Cleaning up old test data...');
    const { data: oldDists } = await supabase
      .from('distributors')
      .select('id')
      .like('email', 'test_%');

    if (oldDists && oldDists.length > 0) {
      const testIds = oldDists.map(d => d.id);

      // Delete all commission records for test month
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

      // Delete orders and items
      const { data: testOrders } = await supabase
        .from('orders')
        .select('id')
        .in('distributor_id', testIds);

      if (testOrders && testOrders.length > 0) {
        const orderIds = testOrders.map(o => o.id);
        await supabase.from('order_items').delete().in('order_id', orderIds);
        await supabase.from('orders').delete().in('id', orderIds);
      }

      // Delete customers
      await supabase.from('customers').delete().like('email', 'test_%');

      // Finally delete distributors
      await supabase.from('distributors').delete().in('id', testIds);

      console.log(`✅ Cleaned up ${oldDists.length} old test distributors\n`);
    } else {
      console.log('✅ No old test data to clean\n');
    }

    // Step 2: Setup test environment (creates helper functions)
    console.log('STEP 2/6: Setting up test environment...');
    await executeSqlFile('00-setup-test-environment.sql');

    // Step 3: Seed distributors (150+ distributors)
    console.log('\nSTEP 3/6: Seeding test distributors (this may take a moment)...');
    await executeSqlFile('01-seed-test-distributors.sql');

    // Verify distributor creation
    const { data: distData, count: distCount } = await supabase
      .from('distributors')
      .select('*', { count: 'exact' })
      .like('email', 'test_%');

    console.log(`✅ Created ${distCount} test distributors`);

    // Step 4: Seed orders
    console.log('\nSTEP 4/6: Seeding test orders and customers...');
    await executeSqlFile('02-seed-test-orders.sql');

    // Verify order creation
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .in('distributor_id', distData?.map(d => d.id) || []);

    console.log(`✅ Created ${orderCount} test orders`);

    // Step 5: Run commission calculations
    console.log('\nSTEP 5/6: Running commission calculations...');
    const { data: commResult, error: commError } = await supabase
      .rpc('run_monthly_commissions', { p_month_year: testMonth });

    if (commError) {
      throw new Error(`Commission calculation failed: ${commError.message}`);
    }

    console.log('✅ Commission calculation completed\n');

    // Step 6: Generate comprehensive report
    console.log('STEP 6/6: Generating results report...');

    // Get all commission types
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
        count: count || 0,
        total: total / 100
      });
    }

    // Calculate revenue
    const { data: orderData } = await supabase
      .from('orders')
      .select('total_cents')
      .in('distributor_id', distData?.map(d => d.id) || []);

    const totalRevenue = orderData?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;

    // Generate final report
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n════════════════════════════════════════════════════════════');
    console.log('                    FULL TEST REPORT');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('📊 TEST DATA CREATED:');
    console.log('─'.repeat(60));
    console.log(`Distributors:           ${distCount} (multi-level matrix)`);
    console.log(`Orders:                 ${orderCount}`);
    console.log(`Test Month:             ${testMonth}`);

    console.log('\n💰 COMMISSION RESULTS:');
    console.log('─'.repeat(60));

    for (const result of results) {
      const label = result.label.padEnd(25);
      const count = String(result.count).padStart(3);
      const amount = `$${result.total.toFixed(2)}`;
      console.log(`${label} ${count} records | ${amount}`);
    }

    console.log('─'.repeat(60));
    console.log(`TOTAL COMMISSIONS:      $${(totalCommissions / 100).toFixed(2)}`);

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
    console.log('✅ FULL TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('💡 Test data remains in database (test_ prefix)');
    console.log('   To remove: DELETE FROM distributors WHERE email LIKE \'test_%\'\n');

  } catch (error: any) {
    console.error('\n❌ TEST SUITE FAILED');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

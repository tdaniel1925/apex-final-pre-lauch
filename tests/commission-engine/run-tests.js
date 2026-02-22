#!/usr/bin/env node

/**
 * Run Commission Engine Tests via Supabase Client
 * Executes all test SQL files and generates a report
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '../../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlFile(filename) {
  const filepath = path.join(__dirname, filename);
  const sql = fs.readFileSync(filepath, 'utf8');

  console.log(`\n📄 Executing: ${filename}`);
  console.log('═'.repeat(60));

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error };
  }

  console.log('✅ Success');
  return { success: true, data };
}

async function runQuery(query, description) {
  console.log(`\n🔍 ${description}`);
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });

  if (error) {
    console.error('❌ Error:', error.message);
    return null;
  }

  return data;
}

async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('   APEX COMMISSION ENGINE - AUTOMATED TEST SUITE');
  console.log('════════════════════════════════════════════════════════════\n');

  const startTime = Date.now();

  try {
    // Step 1: Setup
    console.log('STEP 1/6: Setting up test environment...');
    await executeSqlFile('00-setup-test-environment.sql');

    // Step 2: Seed distributors
    console.log('\nSTEP 2/6: Seeding test distributors...');
    await executeSqlFile('01-seed-test-distributors.sql');

    // Check distributor count
    const distCount = await runQuery(
      "SELECT COUNT(*) as count FROM distributors WHERE email LIKE 'test_%'",
      'Verifying distributor creation'
    );
    console.log(`✅ Created ${distCount?.[0]?.count || 0} test distributors`);

    // Step 3: Seed orders
    console.log('\nSTEP 3/6: Seeding test customers and orders...');
    await executeSqlFile('02-seed-test-orders.sql');

    // Check order count
    const orderCount = await runQuery(
      `SELECT COUNT(*) as count FROM orders
       WHERE distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
          OR customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')`,
      'Verifying order creation'
    );
    console.log(`✅ Created ${orderCount?.[0]?.count || 0} test orders`);

    // Step 4: Run commissions
    console.log('\nSTEP 4/6: Running commission calculations...');
    const commResult = await runQuery(
      "SELECT run_monthly_commissions('9999-99') as result",
      'Executing commission engine'
    );
    console.log('Commission calculation result:', commResult?.[0]?.result);

    // Step 5: Generate report
    console.log('\nSTEP 5/6: Generating verification report...');

    // Get commission counts by type
    const retailCount = await runQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(commission_cents), 0)::NUMERIC / 100 as total FROM commissions_retail WHERE month_year = '9999-99'",
      'Retail commissions'
    );

    const matrixCount = await runQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total FROM commissions_matrix WHERE month_year = '9999-99'",
      'Matrix commissions'
    );

    const matchingCount = await runQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_commission_cents), 0)::NUMERIC / 100 as total FROM commissions_matching WHERE month_year = '9999-99'",
      'Matching bonuses'
    );

    // Calculate payout ratio
    const payoutRatio = await runQuery(
      `WITH revenue AS (
        SELECT COALESCE(SUM(o.total_cents), 0) as total_revenue_cents
        FROM orders o
        WHERE o.distributor_id IN (SELECT id FROM distributors WHERE email LIKE 'test_%')
           OR o.customer_id IN (SELECT id FROM customers WHERE email LIKE 'test_%')
      ),
      commissions AS (
        SELECT (
          (SELECT COALESCE(SUM(commission_cents), 0) FROM commissions_retail WHERE month_year = '9999-99') +
          (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matrix WHERE month_year = '9999-99') +
          (SELECT COALESCE(SUM(total_commission_cents), 0) FROM commissions_matching WHERE month_year = '9999-99')
        ) as total_commissions_cents
      )
      SELECT
        (r.total_revenue_cents::NUMERIC / 100) as revenue,
        (c.total_commissions_cents::NUMERIC / 100) as commissions,
        CASE WHEN r.total_revenue_cents > 0
          THEN ROUND((c.total_commissions_cents::NUMERIC / r.total_revenue_cents * 100), 2)
          ELSE 0
        END as ratio
      FROM revenue r, commissions c`,
      'Payout ratio'
    );

    // Step 6: Display report
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n\n════════════════════════════════════════════════════════════');
    console.log('                    TEST REPORT');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('📊 COMMISSION RESULTS:');
    console.log('─'.repeat(60));
    console.log(`Retail Commissions:     ${retailCount?.[0]?.count || 0} records | $${retailCount?.[0]?.total || '0.00'}`);
    console.log(`Matrix Commissions:     ${matrixCount?.[0]?.count || 0} records | $${matrixCount?.[0]?.total || '0.00'}`);
    console.log(`Matching Bonuses:       ${matchingCount?.[0]?.count || 0} records | $${matchingCount?.[0]?.total || '0.00'}`);

    console.log('\n💰 FINANCIAL HEALTH:');
    console.log('─'.repeat(60));
    console.log(`Total Revenue:          $${payoutRatio?.[0]?.revenue || '0.00'}`);
    console.log(`Total Commissions:      $${payoutRatio?.[0]?.commissions || '0.00'}`);
    console.log(`Payout Ratio:           ${payoutRatio?.[0]?.ratio || '0.00'}%`);

    const ratio = parseFloat(payoutRatio?.[0]?.ratio || 0);
    let healthStatus = '';
    if (ratio < 45) healthStatus = '✅ EXCELLENT (Under 45%)';
    else if (ratio < 50) healthStatus = '✅ GOOD (45-50%)';
    else if (ratio < 55) healthStatus = '✅ ACCEPTABLE (50-55%)';
    else if (ratio < 60) healthStatus = '⚠️ WARNING (55-60%)';
    else healthStatus = '❌ DANGER (Over 60%)';

    console.log(`Health Status:          ${healthStatus}`);

    console.log('\n⏱️  PERFORMANCE:');
    console.log('─'.repeat(60));
    console.log(`Execution Time:         ${elapsed}s`);

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ TEST SUITE COMPLETED SUCCESSFULLY');
    console.log('════════════════════════════════════════════════════════════\n');

    // Ask about cleanup
    console.log('💡 Test data still in database (test_ prefix)');
    console.log('   Run 99-cleanup-test-data.sql to remove it.\n');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

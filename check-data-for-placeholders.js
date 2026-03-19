// Check what data exists to populate placeholder pages
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDataAvailability() {
  console.log('\n🔍 CHECKING DATA AVAILABILITY FOR PLACEHOLDER PAGES\n');
  console.log('='.repeat(70));

  // 1. CHECK COMMISSIONS DATA
  console.log('\n📊 1. COMMISSIONS PAGE DATA:');
  console.log('-'.repeat(70));

  // Check for commission runs
  const { data: commissionRuns, error: runsError } = await supabase
    .from('commission_runs')
    .select('id, period, status, total_commission_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (runsError && !runsError.message.includes('does not exist')) {
    console.log('   ❌ Error querying commission_runs:', runsError.message);
  } else if (runsError) {
    console.log('   ⚠️  Table commission_runs does not exist');
  } else {
    console.log(`   ✅ Commission Runs: ${commissionRuns?.length || 0} found`);
    if (commissionRuns && commissionRuns.length > 0) {
      commissionRuns.forEach(run => {
        console.log(`      - ${run.period}: ${run.status} - $${(run.total_commission_cents / 100).toFixed(2)}`);
      });
    }
  }

  // Check for earnings ledger
  const { data: earnings, error: earningsError } = await supabase
    .from('earnings_ledger')
    .select('member_id, earning_type, amount_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (earningsError && !earningsError.message.includes('does not exist')) {
    console.log('   ❌ Error querying earnings_ledger:', earningsError.message);
  } else if (earningsError) {
    console.log('   ⚠️  Table earnings_ledger does not exist');
  } else {
    console.log(`   ✅ Earnings Records: ${earnings?.length || 0} found`);
    if (earnings && earnings.length > 0) {
      const totalEarnings = earnings.reduce((sum, e) => sum + (e.amount_cents || 0), 0);
      console.log(`      Total in sample: $${(totalEarnings / 100).toFixed(2)}`);
      const types = [...new Set(earnings.map(e => e.earning_type))];
      console.log(`      Earning types: ${types.join(', ')}`);
    }
  }

  // Check payout batches
  const { data: payouts, error: payoutsError } = await supabase
    .from('payout_batches')
    .select('id, period, status, total_amount_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (payoutsError && !payoutsError.message.includes('does not exist')) {
    console.log('   ❌ Error querying payout_batches:', payoutsError.message);
  } else if (payoutsError) {
    console.log('   ⚠️  Table payout_batches does not exist');
  } else {
    console.log(`   ✅ Payout Batches: ${payouts?.length || 0} found`);
    if (payouts && payouts.length > 0) {
      payouts.forEach(batch => {
        console.log(`      - ${batch.period}: ${batch.status} - $${(batch.total_amount_cents / 100).toFixed(2)}`);
      });
    }
  }

  console.log('\n   💡 VERDICT:');
  const hasCommissionData = (commissionRuns && commissionRuns.length > 0) ||
                            (earnings && earnings.length > 0) ||
                            (payouts && payouts.length > 0);
  if (hasCommissionData) {
    console.log('   🟢 BUILD IT - Commission data exists to populate the page');
  } else {
    console.log('   🔴 SKIP IT - No commission data yet, page would be empty');
  }

  // 2. CHECK REPORTS DATA
  console.log('\n\n📈 2. REPORTS PAGE DATA:');
  console.log('-'.repeat(70));

  // Check distributors for signup reports
  const { data: distributors, error: distError } = await supabase
    .from('distributors')
    .select('id, created_at, status')
    .order('created_at', { ascending: false });

  if (distError) {
    console.log('   ❌ Error querying distributors:', distError.message);
  } else {
    console.log(`   ✅ Distributors: ${distributors?.length || 0} total`);

    if (distributors && distributors.length > 0) {
      // Group by month
      const byMonth = {};
      distributors.forEach(d => {
        const month = new Date(d.created_at).toISOString().slice(0, 7);
        byMonth[month] = (byMonth[month] || 0) + 1;
      });
      console.log('      Signups by month:');
      Object.entries(byMonth).sort().forEach(([month, count]) => {
        console.log(`      - ${month}: ${count} signups`);
      });

      // Status breakdown
      const byStatus = {};
      distributors.forEach(d => {
        byStatus[d.status] = (byStatus[d.status] || 0) + 1;
      });
      console.log('      Status breakdown:');
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`      - ${status}: ${count} distributors`);
      });
    }
  }

  // Check sales for sales reports
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('id, total_cents, status, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (salesError && !salesError.message.includes('does not exist')) {
    console.log('   ❌ Error querying sales:', salesError.message);
  } else if (salesError) {
    console.log('   ⚠️  Table sales does not exist');
  } else {
    console.log(`   ✅ Completed Sales: ${sales?.length || 0} found`);
    if (sales && sales.length > 0) {
      const totalSales = sales.reduce((sum, s) => sum + (s.total_cents || 0), 0);
      console.log(`      Total revenue: $${(totalSales / 100).toFixed(2)}`);
    }
  }

  console.log('\n   💡 VERDICT:');
  const hasReportsData = distributors && distributors.length > 0;
  if (hasReportsData) {
    console.log('   🟢 BUILD IT - Signup/distributor data exists for reports');
    console.log('   ℹ️  Can build: Signup reports, Network growth, Status reports');
  } else {
    console.log('   🔴 SKIP IT - No data to report on yet');
  }

  // 3. CHECK ACTIVITY LOG DATA
  console.log('\n\n📝 3. ACTIVITY LOG PAGE DATA:');
  console.log('-'.repeat(70));

  // Check for activity log table
  const { data: activityLog, error: activityError } = await supabase
    .from('activity_log')
    .select('id, user_id, action, details, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (activityError && !activityError.message.includes('does not exist')) {
    console.log('   ❌ Error querying activity_log:', activityError.message);
  } else if (activityError) {
    console.log('   ⚠️  Table activity_log does not exist');
  } else {
    console.log(`   ✅ Activity Logs: ${activityLog?.length || 0} found`);
    if (activityLog && activityLog.length > 0) {
      activityLog.forEach(log => {
        console.log(`      - ${log.action} by ${log.user_id} at ${new Date(log.created_at).toLocaleString()}`);
      });
    }
  }

  // Check for admin_activity_log table
  const { data: adminActivityLog, error: adminActivityError } = await supabase
    .from('admin_activity_log')
    .select('id, admin_id, action, target_type, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (adminActivityError && !adminActivityError.message.includes('does not exist')) {
    console.log('   ❌ Error querying admin_activity_log:', adminActivityError.message);
  } else if (adminActivityError) {
    console.log('   ⚠️  Table admin_activity_log does not exist');
  } else {
    console.log(`   ✅ Admin Activity Logs: ${adminActivityLog?.length || 0} found`);
    if (adminActivityLog && adminActivityLog.length > 0) {
      adminActivityLog.forEach(log => {
        console.log(`      - ${log.action} on ${log.target_type} by ${log.admin_id}`);
      });
    }
  }

  console.log('\n   💡 VERDICT:');
  const hasActivityData = (activityLog && activityLog.length > 0) ||
                          (adminActivityLog && adminActivityLog.length > 0);
  if (hasActivityData) {
    console.log('   🟢 BUILD IT - Activity log data exists');
  } else {
    console.log('   🔴 SKIP IT - No activity log table or data exists');
    console.log('   ℹ️  Would need to create audit system first');
  }

  // 4. CHECK SETTINGS DATA
  console.log('\n\n⚙️  4. SETTINGS PAGE DATA:');
  console.log('-'.repeat(70));

  // Check for settings table
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(10);

  if (settingsError && !settingsError.message.includes('does not exist')) {
    console.log('   ❌ Error querying settings:', settingsError.message);
  } else if (settingsError) {
    console.log('   ⚠️  Table settings does not exist');
  } else {
    console.log(`   ✅ Settings: ${settings?.length || 0} found`);
    if (settings && settings.length > 0) {
      settings.forEach(s => {
        console.log(`      - ${s.key}: ${s.value}`);
      });
    }
  }

  // Check for system_config table
  const { data: systemConfig, error: systemConfigError } = await supabase
    .from('system_config')
    .select('*')
    .limit(10);

  if (systemConfigError && !systemConfigError.message.includes('does not exist')) {
    console.log('   ❌ Error querying system_config:', systemConfigError.message);
  } else if (systemConfigError) {
    console.log('   ⚠️  Table system_config does not exist');
  } else {
    console.log(`   ✅ System Config: ${systemConfig?.length || 0} found`);
  }

  console.log('\n   💡 VERDICT:');
  const hasSettingsData = (settings && settings.length > 0) ||
                          (systemConfig && systemConfig.length > 0);
  if (hasSettingsData) {
    console.log('   🟢 BUILD IT - Settings data exists');
  } else {
    console.log('   🔴 SKIP IT - No settings table exists');
    console.log('   ℹ️  Would need to create schema first (settings table + API)');
  }

  // FINAL SUMMARY
  console.log('\n\n' + '='.repeat(70));
  console.log('📋 FINAL BUILD RECOMMENDATIONS:\n');

  const recommendations = [];

  if (hasCommissionData) {
    recommendations.push('✅ BUILD: Commissions Page (data exists)');
  } else {
    recommendations.push('⏸️  SKIP: Commissions Page (no data yet)');
  }

  if (hasReportsData) {
    recommendations.push('✅ BUILD: Reports Page (distributor data exists)');
  } else {
    recommendations.push('⏸️  SKIP: Reports Page (no data yet)');
  }

  if (hasActivityData) {
    recommendations.push('✅ BUILD: Activity Log Page (data exists)');
  } else {
    recommendations.push('🔨 INFRASTRUCTURE FIRST: Activity Log (create audit system)');
  }

  if (hasSettingsData) {
    recommendations.push('✅ BUILD: Settings Page (data exists)');
  } else {
    recommendations.push('🔨 INFRASTRUCTURE FIRST: Settings Page (create schema)');
  }

  recommendations.forEach(r => console.log(`   ${r}`));

  console.log('\n' + '='.repeat(70));
  console.log('\n');
}

checkDataAvailability().catch(console.error);

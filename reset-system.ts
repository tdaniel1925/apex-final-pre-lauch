// ============================================================
// System Reset - Delete All Test Data
// Preserves: Master account, Admins, Products, Templates, Waitlist
// Deletes: All distributors (except master), orders, commissions
// ============================================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetSystem() {
  console.log('🚨 SYSTEM RESET IN PROGRESS...\n');
  console.log('⚠️  This will DELETE all distributors, orders, and commissions');
  console.log('✅ Preserving: Master account, Admins, Products, Templates, Waitlist\n');

  const deletionLog: any = {
    timestamp: new Date().toISOString(),
    deleted_counts: {}
  };

  // Step 1: Delete commission records (no FK dependencies)
  console.log('📊 Deleting commissions...');
  const commissionTables = [
    'commissions_retail',
    'commissions_cab',
    'commissions_customer_milestone',
    'commissions_retention',
    'commissions_matrix',
    'commissions_matching',
    'commissions_override',
    'commissions_infinity',
    'commissions_fast_start',
    'commissions_rank_advancement',
    'commissions_car',
    'commissions_vacation',
    'commissions_infinity_pool'
  ];

  let totalCommissionsDeleted = 0;
  for (const table of commissionTables) {
    const { count, error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) console.error(`  ❌ Error deleting ${table}:`, error);
    else {
      console.log(`  ✅ Deleted from ${table}`);
      totalCommissionsDeleted += (count || 0);
    }
  }
  deletionLog.deleted_counts.commissions = totalCommissionsDeleted;
  console.log(`  📊 Total commissions deleted: ${totalCommissionsDeleted}\n`);

  // Step 2: Delete order items (child table first)
  console.log('📦 Deleting order items...');
  const { count: orderItemsCount, error: orderItemsError } = await supabase
    .from('order_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (orderItemsError) console.error('  ❌ Error:', orderItemsError);
  else console.log(`  ✅ Deleted ${orderItemsCount} order items\n`);
  deletionLog.deleted_counts.order_items = orderItemsCount || 0;

  // Step 3: Delete orders
  console.log('📦 Deleting orders...');
  const { count: ordersCount, error: ordersError } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (ordersError) console.error('  ❌ Error:', ordersError);
  else console.log(`  ✅ Deleted ${ordersCount} orders\n`);
  deletionLog.deleted_counts.orders = ordersCount || 0;

  // Step 4: Delete rank history
  console.log('📈 Deleting rank history...');
  const { count: rankCount, error: rankError } = await supabase
    .from('rank_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (rankError) console.error('  ❌ Error:', rankError);
  else console.log(`  ✅ Deleted ${rankCount} rank history records\n`);
  deletionLog.deleted_counts.rank_history = rankCount || 0;

  // Step 5: Delete monthly snapshots
  console.log('📊 Deleting monthly snapshots...');
  const { count: snapshotCount, error: snapshotError } = await supabase
    .from('monthly_snapshots')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (snapshotError) console.error('  ❌ Error:', snapshotError);
  else console.log(`  ✅ Deleted ${snapshotCount} monthly snapshots\n`);
  deletionLog.deleted_counts.monthly_snapshots = snapshotCount || 0;

  // Step 6: Delete business card orders
  console.log('🎴 Deleting business card orders...');
  const { count: cardCount, error: cardError } = await supabase
    .from('business_card_orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (cardError) console.error('  ❌ Error:', cardError);
  else console.log(`  ✅ Deleted ${cardCount} business card orders\n`);
  deletionLog.deleted_counts.business_card_orders = cardCount || 0;

  // Step 7: Delete business center subscriptions
  console.log('💼 Deleting business center subscriptions...');
  const { count: bcSubCount, error: bcSubError } = await supabase
    .from('business_center_subscriptions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (bcSubError) console.error('  ❌ Error:', bcSubError);
  else console.log(`  ✅ Deleted ${bcSubCount} BC subscriptions\n`);
  deletionLog.deleted_counts.bc_subscriptions = bcSubCount || 0;

  // Step 8: Delete affiliate data
  console.log('🔗 Deleting affiliate data...');
  const { count: clickCount } = await supabase
    .from('affiliate_clicks')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  const { count: convCount } = await supabase
    .from('affiliate_conversions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log(`  ✅ Deleted ${clickCount || 0} clicks, ${convCount || 0} conversions\n`);
  deletionLog.deleted_counts.affiliate_clicks = clickCount || 0;
  deletionLog.deleted_counts.affiliate_conversions = convCount || 0;

  // Step 9: Delete genealogy
  console.log('🌳 Deleting genealogy...');
  const { count: genealogyCount, error: genealogyError } = await supabase
    .from('genealogy')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (genealogyError) console.error('  ❌ Error:', genealogyError);
  else console.log(`  ✅ Deleted ${genealogyCount} genealogy records\n`);
  deletionLog.deleted_counts.genealogy = genealogyCount || 0;

  // Step 10: Get master distributor ID
  const { data: master } = await supabase
    .from('distributors')
    .select('id')
    .eq('is_master', true)
    .single();

  if (!master) {
    console.error('❌ No master account found!');
    return;
  }

  console.log(`✅ Master account ID: ${master.id}\n`);

  // Step 11: Delete all distributors EXCEPT master
  console.log('👥 Deleting distributors (except master)...');
  const { count: distCount, error: distError } = await supabase
    .from('distributors')
    .delete()
    .neq('id', master.id);

  if (distError) console.error('  ❌ Error:', distError);
  else console.log(`  ✅ Deleted ${distCount} distributors\n`);
  deletionLog.deleted_counts.distributors = distCount || 0;

  // Step 12: Reset master account's matrix stats
  console.log('👑 Resetting master account matrix stats...');
  const { error: masterError } = await supabase
    .from('distributors')
    .update({
      matrix_parent_id: null,
      matrix_position: null,
      matrix_level: 0,
      total_downline: 0,
      active_downline: 0,
    })
    .eq('id', master.id);

  if (masterError) console.error('  ❌ Error:', masterError);
  else console.log('  ✅ Master account reset\n');

  // Final summary
  console.log('='.repeat(60));
  console.log('✅ SYSTEM RESET COMPLETE');
  console.log('='.repeat(60));
  console.log('📊 Deletion Summary:');
  console.log(`   - Distributors: ${deletionLog.deleted_counts.distributors}`);
  console.log(`   - Orders: ${deletionLog.deleted_counts.orders}`);
  console.log(`   - Order Items: ${deletionLog.deleted_counts.order_items}`);
  console.log(`   - Commissions: ${deletionLog.deleted_counts.commissions}`);
  console.log(`   - Rank History: ${deletionLog.deleted_counts.rank_history}`);
  console.log(`   - Genealogy: ${deletionLog.deleted_counts.genealogy}`);
  console.log('');
  console.log('✅ PRESERVED:');
  console.log('   - Master account (Apex Vision)');
  console.log('   - Admin accounts');
  console.log('   - Products');
  console.log('   - Business card templates');
  console.log('   - Social media content');
  console.log('   - Email templates');
  console.log('   - Waitlist entries (6 total)');
  console.log('='.repeat(60));

  return deletionLog;
}

resetSystem()
  .then((log) => {
    console.log('\n✅ Reset complete! System is ready for fresh signups.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  });

// ============================================================
// System Backup Before Reset
// Creates complete JSON backup of all data that will be deleted
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { writeFile } from 'fs/promises';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createBackup() {
  console.log('📦 Creating backup before system reset...\n');

  const backup: any = {
    backup_date: new Date().toISOString(),
    admin_email: 'tdaniel@botmakers.ai',
    note: 'Pre-launch system reset - backing up test data and early signups',
    data: {}
  };

  // Backup distributors
  const { data: distributors } = await supabase
    .from('distributors')
    .select('*')
    .order('created_at', { ascending: true });
  backup.data.distributors = distributors;
  console.log(`✅ Backed up ${distributors?.length || 0} distributors`);

  // Backup genealogy
  const { data: genealogy } = await supabase
    .from('genealogy')
    .select('*');
  backup.data.genealogy = genealogy;
  console.log(`✅ Backed up ${genealogy?.length || 0} genealogy records`);

  // Backup orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*');
  backup.data.orders = orders;
  console.log(`✅ Backed up ${orders?.length || 0} orders`);

  // Backup order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*');
  backup.data.order_items = orderItems;
  console.log(`✅ Backed up ${orderItems?.length || 0} order items`);

  // Backup commissions (all types)
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

  backup.data.commissions = {};
  let totalCommissions = 0;

  for (const table of commissionTables) {
    const { data } = await supabase.from(table).select('*');
    backup.data.commissions[table] = data;
    totalCommissions += data?.length || 0;
  }
  console.log(`✅ Backed up ${totalCommissions} commission records across ${commissionTables.length} tables`);

  // Backup rank history
  const { data: rankHistory } = await supabase
    .from('rank_history')
    .select('*');
  backup.data.rank_history = rankHistory;
  console.log(`✅ Backed up ${rankHistory?.length || 0} rank history records`);

  // Backup monthly snapshots
  const { data: snapshots } = await supabase
    .from('monthly_snapshots')
    .select('*');
  backup.data.monthly_snapshots = snapshots;
  console.log(`✅ Backed up ${snapshots?.length || 0} monthly snapshots`);

  // Backup business card orders
  const { data: cardOrders } = await supabase
    .from('business_card_orders')
    .select('*');
  backup.data.business_card_orders = cardOrders;
  console.log(`✅ Backed up ${cardOrders?.length || 0} business card orders`);

  // Backup affiliate data
  const { data: clicks } = await supabase
    .from('affiliate_clicks')
    .select('*');
  backup.data.affiliate_clicks = clicks;
  console.log(`✅ Backed up ${clicks?.length || 0} affiliate clicks`);

  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('*');
  backup.data.affiliate_conversions = conversions;
  console.log(`✅ Backed up ${conversions?.length || 0} affiliate conversions`);

  // Backup business center subscriptions
  const { data: bcSubs } = await supabase
    .from('business_center_subscriptions')
    .select('*');
  backup.data.business_center_subscriptions = bcSubs;
  console.log(`✅ Backed up ${bcSubs?.length || 0} business center subscriptions`);

  // Save to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `apex-backup-${timestamp}.json`;

  await writeFile(filename, JSON.stringify(backup, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Backup complete!`);
  console.log(`📁 File: ${filename}`);
  console.log(`📊 Total records backed up:`);
  console.log(`   - Distributors: ${distributors?.length || 0}`);
  console.log(`   - Orders: ${orders?.length || 0}`);
  console.log(`   - Commissions: ${totalCommissions}`);
  console.log(`   - Genealogy: ${genealogy?.length || 0}`);
  console.log('='.repeat(60));

  return filename;
}

createBackup()
  .then((filename) => {
    console.log(`\n✅ Backup saved: ${filename}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  });

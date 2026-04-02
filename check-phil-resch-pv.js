/**
 * Quick check: Where did Phil Resch's 499 PV come from?
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('\n🔍 Checking Phil Resch (499 PV source)...\n');

  // Find Phil Resch
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, slug')
    .eq('slug', 'phil-resch')
    .single();

  if (!distributor) {
    console.log('❌ Phil Resch not found');
    return;
  }

  // Check transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  if (!transactions || transactions.length === 0) {
    console.log('❌ No transactions found for Phil Resch');
    console.log('   → 499 PV likely set manually or during import');
  } else {
    console.log(`✅ Found ${transactions.length} transaction(s):`);
    let totalBV = 0;
    transactions.forEach(tx => {
      console.log(`   • ${new Date(tx.created_at).toLocaleDateString()}: ${tx.transaction_type}`);
      console.log(`     Product: ${tx.product_slug || 'N/A'}`);
      console.log(`     Amount: $${tx.amount || 0}`);
      totalBV += tx.amount || 0;
    });
    console.log(`\n   Total transaction value: $${totalBV}`);
    console.log(`   PV on member record: 499`);
  }

  // Check orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('distributor_id', distributor.id);

  if (orders && orders.length > 0) {
    console.log(`\n✅ Found ${orders.length} order(s):`);
    orders.forEach(order => {
      console.log(`   • Order #${order.order_number}: $${(order.total_cents / 100).toFixed(2)}`);
      console.log(`     BV: ${order.total_bv || 0}`);
    });
  }

  console.log('\n');
}

check();

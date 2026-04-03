/**
 * Quick script to check today's sales
 * Run with: node check-sales-today.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTodaysSales() {
  console.log('\n📊 Checking sales for April 3, 2026...\n');

  // Get today's orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      total_amount,
      product_name,
      distributor:distributors (
        first_name,
        last_name,
        email
      )
    `)
    .gte('created_at', '2026-04-03T00:00:00')
    .lt('created_at', '2026-04-04T00:00:00')
    .in('status', ['completed', 'processing', 'pending'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching orders:', error);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('📭 No sales today yet.');
    return;
  }

  console.log(`💰 Total Sales Today: ${orders.length}\n`);

  let totalRevenue = 0;

  orders.forEach((order, index) => {
    const buyer = order.distributor
      ? `${order.distributor.first_name} ${order.distributor.last_name}`
      : 'Guest';
    const time = new Date(order.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    });

    totalRevenue += parseFloat(order.total_amount || 0);

    console.log(`${index + 1}. ${time} - ${buyer}`);
    console.log(`   Product: ${order.product_name}`);
    console.log(`   Amount: $${parseFloat(order.total_amount).toFixed(2)}`);
    console.log(`   Status: ${order.status}`);
    console.log('');
  });

  console.log(`💵 Total Revenue: $${totalRevenue.toFixed(2)}\n`);
}

checkTodaysSales();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n📊 Checking sales for last 7 days...\n');

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .gte('created_at', '2026-03-27T00:00:00')
  .order('created_at', { ascending: false });

if (error) {
  console.log('❌ Error:', error.message);
} else if (!data || data.length === 0) {
  console.log('📭 No sales in the last 7 days.\n');
} else {
  console.log(`💰 Total Sales (Last 7 Days): ${data.length}\n`);
  
  let totalRevenue = 0;
  
  data.forEach((order, i) => {
    const date = new Date(order.created_at);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Chicago'
    });
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    });
    
    const amount = parseFloat(order.amount || order.total || 0);
    totalRevenue += amount;
    
    console.log(`${i+1}. ${dateStr} ${time} - $${amount.toFixed(2)}`);
    if (order.product_name) console.log(`   Product: ${order.product_name}`);
  });
  
  console.log(`\n💵 Total Revenue (7 days): $${totalRevenue.toFixed(2)}\n`);
}

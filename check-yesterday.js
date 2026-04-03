import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n📊 Checking sales for April 2, 2026 (Yesterday)...\n');

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .gte('created_at', '2026-04-02T00:00:00')
  .lt('created_at', '2026-04-03T00:00:00')
  .order('created_at', { ascending: false });

if (error) {
  console.log('❌ Error:', error.message);
} else if (!data || data.length === 0) {
  console.log('📭 No sales yesterday.\n');
} else {
  console.log(`💰 Total Sales Yesterday: ${data.length}\n`);
  
  let totalRevenue = 0;
  
  data.forEach((order, i) => {
    const time = new Date(order.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago'
    });
    
    const amount = parseFloat(order.amount || order.total || 0);
    totalRevenue += amount;
    
    console.log(`${i+1}. ${time} - $${amount.toFixed(2)}`);
    if (order.product_name) console.log(`   Product: ${order.product_name}`);
  });
  
  console.log(`\n💵 Total Revenue Yesterday: $${totalRevenue.toFixed(2)}\n`);
}

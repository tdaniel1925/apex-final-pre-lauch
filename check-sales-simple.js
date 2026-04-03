import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase
  .from('orders')
  .select('*')
  .gte('created_at', '2026-04-03T00:00:00')
  .order('created_at', { ascending: false })
  .limit(10);

if (error) {
  console.log('Error:', error.message);
} else if (!data || data.length === 0) {
  console.log('\n📭 No sales today yet.\n');
} else {
  console.log(`\n💰 Sales today: ${data.length}\n`);
  data.forEach((order, i) => {
    const time = new Date(order.created_at).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    console.log(`${i+1}. ${time} - $${order.amount || order.total || 0}`);
  });
  console.log('');
}

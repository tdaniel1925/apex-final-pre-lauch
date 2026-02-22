import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRetail() {
  // Check customers
  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .like('email', 'test_%');

  console.log('\nRetail Customers:');
  console.table(customers?.map(c => ({
    email: c.email,
    referred_by: c.referred_by_distributor_id?.substring(0, 8)
  })));

  // Check retail orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_id, is_personal_purchase, payment_status, total_cents, created_at')
    .not('customer_id', 'is', null);

  console.log('\nRetail Orders:');
  console.table(orders?.map(o => ({
    customer_id: o.customer_id?.substring(0, 8),
    is_personal: o.is_personal_purchase,
    payment_status: o.payment_status,
    total_cents: o.total_cents,
    month: new Date(o.created_at).toISOString().substring(0, 7)
  })));

  // Check if retail commissions were calculated
  const { data: retailComm, count } = await supabase
    .from('commissions_retail')
    .select('*', { count: 'exact' })
    .eq('month_year', '2026-02');

  console.log('\nRetail Commissions for 2026-02:');
  console.log(`Count: ${count}`);
  if (count && count > 0) {
    console.table(retailComm);
  }
}

checkRetail();

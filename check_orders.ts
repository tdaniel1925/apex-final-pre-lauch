import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkOrders() {
  const { data: distributors } = await supabase
    .from('distributors')
    .select('id, email')
    .like('email', 'test_%');

  console.log('\nTest Distributors:');
  console.table(distributors?.map(d => ({ email: d.email, id: d.id })));

  const { data: orders } = await supabase
    .from('orders')
    .select('id, distributor_id, payment_status, is_personal_purchase, created_at, total_cents')
    .in('distributor_id', distributors?.map(d => d.id) || []);

  console.log('\nOrders:');
  console.table(orders?.map(o => ({
    distributor_id: o.distributor_id,
    payment_status: o.payment_status,
    is_personal_purchase: o.is_personal_purchase,
    created_at: o.created_at,
    total_cents: o.total_cents,
    month: o.created_at ? new Date(o.created_at).toISOString().substring(0, 7) : 'null'
  })));

  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, product_name, quantity, unit_price_cents, total_price_cents, bv_amount')
    .in('order_id', orders?.map(o => o.id) || []);

  console.log('\nOrder Items:');
  console.table(items?.map(i => ({
    order_id: i.order_id?.substring(0, 8),
    product: i.product_name,
    qty: i.quantity,
    unit_price: i.unit_price_cents,
    total_price: i.total_price_cents,
    bv: i.bv_amount
  })));
}

checkOrders();

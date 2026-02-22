import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkBV() {
  const { data } = await supabase
    .from('bv_snapshots')
    .select('*')
    .eq('month_year', '2026-02')
    .order('group_bv', { ascending: false });

  console.log('BV Snapshots for month 2026-02:');
  console.table(data?.map(d => ({
    personal_bv: d.personal_bv,
    group_bv: d.group_bv,
    is_active: d.is_active
  })));

  const { data: orders } = await supabase
    .from('orders')
    .select('total_bv, is_personal_purchase')
    .like('distributor_id', '%');

  console.log('\nOrders:');
  console.table(orders);
}

checkBV();

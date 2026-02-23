// Quick script to check what's in the database before reset
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDatabaseContents() {
  console.log('📊 Checking database contents...\n');

  // Check distributors
  const { data: distributors, count: distCount } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, is_master, created_at', { count: 'exact' });

  console.log(`👥 DISTRIBUTORS (${distCount} total):`);
  distributors?.forEach((d: any) => {
    console.log(`  ${d.is_master ? '👑 MASTER' : '  '} - ${d.first_name} ${d.last_name} (${d.email}) - Created: ${d.created_at}`);
  });

  // Check admins
  const { data: admins, count: adminCount } = await supabase
    .from('admins')
    .select('id, email, role', { count: 'exact' });

  console.log(`\n🔐 ADMINS (${adminCount} total):`);
  admins?.forEach((a: any) => {
    console.log(`  - ${a.email} (${a.role})`);
  });

  // Check orders
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📦 ORDERS: ${orderCount || 0}`);

  // Check waitlist
  const { count: waitlistCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true });

  console.log(`📋 WAITLIST: ${waitlistCount || 0}`);

  // Check commissions (sample one table)
  const { count: commissionCount } = await supabase
    .from('commissions_retail')
    .select('*', { count: 'exact', head: true });

  console.log(`💰 RETAIL COMMISSIONS: ${commissionCount || 0}`);

  // Check business card orders
  const { count: cardOrderCount } = await supabase
    .from('business_card_orders')
    .select('*', { count: 'exact', head: true });

  console.log(`🎴 BUSINESS CARD ORDERS: ${cardOrderCount || 0}`);

  console.log('\n' + '='.repeat(60));
}

checkDatabaseContents()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });

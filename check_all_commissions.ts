import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAllCommissions() {
  const month = '2026-02';

  // Check each commission type
  const tables = [
    'commissions_retail',
    'commissions_matrix',
    'commissions_matching',
    'commissions_override',
    'commissions_infinity',
    'commissions_fast_start',
    'commissions_rank_advancement',
    'commissions_car',
    'commissions_vacation'
  ];

  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .eq('month_year', month);

    console.log(`\n${table}:`);
    if (error) {
      console.log(`  Error: ${error.message}`);
    } else {
      console.log(`  Count: ${count}`);
      if (count && count > 0 && data) {
        console.table(data.slice(0, 5)); // Show first 5 records
      }
    }
  }
}

checkAllCommissions();

// Check if email tables exist
import { createServiceClient } from '../src/lib/supabase/service';

async function checkTables() {
  const supabase = createServiceClient();

  console.log('🔍 Checking if email tables exist...\n');

  // Try to query each table
  const tables = ['email_templates', 'email_campaigns', 'email_sends'];

  for (const table of tables) {
    console.log(`Checking ${table}...`);
    try {
      const { data, error } = await (supabase as any)
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`  ❌ Table does not exist or error: ${error.message}`);
        console.log(`     Code: ${error.code}`);
      } else {
        console.log(`  ✅ Table exists! (${data?.length || 0} rows returned)`);
      }
    } catch (err) {
      console.log(`  ❌ Error querying table:`, err);
    }
    console.log('');
  }
}

checkTables().then(() => {
  console.log('✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

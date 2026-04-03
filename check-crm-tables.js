import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const tables = ['crm_leads', 'crm_contacts', 'crm_tasks', 'crm_activities'];

console.log('\n📊 Checking CRM tables...\n');

for (const table of tables) {
  const { data, error } = await supabase.from(table).select('id').limit(0);
  if (error) {
    console.log(`❌ ${table}: NOT FOUND`);
  } else {
    console.log(`✅ ${table}: EXISTS`);
  }
}

console.log('\n');

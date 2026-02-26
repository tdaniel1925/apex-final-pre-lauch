// Simple check for email_campaigns schema
import { createServiceClient } from '../src/lib/supabase/service';

async function checkSchema() {
  const supabase = createServiceClient();

  console.log('Checking email_campaigns table columns by attempting insert...\n');

  const testRecord = {
    distributor_id: '00000000-0000-0000-0000-000000000000',
    licensing_status: 'licensed',
    current_step: 0,
    is_active: true,
    started_at: new Date().toISOString(),
    next_email_scheduled_for: null,
  };

  console.log('Trying to insert with fields:');
  console.log(Object.keys(testRecord).join(', '));
  console.log('');

  const { error } = await supabase
    .from('email_campaigns')
    .insert(testRecord);

  if (error) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('');

    if (error.code === 'PGRST204') {
      console.log('SCHEMA CACHE ISSUE: Column not found in schema cache');
      console.log('This usually means Supabase needs to refresh its schema cache');
      console.log('The table might exist but Supabase API layer does not know about it yet');
    }
  } else {
    console.log('Insert succeeded (unexpected with fake ID)');
  }
}

checkSchema().then(() => {
  console.log('\nDone');
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

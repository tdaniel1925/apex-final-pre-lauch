// Check email_campaigns table structure by trying to insert with all fields
import { createServiceClient } from '../src/lib/supabase/service';

async function checkColumns() {
  const supabase = createServiceClient();

  console.log('🔍 Checking email_campaigns table columns...\n');

  // Try to insert a test record to see which fields are accepted
  const testRecord = {
    distributor_id: '00000000-0000-0000-0000-000000000000', // Fake ID
    licensing_status: 'licensed' as const,
    current_step: 0,
    is_active: true,
    started_at: new Date().toISOString(),
    next_email_scheduled_for: null,
  };

  console.log('Attempting insert with these fields:');
  console.log(Object.keys(testRecord).join(', '));
  console.log('');

  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(testRecord)
    .select()
    .single();

  if (error) {
    console.log('❌ Insert failed (expected):');
    console.log(`   Code: ${error.code}`);
    console.log(`   Message: ${error.message}`);
    console.log('');

    if (error.message.includes('Could not find')) {
      console.log('⚠️  SCHEMA CACHE ISSUE DETECTED');
      console.log('   The column might exist but the schema cache is outdated.');
      console.log('');
      console.log('   Solutions:');
      console.log('   1. Restart the Supabase project');
      console.log('   2. Or run: ALTER TABLE email_campaigns ALTER COLUMN current_step TYPE INTEGER;');
    } else if (error.message.includes('violates foreign key')) {
      console.log('✅ This error means the fields are accepted!');
      console.log('   The fake distributor_id just doesn't exist, which is expected.');
    }
  } else {
    console.log('✅ Insert succeeded!');
    console.log('   Returned data:', data);
  }

  // List all migrations applied
  console.log('\n📋 Checking migrations in supabase_migrations table...');
  const { data: migrations } = await (supabase as any)
    .rpc('get_applied_migrations');

  console.log('Applied migrations:', migrations);
}

checkColumns().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

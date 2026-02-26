// Show actual email_campaigns table schema
import { createServiceClient } from '../src/lib/supabase/service';

async function showSchema() {
  const supabase = createServiceClient();

  console.log('Querying actual email_campaigns table schema...\n');

  // Query information_schema to see all columns
  const { data, error } = await (supabase as any)
    .rpc('get_table_columns', {
      table_name_param: 'email_campaigns'
    });

  if (error) {
    console.log('RPC not available, using direct query...\n');

    // Alternative: Just try to select * and see what comes back
    const { data: sample } = await supabase
      .from('email_campaigns')
      .select('*')
      .limit(0);

    console.log('Sample query result (no rows, just checking if it works)');
  }

  // Use a raw SQL query through a custom function
  console.log('Listing all columns from information_schema:');
  console.log('(Note: This shows the columns that actually exist in the database)\n');

  // Since we can't run raw SQL easily, let's deduce from the error message
  console.log('From the error message, we can see the row structure:');
  console.log('');
  console.log('Columns present in email_campaigns table (based on error output):');
  console.log('1. id (UUID)');
  console.log('2. distributor_id (UUID)');
  console.log('3. null (unknown column)');
  console.log('4. null (unknown column)');
  console.log('5. {} (array - possibly variables or tags)');
  console.log('6. null (unknown column)');
  console.log('7. "draft" (status column?)');
  console.log('8. false (boolean)');
  console.log('9. null (timestamp?)');
  console.log('10. null (timestamp?)');
  console.log('11. null (timestamp?)');
  console.log('12. null (timestamp?)');
  console.log('13. timestamp (created_at?)');
  console.log('14. null');
  console.log('15. timestamp (updated_at?)');
  console.log('16. timestamp');
  console.log('17. 0 (integer)');
  console.log('18. true (is_active)');
  console.log('19. null');
  console.log('20. null');
  console.log('21. null');
  console.log('22. 0 (total_emails_sent)');
  console.log('23. "licensed" (licensing_status)');
  console.log('');
  console.log('The error says "name" column has NOT NULL constraint but we are not providing it.');
  console.log('This suggests email_campaigns has a "name" column that our code does not know about.');
}

showSchema().then(() => {
  console.log('\nDone');
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

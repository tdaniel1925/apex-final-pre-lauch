// Quick script to check email templates
import { createServiceClient } from '../src/lib/supabase/service';

async function checkTemplates() {
  const client = createServiceClient();

  console.log('Checking email_templates table...\n');

  const { data, error } = await client
    .from('email_templates')
    .select('*')
    .eq('sequence_order', 0)
    .order('licensing_status');

  if (error) {
    console.error('Error fetching templates:', error);
    return;
  }

  console.log('Welcome email templates (sequence_order = 0):');
  console.table(data);

  // Check Sella's licensing status
  const { data: sella, error: sellaError } = await client
    .from('distributors')
    .select('id, first_name, last_name, email, licensing_status')
    .eq('id', '0b72d952-b556-4a09-8f86-7eae0299cfa4')
    .single();

  if (sellaError) {
    console.error('Error fetching Sella:', sellaError);
    return;
  }

  console.log('\nSella\'s data:');
  console.log(sella);

  // Check if matching template exists
  const matchingTemplate = data?.find(
    (t) => t.licensing_status === sella.licensing_status && t.is_active
  );

  if (matchingTemplate) {
    console.log('\n✅ Matching template found:', matchingTemplate.name);
  } else {
    console.log('\n❌ No matching template for licensing_status:', sella.licensing_status);
  }
}

checkTemplates();

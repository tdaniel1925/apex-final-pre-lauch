// Check the actual template format in database
import { createServiceClient } from '../src/lib/supabase/service';

async function checkTemplate() {
  const supabase = createServiceClient();

  console.log('Fetching welcome-licensed template...\n');

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('template_key, template_name, subject, variables_used')
    .eq('template_key', 'welcome-licensed')
    .single();

  if (error || !template) {
    console.error('Error:', error);
    return;
  }

  console.log('Template:', template.template_name);
  console.log('Key:', template.template_key);
  console.log('');
  console.log('Subject:');
  console.log(template.subject);
  console.log('');
  console.log('Variables used:');
  console.log(template.variables_used);
  console.log('');
  console.log('Analysis:');

  if (template.subject.includes('{first_name}')) {
    console.log('✅ Template uses correct format: {first_name}');
  } else if (template.subject.includes('{{first_name}}')) {
    console.log('⚠️  Template uses double braces: {{first_name}}');
    console.log('   Our code expects single braces: {first_name}');
  } else {
    console.log('❌ Template does not use {first_name} format');
    console.log('   Actual subject:', template.subject);
  }
}

checkTemplate().then(() => {
  console.log('\nDone');
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

// Check the welcome email template body for variable issues
import { createServiceClient } from '../src/lib/supabase/service';

async function checkTemplate() {
  const supabase = createServiceClient();

  console.log('🔍 Checking welcome email template body...\n');

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'welcome-licensed')
    .single();

  if (error || !template) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Template:', template.template_name);
  console.log('\n📧 Subject:');
  console.log(template.subject);
  console.log('\n📧 Body (first 2000 chars):');
  console.log(template.body.substring(0, 2000));
  console.log('\n...');

  // Check for variables
  console.log('\n🔍 Variables Found in Body:');
  const bodyVars = template.body.match(/\{[^}]+\}/g) || [];
  const uniqueVars = [...new Set(bodyVars)];

  console.log('Unique variables:', uniqueVars.join(', '));

  // Check for button links
  console.log('\n🔍 Checking for button/link issues...');

  if (template.body.includes('{slug}')) {
    console.log('❌ PROBLEM: Template uses {slug} variable');
    console.log('   We need to add "slug" to TemplateVariables or change template to use full URL');
  }

  if (template.body.includes('href="{') || template.body.includes("href='{")) {
    console.log('❌ PROBLEM: Links may have variable syntax issues');
  }

  // Check variables_used array
  console.log('\n📋 variables_used array:', template.variables_used);
}

checkTemplate().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

// Check the full welcome email template
import { createServiceClient } from '../src/lib/supabase/service';

async function checkTemplate() {
  const supabase = createServiceClient();

  console.log('🔍 Fetching full welcome email template...\n');

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'welcome-licensed')
    .single();

  if (error || !template) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📧 Full Body:\n');
  console.log(template.body);
  console.log('\n---\n');

  // Check for variables
  const bodyVars = template.body.match(/\{[^}]+\}/g) || [];
  const uniqueVars = [...new Set(bodyVars)];

  console.log('🔍 All Variables Found:', uniqueVars.join(', '));
  console.log('\n📋 variables_used array:', template.variables_used);
}

checkTemplate().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

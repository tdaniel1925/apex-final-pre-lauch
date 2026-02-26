// Fix the welcome email template to use proper URL variables
import { createServiceClient } from '../src/lib/supabase/service';

async function fixTemplate() {
  const supabase = createServiceClient();

  console.log('🔧 Fixing welcome email template URLs...\n');

  // Get current template
  const { data: template, error: fetchError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'welcome-licensed')
    .single();

  if (fetchError || !template) {
    console.error('❌ Error fetching template:', fetchError);
    return;
  }

  let updatedBody = template.body;

  // Fix 1: Replace undefined/dashboard with {dashboard_link}
  updatedBody = updatedBody.replace(
    'href="undefined/dashboard"',
    'href="{dashboard_link}"'
  );

  // Fix 2: Replace undefined/{slug} with {referral_link}
  updatedBody = updatedBody.replace(
    'href="undefined/{slug}"',
    'href="{referral_link}"'
  );

  // Fix 3: Replace the text display of the URL
  updatedBody = updatedBody.replace(
    'https://reachtheapex.net/{slug}',
    '{referral_link}'
  );

  // Update variables_used array to include dashboard_link and referral_link
  const updatedVariablesUsed = [
    'first_name',
    'dashboard_link',
    'referral_link',
    'temporary_password_notice'
  ];

  // Update the template
  const { error: updateError } = await supabase
    .from('email_templates')
    .update({
      body: updatedBody,
      variables_used: updatedVariablesUsed,
      updated_at: new Date().toISOString()
    })
    .eq('template_key', 'welcome-licensed');

  if (updateError) {
    console.error('❌ Error updating template:', updateError);
    return;
  }

  console.log('✅ Template fixed!');
  console.log('   - Dashboard button now uses {dashboard_link}');
  console.log('   - Referral link now uses {referral_link}');
  console.log('   - Updated variables_used array');
}

fixTemplate().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

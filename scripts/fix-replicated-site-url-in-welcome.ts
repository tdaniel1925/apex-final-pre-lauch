// Fix replicated site URL in welcome email and add photo instruction
import { createServiceClient } from '../src/lib/supabase/service';

async function fixReplicatedSiteUrl() {
  const supabase = createServiceClient();

  console.log('🔧 Fixing replicated site URL in welcome email...\n');

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

  // Fix 1: Replace the referral_link in the "Your personalized replicated site" section with replicated_site_link
  updatedBody = updatedBody.replace(
    /<p style="margin: 24px 0 0[^>]*>[\s\S]*?Your personalized replicated site:[\s\S]*?<\/p>\s*<p style="margin: 8px 0 0[^>]*>[\s\S]*?<a href="{referral_link}"[^>]*>[\s\S]*?{referral_link}[\s\S]*?<\/a>[\s\S]*?<\/p>/,
    `<p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Your personalized replicated site:
              </p>
              <p style="margin: 8px 0 0; font-size: 16px;">
                <a href="{replicated_site_link}" style="color: #2B4C7E; text-decoration: none; font-weight: bold;">
                  {replicated_site_link}
                </a>
              </p>

              <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                💡 <strong>Pro Tip:</strong> Add your photo and bio in your profile settings to personalize your replicated site and build trust with prospects!
              </p>`
  );

  // Update variables_used array to include replicated_site_link
  const updatedVariablesUsed = [
    'first_name',
    'email',
    'dashboard_link',
    'referral_link',
    'replicated_site_link',
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

  console.log('✅ Template updated!');
  console.log('   - Fixed replicated site URL to use /{slug} format');
  console.log('   - Added pro tip about adding photo to replicated site');
  console.log('   - Updated variables_used array');
}

fixReplicatedSiteUrl().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

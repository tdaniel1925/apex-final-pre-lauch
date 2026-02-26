// Add login credentials section to welcome email template
import { createServiceClient } from '../src/lib/supabase/service';

async function updateTemplate() {
  const supabase = createServiceClient();

  console.log('🔧 Adding login credentials section to welcome email...\n');

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

  // Find the temporary_password_notice placeholder and add login info section after it
  const loginInfoSection = `
              {temporary_password_notice}

              <!-- Login Credentials Box -->
              <div style="margin: 24px 0; padding: 20px; background: #F3F4F6; border-left: 4px solid #2B4C7E; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #2B4C7E; font-size: 14px;">
                  🔑 Your Login Credentials
                </p>
                <p style="margin: 0 0 12px; color: #374151; font-size: 13px;">
                  Use these credentials to access your back office:
                </p>
                <div style="margin: 8px 0;">
                  <p style="margin: 0 0 4px; color: #6B7280; font-size: 12px; font-weight: 600;">
                    Username:
                  </p>
                  <p style="margin: 0 0 12px; font-family: monospace; font-size: 14px; color: #2B4C7E; font-weight: 600;">
                    {email}
                  </p>
                  <p style="margin: 0 0 4px; color: #6B7280; font-size: 12px; font-weight: 600;">
                    Login URL:
                  </p>
                  <p style="margin: 0; font-size: 14px;">
                    <a href="{dashboard_link}" style="color: #2B4C7E; text-decoration: none; font-weight: 600;">
                      {dashboard_link}
                    </a>
                  </p>
                </div>
              </div>`;

  // Replace the temporary_password_notice line with the full section
  updatedBody = updatedBody.replace(
    /\s*{temporary_password_notice}/,
    loginInfoSection
  );

  // Update variables_used to include email
  const updatedVariablesUsed = [
    'first_name',
    'email',
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

  console.log('✅ Template updated!');
  console.log('   - Added login credentials box');
  console.log('   - Shows username (email) and login URL');
  console.log('   - Temporary password notice still shows when applicable');
  console.log('   - Updated variables_used array');
}

updateTemplate().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

// Update welcome email template to include password reset instruction
import { createServiceClient } from '../src/lib/supabase/service';

async function updateTemplate() {
  const supabase = createServiceClient();

  console.log('🔧 Updating welcome email template with password reset instruction...\n');

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

  // Find the login credentials section and add a prominent password reset notice after it
  const passwordResetNotice = `
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
              </div>

              <!-- Password Reset Notice -->
              <div style="margin: 24px 0; padding: 20px; background: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-weight: 700; color: #92400E; font-size: 14px;">
                  ⚠️ Important: Reset Your Password
                </p>
                <p style="margin: 0 0 12px; color: #78350F; font-size: 13px;">
                  For security, please reset your password before logging in.
                </p>
                <p style="margin: 0;">
                  <a href="https://reachtheapex.net/forgot-password" style="color: #92400E; text-decoration: underline; font-weight: 600; font-size: 13px;">
                    Reset your password here →
                  </a>
                </p>
              </div>`;

  // Replace the old login credentials section with the new one including password reset notice
  updatedBody = updatedBody.replace(
    /<!-- Login Credentials Box -->[\s\S]*?<\/div>/,
    passwordResetNotice
  );

  // Update the template
  const { error: updateError } = await supabase
    .from('email_templates')
    .update({
      body: updatedBody,
      updated_at: new Date().toISOString()
    })
    .eq('template_key', 'welcome-licensed');

  if (updateError) {
    console.error('❌ Error updating template:', updateError);
    return;
  }

  console.log('✅ Template updated!');
  console.log('   - Added prominent password reset notice');
  console.log('   - Yellow alert box with link to reset password');
}

updateTemplate().then(() => {
  console.log('\n✅ Done');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

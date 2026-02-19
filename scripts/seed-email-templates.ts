// =============================================
// Seed Email Templates
// Creates welcome email templates for new distributors
// =============================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const emailTemplate = (licensingStatus: 'licensed' | 'non_licensed') => {
  // Use production URL for logo so it displays in emails
  const logoUrl = 'https://reachtheapex.net/apex-logo-email.png';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Apex Affinity Group</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Logo Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
              <img src="${logoUrl}" alt="Apex Affinity Group" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                Welcome to Apex Affinity Group, {{first_name}}!
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We're thrilled to have you join our team! Your journey to building a successful insurance business starts now.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Here's what you can do next:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #555555;">
                <li><strong>Complete Your Profile:</strong> Add your photo and bio to build trust with prospects</li>
                <li><strong>Get Your Replicated Site:</strong> Share your personalized link to start recruiting</li>
                ${licensingStatus === 'licensed'
                  ? '<li><strong>Submit Your License:</strong> Upload your insurance license for verification</li>'
                  : '<li><strong>Start Learning:</strong> Access our training materials to get started</li>'
                }
                <li><strong>Build Your Team:</strong> Invite others and start earning immediately</li>
              </ul>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Your personalized replicated site:
              </p>
              <p style="margin: 8px 0 0; font-size: 16px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/{{slug}}" style="color: #2B4C7E; text-decoration: none; font-weight: bold;">
                  ${process.env.NEXT_PUBLIC_APP_URL || 'https://reachtheapex.net'}/{{slug}}
                </a>
              </p>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                If you have any questions, don't hesitate to reach out to your sponsor or our support team.
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Welcome aboard!<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
              </p>

              <p style="margin: 16px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                You received this email because you created an account with Apex Affinity Group.<br>
                If you believe you received this email in error, please contact us at support@reachtheapex.net
              </p>

              <p style="margin: 12px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Apex Affinity Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

async function seedEmailTemplates() {
  console.log('🌱 Seeding email templates...\n');

  try {
    // Delete existing templates (for clean slate)
    console.log('Deleting existing templates...');
    await supabase.from('email_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create welcome email for LICENSED distributors
    console.log('Creating welcome email template for licensed distributors...');
    const { data: licensedTemplate, error: licensedError } = await supabase
      .from('email_templates')
      .insert({
        template_key: 'welcome-licensed',
        template_name: 'Welcome Email - Licensed',
        description: 'Welcome email sent to newly registered licensed distributors',
        subject: 'Welcome to Apex Affinity Group, {{first_name}}!',
        body: emailTemplate('licensed'),
        licensing_status: 'licensed',
        sequence_order: 0,
        delay_days: 0,
        is_active: true,
        variables_used: ['first_name', 'slug'],
      })
      .select()
      .single();

    if (licensedError) {
      console.error('❌ Error creating licensed template:', licensedError);
      throw licensedError;
    }

    console.log('✅ Licensed welcome template created:', licensedTemplate.id);

    // Create welcome email for NON-LICENSED distributors
    console.log('\nCreating welcome email template for non-licensed distributors...');
    const { data: nonLicensedTemplate, error: nonLicensedError } = await supabase
      .from('email_templates')
      .insert({
        template_key: 'welcome-non-licensed',
        template_name: 'Welcome Email - Non-Licensed',
        description: 'Welcome email sent to newly registered non-licensed distributors',
        subject: 'Welcome to Apex Affinity Group, {{first_name}}!',
        body: emailTemplate('non_licensed'),
        licensing_status: 'non_licensed',
        sequence_order: 0,
        delay_days: 0,
        is_active: true,
        variables_used: ['first_name', 'slug'],
      })
      .select()
      .single();

    if (nonLicensedError) {
      console.error('❌ Error creating non-licensed template:', nonLicensedError);
      throw nonLicensedError;
    }

    console.log('✅ Non-licensed welcome template created:', nonLicensedTemplate.id);

    console.log('\n✨ Email templates seeded successfully!\n');
    console.log('📧 Templates created:');
    console.log(`   - Licensed: ${licensedTemplate.id}`);
    console.log(`   - Non-Licensed: ${nonLicensedTemplate.id}`);
    console.log('\n💡 New signups will now receive welcome emails automatically.');

  } catch (error) {
    console.error('\n❌ Error seeding email templates:', error);
    process.exit(1);
  }
}

seedEmailTemplates();

-- =============================================
-- CREATE EMAIL_TEMPLATES TABLE
-- For signup welcome emails and nurture campaigns
-- =============================================

-- Create the email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  licensing_status TEXT NOT NULL CHECK (licensing_status IN ('licensed', 'non_licensed', 'both')),
  sequence_order INTEGER NOT NULL DEFAULT 0,
  delay_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  variables_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_licensing_status ON email_templates(licensing_status);
CREATE INDEX IF NOT EXISTS idx_email_templates_sequence_order ON email_templates(sequence_order);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to read templates
CREATE POLICY "Service role can read email templates"
  ON email_templates FOR SELECT
  USING (true);

-- Create policy for authenticated users to read templates
CREATE POLICY "Authenticated users can read email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- SEED WELCOME EMAIL TEMPLATES
-- =============================================

-- Welcome email for LICENSED distributors
INSERT INTO email_templates (
  template_key,
  template_name,
  subject,
  body,
  licensing_status,
  sequence_order,
  delay_days,
  is_active,
  variables_used
) VALUES (
  'welcome-licensed',
  'Welcome Email - Licensed',
  'Welcome to Apex Affinity Group, {{first_name}}!',
  '<!DOCTYPE html>
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
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <tr>
            <td style="padding: 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                Welcome to Apex Affinity Group, {{first_name}}!
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We are thrilled to have you join our team! Your journey to building a successful insurance business starts now.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Your sponsor, <strong>{{sponsor_name}}</strong>, is here to support you every step of the way.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Here are your next steps:</strong>
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #555555;">
                <li>Complete your profile and upload your photo</li>
                <li>Submit your insurance license for verification</li>
                <li>Share your personalized replicated site</li>
                <li>Connect with your sponsor for personalized training</li>
                <li>Start building your team and earning commissions</li>
              </ul>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://reachtheapex.net/dashboard" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Your personalized replicated site:</strong>
              </p>
              <p style="margin: 8px 0 0; font-size: 16px;">
                <a href="https://reachtheapex.net/{{slug}}" style="color: #2B4C7E; text-decoration: none; font-weight: bold;">
                  reachtheapex.net/{{slug}}
                </a>
              </p>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                If you have any questions, reach out to your sponsor or contact our support team at support@theapexway.net
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Welcome aboard!<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © 2026 Apex Affinity Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'licensed',
  0,
  0,
  true,
  ARRAY['first_name', 'slug', 'sponsor_name']
);

-- Welcome email for NON-LICENSED distributors
INSERT INTO email_templates (
  template_key,
  template_name,
  subject,
  body,
  licensing_status,
  sequence_order,
  delay_days,
  is_active,
  variables_used
) VALUES (
  'welcome-non-licensed',
  'Welcome Email - Non-Licensed',
  'Welcome to Apex Affinity Group, {{first_name}}!',
  '<!DOCTYPE html>
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
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <tr>
            <td style="padding: 40px; color: #333333;">
              <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: bold; color: #2B4C7E; text-align: center;">
                Welcome to Apex Affinity Group, {{first_name}}!
              </h1>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                We are thrilled to have you join our team! Your journey to building a successful business starts now.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                Your sponsor, <strong>{{sponsor_name}}</strong>, is here to support you every step of the way.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Here are your next steps:</strong>
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #555555;">
                <li>Complete your profile and upload your photo</li>
                <li>Access our comprehensive training materials</li>
                <li>Share your personalized replicated site</li>
                <li>Connect with your sponsor for personalized guidance</li>
                <li>Start building your team and earning commissions</li>
              </ul>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="https://reachtheapex.net/dashboard" style="display: inline-block; padding: 16px 32px; background-color: #2B4C7E; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                      Go to Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                <strong>Your personalized replicated site:</strong>
              </p>
              <p style="margin: 8px 0 0; font-size: 16px;">
                <a href="https://reachtheapex.net/{{slug}}" style="color: #2B4C7E; text-decoration: none; font-weight: bold;">
                  reachtheapex.net/{{slug}}
                </a>
              </p>

              <p style="margin: 32px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                If you have any questions, reach out to your sponsor or contact our support team at support@theapexway.net
              </p>

              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #555555;">
                Welcome aboard!<br>
                <strong>The Apex Affinity Group Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #6b7280; text-align: center;">
                <strong>Apex Affinity Group</strong><br>
                1600 Highway 6 Ste 400<br>
                Sugar Land, TX 77478
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; line-height: 1.5; color: #9ca3af; text-align: center;">
                © 2026 Apex Affinity Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'non_licensed',
  0,
  0,
  true,
  ARRAY['first_name', 'slug', 'sponsor_name']
);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE email_templates IS 'Email templates for signup welcome emails and nurture campaigns';

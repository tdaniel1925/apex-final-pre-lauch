-- =============================================
-- Fix email template variable format
-- Change from {{variable}} to {variable}
-- =============================================

-- Fix welcome-licensed template
UPDATE email_templates
SET
  subject = REPLACE(REPLACE(subject, '{{', '{'), '}}', '}'),
  body = REPLACE(REPLACE(body, '{{', '{'), '}}', '}')
WHERE template_key = 'welcome-licensed';

-- Fix welcome-non_licensed template if it exists
UPDATE email_templates
SET
  subject = REPLACE(REPLACE(subject, '{{', '{'), '}}', '}'),
  body = REPLACE(REPLACE(body, '{{', '{'), '}}', '}')
WHERE template_key = 'welcome-non_licensed';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

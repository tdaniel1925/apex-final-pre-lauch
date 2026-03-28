// =============================================
// Email Template Wrapper
// Wrap all emails with consistent Apex branding
// =============================================

import fs from 'fs';
import path from 'path';

/**
 * Wrap email content with Apex base template
 * @param emailContent - HTML content to wrap
 * @param emailTitle - Email title for <title> tag
 * @param unsubscribeUrl - Optional unsubscribe URL
 * @returns Complete HTML email with Apex branding
 */
export function wrapEmailTemplate(
  emailContent: string,
  emailTitle: string,
  unsubscribeUrl: string = '#'
): string {
  // Load base template
  const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email.html');
  let baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

  // Replace placeholders
  baseTemplate = baseTemplate.replace('{{EMAIL_TITLE}}', emailTitle);
  baseTemplate = baseTemplate.replace('{{EMAIL_CONTENT}}', emailContent);
  baseTemplate = baseTemplate.replace('{{unsubscribe_url}}', unsubscribeUrl);

  return baseTemplate;
}

/**
 * IMPORTANT: All system emails MUST use this wrapper
 *
 * Usage:
 * ```typescript
 * const emailHtml = wrapEmailTemplate(
 *   '<p>Your content here...</p>',
 *   'Email Subject',
 *   'https://reachtheapex.net/unsubscribe?token=xxx'
 * );
 *
 * await resend.emails.send({
 *   from: 'Apex <notifications@reachtheapex.net>',
 *   to: 'user@example.com',
 *   subject: 'Email Subject',
 *   html: emailHtml,
 * });
 * ```
 */

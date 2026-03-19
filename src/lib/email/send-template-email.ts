import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailVariables {
  [key: string]: string;
}

interface SendTemplateEmailOptions {
  to: string | string[];
  subject: string;
  templateName: string; // e.g., 'phone-number-request'
  variables: EmailVariables;
  from?: string;
}

/**
 * Send an email using the base template system
 *
 * MANDATORY RULES:
 * 1. ALWAYS use @theapexway.net domain
 * 2. ALWAYS use base-email-template.html as wrapper
 * 3. ALWAYS check result.error before logging success
 * 4. ALWAYS access result.data.id (NOT result.id)
 */
export async function sendTemplateEmail(options: SendTemplateEmailOptions) {
  const {
    to,
    subject,
    templateName,
    variables,
    from = 'theapex@theapexway.net', // Default to verified address
  } = options;

  // Enforce @theapexway.net domain
  if (!from.endsWith('@theapexway.net')) {
    throw new Error('INVALID EMAIL DOMAIN: All emails must be sent from @theapexway.net');
  }

  try {
    // Load base template
    const baseTemplatePath = path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html');
    const baseTemplate = await fs.readFile(baseTemplatePath, 'utf-8');

    // Load content template
    const contentTemplatePath = path.join(process.cwd(), `src/lib/email/templates/${templateName}.html`);
    const contentTemplate = await fs.readFile(contentTemplatePath, 'utf-8');

    // Replace content placeholder in base template
    let emailHtml = baseTemplate.replace('{{email_content}}', contentTemplate);

    // Replace all variables
    emailHtml = emailHtml.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match; // Keep placeholder if variable not provided
    });

    // Send via Resend
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html: emailHtml,
    });

    // CRITICAL: Check for errors in response
    if (result.error) {
      console.error('❌ Email send failed:', {
        error: result.error,
        to,
        subject,
        template: templateName,
      });
      return {
        success: false,
        error: result.error,
        messageId: null,
      };
    }

    // SUCCESS: Access result.data.id (NOT result.id!)
    const messageId = result.data?.id;

    console.log('✅ Email sent successfully:', {
      messageId,
      to,
      subject,
      template: templateName,
    });

    return {
      success: true,
      error: null,
      messageId,
    };

  } catch (error) {
    console.error('❌ Email send exception:', {
      error: error instanceof Error ? error.message : error,
      to,
      subject,
      template: templateName,
    });

    return {
      success: false,
      error: error instanceof Error ? { message: error.message } : { message: 'Unknown error' },
      messageId: null,
    };
  }
}

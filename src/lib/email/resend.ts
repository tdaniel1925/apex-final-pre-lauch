// =============================================
// Resend Email Service
// Simple email sending via Resend API
// =============================================

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  bcc?: string | string[]; // BCC recipients (use for mass emails to protect privacy)
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
  }>;
}

interface SendEmailResponse {
  success: boolean;
  id?: string; // Resend email ID
  error?: string;
}

/**
 * Send email via Resend with optional attachments
 * @param to - Recipient email address (single or array for multiple recipients)
 * @param subject - Email subject line
 * @param html - HTML email content
 * @param from - Sender email address
 * @param bcc - BCC recipients (use for mass emails to protect privacy)
 * @param attachments - Optional file attachments (base64 encoded)
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Apex Affinity Group <theapex@theapexway.net>',
  bcc,
  attachments,
}: SendEmailParams): Promise<SendEmailResponse> {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    // Build email payload
    const emailPayload: any = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    };

    // Add BCC if provided (for mass emails to protect privacy)
    if (bcc) {
      emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];
    }

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send batch emails (future use for bulk sends)
 */
export async function sendBatchEmails(
  emails: Array<{ to: string; subject: string; html: string }>
): Promise<SendEmailResponse[]> {
  // For now, send one by one
  // In future, can use Resend's batch API if needed
  return Promise.all(
    emails.map((email) =>
      sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
      })
    )
  );
}

/**
 * Send mass email to multiple recipients using BCC to protect privacy
 * MANDATORY: Use this for all mass emails to distributors/members
 *
 * @param recipients - Array of recipient email addresses
 * @param subject - Email subject line
 * @param html - HTML email content
 * @param from - Sender email address
 * @returns SendEmailResponse with success status and email ID
 *
 * @example
 * const result = await sendMassEmailBCC({
 *   recipients: ['user1@example.com', 'user2@example.com'],
 *   subject: 'Important Update',
 *   html: emailHtml,
 * });
 */
export async function sendMassEmailBCC({
  recipients,
  subject,
  html,
  from = 'Apex Affinity Group <theapex@theapexway.net>',
}: {
  recipients: string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<SendEmailResponse> {
  // Send email with all recipients in BCC field to protect privacy
  // The TO field is set to the sender to avoid exposing recipient emails
  return sendEmail({
    to: from, // Send to sender (won't expose in email)
    bcc: recipients, // All recipients in BCC (private)
    subject,
    html,
    from,
  });
}

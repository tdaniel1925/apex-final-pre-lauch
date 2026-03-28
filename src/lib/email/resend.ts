// =============================================
// Resend Email Service
// Simple email sending via Resend API
// =============================================

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
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
 * @param attachments - Optional file attachments (base64 encoded)
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Apex Affinity Group <theapex@theapexway.net>',
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
      to: [to],
      subject,
      html,
    };

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

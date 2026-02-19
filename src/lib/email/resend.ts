// =============================================
// Resend Email Service
// Simple email sending via Resend API
// =============================================

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SendEmailResponse {
  success: boolean;
  id?: string; // Resend email ID
  error?: string;
}

/**
 * Send email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'Apex Affinity Group <noreply@reachtheapex.net>',
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

    // Call Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
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

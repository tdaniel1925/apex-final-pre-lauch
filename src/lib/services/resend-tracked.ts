// =============================================
// Resend Email Client with Usage Tracking
// Wraps Resend API calls with automatic cost tracking
// ALL emails automatically use Apex base template
// =============================================

import { Resend } from 'resend';
import { trackUsage } from './tracking';
import type { TriggeredBy } from '@/types/service-tracking';
import { wrapEmailTemplate } from '../email/template-wrapper';

// Lazy-load Resend client to avoid build-time initialization
let _resend: Resend | undefined;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// =============================================
// Tracked Resend Client
// =============================================

export interface TrackedEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;

  // Tracking context
  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;

  // Template options
  skipTemplateWrap?: boolean; // Set to true to skip automatic Apex template wrapping
  unsubscribeUrl?: string; // Optional unsubscribe URL
}

/**
 * Send email with automatic cost tracking
 *
 * Usage:
 * ```typescript
 * const result = await sendTrackedEmail({
 *   from: 'noreply@reachtheapex.net',
 *   to: user.email,
 *   subject: 'Welcome to Apex!',
 *   html: '<p>Welcome!</p>',
 *   triggeredBy: 'system',
 *   userId: user.id,
 *   feature: 'welcome-email',
 * });
 * ```
 */
export async function sendTrackedEmail(params: TrackedEmailParams) {
  const startTime = Date.now();
  const resend = getResend();

  try {
    const emailCount = Array.isArray(params.to) ? params.to.length : 1;

    // Automatically wrap HTML content with Apex base template
    // (unless skipTemplateWrap is true or using React component)
    let finalHtml = params.html;
    if (params.html && !params.skipTemplateWrap && !params.react) {
      finalHtml = wrapEmailTemplate(
        params.html,
        params.subject,
        params.unsubscribeUrl
      );
    }

    const response = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: finalHtml,
      text: params.text,
      react: params.react,
      attachments: params.attachments,
    });

    const durationMs = Date.now() - startTime;

    // Track usage
    await trackUsage({
      service: 'resend',
      operation: 'email.send',
      endpoint: '/emails',

      emailsSent: emailCount,

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        from: params.from,
        to: params.to,
        subject: params.subject,
        has_attachments: !!params.attachments?.length,
        attachment_count: params.attachments?.length || 0,
      },
      responseMetadata: {
        email_id: response.data?.id,
      },
      durationMs,
    });

    return response;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    // Track failed email too
    await trackUsage({
      service: 'resend',
      operation: 'email.send',
      endpoint: '/emails',

      emailsSent: 0, // Failed, so 0

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        from: params.from,
        to: params.to,
        subject: params.subject,
      },
      error: error.message,
      durationMs,
    });

    throw error;
  }
}

/**
 * Send batch emails with automatic cost tracking
 */
export async function sendTrackedBatchEmails(params: {
  emails: Array<{
    from: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }>;

  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;
  skipTemplateWrap?: boolean; // Set to true to skip automatic Apex template wrapping
  unsubscribeUrl?: string;
}) {
  const startTime = Date.now();
  const resend = getResend();

  try {
    // Automatically wrap all HTML emails with Apex base template
    const wrappedEmails = params.skipTemplateWrap
      ? params.emails
      : params.emails.map(email => ({
          ...email,
          html: email.html
            ? wrapEmailTemplate(email.html, email.subject, params.unsubscribeUrl)
            : email.html,
        }));

    const response = await resend.batch.send(wrappedEmails as any);

    const durationMs = Date.now() - startTime;
    const successCount = response.data ? (response.data as unknown as any[]).filter((r: any) => !r.error).length : 0;

    // Track usage
    await trackUsage({
      service: 'resend',
      operation: 'email.batch',
      endpoint: '/emails/batch',

      emailsSent: successCount,

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        batch_size: params.emails.length,
      },
      responseMetadata: {
        success_count: successCount,
        error_count: params.emails.length - successCount,
      },
      durationMs,
    });

    return response;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'resend',
      operation: 'email.batch',
      endpoint: '/emails/batch',

      emailsSent: 0,

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        batch_size: params.emails.length,
      },
      error: error.message,
      durationMs,
    });

    throw error;
  }
}

// Export function to get Resend client for non-tracked use if needed
export { getResend as resend };

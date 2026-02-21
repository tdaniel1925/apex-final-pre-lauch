// =============================================
// Resend Email Client with Usage Tracking
// Wraps Resend API calls with automatic cost tracking
// =============================================

import { Resend } from 'resend';
import { trackUsage } from './tracking';
import type { TriggeredBy } from '@/types/service-tracking';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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

  try {
    const emailCount = Array.isArray(params.to) ? params.to.length : 1;

    const response = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
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
}) {
  const startTime = Date.now();

  try {
    const response = await resend.batch.send(params.emails as any);

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

// Export original client for non-tracked use if needed
export { resend };

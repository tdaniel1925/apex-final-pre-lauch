// =============================================
// EMAIL TRANSACTION HANDLER
// =============================================
// Security Fix #8: Email send with rollback on failure
// Usage: await sendEmailWithRollback({ ... })
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email type for categorization
 */
export type EmailType =
  | 'invitation'
  | 'password_reset'
  | 'email_changed'
  | 'welcome'
  | 'notification'
  | 'event_reminder'
  | 'commission_statement';

/**
 * Email options for transactional sending
 */
export interface EmailTransactionOptions {
  // Email content
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;

  // From details
  from?: string;
  fromName?: string;
  replyTo?: string;

  // Categorization
  emailType: EmailType;

  // Related entity (for tracking)
  entityType?: string;
  entityId?: string;

  // Retry configuration
  maxRetries?: number;

  // Status update callback (optional)
  onStatusUpdate?: (status: 'pending' | 'sent' | 'failed', emailId?: string) => Promise<void>;
}

/**
 * Result of email send operation
 */
export interface EmailSendResult {
  success: boolean;
  emailId?: string;
  queueId?: string;
  error?: string;
}

/**
 * Send email with automatic rollback on failure
 *
 * Pattern:
 * 1. Create record in pending state
 * 2. Attempt to send email
 * 3. On success: mark as sent
 * 4. On failure: mark as failed, add to retry queue
 *
 * @param options - Email options
 * @returns Promise with result
 *
 * @example
 * ```typescript
 * const result = await sendEmailWithRollback({
 *   to: 'user@example.com',
 *   toName: 'John Doe',
 *   subject: 'Welcome to Apex',
 *   html: emailHtml,
 *   emailType: 'welcome',
 *   entityType: 'distributor',
 *   entityId: distributorId,
 *   onStatusUpdate: async (status) => {
 *     await supabase
 *       .from('distributors')
 *       .update({ onboarding_email_status: status })
 *       .eq('id', distributorId);
 *   }
 * });
 *
 * if (!result.success) {
 *   // Email failed but will be retried automatically
 *   console.log('Email queued for retry:', result.queueId);
 * }
 * ```
 */
export async function sendEmailWithRollback(
  options: EmailTransactionOptions
): Promise<EmailSendResult> {
  const supabase = createServiceClient();

  const {
    to,
    toName,
    subject,
    html,
    text,
    from = 'Apex Affinity Group <theapex@theapexway.net>',
    fromName = 'Apex Affinity Group',
    replyTo,
    emailType,
    entityType,
    entityId,
    maxRetries = 3,
    onStatusUpdate,
  } = options;

  try {
    // Step 1: Call status update callback with 'pending'
    if (onStatusUpdate) {
      await onStatusUpdate('pending');
    }

    // Step 2: Attempt to send email immediately
    const { data: emailData, error: emailError } = await resend.emails.send({
      from,
      to: toName ? `${toName} <${to}>` : to,
      subject,
      html,
      text,
      replyTo: replyTo,
    });

    if (emailError) {
      // Email send failed - add to retry queue
      const { data: queueData, error: queueError } = await supabase
        .from('email_retry_queue')
        .insert({
          email_type: emailType,
          recipient_email: to,
          recipient_name: toName,
          subject,
          html_body: html,
          text_body: text,
          from_email: from,
          from_name: fromName,
          reply_to: replyTo,
          entity_type: entityType,
          entity_id: entityId,
          status: 'pending',
          retry_count: 0,
          max_retries: maxRetries,
          last_error: emailError.message,
          next_retry_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        })
        .select('id')
        .single();

      if (queueError) {
        console.error('[EMAIL] Failed to queue email for retry:', queueError);
      }

      // Call status update callback with 'failed'
      if (onStatusUpdate) {
        await onStatusUpdate('failed', queueData?.id);
      }

      return {
        success: false,
        queueId: queueData?.id,
        error: emailError.message,
      };
    }

    // Step 3: Email sent successfully - call status update callback
    if (onStatusUpdate) {
      await onStatusUpdate('sent', emailData?.id);
    }

    return {
      success: true,
      emailId: emailData?.id,
    };
  } catch (error) {
    console.error('[EMAIL] Exception in sendEmailWithRollback:', error);

    // Add to retry queue on exception
    try {
      const { data: queueData } = await supabase
        .from('email_retry_queue')
        .insert({
          email_type: emailType,
          recipient_email: to,
          recipient_name: toName,
          subject,
          html_body: html,
          text_body: text,
          from_email: from,
          from_name: fromName,
          reply_to: replyTo,
          entity_type: entityType,
          entity_id: entityId,
          status: 'pending',
          retry_count: 0,
          max_retries: maxRetries,
          last_error: error instanceof Error ? error.message : 'Unknown error',
          next_retry_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        })
        .select('id')
        .single();

      if (onStatusUpdate) {
        await onStatusUpdate('failed', queueData?.id);
      }

      return {
        success: false,
        queueId: queueData?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } catch (queueError) {
      console.error('[EMAIL] Failed to queue email:', queueError);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Process email retry queue
 * This should be called by a background job (e.g., cron, Inngest)
 *
 * @param batchSize - Number of emails to process
 * @returns Promise with result
 */
export async function processEmailRetryQueue(batchSize: number = 10): Promise<{
  processed: number;
  sent: number;
  failed: number;
  abandoned: number;
}> {
  const supabase = createServiceClient();

  try {
    // Get pending emails ready for retry
    const { data: pendingEmails, error: fetchError } = await supabase.rpc(
      'get_pending_email_retries',
      { batch_size: batchSize }
    );

    if (fetchError || !pendingEmails) {
      console.error('[EMAIL] Error fetching pending emails:', fetchError);
      return { processed: 0, sent: 0, failed: 0, abandoned: 0 };
    }

    let sent = 0;
    let failed = 0;
    let abandoned = 0;

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await supabase
          .from('email_retry_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // Attempt to send
        const { error: sendError } = await resend.emails.send({
          from: email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email,
          to: email.recipient_name
            ? `${email.recipient_name} <${email.recipient_email}>`
            : email.recipient_email,
          subject: email.subject,
          html: email.html_body,
          text: email.text_body,
          replyTo: email.reply_to || undefined,
        });

        if (sendError) {
          // Send failed - increment retry count
          await supabase.rpc('increment_email_retry', {
            p_email_id: email.id,
            p_error_message: sendError.message,
          });

          if (email.retry_count + 1 >= email.max_retries) {
            abandoned++;
          } else {
            failed++;
          }
        } else {
          // Send succeeded - mark as sent
          await supabase.rpc('mark_email_sent', { p_email_id: email.id });
          sent++;
        }
      } catch (error) {
        console.error('[EMAIL] Error processing email:', email.id, error);

        // Increment retry count on exception
        await supabase.rpc('increment_email_retry', {
          p_email_id: email.id,
          p_error_message: error instanceof Error ? error.message : 'Unknown error',
        });

        if (email.retry_count + 1 >= email.max_retries) {
          abandoned++;
        } else {
          failed++;
        }
      }
    }

    return {
      processed: pendingEmails.length,
      sent,
      failed,
      abandoned,
    };
  } catch (error) {
    console.error('[EMAIL] Exception in processEmailRetryQueue:', error);
    return { processed: 0, sent: 0, failed: 0, abandoned: 0 };
  }
}

/**
 * Get email retry queue statistics
 *
 * @returns Promise with stats
 */
export async function getEmailRetryStats(): Promise<{
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  abandoned: number;
}> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from('email_retry_queue')
      .select('status')
      .in('status', ['pending', 'processing', 'sent', 'failed', 'abandoned']);

    if (error) {
      console.error('[EMAIL] Error fetching stats:', error);
      return { pending: 0, processing: 0, sent: 0, failed: 0, abandoned: 0 };
    }

    const stats = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      abandoned: 0,
    };

    data?.forEach((row: any) => {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('[EMAIL] Exception fetching stats:', error);
    return { pending: 0, processing: 0, sent: 0, failed: 0, abandoned: 0 };
  }
}

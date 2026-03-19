import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  hasEnoughInvites,
  validateInvitationData,
  incrementInvitationUsage,
  isDuplicateInvitation,
} from '@/lib/autopilot/invitation-helpers';
import { sendMeetingInvitationEmail } from '@/lib/email/send-meeting-invitation';
import { MAX_BULK_RECIPIENTS, INVITATION_STATUS } from '@/lib/autopilot/constants';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Recipient schema
const recipientSchema = z.object({
  recipient_email: z.string().email('Invalid email address'),
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  recipient_phone: z.string().optional(),
});

// Validation schema for bulk invitations
const bulkInvitationSchema = z.object({
  recipients: z
    .array(recipientSchema)
    .min(1, 'At least one recipient is required')
    .max(MAX_BULK_RECIPIENTS, `Maximum ${MAX_BULK_RECIPIENTS} recipients allowed`),
  meeting_title: z.string().min(3, 'Title must be at least 3 characters'),
  meeting_description: z.string().optional(),
  meeting_date_time: z.string().datetime('Invalid date/time format'),
  meeting_location: z.string().optional(),
  meeting_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  invitation_type: z.enum(['personal', 'company_event']).optional(),
  company_event_id: z.string().uuid().optional().nullable(),
});

/**
 * POST /api/autopilot/invitations/bulk
 * Create and send meeting invitations to multiple recipients
 *
 * Features:
 * - Validates all recipients before processing
 * - Checks quota for entire batch (not just first recipient)
 * - Detects duplicate invitations within 60-second window
 * - Processes invitations sequentially with individual error tracking
 * - Increments usage counter once for all successful sends (atomic)
 * - Updates invitation status to 'failed' if email sending fails
 * - Returns detailed per-recipient results
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to send invitations',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Bulk Invitations API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = bulkInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid invitation data',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    const recipientsCount = data.recipients.length;

    // Check if distributor has enough invitations for ALL recipients in the bulk send
    // This prevents partial sends where user doesn't have enough quota
    const hasEnough = await hasEnoughInvites(distributor.id, recipientsCount);
    if (!hasEnough) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient Quota',
          message: `You don't have enough invitations remaining to send to ${recipientsCount} recipient${recipientsCount !== 1 ? 's' : ''}. Please upgrade your plan or reduce the number of recipients.`,
        },
        { status: 403 }
      );
    }

    // Additional validation for each recipient
    for (let i = 0; i < data.recipients.length; i++) {
      const recipient = data.recipients[i];
      const customValidation = validateInvitationData({
        recipient_email: recipient.recipient_email,
        recipient_name: recipient.recipient_name,
        meeting_title: data.meeting_title,
        meeting_date_time: data.meeting_date_time,
      });

      if (!customValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: `Invalid data for recipient ${i + 1}`,
            errors: customValidation.errors.map((e) => ({
              field: `recipients.${i}`,
              message: e,
            })),
          },
          { status: 400 }
        );
      }
    }

    // Process each recipient
    const results: Array<{
      success: boolean;
      recipient: string;
      error?: string;
    }> = [];

    const distributorName = `${distributor.first_name} ${distributor.last_name}`;

    for (const recipient of data.recipients) {
      try {
        // Check for duplicate invitation within the time window
        const isDuplicate = await isDuplicateInvitation(
          distributor.id,
          recipient.recipient_email,
          data.meeting_date_time
        );

        if (isDuplicate) {
          console.log(
            `[Bulk Invitations API] Skipping duplicate invitation for ${recipient.recipient_email}`
          );
          results.push({
            success: false,
            recipient: recipient.recipient_email,
            error: 'Duplicate invitation - already sent recently',
          });
          continue;
        }

        // Create invitation record
        const { data: invitation, error: createError } = await supabase
          .from('meeting_invitations')
          .insert({
            distributor_id: distributor.id,
            recipient_email: recipient.recipient_email,
            recipient_name: recipient.recipient_name,
            recipient_phone: recipient.recipient_phone || null,
            meeting_title: data.meeting_title,
            meeting_description: data.meeting_description || null,
            meeting_date_time: data.meeting_date_time,
            meeting_location: data.meeting_location || null,
            meeting_link: data.meeting_link || null,
            invitation_type: data.invitation_type || 'personal',
            company_event_id: data.company_event_id || null,
            status: INVITATION_STATUS.SENT,
            sent_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError || !invitation) {
          console.error(
            `[Bulk Invitations API] Error creating invitation for ${recipient.recipient_email}:`,
            createError
          );
          results.push({
            success: false,
            recipient: recipient.recipient_email,
            error: 'Failed to create invitation',
          });
          continue;
        }

        // Send email
        const emailResult = await sendMeetingInvitationEmail({
          invitation,
          distributorName,
        });

        if (!emailResult.success) {
          console.error(
            `[Bulk Invitations API] Error sending email to ${recipient.recipient_email}:`,
            emailResult.error
          );

          // Update invitation status to 'failed' (not 'draft')
          await supabase
            .from('meeting_invitations')
            .update({
              status: INVITATION_STATUS.FAILED,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invitation.id);

          results.push({
            success: false,
            recipient: recipient.recipient_email,
            error: 'Failed to send email',
          });
          continue;
        }

        // Mark as successful (will increment usage counter in batch below)
        results.push({
          success: true,
          recipient: recipient.recipient_email,
        });
      } catch (error: any) {
        console.error(
          `[Bulk Invitations API] Error processing ${recipient.recipient_email}:`,
          error
        );
        results.push({
          success: false,
          recipient: recipient.recipient_email,
          error: error.message || 'Unknown error',
        });
      }
    }

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Increment usage counter ONCE for all successful sends (atomic operation)
    // This prevents race conditions from incrementing in the loop
    if (successCount > 0) {
      const usageIncremented = await incrementInvitationUsage(distributor.id, successCount);
      if (!usageIncremented) {
        console.error(
          `[Bulk Invitations API] WARNING: Failed to increment usage counter for ${successCount} successful invitations`
        );
        // Log this but don't fail the request - invitations were sent successfully
      }
    }

    // Return results
    if (successCount === 0) {
      // All failed
      return NextResponse.json(
        {
          success: false,
          error: 'All Invitations Failed',
          message: 'Failed to send any invitations. Please check the errors and try again.',
          results,
          successCount,
          failureCount,
        },
        { status: 500 }
      );
    }

    // At least some succeeded
    return NextResponse.json({
      success: true,
      message:
        successCount === recipientsCount
          ? `All ${successCount} invitations sent successfully`
          : `${successCount} of ${recipientsCount} invitations sent successfully`,
      results,
      successCount,
      failureCount,
    });
  } catch (error: any) {
    console.error('[Bulk Invitations API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to send invitations',
      },
      { status: 500 }
    );
  }
}

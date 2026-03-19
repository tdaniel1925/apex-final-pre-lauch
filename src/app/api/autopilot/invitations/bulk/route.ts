import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  canSendInvitation,
  validateInvitationData,
  incrementInvitationUsage,
} from '@/lib/autopilot/invitation-helpers';
import { sendMeetingInvitationEmail } from '@/lib/email/send-meeting-invitation';

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
  recipients: z.array(recipientSchema).min(1, 'At least one recipient is required').max(10, 'Maximum 10 recipients allowed'),
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

    // Check if distributor can send the required number of invitations
    // We'll check the limit against the total number of recipients
    const canSend = await canSendInvitation(distributor.id);
    if (!canSend) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit Reached',
          message: 'You have reached your monthly invitation limit. Please upgrade your plan to send more invitations.',
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
            status: 'sent',
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

          // Update invitation status to failed
          await supabase
            .from('meeting_invitations')
            .update({ status: 'draft' })
            .eq('id', invitation.id);

          results.push({
            success: false,
            recipient: recipient.recipient_email,
            error: 'Failed to send email',
          });
          continue;
        }

        // Increment usage counter
        const usageIncremented = await incrementInvitationUsage(distributor.id);
        if (!usageIncremented) {
          console.error(
            `[Bulk Invitations API] Warning: Failed to increment usage counter for ${recipient.recipient_email}`
          );
          // Don't fail the request, just log the warning
        }

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

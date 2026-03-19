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

// Validation schema for creating invitation
const createInvitationSchema = z.object({
  recipient_email: z.string().email('Invalid email address'),
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  meeting_title: z.string().min(3, 'Title must be at least 3 characters'),
  meeting_description: z.string().optional(),
  meeting_date_time: z.string().datetime('Invalid date/time format'),
  meeting_location: z.string().optional(),
  meeting_link: z.string().url('Invalid URL').optional().or(z.literal('')),
});

/**
 * POST /api/autopilot/invitations
 * Create and send a new meeting invitation
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
      console.error('[Invitations API] Error fetching distributor:', distError);
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
    const validation = createInvitationSchema.safeParse(body);
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

    // Additional validation
    const customValidation = validateInvitationData({
      recipient_email: data.recipient_email,
      recipient_name: data.recipient_name,
      meeting_title: data.meeting_title,
      meeting_date_time: data.meeting_date_time,
    });

    if (!customValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid invitation data',
          errors: customValidation.errors.map((e) => ({
            field: 'general',
            message: e,
          })),
        },
        { status: 400 }
      );
    }

    // Check if distributor can send more invitations
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

    // Create invitation record
    const { data: invitation, error: createError } = await supabase
      .from('meeting_invitations')
      .insert({
        distributor_id: distributor.id,
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        meeting_title: data.meeting_title,
        meeting_description: data.meeting_description || null,
        meeting_date_time: data.meeting_date_time,
        meeting_location: data.meeting_location || null,
        meeting_link: data.meeting_link || null,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !invitation) {
      console.error('[Invitations API] Error creating invitation:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to create invitation',
        },
        { status: 500 }
      );
    }

    // Send email
    const distributorName = `${distributor.first_name} ${distributor.last_name}`;
    const emailResult = await sendMeetingInvitationEmail({
      invitation,
      distributorName,
    });

    if (!emailResult.success) {
      console.error('[Invitations API] Error sending email:', emailResult.error);

      // Update invitation status to failed
      await supabase
        .from('meeting_invitations')
        .update({ status: 'draft' })
        .eq('id', invitation.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Email Error',
          message: 'Failed to send invitation email. Please try again.',
          details: emailResult.error,
        },
        { status: 500 }
      );
    }

    // Increment usage counter
    const usageIncremented = await incrementInvitationUsage(distributor.id);
    if (!usageIncremented) {
      console.error('[Invitations API] Warning: Failed to increment usage counter');
      // Don't fail the request, just log the warning
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        recipient_email: invitation.recipient_email,
        recipient_name: invitation.recipient_name,
        meeting_title: invitation.meeting_title,
        meeting_date_time: invitation.meeting_date_time,
        status: invitation.status,
        sent_at: invitation.sent_at,
      },
    });
  } catch (error: any) {
    console.error('[Invitations API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to send invitation',
      },
      { status: 500 }
    );
  }
}

// Validation schema for listing invitations
const listInvitationsSchema = z.object({
  status: z
    .enum([
      'all',
      'draft',
      'sent',
      'opened',
      'responded_yes',
      'responded_no',
      'responded_maybe',
      'expired',
      'canceled',
    ])
    .optional()
    .default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/autopilot/invitations
 * List all invitations for the current user with filtering
 */
export async function GET(request: NextRequest) {
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
          message: 'You must be logged in to view invitations',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Invitations API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: searchParams.get('status') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // Validate parameters
    const validation = listInvitationsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { status, limit, offset, startDate, endDate } = validation.data;

    // Build query
    let query = supabase
      .from('meeting_invitations')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: invitations, error: listError, count } = await query;

    if (listError) {
      console.error('[Invitations API] Error listing invitations:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch invitations',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invitations: invitations || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error('[Invitations API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch invitations',
      },
      { status: 500 }
    );
  }
}

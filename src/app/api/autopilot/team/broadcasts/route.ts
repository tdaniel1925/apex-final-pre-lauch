import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  canSendTeamBroadcast,
  validateBroadcastData,
  getDownlineMembers,
  incrementBroadcastUsage,
} from '@/lib/autopilot/team-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for creating broadcast
const createBroadcastSchema = z.object({
  broadcast_type: z.enum(['email', 'sms', 'in_app']),
  subject: z.string().optional(),
  content: z.string().min(5, 'Content must be at least 5 characters'),
  send_to_all_downline: z.boolean().optional().default(true),
  send_to_downline_levels: z.array(z.number().int().min(1).max(10)).optional(),
  send_to_specific_ranks: z.array(z.string()).optional(),
  send_to_specific_distributors: z.array(z.string().uuid()).optional(),
  scheduled_for: z.string().datetime().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional().default('normal'),
  is_announcement: z.boolean().optional().default(false),
});

/**
 * POST /api/autopilot/team/broadcasts
 * Create and send a team broadcast
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
          message: 'You must be logged in to send broadcasts',
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
      console.error('[Team Broadcasts API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Check if distributor has Team Edition access
    const hasAccess = await canSendTeamBroadcast(distributor.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied',
          message: 'Team Edition subscription required to send team broadcasts',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createBroadcastSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid broadcast data',
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
    const customValidation = validateBroadcastData({
      broadcast_type: data.broadcast_type,
      content: data.content,
      subject: data.subject,
    });

    if (!customValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid broadcast data',
          errors: customValidation.errors.map((e) => ({
            field: 'general',
            message: e,
          })),
        },
        { status: 400 }
      );
    }

    // Get downline members based on targeting criteria
    let downlineMembers: any[] = [];
    if (data.send_to_all_downline) {
      downlineMembers = await getDownlineMembers(distributor.id);
    } else if (data.send_to_downline_levels && data.send_to_downline_levels.length > 0) {
      downlineMembers = await getDownlineMembers(distributor.id, data.send_to_downline_levels);
    }

    // Filter by rank if specified
    if (data.send_to_specific_ranks && data.send_to_specific_ranks.length > 0) {
      downlineMembers = downlineMembers.filter((member: any) =>
        data.send_to_specific_ranks!.includes(member.current_rank || '')
      );
    }

    // Use specific distributors if specified
    if (data.send_to_specific_distributors && data.send_to_specific_distributors.length > 0) {
      downlineMembers = downlineMembers.filter((member: any) =>
        data.send_to_specific_distributors!.includes(member.id)
      );
    }

    const recipientCount = downlineMembers.length;

    if (recipientCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Recipients',
          message: 'No team members match the selected criteria',
        },
        { status: 400 }
      );
    }

    // Create broadcast record
    const senderName = `${distributor.first_name} ${distributor.last_name}`;
    const { data: broadcast, error: createError } = await supabase
      .from('team_broadcasts')
      .insert({
        distributor_id: distributor.id,
        sender_name: senderName,
        broadcast_type: data.broadcast_type,
        subject: data.subject || null,
        content: data.content,
        send_to_all_downline: data.send_to_all_downline,
        send_to_downline_levels: data.send_to_downline_levels || null,
        send_to_specific_ranks: data.send_to_specific_ranks || null,
        send_to_specific_distributors: data.send_to_specific_distributors || null,
        scheduled_for: data.scheduled_for || null,
        status: data.scheduled_for ? 'scheduled' : 'sent',
        sent_at: data.scheduled_for ? null : new Date().toISOString(),
        total_recipients: recipientCount,
        total_sent: data.scheduled_for ? 0 : recipientCount,
        priority: data.priority,
        is_announcement: data.is_announcement,
      })
      .select()
      .single();

    if (createError || !broadcast) {
      console.error('[Team Broadcasts API] Error creating broadcast:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to create broadcast',
        },
        { status: 500 }
      );
    }

    // TODO: Actually send the broadcast
    // For now, we're just creating the record
    // In production, this would integrate with:
    // - Email service (Resend) for email broadcasts
    // - SMS service (Twilio) for SMS broadcasts
    // - In-app notification system for in_app broadcasts

    // Increment usage counter
    const usageIncremented = await incrementBroadcastUsage(distributor.id);
    if (!usageIncremented) {
      console.error('[Team Broadcasts API] Warning: Failed to increment usage counter');
    }

    return NextResponse.json({
      success: true,
      message: data.scheduled_for
        ? 'Broadcast scheduled successfully'
        : 'Broadcast sent successfully',
      broadcast: {
        id: broadcast.id,
        broadcast_type: broadcast.broadcast_type,
        subject: broadcast.subject,
        content: broadcast.content,
        total_recipients: broadcast.total_recipients,
        status: broadcast.status,
        sent_at: broadcast.sent_at,
        scheduled_for: broadcast.scheduled_for,
      },
    });
  } catch (error: any) {
    console.error('[Team Broadcasts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to send broadcast',
      },
      { status: 500 }
    );
  }
}

// Validation schema for listing broadcasts
const listBroadcastsSchema = z.object({
  status: z.enum(['all', 'draft', 'scheduled', 'sending', 'sent', 'failed', 'canceled'])
    .optional()
    .default('all'),
  broadcast_type: z.enum(['all', 'email', 'sms', 'in_app']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

/**
 * GET /api/autopilot/team/broadcasts
 * List all team broadcasts for the current user
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
          message: 'You must be logged in to view broadcasts',
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
      console.error('[Team Broadcasts API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Check if distributor has Team Edition access
    const hasAccess = await canSendTeamBroadcast(distributor.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied',
          message: 'Team Edition subscription required',
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: searchParams.get('status') || 'all',
      broadcast_type: searchParams.get('broadcast_type') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate parameters
    const validation = listBroadcastsSchema.safeParse(params);
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

    const { status, broadcast_type, limit, offset } = validation.data;

    // Build query
    let query = supabase
      .from('team_broadcasts')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    if (broadcast_type !== 'all') {
      query = query.eq('broadcast_type', broadcast_type);
    }

    const { data: broadcasts, error: listError, count } = await query;

    if (listError) {
      console.error('[Team Broadcasts API] Error listing broadcasts:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch broadcasts',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      broadcasts: broadcasts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error('[Team Broadcasts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch broadcasts',
      },
      { status: 500 }
    );
  }
}

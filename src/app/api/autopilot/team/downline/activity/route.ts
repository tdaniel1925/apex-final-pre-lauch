import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { canSendTeamBroadcast, getDownlineMembers } from '@/lib/autopilot/team-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface ActivityItem {
  id: string;
  activity_type: string;
  distributor_id: string;
  distributor_name: string;
  distributor_level: number;
  description: string;
  metadata: any;
  created_at: string;
}

// Validation schema for activity filters
const listActivitySchema = z.object({
  activity_type: z.enum(['all', 'signup', 'sale', 'rank_advancement', 'training_completed'])
    .optional()
    .default('all'),
  distributor_id: z.string().uuid().optional(),
  days: z.number().int().min(1).max(90).optional().default(30),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

/**
 * GET /api/autopilot/team/downline/activity
 * Get activity feed for downline members
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
          message: 'You must be logged in',
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
      console.error('[Downline Activity API] Error fetching distributor:', distError);
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
      activity_type: searchParams.get('activity_type') || 'all',
      distributor_id: searchParams.get('distributor_id') || undefined,
      days: parseInt(searchParams.get('days') || '30'),
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate parameters
    const validation = listActivitySchema.safeParse(params);
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

    const { activity_type, distributor_id, days, limit, offset } = validation.data;

    // Get all downline members
    const downlineMembers = await getDownlineMembers(distributor.id);
    const downlineIds = downlineMembers.map((m) => m.id);

    if (downlineIds.length === 0) {
      return NextResponse.json({
        success: true,
        activities: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasMore: false,
        },
      });
    }

    // Create a map for quick lookup of level
    const memberLevelMap = new Map(downlineMembers.map((m) => [m.id, m.level]));

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build activities array from different sources
    const activities: ActivityItem[] = [];

    // 1. New signups (from members table)
    const { data: signups } = await supabase
      .from('members')
      .select('member_id, distributor_id, full_name, enrollment_date')
      .in('distributor_id', downlineIds)
      .gte('enrollment_date', dateThreshold.toISOString())
      .order('enrollment_date', { ascending: false });

    if (signups && (activity_type === 'all' || activity_type === 'signup')) {
      signups
        .filter((s) => !distributor_id || s.distributor_id === distributor_id)
        .forEach((signup) => {
          activities.push({
            id: `signup-${signup.member_id}`,
            activity_type: 'signup',
            distributor_id: signup.distributor_id,
            distributor_name: signup.full_name,
            distributor_level: memberLevelMap.get(signup.distributor_id) || 0,
            description: `${signup.full_name} joined your team`,
            metadata: {},
            created_at: signup.enrollment_date,
          });
        });
    }

    // 2. Rank advancements (from members table - check tech_rank_achieved_date)
    const { data: rankAdvancements } = await supabase
      .from('members')
      .select('member_id, distributor_id, full_name, tech_rank, tech_rank_achieved_date')
      .in('distributor_id', downlineIds)
      .gte('tech_rank_achieved_date', dateThreshold.toISOString())
      .order('tech_rank_achieved_date', { ascending: false });

    if (rankAdvancements && (activity_type === 'all' || activity_type === 'rank_advancement')) {
      rankAdvancements
        .filter((r) => !distributor_id || r.distributor_id === distributor_id)
        .forEach((advancement) => {
          activities.push({
            id: `rank-${advancement.member_id}-${advancement.tech_rank_achieved_date}`,
            activity_type: 'rank_advancement',
            distributor_id: advancement.distributor_id,
            distributor_name: advancement.full_name,
            distributor_level: memberLevelMap.get(advancement.distributor_id) || 0,
            description: `${advancement.full_name} advanced to ${advancement.tech_rank}`,
            metadata: { rank: advancement.tech_rank },
            created_at: advancement.tech_rank_achieved_date,
          });
        });
    }

    // 3. Sales (from orders table)
    const { data: sales } = await supabase
      .from('orders')
      .select('id, distributor_id, order_total, created_at, distributors!inner(first_name, last_name)')
      .in('distributor_id', downlineIds)
      .eq('order_status', 'completed')
      .gte('created_at', dateThreshold.toISOString())
      .order('created_at', { ascending: false });

    if (sales && (activity_type === 'all' || activity_type === 'sale')) {
      sales
        .filter((s: any) => !distributor_id || s.distributor_id === distributor_id)
        .forEach((sale: any) => {
          const name = `${sale.distributors.first_name} ${sale.distributors.last_name}`;
          activities.push({
            id: `sale-${sale.id}`,
            activity_type: 'sale',
            distributor_id: sale.distributor_id,
            distributor_name: name,
            distributor_level: memberLevelMap.get(sale.distributor_id) || 0,
            description: `${name} made a sale of $${sale.order_total}`,
            metadata: { amount: sale.order_total },
            created_at: sale.created_at,
          });
        });
    }

    // 4. Training completions (from training_shares table)
    const { data: trainingCompletions } = await supabase
      .from('training_shares')
      .select('id, shared_with_distributor_id, shared_with_name, training_title, completed_at')
      .in('shared_with_distributor_id', downlineIds)
      .eq('completed', true)
      .gte('completed_at', dateThreshold.toISOString())
      .order('completed_at', { ascending: false });

    if (trainingCompletions && (activity_type === 'all' || activity_type === 'training_completed')) {
      trainingCompletions
        .filter((t) => !distributor_id || t.shared_with_distributor_id === distributor_id)
        .forEach((completion) => {
          activities.push({
            id: `training-${completion.id}`,
            activity_type: 'training_completed',
            distributor_id: completion.shared_with_distributor_id,
            distributor_name: completion.shared_with_name || 'Unknown',
            distributor_level: memberLevelMap.get(completion.shared_with_distributor_id) || 0,
            description: `${completion.shared_with_name} completed "${completion.training_title}"`,
            metadata: { training_title: completion.training_title },
            created_at: completion.completed_at,
          });
        });
    }

    // Sort all activities by date (most recent first)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Apply pagination
    const total = activities.length;
    const paginatedActivities = activities.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('[Downline Activity API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch downline activity',
      },
      { status: 500 }
    );
  }
}

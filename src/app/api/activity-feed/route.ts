// =============================================
// Activity Feed API
// Fetch organization-wide activities with filters
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

export interface ActivityFeedItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_slug: string;
  actor_photo_url: string | null;
  target_id: string | null;
  target_name: string | null;
  event_type: 'signup' | 'rank_advancement' | 'matrix_filled' | 'first_sale' | 'fast_start_complete' | 'team_milestone' | 'volume_goal';
  event_title: string;
  event_description: string | null;
  metadata: Record<string, any>;
  depth_from_root: number;
  created_at: string;
}

export interface ActivityFeedFilters {
  event_type?: string;
  max_depth?: number;
  period?: 'today' | 'week' | 'month' | 'all';
  limit?: number;
  offset?: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    // Get distributor
    const serviceClient = createServiceClient();
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { success: false, message: 'Distributor not found' } as ApiResponse,
        { status: 404 }
      );
    }

    // Parse filters from query params
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('event_type') || undefined;
    const maxDepth = searchParams.get('max_depth') ? parseInt(searchParams.get('max_depth')!) : undefined;
    const period = (searchParams.get('period') as 'today' | 'week' | 'month' | 'all') || 'all';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Build query
    let query = serviceClient
      .from('activity_feed')
      .select(`
        id,
        actor_id,
        target_id,
        event_type,
        event_title,
        event_description,
        metadata,
        depth_from_root,
        created_at,
        actor:distributors!activity_feed_actor_id_fkey(
          first_name,
          last_name,
          slug,
          profile_photo_url
        ),
        target:distributors!activity_feed_target_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('organization_root_id', distributor.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (maxDepth !== undefined) {
      query = query.lte('depth_from_root', maxDepth);
    }

    // Apply time period filter
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: activities, error: activitiesError } = await query;

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch activities' } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform data
    const transformedActivities: ActivityFeedItem[] = (activities || []).map((activity: any) => ({
      id: activity.id,
      actor_id: activity.actor_id,
      actor_name: activity.actor ? `${activity.actor.first_name} ${activity.actor.last_name}` : 'Unknown',
      actor_slug: activity.actor?.slug || '',
      actor_photo_url: activity.actor?.profile_photo_url || null,
      target_id: activity.target_id,
      target_name: activity.target ? `${activity.target.first_name} ${activity.target.last_name}` : null,
      event_type: activity.event_type,
      event_title: activity.event_title,
      event_description: activity.event_description,
      metadata: activity.metadata || {},
      depth_from_root: activity.depth_from_root,
      created_at: activity.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: {
        activities: transformedActivities,
        count: transformedActivities.length,
        hasMore: transformedActivities.length === limit,
      },
    } as ApiResponse);
  } catch (error) {
    console.error('Activity feed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

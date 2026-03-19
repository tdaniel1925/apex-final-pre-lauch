import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hasReachedLimit } from '@/lib/stripe/autopilot-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for creating social post
const createSocialPostSchema = z.object({
  platforms: z.array(z.enum(['facebook', 'instagram', 'linkedin', 'twitter', 'x'])).min(1, 'Select at least one platform'),
  post_content: z.string().min(1, 'Post content is required').max(63206, 'Post content too long'),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  image_urls: z.array(z.string().url()).optional(),
  video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
  link_url: z.string().url('Invalid link URL').optional().or(z.literal('')),
  hashtags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime('Invalid date/time format').optional(),
  status: z.enum(['draft', 'scheduled']).optional().default('draft'),
});

/**
 * POST /api/autopilot/social/posts
 * Create new social post (draft or scheduled)
 * Supports multi-platform posting (creates separate post for each platform)
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
          message: 'You must be logged in to create social posts',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Social Posts API] Error fetching distributor:', distError);
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
    const validation = createSocialPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid post data',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if distributor can create more social posts
    const hasReached = await hasReachedLimit(distributor.id, 'social');
    if (hasReached) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit Reached',
          message: 'You have reached your monthly social post limit. Please upgrade your plan to post more.',
        },
        { status: 403 }
      );
    }

    // Validate scheduled time if scheduling
    if (data.status === 'scheduled') {
      if (!data.scheduled_for) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Scheduled time is required for scheduled posts',
          },
          { status: 400 }
        );
      }

      const scheduledDate = new Date(data.scheduled_for);
      const now = new Date();
      if (scheduledDate <= now) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Scheduled time must be in the future',
          },
          { status: 400 }
        );
      }
    }

    // Create separate post for each platform
    const createdPosts = [];
    const errors = [];

    for (const platform of data.platforms) {
      // Check platform-specific validations
      if (platform === 'instagram' && !data.image_url && !data.video_url) {
        errors.push({
          platform,
          message: 'Instagram posts require an image or video',
        });
        continue;
      }

      // Create post record
      const postData = {
        distributor_id: distributor.id,
        platform,
        post_content: data.post_content,
        image_url: data.image_url || null,
        image_urls: data.image_urls || null,
        video_url: data.video_url || null,
        link_url: data.link_url || null,
        hashtags: data.hashtags || null,
        scheduled_for: data.scheduled_for || null,
        status: data.status,
      };

      const { data: post, error: createError } = await supabase
        .from('social_posts')
        .insert(postData)
        .select()
        .single();

      if (createError) {
        console.error(`[Social Posts API] Error creating post for ${platform}:`, createError);
        errors.push({
          platform,
          message: 'Failed to create post',
        });
      } else {
        createdPosts.push(post);

        // Increment usage counter only if scheduled or draft (not failed)
        if (post.status === 'scheduled' || post.status === 'draft') {
          const { error: usageError } = await supabase.rpc('increment_autopilot_usage', {
            p_distributor_id: distributor.id,
            p_limit_type: 'social',
            p_increment: 1,
          });

          if (usageError) {
            console.error('[Social Posts API] Warning: Failed to increment usage counter:', usageError);
          }
        }
      }
    }

    // Return response
    if (createdPosts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Creation Failed',
          message: 'Failed to create posts',
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdPosts.length} post(s)`,
      posts: createdPosts.map(p => ({
        id: p.id,
        platform: p.platform,
        post_content: p.post_content.substring(0, 100) + (p.post_content.length > 100 ? '...' : ''),
        status: p.status,
        scheduled_for: p.scheduled_for,
      })),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to create social post',
      },
      { status: 500 }
    );
  }
}

// Validation schema for listing posts
const listPostsSchema = z.object({
  platform: z.enum(['all', 'facebook', 'instagram', 'linkedin', 'twitter', 'x']).optional().default('all'),
  status: z.enum(['all', 'draft', 'scheduled', 'posting', 'posted', 'failed', 'canceled']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/autopilot/social/posts
 * List all social posts for current user with filtering
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
          message: 'You must be logged in to view social posts',
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
      console.error('[Social Posts API] Error fetching distributor:', distError);
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
      platform: searchParams.get('platform') || 'all',
      status: searchParams.get('status') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // Validate parameters
    const validation = listPostsSchema.safeParse(params);
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

    const { platform, status, limit, offset, startDate, endDate } = validation.data;

    // Build query
    let query = supabase
      .from('social_posts')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply platform filter
    if (platform !== 'all') {
      query = query.eq('platform', platform);
    }

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

    const { data: posts, error: listError, count } = await query;

    if (listError) {
      console.error('[Social Posts API] Error listing posts:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch social posts',
        },
        { status: 500 }
      );
    }

    // Get usage stats
    const { data: usageLimits } = await supabase
      .from('autopilot_usage_limits')
      .select('social_posts_this_month, social_posts_limit')
      .eq('distributor_id', distributor.id)
      .single();

    return NextResponse.json({
      success: true,
      posts: posts || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
      usage: usageLimits ? {
        used: usageLimits.social_posts_this_month,
        limit: usageLimits.social_posts_limit,
        remaining: usageLimits.social_posts_limit === -1
          ? 999999
          : Math.max(0, usageLimits.social_posts_limit - usageLimits.social_posts_this_month),
      } : undefined,
    });
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch social posts',
      },
      { status: 500 }
    );
  }
}

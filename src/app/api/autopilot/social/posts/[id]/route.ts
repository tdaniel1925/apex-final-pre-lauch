import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/social/posts/[id]
 * Get single social post details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (postError || !post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Social post not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch social post',
      },
      { status: 500 }
    );
  }
}

// Validation schema for updating post
const updateSocialPostSchema = z.object({
  post_content: z.string().min(1, 'Post content is required').max(63206, 'Post content too long').optional(),
  image_url: z.string().url('Invalid image URL').optional().or(z.literal('')),
  image_urls: z.array(z.string().url()).optional(),
  video_url: z.string().url('Invalid video URL').optional().or(z.literal('')),
  link_url: z.string().url('Invalid link URL').optional().or(z.literal('')),
  hashtags: z.array(z.string()).optional(),
  scheduled_for: z.string().datetime('Invalid date/time format').optional(),
  status: z.enum(['draft', 'scheduled', 'canceled']).optional(),
});

/**
 * PUT /api/autopilot/social/posts/[id]
 * Update draft or scheduled post
 * Cannot update already posted
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
          message: 'You must be logged in to update social posts',
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get existing post
    const { data: existingPost, error: getError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (getError || !existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Social post not found',
        },
        { status: 404 }
      );
    }

    // Check if post can be edited
    if (existingPost.status === 'posted') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Cannot edit posts that have already been posted',
        },
        { status: 400 }
      );
    }

    if (existingPost.status === 'posting') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Cannot edit posts that are currently being posted',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = updateSocialPostSchema.safeParse(body);
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

    // Validate scheduled time if changing to scheduled
    if (data.status === 'scheduled' || (existingPost.status === 'scheduled' && data.scheduled_for)) {
      const scheduledTime = data.scheduled_for || existingPost.scheduled_for;
      if (scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
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
      } else if (data.status === 'scheduled') {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Scheduled time is required for scheduled posts',
          },
          { status: 400 }
        );
      }
    }

    // Update post
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedPost, error: updateError } = await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', params.id)
      .eq('distributor_id', distributor.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Social Posts API] Error updating post:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to update social post',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Social post updated successfully',
      post: updatedPost,
    });
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to update social post',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/autopilot/social/posts/[id]
 * Delete draft or cancel scheduled post
 * Cannot delete already posted
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
          message: 'You must be logged in to delete social posts',
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
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get existing post
    const { data: existingPost, error: getError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (getError || !existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Social post not found',
        },
        { status: 404 }
      );
    }

    // Check if post can be deleted
    if (existingPost.status === 'posted') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Cannot delete posts that have already been posted',
        },
        { status: 400 }
      );
    }

    // Delete post
    const { error: deleteError } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', params.id)
      .eq('distributor_id', distributor.id);

    if (deleteError) {
      console.error('[Social Posts API] Error deleting post:', deleteError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to delete social post',
        },
        { status: 500 }
      );
    }

    // Decrement usage counter if post was scheduled or draft
    if (existingPost.status === 'scheduled' || existingPost.status === 'draft') {
      const { error: usageError } = await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: distributor.id,
        p_limit_type: 'social',
        p_increment: -1, // Decrement
      });

      if (usageError) {
        console.error('[Social Posts API] Warning: Failed to decrement usage counter:', usageError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Social post deleted successfully',
    });
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete social post',
      },
      { status: 500 }
    );
  }
}

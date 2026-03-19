import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { postToPlatform } from '@/lib/autopilot/social-integrations';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/autopilot/social/posts/[id]/post-now
 * Post immediately instead of scheduled time
 * Updates status to 'posted' and sets posted_at timestamp
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          message: 'You must be logged in to post to social media',
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
      .eq('id', id)
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

    // Check if post can be posted
    if (existingPost.status === 'posted') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Post has already been posted',
        },
        { status: 400 }
      );
    }

    if (existingPost.status === 'posting') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Post is currently being posted',
        },
        { status: 400 }
      );
    }

    if (existingPost.status === 'canceled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Operation',
          message: 'Cannot post a canceled post',
        },
        { status: 400 }
      );
    }

    // Update status to 'posting'
    await supabase
      .from('social_posts')
      .update({ status: 'posting', updated_at: new Date().toISOString() })
      .eq('id', id);

    try {
      // Attempt to post to platform
      const postResult = await postToPlatform({
        id: existingPost.id,
        distributor_id: existingPost.distributor_id,
        platform: existingPost.platform,
        post_content: existingPost.post_content,
        image_url: existingPost.image_url,
        image_urls: existingPost.image_urls,
        video_url: existingPost.video_url,
        link_url: existingPost.link_url,
        hashtags: existingPost.hashtags,
      });

      if (!postResult.success) {
        // Update status to 'failed'
        await supabase
          .from('social_posts')
          .update({
            status: 'failed',
            error_message: postResult.error || 'Failed to post to platform',
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        return NextResponse.json(
          {
            success: false,
            error: 'Posting Failed',
            message: postResult.error || 'Failed to post to platform',
          },
          { status: 500 }
        );
      }

      // Update status to 'posted'
      const { data: updatedPost, error: updateError } = await supabase
        .from('social_posts')
        .update({
          status: 'posted',
          posted_at: new Date().toISOString(),
          platform_post_id: postResult.platform_post_id,
          platform_post_url: postResult.platform_post_url,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('[Social Posts API] Error updating post after posting:', updateError);
        return NextResponse.json(
          {
            success: false,
            error: 'Database Error',
            message: 'Post was created but failed to update database',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Post published successfully',
        post: {
          id: updatedPost.id,
          platform: updatedPost.platform,
          status: updatedPost.status,
          posted_at: updatedPost.posted_at,
          platform_post_url: updatedPost.platform_post_url,
        },
      });
    } catch (postingError: any) {
      console.error('[Social Posts API] Error posting to platform:', postingError);

      // Update status to 'failed'
      await supabase
        .from('social_posts')
        .update({
          status: 'failed',
          error_message: postingError.message || 'Unknown error occurred',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json(
        {
          success: false,
          error: 'Posting Failed',
          message: postingError.message || 'Failed to post to platform',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Social Posts API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to post to social media',
      },
      { status: 500 }
    );
  }
}

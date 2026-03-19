import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  canSendTeamBroadcast,
  canShareTraining,
  incrementTrainingShareUsage,
} from '@/lib/autopilot/team-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for sharing training
const shareTrainingSchema = z.object({
  training_video_id: z.string().uuid('Invalid training video ID'),
  shared_with_distributor_ids: z.array(z.string().uuid()).min(1, 'At least one recipient required'),
  personal_message: z.string().max(500).optional(),
});

/**
 * POST /api/autopilot/team/training/share
 * Share training video with downline members
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
          message: 'You must be logged in to share training',
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
      console.error('[Training Share API] Error fetching distributor:', distError);
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
          message: 'Team Edition subscription required to share training',
        },
        { status: 403 }
      );
    }

    // Check if distributor can share more training
    const canShare = await canShareTraining(distributor.id);
    if (!canShare) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit Reached',
          message: 'You have reached your monthly training share limit',
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = shareTrainingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid share data',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get training video details
    const { data: trainingVideo, error: videoError } = await supabase
      .from('training_videos')
      .select('id, title')
      .eq('id', data.training_video_id)
      .single();

    if (videoError || !trainingVideo) {
      console.error('[Training Share API] Error fetching training video:', videoError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Training video not found',
        },
        { status: 404 }
      );
    }

    // Get recipient details
    const { data: recipients, error: recipientsError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .in('id', data.shared_with_distributor_ids);

    if (recipientsError || !recipients || recipients.length === 0) {
      console.error('[Training Share API] Error fetching recipients:', recipientsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Recipients not found',
        },
        { status: 404 }
      );
    }

    // Create share records for each recipient
    const senderName = `${distributor.first_name} ${distributor.last_name}`;
    const shareRecords = recipients.map((recipient) => ({
      shared_by_distributor_id: distributor.id,
      shared_by_name: senderName,
      shared_with_distributor_id: recipient.id,
      shared_with_name: `${recipient.first_name} ${recipient.last_name}`,
      training_video_id: trainingVideo.id,
      training_title: trainingVideo.title,
      personal_message: data.personal_message || null,
      notification_sent: false, // Will be set to true when notification is actually sent
    }));

    const { data: shares, error: createError } = await supabase
      .from('training_shares')
      .insert(shareRecords)
      .select();

    if (createError || !shares) {
      console.error('[Training Share API] Error creating shares:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to create training shares',
        },
        { status: 500 }
      );
    }

    // TODO: Send notifications to recipients
    // In production, this would send email/in-app notifications
    // For now, we're just creating the records

    // Increment usage counter for each share
    for (let i = 0; i < shares.length; i++) {
      await incrementTrainingShareUsage(distributor.id);
    }

    return NextResponse.json({
      success: true,
      message: `Training video shared with ${shares.length} team member${shares.length > 1 ? 's' : ''}`,
      shares: shares.map((share) => ({
        id: share.id,
        shared_with_name: share.shared_with_name,
        training_title: share.training_title,
        created_at: share.created_at,
      })),
    });
  } catch (error: any) {
    console.error('[Training Share API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to share training',
      },
      { status: 500 }
    );
  }
}

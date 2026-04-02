import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const updateStatusSchema = z.object({
  status: z.enum(['active', 'paused', 'cancelled']),
});

/**
 * PATCH /api/dashboard/nurture-campaigns/[id]/status
 * Update campaign status (pause, resume, cancel)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate input
    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;
    const { id: campaignId } = await params;

    const supabase = await createClient();

    // 3. Verify campaign ownership
    const { data: campaign, error: fetchError } = await supabase
      .from('nurture_campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('distributor_id', currentDist.id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found or access denied' },
        { status: 404 }
      );
    }

    // 4. Prevent updating completed campaigns
    if (campaign.campaign_status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot modify completed campaign' },
        { status: 400 }
      );
    }

    // 5. Build update object based on new status
    const updateData: Record<string, any> = {
      campaign_status: status,
    };

    // If resuming, set next_email_at to 24 hours from now
    if (status === 'active' && campaign.campaign_status === 'paused') {
      updateData.next_email_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    // If pausing or cancelling, clear next_email_at
    if (status === 'paused' || status === 'cancelled') {
      updateData.next_email_at = null;
    }

    // 6. Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('nurture_campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: getStatusMessage(status),
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get user-friendly message for status change
 */
function getStatusMessage(status: string): string {
  switch (status) {
    case 'active':
      return 'Campaign resumed successfully';
    case 'paused':
      return 'Campaign paused successfully';
    case 'cancelled':
      return 'Campaign cancelled successfully';
    default:
      return 'Campaign updated successfully';
  }
}

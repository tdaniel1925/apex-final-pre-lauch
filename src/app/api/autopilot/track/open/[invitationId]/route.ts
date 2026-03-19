import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 1x1 transparent GIF (base64)
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * GET /api/autopilot/track/open/[invitationId]
 * Tracking pixel endpoint - records when invitation email is opened
 * Returns a 1x1 transparent GIF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { invitationId } = await params;

    // Fetch invitation (no auth required - this is a tracking pixel)
    const { data: invitation, error: fetchError } = await supabase
      .from('meeting_invitations')
      .select('id, status, opened_at, open_count')
      .eq('id', invitationId)
      .single();

    if (!fetchError && invitation) {
      // Increment open count
      const newOpenCount = (invitation.open_count || 0) + 1;

      // Determine new status
      let newStatus = invitation.status;
      if (invitation.status === 'sent' && !invitation.opened_at) {
        // First open - update status to 'opened'
        newStatus = 'opened';
      }

      // Update invitation
      await supabase
        .from('meeting_invitations')
        .update({
          opened_at: invitation.opened_at || new Date().toISOString(),
          open_count: newOpenCount,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

      // Successfully tracked invitation open
    } else {
      // Invitation not found - tracking pixel still returns successfully
    }

    // Always return tracking pixel (even if update failed)
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error: any) {
    console.error('[Tracking Pixel] Error:', error);

    // Still return tracking pixel even on error
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }
}

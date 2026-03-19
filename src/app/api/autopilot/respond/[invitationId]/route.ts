import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';
import type { ResponseType } from '@/lib/autopilot/invitation-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/respond/[invitationId]?response=yes|no|maybe
 * Handle invitation response tracking
 * Redirects to thank you page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const supabase = createServiceClient();
    const { invitationId } = await params;

    // Get response type from query params
    const searchParams = request.nextUrl.searchParams;
    const response = searchParams.get('response') as ResponseType | null;

    // Validate response type
    if (!response || !['yes', 'no', 'maybe'].includes(response)) {
      // Redirect to error page
      return NextResponse.redirect(
        new URL(
          '/autopilot/respond/thank-you?error=invalid_response',
          request.url
        )
      );
    }

    // Fetch invitation (no auth required - public response link)
    const { data: invitation, error: fetchError } = await supabase
      .from('meeting_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      console.error('[Response API] Invitation not found:', fetchError);
      return NextResponse.redirect(
        new URL(
          '/autopilot/respond/thank-you?error=not_found',
          request.url
        )
      );
    }

    // Check if already responded
    if (invitation.response_type) {
      // Already responded - redirect with existing response
      return NextResponse.redirect(
        new URL(
          `/autopilot/respond/thank-you?response=${invitation.response_type}&already_responded=true&invitation_id=${invitationId}`,
          request.url
        )
      );
    }

    // Map response to status
    const statusMap: Record<ResponseType, string> = {
      yes: 'responded_yes',
      no: 'responded_no',
      maybe: 'responded_maybe',
    };

    // Update invitation with response
    const { error: updateError } = await supabase
      .from('meeting_invitations')
      .update({
        response_type: response,
        responded_at: new Date().toISOString(),
        status: statusMap[response],
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('[Response API] Error updating invitation:', updateError);
      return NextResponse.redirect(
        new URL(
          '/autopilot/respond/thank-you?error=update_failed',
          request.url
        )
      );
    }

    // Response recorded successfully - fetch distributor info for thank you page
    const { data: distributor } = await supabase
      .from('distributors')
      .select('first_name, last_name, phone, email')
      .eq('id', invitation.distributor_id)
      .single();

    const distributorName = distributor
      ? `${distributor.first_name} ${distributor.last_name}`
      : 'Distributor';

    // Build thank you page URL with context
    const thankYouUrl = new URL('/autopilot/respond/thank-you', request.url);
    thankYouUrl.searchParams.set('response', response);
    thankYouUrl.searchParams.set('invitation_id', invitationId);
    thankYouUrl.searchParams.set('meeting_title', invitation.meeting_title);
    thankYouUrl.searchParams.set('meeting_date', invitation.meeting_date_time);
    thankYouUrl.searchParams.set('distributor_name', distributorName);

    if (invitation.meeting_link) {
      thankYouUrl.searchParams.set('meeting_link', invitation.meeting_link);
    }

    if (distributor?.phone) {
      thankYouUrl.searchParams.set('distributor_phone', distributor.phone);
    }

    if (distributor?.email) {
      thankYouUrl.searchParams.set('distributor_email', distributor.email);
    }

    // Redirect to thank you page
    return NextResponse.redirect(thankYouUrl);
  } catch (error: any) {
    console.error('[Response API] Error:', error);
    return NextResponse.redirect(
      new URL(
        '/autopilot/respond/thank-you?error=server_error',
        request.url
      )
    );
  }
}

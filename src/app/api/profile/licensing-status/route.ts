// =============================================
// User Licensing Status Change Request API
// POST /api/profile/licensing-status
// Users submit requests for corporate approval
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

/**
 * POST /api/profile/licensing-status
 *
 * Creates a change request for corporate approval (NO immediate update)
 *
 * Body:
 *   - licensing_status: 'licensed' | 'non_licensed'
 *   - reason?: string (optional explanation)
 *   - documentation_url?: string (license docs URL)
 *
 * Response:
 *   - request: Created placement change request
 *   - message: Success message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licensing_status, reason, documentation_url } = body;

    // Validate licensing_status
    if (!licensing_status || !['licensed', 'non_licensed'].includes(licensing_status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          message: 'Please provide a valid licensing status (licensed or non_licensed)',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Get current distributor
    const { data: currentDistributor } = await supabase
      .from('distributors')
      .select('id, licensing_status')
      .eq('auth_user_id', user.id)
      .single();

    if (!currentDistributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Distributor record not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // If status hasn't changed, return success without creating request
    if (currentDistributor.licensing_status === licensing_status) {
      return NextResponse.json(
        {
          success: true,
          data: { unchanged: true },
          message: 'Licensing status unchanged - no request needed',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Check for existing pending request (limit to 1 pending request at a time)
    const serviceClient = createServiceClient();
    const { data: existingRequest } = await serviceClient
      .from('insurance_placement_change_requests')
      .select('id, status, created_at')
      .eq('agent_id', currentDistributor.id)
      .eq('request_type', 'license_status_change')
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pending request exists',
          message: 'You already have a pending license status change request. Please wait for corporate approval.',
          data: { existingRequest },
        } as ApiResponse,
        { status: 409 } // Conflict
      );
    }

    // Create placement change request
    const { data: changeRequest, error: requestError } = await serviceClient
      .from('insurance_placement_change_requests')
      .insert({
        agent_id: currentDistributor.id,
        requested_by: currentDistributor.id,
        request_type: 'license_status_change',
        current_status: currentDistributor.licensing_status,
        proposed_status: licensing_status,
        reason: reason || `Requesting to change status to ${licensing_status}`,
        documentation_url,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError || !changeRequest) {
      console.error('Error creating placement change request:', requestError);
      return NextResponse.json(
        {
          success: false,
          error: 'Request creation failed',
          message: 'Failed to create placement change request',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // TODO: Send email notification to corporate admins
    // await sendAdminNotification(changeRequest);

    return NextResponse.json(
      {
        success: true,
        data: { request: changeRequest },
        message: 'License status change request submitted for review. You will be notified when it is approved or rejected.',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Licensing status API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

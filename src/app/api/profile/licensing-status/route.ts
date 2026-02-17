// =============================================
// User Licensing Status Update API
// POST /api/profile/licensing-status
// Users can update their own licensing status
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

/**
 * POST /api/profile/licensing-status
 *
 * Updates the current user's licensing status
 *
 * Body:
 *   - licensing_status: 'licensed' | 'non_licensed'
 *
 * Response:
 *   - distributor: Updated distributor object
 *   - message: Success message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licensing_status } = body;

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

    // Get current distributor to check existing status
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

    // If status hasn't changed, return success without updating
    if (currentDistributor.licensing_status === licensing_status) {
      return NextResponse.json(
        {
          success: true,
          data: { distributor: currentDistributor },
          message: 'Licensing status unchanged',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Prepare update data
    const updateData: any = {
      licensing_status,
      licensing_status_set_at: new Date().toISOString(),
    };

    // If changing to non_licensed, clear verification fields
    if (licensing_status === 'non_licensed') {
      updateData.licensing_verified = false;
      updateData.licensing_verified_at = null;
      updateData.licensing_verified_by = null;
    }

    // If changing to licensed, set verified to false (awaiting verification)
    if (licensing_status === 'licensed') {
      updateData.licensing_verified = false;
    }

    // Update using service client to bypass RLS
    const serviceClient = createServiceClient();
    const { data: distributor, error: updateError } = await serviceClient
      .from('distributors')
      .update(updateData)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (updateError || !distributor) {
      console.error('Licensing status update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Update failed',
          message: 'Failed to update licensing status',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { distributor },
        message: 'Licensing status updated successfully',
      } as ApiResponse,
      { status: 200 }
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

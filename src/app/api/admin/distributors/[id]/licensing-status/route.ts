// =============================================
// Admin Licensing Status Management API
// POST /api/admin/distributors/:id/licensing-status
// Verify licenses and change licensing status
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/admin/distributors/:id/licensing-status
 *
 * Admin actions:
 * - Verify a distributor's license
 * - Change a distributor's licensing status
 *
 * Body:
 *   - action: 'verify' | 'change_status'
 *   - licensing_status?: 'licensed' | 'non_licensed' (required for change_status)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: distributorId } = await context.params;
    const body = await request.json();
    const { action, licensing_status } = body;

    // Check admin auth
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

    // Check if user is admin
    const { data: admin } = await supabase
      .from('distributors')
      .select('is_master')
      .eq('auth_user_id', user.id)
      .single();

    if (!admin || !admin.is_master) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        } as ApiResponse,
        { status: 403 }
      );
    }

    const serviceClient = createServiceClient();

    // Handle verify action
    if (action === 'verify') {
      const { data: distributor, error: updateError } = await serviceClient
        .from('distributors')
        .update({
          licensing_verified: true,
          licensing_verified_at: new Date().toISOString(),
          licensing_verified_by: user.id,
        })
        .eq('id', distributorId)
        .select()
        .single();

      if (updateError || !distributor) {
        console.error('License verification error:', updateError);
        return NextResponse.json(
          {
            success: false,
            error: 'Verification failed',
            message: 'Failed to verify license',
          } as ApiResponse,
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: { distributor },
          message: 'License verified successfully',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Handle change_status action
    if (action === 'change_status') {
      if (!licensing_status || !['licensed', 'non_licensed'].includes(licensing_status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid status',
            message: 'Please provide a valid licensing status',
          } as ApiResponse,
          { status: 400 }
        );
      }

      // If changing to non_licensed, clear verification
      const updateData: any = {
        licensing_status,
        licensing_status_set_at: new Date().toISOString(),
      };

      if (licensing_status === 'non_licensed') {
        updateData.licensing_verified = false;
        updateData.licensing_verified_at = null;
        updateData.licensing_verified_by = null;
      }

      const { data: distributor, error: updateError } = await serviceClient
        .from('distributors')
        .update(updateData)
        .eq('id', distributorId)
        .select()
        .single();

      if (updateError || !distributor) {
        console.error('Status change error:', updateError);
        return NextResponse.json(
          {
            success: false,
            error: 'Status change failed',
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
    }

    // Invalid action
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action',
        message: 'Action must be "verify" or "change_status"',
      } as ApiResponse,
      { status: 400 }
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

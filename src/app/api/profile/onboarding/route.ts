// =============================================
// Onboarding Progress API
// POST /api/profile/onboarding
// Saves user's onboarding progress
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse, Distributor } from '@/lib/types';

/**
 * POST /api/profile/onboarding
 *
 * Updates onboarding progress for the authenticated user
 *
 * Body:
 *   - onboarding_step: number (1-6)
 *   - onboarding_completed: boolean (optional)
 *
 * Response:
 *   - distributor: Updated Distributor object
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { onboarding_step, onboarding_completed } = body;

    // Validate request
    if (typeof onboarding_step !== 'number' || onboarding_step < 1 || onboarding_step > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid onboarding step',
          message: 'Onboarding step must be between 1 and 6',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Update onboarding progress using service client (bypass RLS)
    const serviceClient = createServiceClient();

    const updateData: any = {
      onboarding_step,
    };

    // If completing onboarding, set completion timestamp
    if (onboarding_completed === true) {
      updateData.onboarding_completed = true;
      updateData.onboarding_completed_at = new Date().toISOString();
    }

    const { data: distributor, error: updateError } = await serviceClient
      .from('distributors')
      .update(updateData)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (updateError || !distributor) {
      console.error('Onboarding update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Update failed',
          message: 'Failed to save onboarding progress',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: distributor as Distributor,
        message: 'Onboarding progress saved',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding API error:', error);

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

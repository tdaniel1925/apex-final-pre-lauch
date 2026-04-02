// =============================================
// API Route: Update Onboarding Session Stage
// PATCH /api/admin/onboarding/update-stage
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';
import { z } from 'zod';
import { FULFILLMENT_STAGES } from '@/lib/types/fulfillment';

// Validation schema
const updateStageSchema = z.object({
  session_id: z.string().uuid(),
  fulfillment_stage: z.enum(FULFILLMENT_STAGES),
});

export async function PATCH(req: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    // Parse and validate request body
    const body = await req.json();
    const validation = updateStageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { session_id, fulfillment_stage } = validation.data;

    // Update the fulfillment stage
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('onboarding_sessions')
      .update({
        fulfillment_stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating fulfillment stage:', error);
      return NextResponse.json(
        { error: 'Failed to update stage', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Unexpected error in update-stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

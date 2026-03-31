import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sendFulfillmentStageChangeEmail } from '@/lib/fulfillment/notifications';

export const dynamic = 'force-dynamic';

interface UpdateStageRequest {
  fulfillment_id: string;
  new_stage: string;
  notes?: string;
}

const VALID_STAGES = [
  'service_payment_made',
  'onboarding_date_set',
  'onboarding_complete',
  'pages_being_built',
  'social_media_proofs',
  'content_approved',
  'campaigns_launched',
  'service_completed',
];

/**
 * POST /api/fulfillment/update-stage
 * Update fulfillment stage (admin only)
 */
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  try {
    const body: UpdateStageRequest = await request.json();
    const { fulfillment_id, new_stage, notes } = body;

    // Validate input
    if (!fulfillment_id || !new_stage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!VALID_STAGES.includes(new_stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    // Get current fulfillment record
    const { data: currentRecord, error: fetchError } = await supabase
      .from('fulfillment_kanban')
      .select('*, distributor:distributors!fulfillment_kanban_distributor_id_fkey(id, first_name, last_name, email)')
      .eq('id', fulfillment_id)
      .single();

    if (fetchError || !currentRecord) {
      return NextResponse.json(
        { error: 'Fulfillment record not found' },
        { status: 404 }
      );
    }

    // Don't update if already at this stage
    if (currentRecord.stage === new_stage) {
      return NextResponse.json({
        message: 'Already at this stage',
        record: currentRecord,
      });
    }

    // Build new stage history entry
    const newHistoryEntry = {
      stage: new_stage,
      moved_at: new Date().toISOString(),
      moved_by: null, // TODO: Get admin user ID from session
      auto: false,
      notes: notes || undefined,
    };

    const updatedHistory = [
      ...(currentRecord.stage_history as any[]),
      newHistoryEntry,
    ];

    // Update the record
    const { data: updatedRecord, error: updateError } = await supabase
      .from('fulfillment_kanban')
      .update({
        stage: new_stage,
        moved_to_current_stage_at: new Date().toISOString(),
        auto_transitioned: false,
        notes: notes || currentRecord.notes,
        stage_history: updatedHistory,
      })
      .eq('id', fulfillment_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update fulfillment stage:', updateError);
      return NextResponse.json(
        { error: 'Failed to update stage' },
        { status: 500 }
      );
    }

    // Send notification to rep
    await sendFulfillmentStageChangeEmail({
      fulfillmentId: fulfillment_id,
      distributorId: currentRecord.distributor_id,
      clientName: currentRecord.client_name,
      productSlug: currentRecord.product_slug,
      newStage: new_stage,
      notes: notes,
    });

    return NextResponse.json({
      success: true,
      record: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating fulfillment stage:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

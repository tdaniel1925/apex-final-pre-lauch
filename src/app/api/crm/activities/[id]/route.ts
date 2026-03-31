// =============================================
// CRM Activities API - Single Activity Operations
// GET: Get single activity
// PUT: Update activity
// DELETE: Delete activity
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { z } from 'zod';

// =============================================
// Validation Schemas
// =============================================

const updateActivitySchema = z.object({
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'task_completed']).optional(),
  subject: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  duration_minutes: z.number().int().min(0).optional().nullable(),
  outcome: z.enum(['successful', 'no_answer', 'voicemail', 'scheduled_followup', 'not_interested']).optional().nullable(),
  activity_date: z.string().datetime().optional(),
});

// =============================================
// GET /api/crm/activities/[id] - Get single activity
// =============================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: activity, error } = await supabase
      .from('crm_activities')
      .select('*')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (error || !activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Unexpected error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PUT /api/crm/activities/[id] - Update activity
// =============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = updateActivitySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    const supabase = await createClient();

    // Verify activity exists and belongs to current distributor
    const { data: existing } = await supabase
      .from('crm_activities')
      .select('id')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Update activity
    const { data: activity, error } = await supabase
      .from('crm_activities')
      .update(updateData)
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity:', error);
      return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Unexpected error updating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// DELETE /api/crm/activities/[id] - Delete activity
// =============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Delete activity (RLS will ensure it belongs to current distributor)
    const { error } = await supabase
      .from('crm_activities')
      .delete()
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id);

    if (error) {
      console.error('Error deleting activity:', error);
      return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

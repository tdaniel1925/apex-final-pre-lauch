// =============================================
// CRM Tasks API - Mark Task as Complete
// POST: Quick endpoint to mark task as completed
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';

// =============================================
// POST /api/crm/tasks/[id]/complete - Mark as completed
// =============================================
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify task exists and belongs to current distributor
    const { data: existing } = await supabase
      .from('crm_tasks')
      .select('id, status')
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existing.status === 'completed') {
      return NextResponse.json(
        { error: 'Task is already completed' },
        { status: 400 }
      );
    }

    // Mark task as completed
    const { data: task, error } = await supabase
      .from('crm_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('distributor_id', currentDist.id)
      .select()
      .single();

    if (error) {
      console.error('Error completing task:', error);
      return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Unexpected error completing task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

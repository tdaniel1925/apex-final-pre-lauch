// =============================================
// AI Recommendations API - Complete
// Mark a recommendation as completed
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const recommendationId = id;

    // Update recommendation (only if it belongs to current distributor)
    const { error } = await supabase
      .from('ai_genealogy_recommendations')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', recommendationId)
      .eq('distributor_id', currentDist.id); // Security: ensure ownership

    if (error) {
      console.error('Error completing recommendation:', error);
      return NextResponse.json(
        { error: 'Failed to complete recommendation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in complete route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

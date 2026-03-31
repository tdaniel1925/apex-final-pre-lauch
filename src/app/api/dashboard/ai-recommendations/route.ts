// =============================================
// AI Recommendations API - Fetch
// Get today's AI recommendations for current distributor
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';

export async function GET() {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get active recommendations (not dismissed, not completed)
    // Generated in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: recommendations, error } = await supabase
      .from('ai_genealogy_recommendations')
      .select('*')
      .eq('distributor_id', currentDist.id)
      .eq('dismissed', false)
      .eq('completed', false)
      .gte('generated_at', oneDayAgo.toISOString())
      .order('priority', { ascending: false }) // urgent > high > medium > low
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendations: recommendations || [],
    });
  } catch (error: any) {
    console.error('Error in ai-recommendations route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

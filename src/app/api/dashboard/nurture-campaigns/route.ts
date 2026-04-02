import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/nurture-campaigns
 * Fetch all campaigns for the current user
 */
export async function GET() {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch campaigns for this distributor
    const { data: campaigns, error } = await supabase
      .from('nurture_campaigns')
      .select('*')
      .eq('distributor_id', currentDist.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

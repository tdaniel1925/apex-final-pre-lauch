import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentDistributor } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/nurture-campaigns/check-limit
 * Check if user can create more campaigns (1 free, unlimited with Business Center)
 */
export async function GET() {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();

    // Call the database function to check limits
    const { data, error } = await supabase
      .rpc('check_campaign_limit', { p_distributor_id: currentDist.id });

    if (error) {
      return NextResponse.json({ error: 'Failed to check limit' }, { status: 500 });
    }

    return NextResponse.json(data || { can_create: false, limit: 1, current: 0, reason: 'unknown' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

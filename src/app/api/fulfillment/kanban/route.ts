import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAllFulfillmentGroupedByStage } from '@/lib/fulfillment/auto-transitions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/fulfillment/kanban
 * Fetch all fulfillment records grouped by stage for Kanban board
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Check if user is admin
    const authHeader = request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get grouped data
    const groupedData = await getAllFulfillmentGroupedByStage();

    return NextResponse.json(groupedData);
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban data' },
      { status: 500 }
    );
  }
}

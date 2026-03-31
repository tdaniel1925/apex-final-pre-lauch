// =============================================
// Usage Stats API
// Get current usage for AI chatbot and voice
// =============================================

import { NextResponse } from 'next/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { getUsageStats } from '@/lib/usage/tracking';

export async function GET() {
  try {
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usage = await getUsageStats(currentDist.id);

    return NextResponse.json({
      usage,
    });
  } catch (error: any) {
    console.error('Error in usage-stats route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

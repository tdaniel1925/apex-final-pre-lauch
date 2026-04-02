/**
 * Daily Qualification Update Cron Job
 *
 * Runs at 2am every day to update qualification status of all pending estimated earnings.
 *
 * Vercel Cron Configuration (in vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-estimates",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 *
 * Schedule: 0 2 * * * = Every day at 2:00 AM UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateDailyQualifications } from '@/lib/compensation/update-estimates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/cron/update-estimates
 *
 * Called by Vercel Cron at 2am daily.
 * Updates qualification status for all pending estimated earnings.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production') {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        console.error('Unauthorized cron request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🕐 Starting daily qualification update cron job...');

    // Run the daily qualification update
    const summary = await updateDailyQualifications();

    console.log('✅ Cron job complete');

    return NextResponse.json({
      success: true,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Daily qualification update failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

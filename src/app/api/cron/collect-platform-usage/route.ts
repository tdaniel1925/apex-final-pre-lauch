// =============================================
// Cron Job: Collect Platform Usage
// GET /api/cron/collect-platform-usage
// Runs daily to collect Vercel and Supabase usage
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { recordVercelUsage } from '@/lib/services/vercel-usage';
import { recordSupabaseUsage } from '@/lib/services/supabase-usage';

/**
 * Cron job to collect daily platform usage
 *
 * Configure in Vercel:
 * 1. Go to Project Settings → Cron Jobs
 * 2. Add cron: /api/cron/collect-platform-usage
 * 3. Schedule: "0 1 * * *" (1 AM daily)
 *
 * Or use Vercel cron config:
 * vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/collect-platform-usage",
 *     "schedule": "0 1 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron or an authorized request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      vercel: { success: false, error: null as string | null },
      supabase: { success: false, error: null as string | null },
    };

    // Collect yesterday's usage (since today isn't complete yet)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Collect Vercel usage
    try {
      await recordVercelUsage(yesterday);
      results.vercel.success = true;
    } catch (error: any) {
      console.error('Failed to collect Vercel usage:', error);
      results.vercel.error = error.message;
    }

    // Collect Supabase usage
    try {
      await recordSupabaseUsage(yesterday);
      results.supabase.success = true;
    } catch (error: any) {
      console.error('Failed to collect Supabase usage:', error);
      results.supabase.error = error.message;
    }

    return NextResponse.json({
      success: results.vercel.success && results.supabase.success,
      date: yesterday.toISOString().split('T')[0],
      results,
      message: 'Platform usage collection completed',
    });
  } catch (error: any) {
    console.error('Platform usage collection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to collect platform usage',
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

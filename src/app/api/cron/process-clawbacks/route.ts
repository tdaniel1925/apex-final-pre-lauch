/**
 * Cron Job: Process Clawbacks
 *
 * POST /api/cron/process-clawbacks
 * - Clear expired clawback queue entries (after 60-day window)
 * - Run daily at 2:00 AM via Supabase pg_cron
 *
 * SECURITY: Verify request is from Supabase service role or has valid cron token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  clearExpiredClawbackQueue,
  getActiveClawbackQueue,
} from '@/lib/compensation/clawback-processor';

const CRON_SECRET = process.env.CRON_SECRET || 'change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authorization (cron secret or service role key)
    const authHeader = request.headers.get('authorization');
    const cronToken = request.headers.get('x-cron-token');

    const isValidCronToken = cronToken === CRON_SECRET;
    const isServiceRole = authHeader?.includes(process.env.SUPABASE_SERVICE_ROLE_KEY || '');

    if (!isValidCronToken && !isServiceRole) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid cron token or service role key' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting clawback processing job...');

    // 2. Clear expired clawback queue entries
    const clearedCount = await clearExpiredClawbackQueue();

    console.log(`[CRON] Cleared ${clearedCount} expired clawback queue entries`);

    // 3. Get remaining active clawback queue
    const activeQueue = await getActiveClawbackQueue();

    console.log(`[CRON] ${activeQueue.length} clawback entries still active`);

    // 4. Log to audit log
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    await supabase.from('audit_log').insert({
      action: 'cab_clawback_processed',
      actor_type: 'system',
      actor_id: null,
      table_name: 'cab_clawback_queue',
      record_id: null,
      details: {
        cleared_count: clearedCount,
        active_count: activeQueue.length,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Clawback processing complete',
      cleared_count: clearedCount,
      active_count: activeQueue.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Clawback processing error:', error);
    return NextResponse.json(
      {
        error: 'Clawback processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow GET for health checks
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'process-clawbacks',
    schedule: '0 2 * * *', // Daily at 2:00 AM
  });
}

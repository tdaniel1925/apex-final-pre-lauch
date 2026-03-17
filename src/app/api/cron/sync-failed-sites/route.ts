// =============================================
// Cron Job: Retry Failed Site Creations
// GET /api/cron/sync-failed-sites
// Runs daily to retry all failed site creations
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { retryFailedSites } from '@/lib/integrations/user-sync/service';
import type { ApiResponse } from '@/lib/types';

/**
 * GET /api/cron/sync-failed-sites
 *
 * Cron job that retries all failed site creations
 * Should be called by a cron service (Vercel Cron, etc.)
 *
 * Security:
 *   - Requires CRON_SECRET header to match env variable
 *   - Or can be called by authenticated admin
 *
 * Response:
 *   - success: boolean
 *   - processed: number of distributors processed
 *   - retried: number of sites retried
 *   - succeeded: number of successful retries
 *   - failed: number of failed retries
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && cronSecret !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid cron secret',
        } as ApiResponse,
        { status: 401 }
      );
    }

    console.log('[CronJob] Starting failed sites sync job');

    const supabase = createServiceClient();

    // Find all distributors with failed sites that haven't exceeded max retries
    const { data: failedSites, error: fetchError } = await supabase
      .from('distributor_replicated_sites')
      .select(`
        *,
        distributor:distributors(id, slug, first_name, last_name),
        integration:platform_integrations(max_retry_attempts)
      `)
      .eq('status', 'failed')
      .order('last_sync_attempt_at', { ascending: true });

    if (fetchError) {
      console.error('[CronJob] Failed to fetch failed sites:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: fetchError.message,
        } as ApiResponse,
        { status: 500 }
      );
    }

    if (!failedSites || failedSites.length === 0) {
      console.log('[CronJob] No failed sites to retry');
      return NextResponse.json(
        {
          success: true,
          data: {
            processed: 0,
            retried: 0,
            succeeded: 0,
            failed: 0,
          },
          message: 'No failed sites to retry',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Filter sites that haven't exceeded max retries
    const retryableSites = failedSites.filter((site) => {
      const maxRetries = site.integration?.max_retry_attempts || 5;
      return site.sync_attempts < maxRetries;
    });

    if (retryableSites.length === 0) {
      console.log('[CronJob] All failed sites have exceeded max retries');
      return NextResponse.json(
        {
          success: true,
          data: {
            processed: failedSites.length,
            retried: 0,
            succeeded: 0,
            failed: 0,
          },
          message: 'All failed sites have exceeded max retries',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Group by distributor ID to avoid multiple calls for same distributor
    const distributorIds = [...new Set(retryableSites.map((site) => site.distributor_id))];

    console.log(`[CronJob] Retrying ${retryableSites.length} failed sites for ${distributorIds.length} distributors`);

    let totalRetried = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;

    // Retry each distributor's failed sites
    for (const distributorId of distributorIds) {
      try {
        const results = await retryFailedSites(distributorId);
        totalRetried += results.length;
        totalSucceeded += results.filter((r) => r.success).length;
        totalFailed += results.filter((r) => !r.success).length;
      } catch (error) {
        console.error(`[CronJob] Error retrying sites for distributor ${distributorId}:`, error);
        totalFailed += retryableSites.filter((s) => s.distributor_id === distributorId).length;
      }
    }

    console.log(`[CronJob] Completed: ${totalSucceeded} succeeded, ${totalFailed} failed`);

    return NextResponse.json(
      {
        success: true,
        data: {
          processed: distributorIds.length,
          retried: totalRetried,
          succeeded: totalSucceeded,
          failed: totalFailed,
        },
        message: `Retry job completed: ${totalSucceeded} of ${totalRetried} sites succeeded`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[CronJob] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/sync-failed-sites
 *
 * Alternative endpoint for cron services that require POST
 * Just delegates to the GET handler
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

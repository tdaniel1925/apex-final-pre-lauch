// =============================================
// Admin Manual User Sync API Route
// POST /api/admin/integrations/sync-user
// Allows admins to manually sync a distributor to external platforms
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createReplicatedSites,
  createReplicatedSite,
  retryFailedSites,
} from '@/lib/integrations/user-sync/service';
import type { ApiResponse } from '@/lib/types';
import { z } from 'zod';

// Request validation schema
const syncUserSchema = z.object({
  distributor_id: z.string().uuid('Invalid distributor ID'),
  integration_id: z.string().uuid('Invalid integration ID').optional(),
  action: z.enum(['sync_all', 'sync_specific', 'retry_failed']).default('sync_all'),
});

/**
 * POST /api/admin/integrations/sync-user
 *
 * Manually sync a distributor to external platforms
 *
 * Body:
 *   - distributor_id: string (UUID) - Required
 *   - integration_id: string (UUID) - Optional, for specific integration
 *   - action: 'sync_all' | 'sync_specific' | 'retry_failed' - Default: 'sync_all'
 *
 * Actions:
 *   - sync_all: Create sites on all enabled integrations
 *   - sync_specific: Create site on specific integration (requires integration_id)
 *   - retry_failed: Retry all failed site creations
 *
 * Response:
 *   - success: boolean
 *   - results: Array of sync results
 *   - message: Success/error message
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Verify admin status
    const { data: distributor } = await supabase
      .from('distributors')
      .select('is_admin')
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor?.is_admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Admin access required',
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = syncUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: validationResult.error.issues[0]?.message || 'Invalid input',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { distributor_id, integration_id, action } = validationResult.data;

    // Verify distributor exists
    const { data: targetDistributor, error: distributorError } = await supabase
      .from('distributors')
      .select('id, slug, first_name, last_name')
      .eq('id', distributor_id)
      .single();

    if (distributorError || !targetDistributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor not found',
          message: `Distributor with ID ${distributor_id} does not exist`,
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Execute requested action
    let results: unknown[] = [];
    let message = '';

    switch (action) {
      case 'sync_all':
        console.log(`[AdminSync] Syncing all integrations for distributor ${distributor_id}`);
        await createReplicatedSites(distributor_id);
        message = `Successfully initiated sync for all integrations for ${targetDistributor.first_name} ${targetDistributor.last_name}`;
        break;

      case 'sync_specific':
        if (!integration_id) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing integration_id',
              message: 'integration_id is required for sync_specific action',
            } as ApiResponse,
            { status: 400 }
          );
        }

        console.log(`[AdminSync] Syncing integration ${integration_id} for distributor ${distributor_id}`);
        const siteResult = await createReplicatedSite(integration_id, distributor_id);
        results = [siteResult];
        message = siteResult.success
          ? `Successfully created site: ${siteResult.site_url}`
          : `Failed to create site: ${siteResult.error}`;
        break;

      case 'retry_failed':
        console.log(`[AdminSync] Retrying failed sites for distributor ${distributor_id}`);
        const retryResults = await retryFailedSites(distributor_id, integration_id);
        results = retryResults;
        const successCount = retryResults.filter((r) => r.success).length;
        message = `Retry complete: ${successCount} of ${retryResults.length} sites succeeded`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            message: `Unknown action: ${action}`,
          } as ApiResponse,
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: { results },
        message,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[AdminSync] Error:', error);

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

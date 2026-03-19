// =============================================
// Admin Distributor Replicated Sites API
// GET /api/admin/distributors/[id]/replicated-sites
// Fetch all replicated sites for a distributor
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDistributorReplicatedSites } from '@/lib/integrations/user-sync/service';
import type { ApiResponse } from '@/lib/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/admin/distributors/[id]/replicated-sites
 *
 * Fetch all replicated sites for a specific distributor
 *
 * Response:
 *   - success: boolean
 *   - data: Array of replicated sites with integration details
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // 1. Verify admin access
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to perform this action',
        } as ApiResponse,
        { status: 401 }
      );
    }

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

    // 2. Get distributor ID from params
    const { id: distributorId } = await context.params;

    // 3. Verify distributor exists
    const { data: targetDistributor, error: distributorError } = await supabase
      .from('distributors')
      .select('id, slug, first_name, last_name')
      .eq('id', distributorId)
      .single();

    if (distributorError || !targetDistributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not found',
          message: 'Distributor not found',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // 4. Fetch replicated sites
    const { data: sites, error: sitesError } = await getDistributorReplicatedSites(distributorId);

    if (sitesError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: sitesError.message || 'Failed to fetch replicated sites',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: sites || [],
        message: `Found ${sites?.length || 0} replicated site(s)`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[ReplicatedSites API] Error:', error);
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

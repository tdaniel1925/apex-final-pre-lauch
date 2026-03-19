// =============================================
// Distributors Without Sites API
// GET /api/admin/integrations/bulk-sync/distributors-without-sites
// Fetch all distributors who don't have replicated sites
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

/**
 * GET /api/admin/integrations/bulk-sync/distributors-without-sites
 *
 * Fetch all distributors who don't have any replicated sites yet
 *
 * Response:
 *   - success: boolean
 *   - data: Array of distributors without sites
 */
export async function GET(request: NextRequest) {
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

    // 2. Find distributors without any replicated sites
    const serviceClient = createServiceClient();

    // Get all distributors
    const { data: allDistributors, error: distributorsError } = await serviceClient
      .from('distributors')
      .select('id, slug, first_name, last_name, email, created_at')
      .eq('is_master', false) // Exclude master distributor
      .order('created_at', { ascending: false });

    if (distributorsError) {
      console.error('[BulkSync API] Failed to fetch distributors:', distributorsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to fetch distributors',
        } as ApiResponse,
        { status: 500 }
      );
    }

    if (!allDistributors || allDistributors.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: 'No distributors found',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Get all distributors who have sites
    const { data: distributorsWithSites, error: sitesError } = await serviceClient
      .from('distributor_replicated_sites')
      .select('distributor_id')
      .in('status', ['active', 'pending']);

    if (sitesError) {
      console.error('[BulkSync API] Failed to fetch sites:', sitesError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to fetch replicated sites',
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Filter out distributors who have sites
    const distributorIdsWithSites = new Set(
      (distributorsWithSites || []).map((site) => site.distributor_id)
    );

    const distributorsWithoutSites = allDistributors.filter(
      (dist) => !distributorIdsWithSites.has(dist.id)
    );

    return NextResponse.json(
      {
        success: true,
        data: distributorsWithoutSites,
        message: `Found ${distributorsWithoutSites.length} distributor(s) without replicated sites`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[BulkSync API] Error:', error);
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

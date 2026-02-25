// =============================================
// Distributor Enrollees API
// Get personal and organization enrollee counts
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  getEnrolleeStats,
  getPersonalEnrollees,
  getOrganizationEnrollees,
} from '@/lib/enrollees/enrollee-counter';

// GET /api/distributors/[id]/enrollees
// Get enrollee statistics for a distributor
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeList = searchParams.get('includeList') === 'true';

    // Verify distributor exists
    const serviceClient = createServiceClient();
    const { data: distributor, error } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, slug')
      .eq('id', id)
      .single();

    if (error || !distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Get enrollee counts
    const stats = await getEnrolleeStats(id);

    // Optionally include full lists
    let personalEnrolleesList = [];
    let organizationEnrolleesList = [];

    if (includeList) {
      [personalEnrolleesList, organizationEnrolleesList] = await Promise.all([
        getPersonalEnrollees(id),
        getOrganizationEnrollees(id),
      ]);
    }

    return NextResponse.json({
      success: true,
      distributor: {
        id: distributor.id,
        name: `${distributor.first_name} ${distributor.last_name}`,
        slug: distributor.slug,
      },
      stats: {
        personalEnrollees: stats.personalEnrollees,
        organizationEnrollees: stats.organizationEnrollees,
      },
      ...(includeList && {
        personalEnrolleesList,
        organizationEnrolleesList,
      }),
    });
  } catch (error: any) {
    console.error('Error in GET enrollees API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

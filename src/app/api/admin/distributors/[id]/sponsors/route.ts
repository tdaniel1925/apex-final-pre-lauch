// =============================================
// Get Sponsor Lineage API
// Returns the full sponsor path from master to current distributor
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import type { Distributor } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Check admin auth
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createServiceClient();

    // Get the current distributor
    const { data: distributor, error: distError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Build sponsor path recursively
    const sponsorPath: Distributor[] = [];
    let currentId = distributor.sponsor_id;

    // Traverse up the sponsor tree until we hit master or null
    while (currentId) {
      const { data: sponsor, error } = await serviceClient
        .from('distributors')
        .select('*')
        .eq('id', currentId)
        .single();

      if (error || !sponsor) break;

      sponsorPath.unshift(sponsor); // Add to beginning of array
      currentId = sponsor.sponsor_id;
    }

    return NextResponse.json({
      success: true,
      data: {
        sponsorPath,
        directSponsor: sponsorPath.length > 0 ? sponsorPath[sponsorPath.length - 1] : null,
        totalLevels: sponsorPath.length,
      },
    });
  } catch (error) {
    console.error('Error fetching sponsor path:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sponsor path' },
      { status: 500 }
    );
  }
}

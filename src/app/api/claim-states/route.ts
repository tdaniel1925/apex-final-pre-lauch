// =============================================
// Claim the States API
// Fetch state ownership data and leaderboards
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';

export interface StateOwnershipData {
  code: string;
  name: string;
  status: 'unclaimed' | 'claimed' | 'elite' | 'legacy';
  currentGVP: number;
  currentOwner: {
    id: string;
    name: string;
    photo_url?: string;
    gvp: number;
    dateClaimed?: string;
  } | null;
  firstOwner: {
    id: string;
    name: string;
    photo_url?: string;
    dateClaimed?: string;
    gvp: number;
  } | null;
  topContributors: Array<{
    id: string;
    name: string;
    slug: string;
    photo_url?: string;
    gvp: number;
    rank: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const serviceClient = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const stateCode = searchParams.get('state_code');
    const currentYear = new Date().getFullYear();

    // If state_code is provided, return details for that state
    if (stateCode) {
      return getStateDetails(stateCode, currentYear);
    }

    // Otherwise, return all states overview
    return getAllStates(currentYear);
  } catch (error) {
    console.error('Claim States API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

async function getAllStates(currentYear: number) {
  const serviceClient = createServiceClient();

  // Fetch all state ownership data
  const { data: states, error: statesError } = await serviceClient
    .from('state_ownership')
    .select(`
      state_code,
      state_name,
      current_gvp,
      date_claimed,
      first_owner_id,
      first_owner_name,
      first_claim_date,
      current_owner:distributors!state_ownership_current_owner_id_fkey(
        id,
        first_name,
        last_name,
        profile_photo_url
      )
    `)
    .eq('current_year', currentYear);

  if (statesError) {
    console.error('Error fetching states:', statesError);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch states' } as ApiResponse,
      { status: 500 }
    );
  }

  // Transform to response format
  const statesData: StateOwnershipData[] = (states || []).map((state: any) => {
    const currentGVP = parseFloat(state.current_gvp || '0');

    // Determine status
    let status: 'unclaimed' | 'claimed' | 'elite' | 'legacy' = 'unclaimed';
    if (currentGVP >= 5000) status = 'legacy';
    else if (currentGVP >= 1000) status = 'elite';
    else if (currentGVP >= 500) status = 'claimed';

    return {
      code: state.state_code,
      name: state.state_name,
      status,
      currentGVP,
      currentOwner: state.current_owner ? {
        id: state.current_owner.id,
        name: `${state.current_owner.first_name} ${state.current_owner.last_name}`,
        photo_url: state.current_owner.profile_photo_url,
        gvp: currentGVP,
        dateClaimed: state.date_claimed,
      } : null,
      firstOwner: state.first_owner_id ? {
        id: state.first_owner_id,
        name: state.first_owner_name,
        dateClaimed: state.first_claim_date,
        gvp: 0, // Will be filled from history if needed
      } : null,
      topContributors: [], // Will be populated on individual state view
    };
  });

  // Calculate summary stats
  const summary = {
    totalStates: statesData.length,
    claimedStates: statesData.filter(s => s.status !== 'unclaimed').length,
    unclaimedStates: statesData.filter(s => s.status === 'unclaimed').length,
    eliteStates: statesData.filter(s => s.status === 'elite').length,
    legacyStates: statesData.filter(s => s.status === 'legacy').length,
    totalGVP: statesData.reduce((sum, s) => sum + s.currentGVP, 0),
  };

  return NextResponse.json({
    success: true,
    data: {
      states: statesData,
      summary,
      year: currentYear,
    },
  } as ApiResponse);
}

async function getStateDetails(stateCode: string, currentYear: number) {
  const serviceClient = createServiceClient();

  // Fetch state ownership
  const { data: state, error: stateError } = await serviceClient
    .from('state_ownership')
    .select(`
      state_code,
      state_name,
      current_gvp,
      date_claimed,
      first_owner_id,
      first_owner_name,
      first_claim_date,
      first_claim_gvp,
      current_owner:distributors!state_ownership_current_owner_id_fkey(
        id,
        first_name,
        last_name,
        profile_photo_url
      )
    `)
    .eq('state_code', stateCode.toUpperCase())
    .eq('current_year', currentYear)
    .single();

  if (stateError) {
    console.error('Error fetching state:', stateError);
    return NextResponse.json(
      { success: false, message: 'State not found' } as ApiResponse,
      { status: 404 }
    );
  }

  // Fetch top contributors for this state
  const { data: contributors, error: contributorsError } = await serviceClient
    .from('state_gvp_ledger')
    .select(`
      distributor_id,
      total_gvp,
      distributor:distributors(
        id,
        first_name,
        last_name,
        slug,
        profile_photo_url
      )
    `)
    .eq('state_code', stateCode.toUpperCase())
    .eq('year', currentYear)
    .order('total_gvp', { ascending: false })
    .limit(10);

  if (contributorsError) {
    console.error('Error fetching contributors:', contributorsError);
  }

  const currentGVP = parseFloat(state.current_gvp || '0');

  // Determine status
  let status: 'unclaimed' | 'claimed' | 'elite' | 'legacy' = 'unclaimed';
  if (currentGVP >= 5000) status = 'legacy';
  else if (currentGVP >= 1000) status = 'elite';
  else if (currentGVP >= 500) status = 'claimed';

  const stateData: StateOwnershipData = {
    code: state.state_code,
    name: state.state_name,
    status,
    currentGVP,
    currentOwner: state.current_owner ? {
      id: state.current_owner.id,
      name: `${state.current_owner.first_name} ${state.current_owner.last_name}`,
      photo_url: state.current_owner.profile_photo_url,
      gvp: currentGVP,
      dateClaimed: state.date_claimed,
    } : null,
    firstOwner: state.first_owner_id ? {
      id: state.first_owner_id,
      name: state.first_owner_name,
      dateClaimed: state.first_claim_date,
      gvp: parseFloat(state.first_claim_gvp || '0'),
    } : null,
    topContributors: (contributors || []).map((c: any, index: number) => ({
      id: c.distributor.id,
      name: `${c.distributor.first_name} ${c.distributor.last_name}`,
      slug: c.distributor.slug,
      photo_url: c.distributor.profile_photo_url,
      gvp: parseFloat(c.total_gvp || '0'),
      rank: index + 1,
    })),
  };

  return NextResponse.json({
    success: true,
    data: stateData,
  } as ApiResponse);
}

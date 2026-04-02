// =============================================
// Compensation Calculator API
// Calculate earnings based on sales, team, and rank
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { RANKED_OVERRIDE_SCHEDULES, TECH_RANK_REQUIREMENTS, type TechRank } from '@/lib/compensation/config';

export const dynamic = 'force-dynamic';

interface CalculationRequest {
  personalSales: {
    member: number;
    retail: number;
  };
  avgProductName: string;
  teamSize: number;
  avgTeamProductionPerPerson: number;
  selectedRank: string;
}

interface CalculationResponse {
  directCommissions: number;
  overrides: number;
  total: number;
  personalCredits: number;
  groupCredits: number;
  qualifiesForRank: boolean;
  breakdown: {
    memberSales: {
      count: number;
      commissionPerSale: number;
      totalCommission: number;
    };
    retailSales: {
      count: number;
      commissionPerSale: number;
      totalCommission: number;
    };
    overrideEstimate: {
      l1: number;
      l2: number;
      l3: number;
      l4: number;
      l5: number;
    };
  };
}

// POST /api/dashboard/compensation/calculate - Calculate earnings
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CalculationRequest = await request.json();
    const { personalSales, avgProductName, teamSize, avgTeamProductionPerPerson, selectedRank } = body;

    // Validation
    if (!avgProductName || !selectedRank) {
      return NextResponse.json(
        { error: 'Missing required fields: avgProductName, selectedRank' },
        { status: 400 }
      );
    }

    // Load products from database (FIXED: was hardcoded)
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('name, slug, wholesale_price_cents, retail_price_cents, member_credits, retail_credits, is_active')
      .eq('is_active', true);

    if (productsError || !productsData) {
      console.error('[COMPENSATION CALC] Failed to load products:', productsError);
      return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
    }

    // Transform to expected format
    const products = productsData.map((p) => ({
      name: p.name,
      memberPriceCents: p.wholesale_price_cents,
      retailPriceCents: p.retail_price_cents,
      memberBV: p.member_credits,
      retailBV: p.retail_credits,
      type: p.slug === 'custom-business-center' ? ('business_center' as const) : ('standard' as const),
    }));

    // Find product by name
    const product = products.find((p) => p.name === avgProductName);
    if (!product) {
      return NextResponse.json({ error: 'Invalid product name' }, { status: 400 });
    }

    // Find rank - convert display name to lowercase for lookup
    const rankKey = selectedRank.toLowerCase() as TechRank;
    const rankReq = TECH_RANK_REQUIREMENTS.find((r) => r.name === rankKey);
    const overrideSchedule = RANKED_OVERRIDE_SCHEDULES[rankKey];

    if (!rankReq || !overrideSchedule) {
      return NextResponse.json({ error: 'Invalid rank name' }, { status: 400 });
    }

    // === STEP 1: Calculate Direct Commissions ===

    // Calculate member sales commissions using waterfall
    const memberWaterfall = calculateWaterfall(product.memberPriceCents, product.type || 'standard');
    const memberCommissionPerSale = memberWaterfall.sellerCommissionCents / 100; // Convert to dollars
    const totalMemberCommissions = (personalSales.member || 0) * memberCommissionPerSale;

    // Calculate retail sales commissions using waterfall
    const retailPriceCents = product.retailPriceCents || product.memberPriceCents;
    const retailWaterfall = calculateWaterfall(retailPriceCents, product.type || 'standard');
    const retailCommissionPerSale = retailWaterfall.sellerCommissionCents / 100; // Convert to dollars
    const totalRetailCommissions = (personalSales.retail || 0) * retailCommissionPerSale;

    const directCommissions = totalMemberCommissions + totalRetailCommissions;

    // === STEP 2: Calculate Personal Credits ===

    const memberCredits = (personalSales.member || 0) * product.memberBV;
    const retailCredits = (personalSales.retail || 0) * (product.retailBV || product.memberBV);
    const personalCredits = memberCredits + retailCredits;

    // === STEP 3: Estimate Group Credits ===

    const groupCredits = (teamSize || 0) * (avgTeamProductionPerPerson || 0);

    // === STEP 4: Calculate Override Earnings (Estimate) ===

    // Use avg price for calculations
    const avgPriceCents = (product.memberPriceCents + (retailPriceCents || product.memberPriceCents)) / 2;
    const avgWaterfall = calculateWaterfall(avgPriceCents, product.type || 'standard');
    const overridePoolPerSale = avgWaterfall.overridePoolCents / 100; // Convert to dollars

    // Estimate level distribution:
    // - 20% of team at L1 (enroller override - sponsor_id tree)
    // - 30% at L2 (matrix tree)
    // - 25% at L3
    // - 15% at L4
    // - 10% at L5
    const levelDistribution = [0.20, 0.30, 0.25, 0.15, 0.10];
    const levelRates = overrideSchedule; // Already in decimal form (0.30, 0.05, etc.)

    let totalOverrides = 0;
    const overrideBreakdown = { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 };

    levelDistribution.forEach((pct, idx) => {
      const levelPeople = Math.floor((teamSize || 0) * pct);
      const levelOverride = levelPeople * overridePoolPerSale * levelRates[idx];
      totalOverrides += levelOverride;

      // Store in breakdown
      if (idx === 0) overrideBreakdown.l1 = levelOverride;
      else if (idx === 1) overrideBreakdown.l2 = levelOverride;
      else if (idx === 2) overrideBreakdown.l3 = levelOverride;
      else if (idx === 3) overrideBreakdown.l4 = levelOverride;
      else if (idx === 4) overrideBreakdown.l5 = levelOverride;
    });

    // === STEP 5: Check Rank Qualification ===

    const qualifiesForRank =
      personalCredits >= rankReq.personal && groupCredits >= rankReq.group;

    // === STEP 6: Calculate Total ===

    const total = directCommissions + totalOverrides;

    // === STEP 7: Build Response ===

    const response: CalculationResponse = {
      directCommissions,
      overrides: totalOverrides,
      total,
      personalCredits,
      groupCredits,
      qualifiesForRank,
      breakdown: {
        memberSales: {
          count: personalSales.member || 0,
          commissionPerSale: memberCommissionPerSale,
          totalCommission: totalMemberCommissions,
        },
        retailSales: {
          count: personalSales.retail || 0,
          commissionPerSale: retailCommissionPerSale,
          totalCommission: totalRetailCommissions,
        },
        overrideEstimate: overrideBreakdown,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[COMPENSATION CALC] Exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

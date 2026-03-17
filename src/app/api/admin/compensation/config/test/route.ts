// =============================================
// DUAL-LADDER COMPENSATION CONFIG TEST API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { calculateWaterfall } from '@/lib/compensation/waterfall';
import { evaluateTechRank } from '@/lib/compensation/rank';
import { calculateOverride } from '@/lib/compensation/override-resolution';
import { calculateRankBonus } from '@/lib/compensation/bonus-programs';

/**
 * Test Compensation Configuration
 *
 * POST /api/admin/compensation/config/test
 *
 * Tests compensation calculations with provided configuration and scenarios.
 * Does NOT write to the database - purely for testing/validation.
 *
 * Body:
 * {
 *   scenario: 'waterfall' | 'rank' | 'override' | 'bonus',
 *   testData: {
 *     // For waterfall test:
 *     priceCents: number,
 *     productType?: 'standard' | 'business_center',
 *
 *     // For rank test:
 *     personalCredits: number,
 *     teamCredits: number,
 *     sponsoredMembers: { rank: string, count: number }[],
 *
 *     // For override test:
 *     sellerRank: string,
 *     uplineRanks: string[], // [L1, L2, L3, L4, L5]
 *     enrollerId: string,
 *     overridePoolCents: number,
 *
 *     // For bonus test:
 *     currentRank: string,
 *     newRank: string,
 *     highestRank: string,
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { scenario, testData } = body;

    if (!scenario || !testData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'scenario and testData are required',
        },
        { status: 400 }
      );
    }

    let result: any;

    switch (scenario) {
      case 'waterfall': {
        // Test waterfall calculation
        const { priceCents, productType = 'standard' } = testData;

        if (!priceCents || priceCents <= 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid test data',
              message: 'priceCents must be a positive number',
            },
            { status: 400 }
          );
        }

        result = calculateWaterfall(priceCents, productType);

        return NextResponse.json({
          success: true,
          scenario: 'waterfall',
          input: { priceCents, productType },
          result,
          explanation: {
            steps: [
              `1. BotMakers Fee (30%): $${(result.botmakersFee / 100).toFixed(2)}`,
              `2. Adjusted Gross: $${(result.adjustedGross / 100).toFixed(2)}`,
              `3. Apex Take (30% of adjusted): $${(result.apexTake / 100).toFixed(2)}`,
              `4. Remainder: $${(result.remainder / 100).toFixed(2)}`,
              `5. Bonus Pool (3.5% of remainder): $${(result.bonusPool / 100).toFixed(2)}`,
              `6. Leadership Pool (1.5% of remainder): $${(result.leadershipPool / 100).toFixed(2)}`,
              `7. Commission Pool: $${(result.commissionPool / 100).toFixed(2)}`,
              `8. Seller Commission (60% of pool): $${(result.sellerCommission / 100).toFixed(2)}`,
              `9. Override Pool (40% of pool): $${(result.overridePool / 100).toFixed(2)}`,
            ],
          },
        });
      }

      case 'rank': {
        // Test rank qualification
        const { personalCredits, teamCredits, sponsoredMembers = [] } = testData;

        if (personalCredits === undefined || teamCredits === undefined) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid test data',
              message: 'personalCredits and teamCredits are required',
            },
            { status: 400 }
          );
        }

        // Create mock member data for rank evaluation
        const mockMember = {
          memberId: 'test-member',
          personalCreditsMonthly: personalCredits,
          groupCreditsMonthly: teamCredits,
          currentTechRank: 'starter' as any,
          enrollmentDate: new Date(),
          techGraceMonths: 0,
          highestTechRank: 'starter' as any,
        };

        // Convert sponsoredMembers array to format expected by evaluateTechRank
        const sponsoredMembersArray = sponsoredMembers.flatMap((item: any) =>
          Array(item.count).fill(null).map(() => ({
            memberId: `test-${item.rank}-${Math.random()}`,
            techRank: item.rank,
            personallySponsored: true,
          }))
        );

        result = evaluateTechRank(mockMember, sponsoredMembersArray);

        return NextResponse.json({
          success: true,
          scenario: 'rank',
          input: { personalCredits, teamCredits, sponsoredMembers },
          result,
          explanation: {
            qualifiedRank: result.qualifiedRank,
            meetsPersonalRequirement: result.meetsPersonalRequirement,
            meetsGroupRequirement: result.meetsGroupRequirement,
            meetsDownlineRequirement: result.meetsDownlineRequirement,
            requirements: result.requirements,
          },
        });
      }

      case 'override': {
        // Test override calculation
        const { memberRank, priceCents, productType = 'standard', isEnroller, matrixLevel } = testData;

        if (!memberRank || !priceCents) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid test data',
              message: 'memberRank and priceCents are required',
            },
            { status: 400 }
          );
        }

        // Create mock member for override calculation
        const mockMember = {
          memberId: 'test-member',
          techRank: memberRank as any,
          personalCreditsMonthly: 100, // Qualified
          overrideQualified: true,
        };

        // Create mock sale
        const mockSale = {
          orderId: 'test-order',
          sellerMemberId: 'test-seller',
          priceCents,
          productType: productType as any,
        };

        result = calculateOverride(
          mockMember,
          mockSale,
          isEnroller || false,
          matrixLevel
        );

        return NextResponse.json({
          success: true,
          scenario: 'override',
          input: { memberRank, priceCents, productType, isEnroller, matrixLevel },
          result,
          explanation: {
            memberId: result.memberId,
            memberTechRank: result.memberTechRank,
            amountCents: result.amountCents,
            amountFormatted: `$${(result.amountCents / 100).toFixed(2)}`,
            level: result.level,
            percentage: `${(result.percentage * 100).toFixed(1)}%`,
            rule: result.rule,
            qualified: result.qualified,
            reason: result.reason || 'Qualified',
          },
        });
      }

      case 'bonus': {
        // Test rank bonus calculation
        const { newRank, highestRank, overrideQualified = true } = testData;

        if (!newRank || !highestRank) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid test data',
              message: 'newRank and highestRank are required',
            },
            { status: 400 }
          );
        }

        result = calculateRankBonus(
          'test-member',
          newRank,
          highestRank,
          overrideQualified
        );

        return NextResponse.json({
          success: true,
          scenario: 'bonus',
          input: { newRank, highestRank, overrideQualified },
          result,
          explanation: {
            bonusCents: result.bonusCents,
            bonusAmount: `$${(result.bonusCents / 100).toFixed(2)}`,
            qualified: result.qualified,
            reason: result.reason || 'Qualified for rank bonus',
          },
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid scenario',
            message: 'scenario must be one of: waterfall, rank, override, bonus',
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Config Test] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

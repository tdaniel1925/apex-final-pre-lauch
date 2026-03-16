// API Endpoint: Stress Test Validation
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { calculateWaterfall, calculateMargins, validateWaterfall } from '@/lib/compensation/waterfall';
import { evaluateRank, validateRankEvaluation } from '@/lib/compensation/rank';
import { PRODUCT_PRICES, COMP_PLAN_CONFIG } from '@/lib/compensation/config';
import { getAdminUser } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  // CRITICAL: Only Admin can run stress tests
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { proposedConfig } = await request.json();

    const db = createServiceClient();

    // Fetch stress test scenarios
    const { data: scenarios, error } = await db
      .from('stress_test_scenarios')
      .select('*');

    if (error) {
      throw error;
    }

    const results = [];
    let allPassed = true;

    for (const scenario of scenarios || []) {
      let passed = true;
      let actualValues: any = {};
      let deviations: any = {};

      switch (scenario.dimension) {
        case 'waterfall_integrity':
          // Test waterfall calculation for all products
          const waterfallTests = [
            { product: 'PulseMarket_member', price: 59 },
            { product: 'PulseFlow_retail', price: 149 },
          ];

          for (const test of waterfallTests) {
            const result = calculateWaterfall(test.price, false);
            const expected = scenario.expected_values[test.product];

            if (expected) {
              const errors = validateWaterfall(result, expected, scenario.tolerance?.amount || 0.01);
              if (errors.length > 0) {
                passed = false;
                deviations[test.product] = errors;
              }

              actualValues[test.product] = {
                price: result.grossPrice,
                botmakers: result.botmakersFee,
                seller: result.sellerCommission,
                override_pool: result.overridePool,
              };
            }
          }
          break;

        case 'apex_margin_sustainability':
          // Test Apex margin across all products
          const margins = [];
          for (const [product, prices] of Object.entries(PRODUCT_PRICES)) {
            if (product === 'BIZCENTER') continue;

            const result = calculateWaterfall(prices.member, false);
            const marginPcts = calculateMargins(result);
            margins.push(marginPcts.apex_pct);
          }

          const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
          const minMargin = Math.min(...margins);
          const maxMargin = Math.max(...margins);

          actualValues = {
            avg_margin_pct: avgMargin,
            min_margin_pct: minMargin,
            max_margin_pct: maxMargin,
          };

          const expectedMin = scenario.expected_values.min_margin_pct;
          const expectedMax = scenario.expected_values.max_margin_pct;

          if (minMargin < expectedMin || maxMargin > expectedMax) {
            passed = false;
            deviations.margin = `Margin ${minMargin.toFixed(2)}%-${maxMargin.toFixed(2)}% outside expected range ${expectedMin}%-${expectedMax}%`;
          }
          break;

        case 'field_payout_competitiveness':
          // Test field payout percentage
          const fieldPayouts = [];
          for (const [product, prices] of Object.entries(PRODUCT_PRICES)) {
            if (product === 'BIZCENTER') continue;

            const result = calculateWaterfall(prices.member, false);
            const marginPcts = calculateMargins(result);
            fieldPayouts.push(marginPcts.field_pct);
          }

          const avgField = fieldPayouts.reduce((a, b) => a + b, 0) / fieldPayouts.length;

          actualValues = {
            avg_field_pct: avgField,
          };

          const expectedMinField = scenario.expected_values.min_field_pct;
          const expectedMaxField = scenario.expected_values.max_field_pct;

          if (avgField < expectedMinField || avgField > expectedMaxField) {
            passed = false;
            deviations.field = `Field payout ${avgField.toFixed(2)}% outside expected range ${expectedMinField}%-${expectedMaxField}%`;
          }
          break;

        case 'cab_clawback_policy':
          // Validate CAB configuration matches expected
          actualValues = {
            release_day: COMP_PLAN_CONFIG.bonuses.cab.retention_days,
            amount: COMP_PLAN_CONFIG.bonuses.cab.amount,
            monthly_cap: COMP_PLAN_CONFIG.bonuses.cab.monthly_cap,
            max_liability: COMP_PLAN_CONFIG.bonuses.cab.monthly_cap * COMP_PLAN_CONFIG.bonuses.cab.amount,
          };

          if (actualValues.release_day !== scenario.expected_values.release_day) {
            passed = false;
            deviations.release_day = `Actual ${actualValues.release_day} vs expected ${scenario.expected_values.release_day}`;
          }

          if (actualValues.amount !== scenario.expected_values.amount) {
            passed = false;
            deviations.amount = `Actual ${actualValues.amount} vs expected ${scenario.expected_values.amount}`;
          }
          break;

        case 'rank_qualification_thresholds':
          // Validate rank thresholds match expected
          actualValues = COMP_PLAN_CONFIG.rank_thresholds;

          for (const [rank, thresholds] of Object.entries(scenario.expected_values)) {
            const actual = COMP_PLAN_CONFIG.rank_thresholds[rank as keyof typeof COMP_PLAN_CONFIG.rank_thresholds];
            const expected = thresholds as { personal_bv: number; team_bv: number };
            if (actual.personal_bv !== expected.personal_bv || actual.team_bv !== expected.team_bv) {
              passed = false;
              deviations[rank] = `Actual ${JSON.stringify(actual)} vs expected ${JSON.stringify(expected)}`;
            }
          }
          break;

        case 'minimum_payout_threshold':
          // Validate $25 minimum
          actualValues = {
            threshold: COMP_PLAN_CONFIG.minimum_payout,
          };

          if (actualValues.threshold !== scenario.expected_values.threshold) {
            passed = false;
            deviations.threshold = `Actual $${actualValues.threshold} vs expected $${scenario.expected_values.threshold}`;
          }
          break;

        default:
          // Skip unknown dimensions for now
          passed = true;
      }

      if (!passed && scenario.severity === 'CRITICAL') {
        allPassed = false;
      }

      results.push({
        dimension: scenario.dimension,
        passed,
        severity: scenario.severity,
        actualValues,
        deviations,
      });

      // Save result to database
      await db.from('stress_test_results').insert({
        result_id: crypto.randomUUID(),
        scenario_id: scenario.scenario_id,
        passed,
        actual_values: actualValues,
        deviations,
        config_snapshot: COMP_PLAN_CONFIG,
      });
    }

    return NextResponse.json({
      success: true,
      overallStatus: allPassed ? 'PASS' : 'FAIL',
      results,
      criticalFailures: results.filter((r: any) => !r.passed && r.severity === 'CRITICAL').length,
      warnings: results.filter((r: any) => !r.passed && r.severity === 'WARNING').length,
    });
  } catch (error: any) {
    console.error('Stress test error:', error);
    return NextResponse.json(
      { error: error.message || 'Stress test failed' },
      { status: 500 }
    );
  }
}

// GET: Retrieve latest stress test results
export async function GET(request: NextRequest) {
  // CRITICAL: Only Admin can view stress test results
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const db = createServiceClient();

    const { data: results, error } = await db
      .from('stress_test_results')
      .select('*, stress_test_scenarios(*)')
      .order('run_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      results: results || [],
    });
  } catch (error: any) {
    console.error('Error fetching stress test results:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stress test results' },
      { status: 500 }
    );
  }
}

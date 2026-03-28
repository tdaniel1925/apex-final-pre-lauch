/**
 * Admin Compliance Overview API
 *
 * Returns summary of FTC compliance across all distributors:
 * - Overall compliance rate
 * - Count of compliant vs non-compliant distributors
 * - Anti-frontloading violations count
 * - Recent compliance trends
 *
 * @route GET /api/admin/compliance/overview
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  generateRetailComplianceReport,
  getNonCompliantDistributors,
} from '@/lib/compliance/retail-validation';
import { getAntiFrontloadingReport } from '@/lib/compliance/anti-frontloading';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get retail compliance report
    const retailReport = await generateRetailComplianceReport();

    // Get anti-frontloading violations
    const frontloadingViolations = await getAntiFrontloadingReport();

    // Get total active distributors
    const { count: totalDistributors } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get distributors with sales this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: distributorsWithSales } = await supabase
      .from('orders')
      .select('rep_id', { count: 'exact', head: true })
      .not('rep_id', 'is', null)
      .in('status', ['completed', 'processing'])
      .gte('created_at', monthStart.toISOString());

    return NextResponse.json({
      overview: {
        total_distributors: totalDistributors || 0,
        distributors_with_sales: distributorsWithSales || 0,
        compliant_distributors: retailReport.compliant_distributors,
        non_compliant_distributors: retailReport.non_compliant_distributors,
        compliance_rate: retailReport.compliance_rate,
      },
      retail_compliance: {
        compliant_count: retailReport.compliant_distributors,
        non_compliant_count: retailReport.non_compliant_distributors,
        compliance_rate: retailReport.compliance_rate,
      },
      anti_frontloading: {
        violations_count: frontloadingViolations.length,
        total_bv_not_credited: frontloadingViolations.reduce(
          (sum, v) => sum + v.bv_not_credited,
          0
        ),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching compliance overview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch compliance overview' },
      { status: 500 }
    );
  }
}

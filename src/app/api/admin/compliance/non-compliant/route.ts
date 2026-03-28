/**
 * Admin Non-Compliant Distributors API
 *
 * Returns detailed list of distributors failing 70% retail requirement
 * and anti-frontloading violations.
 *
 * @route GET /api/admin/compliance/non-compliant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNonCompliantDistributors } from '@/lib/compliance/retail-validation';
import { getAntiFrontloadingReport } from '@/lib/compliance/anti-frontloading';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get non-compliant distributors (retail validation)
    const retailNonCompliant = await getNonCompliantDistributors();

    // Get anti-frontloading violations
    const frontloadingViolations = await getAntiFrontloadingReport();

    return NextResponse.json({
      retail_non_compliant: retailNonCompliant,
      frontloading_violations: frontloadingViolations,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching non-compliant distributors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch non-compliant distributors' },
      { status: 500 }
    );
  }
}

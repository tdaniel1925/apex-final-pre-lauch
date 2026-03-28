/**
 * Admin Compliance Dashboard
 *
 * Displays FTC compliance overview:
 * - Overall compliance rate
 * - Non-compliant distributors list
 * - Anti-frontloading violations
 * - Monthly trends
 *
 * @page /admin/compliance
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ComplianceOverview {
  overview: {
    total_distributors: number;
    distributors_with_sales: number;
    compliant_distributors: number;
    non_compliant_distributors: number;
    compliance_rate: number;
  };
  retail_compliance: {
    compliant_count: number;
    non_compliant_count: number;
    compliance_rate: number;
  };
  anti_frontloading: {
    violations_count: number;
    total_bv_not_credited: number;
  };
}

interface RetailNonCompliant {
  distributor_id: string;
  distributor_name: string;
  retail_bv: number;
  self_purchase_bv: number;
  total_bv: number;
  retail_percentage: number;
}

interface FrontloadingViolation {
  distributor_id: string;
  distributor_name: string;
  total_self_purchases: number;
  bv_not_credited: number;
}

export default function ComplianceDashboard() {
  const [overview, setOverview] = useState<ComplianceOverview | null>(null);
  const [retailNonCompliant, setRetailNonCompliant] = useState<RetailNonCompliant[]>([]);
  const [frontloadingViolations, setFrontloadingViolations] = useState<FrontloadingViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  async function fetchComplianceData() {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Not authenticated');
        return;
      }

      // Fetch overview
      const overviewRes = await fetch('/api/admin/compliance/overview', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!overviewRes.ok) {
        throw new Error('Failed to fetch compliance overview');
      }

      const overviewData = await overviewRes.json();
      setOverview(overviewData);

      // Fetch non-compliant distributors
      const nonCompliantRes = await fetch('/api/admin/compliance/non-compliant', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!nonCompliantRes.ok) {
        throw new Error('Failed to fetch non-compliant distributors');
      }

      const nonCompliantData = await nonCompliantRes.json();
      setRetailNonCompliant(nonCompliantData.retail_non_compliant || []);
      setFrontloadingViolations(nonCompliantData.frontloading_violations || []);
    } catch (err: any) {
      console.error('Error fetching compliance data:', err);
      setError(err.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-xl">Loading compliance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400 text-xl">No data available</div>
      </div>
    );
  }

  const complianceColor =
    overview.overview.compliance_rate >= 90
      ? 'text-green-400'
      : overview.overview.compliance_rate >= 70
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FTC Compliance Dashboard</h1>
          <p className="text-slate-300">
            Monitor anti-frontloading and 70% retail customer compliance
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Distributors */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Total Distributors</div>
            <div className="text-white text-3xl font-bold">
              {overview.overview.total_distributors}
            </div>
            <div className="text-slate-500 text-xs mt-2">
              {overview.overview.distributors_with_sales} with sales this month
            </div>
          </div>

          {/* Compliance Rate */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Compliance Rate</div>
            <div className={`text-3xl font-bold ${complianceColor}`}>
              {overview.overview.compliance_rate.toFixed(1)}%
            </div>
            <div className="text-slate-500 text-xs mt-2">70% retail requirement</div>
          </div>

          {/* Compliant */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Compliant</div>
            <div className="text-green-400 text-3xl font-bold">
              {overview.overview.compliant_distributors}
            </div>
            <div className="text-slate-500 text-xs mt-2">Meeting all requirements</div>
          </div>

          {/* Non-Compliant */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="text-slate-400 text-sm mb-2">Non-Compliant</div>
            <div className="text-red-400 text-3xl font-bold">
              {overview.overview.non_compliant_distributors}
            </div>
            <div className="text-slate-500 text-xs mt-2">Below 70% retail</div>
          </div>
        </div>

        {/* Anti-Frontloading Summary */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Anti-Frontloading Violations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-slate-400 text-sm mb-1">Violations This Month</div>
              <div className="text-yellow-400 text-2xl font-bold">
                {overview.anti_frontloading.violations_count}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">BV Not Credited</div>
              <div className="text-orange-400 text-2xl font-bold">
                {Math.round(overview.anti_frontloading.total_bv_not_credited)}
              </div>
            </div>
          </div>
          <div className="text-slate-500 text-xs mt-4">
            Max 1 self-purchase per product counts toward BV per month
          </div>
        </div>

        {/* Non-Compliant Distributors Table */}
        {retailNonCompliant.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 mb-8">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                Non-Compliant Distributors ({retailNonCompliant.length})
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Distributors below 70% retail customer requirement
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Distributor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Retail %
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Retail BV
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Self-Purchase BV
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Total BV
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Shortfall
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {retailNonCompliant.map((dist) => {
                    const shortfall = Math.round(dist.total_bv * 0.7 - dist.retail_bv);
                    return (
                      <tr key={dist.distributor_id} className="hover:bg-slate-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {dist.distributor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className="text-red-400 font-semibold">
                            {dist.retail_percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-right">
                          {dist.retail_bv}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 text-right">
                          {dist.self_purchase_bv}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-right font-semibold">
                          {dist.total_bv}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className="text-orange-400">+{shortfall} retail BV</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Frontloading Violations Table */}
        {frontloadingViolations.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">
                Anti-Frontloading Violations ({frontloadingViolations.length})
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Distributors with multiple self-purchases this month
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Distributor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Total Self-Purchases
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      BV Not Credited
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {frontloadingViolations.map((violation) => (
                    <tr key={violation.distributor_id} className="hover:bg-slate-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {violation.distributor_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 text-right font-semibold">
                        {violation.total_self_purchases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400 text-right">
                        ~{Math.round(violation.bv_not_credited)} BV
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {retailNonCompliant.length === 0 && frontloadingViolations.length === 0 && (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-white mb-2">All Distributors Compliant!</h3>
            <p className="text-slate-400">
              No compliance violations found this month. Great work!
            </p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchComplianceData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
          <div className="text-slate-500 text-xs mt-2">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

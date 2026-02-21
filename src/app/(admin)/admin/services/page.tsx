// =============================================
// Admin Service Cost Tracking Dashboard
// View and manage 3rd party service costs
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import type { CostOverview, ServiceUsageSummary } from '@/types/service-tracking';

export const metadata = {
  title: 'Service Costs - Admin',
};

// Revalidate every 60 seconds
export const revalidate = 60;

async function getCostOverview(): Promise<CostOverview> {
  const supabase = createServiceClient();

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Get all active services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Get current month budgets
  const { data: budgets } = await supabase
    .from('service_budgets')
    .select('*')
    .eq('month', currentMonthStart.toISOString().split('T')[0]);

  const serviceSummaries: ServiceUsageSummary[] = [];
  let totalSpendCurrentMonth = 0;
  let totalBudgetCurrentMonth = 0;

  for (const service of services || []) {
    // Current month usage
    const { data: currentMonthUsage } = await supabase
      .from('service_usage_logs')
      .select('cost_usd, total_tokens, requests_count, feature')
      .eq('service_id', service.id)
      .gte('created_at', currentMonthStart.toISOString());

    const currentMonthCost =
      currentMonthUsage?.reduce((sum, log) => sum + (Number(log.cost_usd) || 0), 0) || 0;
    const currentMonthRequests =
      currentMonthUsage?.reduce((sum, log) => sum + (log.requests_count || 0), 0) || 0;
    const currentMonthTokens =
      currentMonthUsage?.reduce((sum, log) => sum + (log.total_tokens || 0), 0) || 0;

    // Previous month usage
    const { data: previousMonthUsage } = await supabase
      .from('service_usage_logs')
      .select('cost_usd, requests_count')
      .eq('service_id', service.id)
      .gte('created_at', previousMonthStart.toISOString())
      .lte('created_at', previousMonthEnd.toISOString());

    const previousMonthCost =
      previousMonthUsage?.reduce((sum, log) => sum + (Number(log.cost_usd) || 0), 0) || 0;
    const previousMonthRequests =
      previousMonthUsage?.reduce((sum, log) => sum + (log.requests_count || 0), 0) || 0;

    // Trend calculation
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercent = 0;

    if (previousMonthCost > 0) {
      const change = ((currentMonthCost - previousMonthCost) / previousMonthCost) * 100;
      trendPercent = Math.abs(change);
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';
    } else if (currentMonthCost > 0) {
      trend = 'up';
      trendPercent = 100;
    }

    // Top features
    const featureCosts = new Map<string, { cost: number; requests: number }>();
    currentMonthUsage?.forEach((log) => {
      const feature = log.feature || 'unknown';
      const existing = featureCosts.get(feature) || { cost: 0, requests: 0 };
      featureCosts.set(feature, {
        cost: existing.cost + (Number(log.cost_usd) || 0),
        requests: existing.requests + (log.requests_count || 0),
      });
    });

    const topFeatures = Array.from(featureCosts.entries())
      .map(([feature, data]) => ({ feature, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    const budget = budgets?.find((b) => b.service_id === service.id);

    serviceSummaries.push({
      service,
      currentMonth: {
        totalCost: currentMonthCost,
        totalRequests: currentMonthRequests,
        totalTokens: currentMonthTokens > 0 ? currentMonthTokens : undefined,
        budget: budget || undefined,
      },
      previousMonth: {
        totalCost: previousMonthCost,
        totalRequests: previousMonthRequests,
      },
      trend,
      trendPercent,
      topFeatures,
    });

    totalSpendCurrentMonth += currentMonthCost;
    if (budget) {
      totalBudgetCurrentMonth += Number(budget.budget_usd);
    }
  }

  // Get recent unacknowledged alerts
  const { data: alerts } = await supabase
    .from('service_cost_alerts')
    .select('*, services(name, display_name)')
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
    .limit(10);

  const budgetUtilization =
    totalBudgetCurrentMonth > 0 ? (totalSpendCurrentMonth / totalBudgetCurrentMonth) * 100 : 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const projectedMonthlySpend =
    daysElapsed > 0 ? (totalSpendCurrentMonth / daysElapsed) * daysInMonth : totalSpendCurrentMonth;

  return {
    totalSpendCurrentMonth,
    totalBudgetCurrentMonth,
    budgetUtilization,
    projectedMonthlySpend,
    services: serviceSummaries,
    recentAlerts: alerts || [],
  };
}

export default async function ServiceCostsPage() {
  await requireAdmin();
  const overview = await getCostOverview();

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Service Cost Tracking</h1>
        <p className="text-sm text-gray-600 mt-0.5">
          Monitor usage and costs for 3rd party services
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Current Month Spend</p>
          <p className="text-2xl font-bold text-gray-900">
            ${overview.totalSpendCurrentMonth.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Projected: ${overview.projectedMonthlySpend.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Monthly Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            ${overview.totalBudgetCurrentMonth.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {overview.budgetUtilization.toFixed(1)}% used
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Remaining Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            ${(overview.totalBudgetCurrentMonth - overview.totalSpendCurrentMonth).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {overview.totalBudgetCurrentMonth > 0
              ? `${(100 - overview.budgetUtilization).toFixed(1)}% left`
              : 'No budget set'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-600 mb-1">Active Alerts</p>
          <p className="text-2xl font-bold text-orange-600">
            {overview.recentAlerts.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Unacknowledged</p>
        </div>
      </div>

      {/* Alerts Section */}
      {overview.recentAlerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-bold text-orange-900 mb-2">
            ⚠️ Active Cost Alerts
          </h2>
          <div className="space-y-2">
            {overview.recentAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className="bg-white rounded p-2 border border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {alert.services?.display_name} - {alert.message}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {overview.services.map((serviceSummary) => {
          const budget = serviceSummary.currentMonth.budget;
          const budgetPercent = budget
            ? (serviceSummary.currentMonth.totalCost / Number(budget.budget_usd)) * 100
            : 0;

          return (
            <div
              key={serviceSummary.service.id}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {serviceSummary.service.display_name}
                  </h3>
                  <p className="text-xs text-gray-600 capitalize">
                    {serviceSummary.service.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-[#2B4C7E]">
                    ${serviceSummary.currentMonth.totalCost.toFixed(4)}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {serviceSummary.trend === 'up' && (
                      <span className="text-red-600">
                        ↑ {serviceSummary.trendPercent.toFixed(0)}%
                      </span>
                    )}
                    {serviceSummary.trend === 'down' && (
                      <span className="text-green-600">
                        ↓ {serviceSummary.trendPercent.toFixed(0)}%
                      </span>
                    )}
                    {serviceSummary.trend === 'stable' && (
                      <span className="text-gray-600">→ Stable</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Bar */}
              {budget && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Budget Progress</span>
                    <span className="font-semibold">{budgetPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetPercent >= 100
                          ? 'bg-red-600'
                          : budgetPercent >= 80
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${serviceSummary.currentMonth.totalCost.toFixed(2)} / $
                    {Number(budget.budget_usd).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-600">Requests</p>
                  <p className="text-sm font-bold text-gray-900">
                    {serviceSummary.currentMonth.totalRequests.toLocaleString()}
                  </p>
                </div>
                {serviceSummary.currentMonth.totalTokens && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-600">Tokens</p>
                    <p className="text-sm font-bold text-gray-900">
                      {serviceSummary.currentMonth.totalTokens.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Top Features */}
              {serviceSummary.topFeatures.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Top Features
                  </p>
                  <div className="space-y-1">
                    {serviceSummary.topFeatures.slice(0, 3).map((feature) => (
                      <div
                        key={feature.feature}
                        className="flex justify-between text-xs"
                      >
                        <span className="text-gray-600 truncate">
                          {feature.feature}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${feature.cost.toFixed(4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Costs are tracked automatically when using the wrapped service
          clients (<code>openai-tracked.ts</code>, <code>resend-tracked.ts</code>,{' '}
          <code>redis-tracked.ts</code>). Update your existing code to use these wrappers to
          enable tracking.
        </p>
      </div>
    </div>
  );
}

// =============================================
// Admin Service Usage API
// GET /api/admin/services/usage
// Returns cost overview and usage data
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { adminRateLimit, checkRateLimit } from '@/lib/rate-limit';
import type { CostOverview, ServiceUsageSummary } from '@/types/service-tracking';

export async function GET(request: NextRequest) {
  const adminContext = await getAdminUser();
  if (!adminContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const rateLimitResponse = await checkRateLimit(
    adminRateLimit,
    adminContext.admin.id
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createServiceClient();

    // Get current and previous month boundaries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (servicesError) {
      throw new Error(`Failed to fetch services: ${servicesError.message}`);
    }

    // Get current month budgets
    const { data: budgets } = await supabase
      .from('service_budgets')
      .select('*')
      .eq('month', currentMonthStart.toISOString().split('T')[0]);

    // Get usage data for each service
    const serviceSummaries: ServiceUsageSummary[] = [];
    let totalSpendCurrentMonth = 0;
    let totalBudgetCurrentMonth = 0;

    for (const service of services || []) {
      // Current month stats
      const { data: currentMonthUsage } = await supabase
        .from('service_usage_logs')
        .select('cost_usd, total_tokens, requests_count, feature')
        .eq('service_id', service.id)
        .gte('created_at', currentMonthStart.toISOString());

      const currentMonthCost = currentMonthUsage?.reduce(
        (sum, log) => sum + (Number(log.cost_usd) || 0),
        0
      ) || 0;

      const currentMonthRequests = currentMonthUsage?.reduce(
        (sum, log) => sum + (log.requests_count || 0),
        0
      ) || 0;

      const currentMonthTokens = currentMonthUsage?.reduce(
        (sum, log) => sum + (log.total_tokens || 0),
        0
      ) || 0;

      // Previous month stats
      const { data: previousMonthUsage } = await supabase
        .from('service_usage_logs')
        .select('cost_usd, requests_count')
        .eq('service_id', service.id)
        .gte('created_at', previousMonthStart.toISOString())
        .lte('created_at', previousMonthEnd.toISOString());

      const previousMonthCost = previousMonthUsage?.reduce(
        (sum, log) => sum + (Number(log.cost_usd) || 0),
        0
      ) || 0;

      const previousMonthRequests = previousMonthUsage?.reduce(
        (sum, log) => sum + (log.requests_count || 0),
        0
      ) || 0;

      // Calculate trend
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

      // Top features by cost
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

      // Get budget for this service
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

    // Get recent alerts
    const { data: alerts } = await supabase
      .from('service_cost_alerts')
      .select('*, services(name, display_name)')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate budget utilization
    const budgetUtilization =
      totalBudgetCurrentMonth > 0
        ? (totalSpendCurrentMonth / totalBudgetCurrentMonth) * 100
        : 0;

    // Simple projection: current spend * (days in month / days elapsed)
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const daysElapsed = now.getDate();
    const projectedMonthlySpend =
      daysElapsed > 0
        ? (totalSpendCurrentMonth / daysElapsed) * daysInMonth
        : totalSpendCurrentMonth;

    const overview: CostOverview = {
      totalSpendCurrentMonth,
      totalBudgetCurrentMonth,
      budgetUtilization,
      projectedMonthlySpend,
      services: serviceSummaries,
      recentAlerts: alerts || [],
    };

    return NextResponse.json(overview);
  } catch (error: any) {
    console.error('Error fetching service usage:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service usage' },
      { status: 500 }
    );
  }
}

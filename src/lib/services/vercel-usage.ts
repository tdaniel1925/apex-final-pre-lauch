// =============================================
// Vercel Usage Tracking
// Fetches project-specific usage from Vercel API
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

// =============================================
// Vercel API Client
// =============================================

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_OIDC_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_xCohiIMthEe2uzQHqYofvXax';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_wC7jcslsKKw9ub4Yni2PN0blJN9t';

interface VercelUsage {
  functionExecutions: number;
  bandwidthGB: number;
  buildMinutes: number;
}

/**
 * Fetch project-specific usage from Vercel API
 * Docs: https://vercel.com/docs/rest-api/endpoints#get-project-usage
 */
async function fetchVercelUsage(date: Date): Promise<VercelUsage> {
  if (!VERCEL_API_TOKEN) {
    throw new Error('VERCEL_API_TOKEN not configured');
  }

  // Vercel API expects timestamps
  const since = new Date(date);
  since.setHours(0, 0, 0, 0);
  const until = new Date(date);
  until.setHours(23, 59, 59, 999);

  try {
    // Fetch usage for this specific project
    const response = await fetch(
      `https://api.vercel.com/v1/projects/${VERCEL_PROJECT_ID}/analytics/usage?teamId=${VERCEL_TEAM_ID}&since=${since.getTime()}&until=${until.getTime()}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse Vercel response
    // Note: Actual response structure may vary, adjust based on Vercel API docs
    return {
      functionExecutions: data.executionUnits || 0,
      bandwidthGB: (data.dataCacheRead || 0) / (1024 * 1024 * 1024), // Convert bytes to GB
      buildMinutes: (data.buildTime || 0) / 60, // Convert seconds to minutes
    };
  } catch (error) {
    console.error('Failed to fetch Vercel usage:', error);
    throw error;
  }
}

/**
 * Calculate Vercel costs based on usage
 */
function calculateVercelCost(usage: VercelUsage): {
  baseCost: number;
  overageCost: number;
  totalCost: number;
  details: Record<string, any>;
} {
  const BASE_MONTHLY_COST = 20; // Pro plan
  const baseCost = BASE_MONTHLY_COST / 30; // Daily proration

  let overageCost = 0;
  const details: Record<string, any> = {};

  // Function executions: First 1M free, then $0.60 per additional 1M
  if (usage.functionExecutions > 1_000_000) {
    const overage = usage.functionExecutions - 1_000_000;
    const cost = (overage / 1_000_000) * 0.6;
    overageCost += cost;
    details.functionExecutionsOverage = overage;
    details.functionExecutionsCost = cost;
  }

  // Bandwidth: First 100GB free, then $0.40 per GB
  if (usage.bandwidthGB > 100) {
    const overage = usage.bandwidthGB - 100;
    const cost = overage * 0.4;
    overageCost += cost;
    details.bandwidthOverageGB = overage;
    details.bandwidthCost = cost;
  }

  // Build minutes: First 6000 free, then $40 per 1000
  if (usage.buildMinutes > 6000) {
    const overage = usage.buildMinutes - 6000;
    const cost = (overage / 1000) * 40;
    overageCost += cost;
    details.buildMinutesOverage = overage;
    details.buildMinutesCost = cost;
  }

  return {
    baseCost,
    overageCost,
    totalCost: baseCost + overageCost,
    details,
  };
}

/**
 * Record Vercel usage snapshot for a specific date
 */
export async function recordVercelUsage(date: Date = new Date()): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get service ID
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('name', 'vercel')
      .single();

    if (!service) {
      throw new Error('Vercel service not found in database');
    }

    // Fetch usage from Vercel API
    const usage = await fetchVercelUsage(date);

    // Calculate costs
    const costs = calculateVercelCost(usage);

    // Get snapshot date (YYYY-MM-DD)
    const snapshotDate = date.toISOString().split('T')[0];

    // Insert or update snapshot
    const { error } = await supabase
      .from('platform_usage_snapshots')
      .upsert(
        {
          service_id: service.id,
          snapshot_date: snapshotDate,
          function_executions: usage.functionExecutions,
          bandwidth_gb: usage.bandwidthGB,
          build_minutes: usage.buildMinutes,
          base_cost_usd: costs.baseCost,
          overage_cost_usd: costs.overageCost,
          total_cost_usd: costs.totalCost,
          cost_calculation: costs.details,
        },
        {
          onConflict: 'service_id,snapshot_date',
        }
      );

    if (error) {
      throw new Error(`Failed to record Vercel usage: ${error.message}`);
    }

    console.log(`Recorded Vercel usage for ${snapshotDate}: $${costs.totalCost.toFixed(4)}`);
  } catch (error) {
    console.error('Error recording Vercel usage:', error);
    throw error;
  }
}

/**
 * Get Vercel usage for current month
 */
export async function getVercelMonthlyUsage(): Promise<{
  totalCost: number;
  baseCost: number;
  overageCost: number;
  snapshots: any[];
}> {
  const supabase = createServiceClient();

  // Get current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  // Get service ID
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', 'vercel')
    .single();

  if (!service) {
    throw new Error('Vercel service not found');
  }

  // Get all snapshots for current month
  const { data: snapshots, error } = await supabase
    .from('platform_usage_snapshots')
    .select('*')
    .eq('service_id', service.id)
    .gte('snapshot_date', monthStart)
    .order('snapshot_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to get Vercel usage: ${error.message}`);
  }

  // Calculate totals
  const totalCost = snapshots?.reduce((sum, s) => sum + Number(s.total_cost_usd || 0), 0) || 0;
  const baseCost = snapshots?.reduce((sum, s) => sum + Number(s.base_cost_usd || 0), 0) || 0;
  const overageCost = snapshots?.reduce((sum, s) => sum + Number(s.overage_cost_usd || 0), 0) || 0;

  return {
    totalCost,
    baseCost,
    overageCost,
    snapshots: snapshots || [],
  };
}

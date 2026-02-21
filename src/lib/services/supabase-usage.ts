// =============================================
// Supabase Usage Tracking
// Fetches project-specific usage from Supabase API
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

// =============================================
// Supabase Management API Client
// =============================================

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Management API token
const SUPABASE_PROJECT_REF = 'brejvdvzwshroxkkhmzy'; // From SUPABASE_URL

interface SupabaseUsage {
  databaseSizeGB: number;
  databaseBandwidthGB: number;
  storageSizeGB: number;
  databaseRequests: number;
}

/**
 * Fetch project-specific usage from Supabase Management API
 * Docs: https://supabase.com/docs/reference/api/usage
 */
async function fetchSupabaseUsage(date: Date): Promise<SupabaseUsage> {
  // Note: Supabase Management API requires separate access token
  // This is different from the service role key
  if (!SUPABASE_ACCESS_TOKEN) {
    console.warn('SUPABASE_ACCESS_TOKEN not configured - using estimates');
    return estimateSupabaseUsage();
  }

  try {
    // Fetch usage stats from Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/usage`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse Supabase response
    return {
      databaseSizeGB: (data.db_size || 0) / (1024 * 1024 * 1024), // Bytes to GB
      databaseBandwidthGB: (data.db_egress_bytes || 0) / (1024 * 1024 * 1024),
      storageSizeGB: (data.storage_size || 0) / (1024 * 1024 * 1024),
      databaseRequests: data.db_requests || 0,
    };
  } catch (error) {
    console.error('Failed to fetch Supabase usage:', error);
    // Fall back to estimates
    return estimateSupabaseUsage();
  }
}

/**
 * Estimate Supabase usage when API is unavailable
 * Uses database queries to estimate size
 */
async function estimateSupabaseUsage(): Promise<SupabaseUsage> {
  const supabase = createServiceClient();

  try {
    // Get database size from pg_catalog
    const { data: dbSize } = await supabase.rpc('pg_database_size', {
      database_name: 'postgres',
    });

    // Estimate based on table counts and typical row sizes
    const { count: distributorCount } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true });

    const { count: usageLogCount } = await supabase
      .from('service_usage_logs')
      .select('*', { count: 'exact', head: true });

    // Rough estimates (actual values will vary)
    const estimatedDbSizeBytes = (distributorCount || 0) * 2048 + (usageLogCount || 0) * 1024;
    const estimatedDbSizeGB = estimatedDbSizeBytes / (1024 * 1024 * 1024);

    return {
      databaseSizeGB: Math.max(estimatedDbSizeGB, 0.1), // Minimum 100MB
      databaseBandwidthGB: 0.5, // Estimate ~500MB/day bandwidth
      storageSizeGB: 0.1, // Minimal storage usage
      databaseRequests: (distributorCount || 0) * 100, // Estimate requests
    };
  } catch (error) {
    console.error('Failed to estimate Supabase usage:', error);
    // Return conservative defaults
    return {
      databaseSizeGB: 1,
      databaseBandwidthGB: 1,
      storageSizeGB: 0.5,
      databaseRequests: 10000,
    };
  }
}

/**
 * Calculate Supabase costs based on usage
 */
function calculateSupabaseCost(usage: SupabaseUsage): {
  baseCost: number;
  overageCost: number;
  totalCost: number;
  details: Record<string, any>;
} {
  const BASE_MONTHLY_COST = 25; // Pro plan
  const baseCost = BASE_MONTHLY_COST / 30; // Daily proration

  let overageCost = 0;
  const details: Record<string, any> = {};

  // Database size: First 8GB free, then $0.125 per GB/month
  if (usage.databaseSizeGB > 8) {
    const overage = usage.databaseSizeGB - 8;
    const cost = (overage * 0.125) / 30; // Daily proration
    overageCost += cost;
    details.databaseSizeOverageGB = overage;
    details.databaseSizeCost = cost;
  }

  // Bandwidth: First 50GB free, then $0.09 per GB
  if (usage.databaseBandwidthGB > 50) {
    const overage = usage.databaseBandwidthGB - 50;
    const cost = overage * 0.09;
    overageCost += cost;
    details.bandwidthOverageGB = overage;
    details.bandwidthCost = cost;
  }

  // Storage: First 250GB free, then $0.021 per GB/month
  if (usage.storageSizeGB > 250) {
    const overage = usage.storageSizeGB - 250;
    const cost = (overage * 0.021) / 30; // Daily proration
    overageCost += cost;
    details.storageOverageGB = overage;
    details.storageCost = cost;
  }

  return {
    baseCost,
    overageCost,
    totalCost: baseCost + overageCost,
    details,
  };
}

/**
 * Record Supabase usage snapshot for a specific date
 */
export async function recordSupabaseUsage(date: Date = new Date()): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get service ID
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('name', 'supabase')
      .single();

    if (!service) {
      throw new Error('Supabase service not found in database');
    }

    // Fetch usage (or estimate)
    const usage = await fetchSupabaseUsage(date);

    // Calculate costs
    const costs = calculateSupabaseCost(usage);

    // Get snapshot date (YYYY-MM-DD)
    const snapshotDate = date.toISOString().split('T')[0];

    // Insert or update snapshot
    const { error } = await supabase
      .from('platform_usage_snapshots')
      .upsert(
        {
          service_id: service.id,
          snapshot_date: snapshotDate,
          database_size_gb: usage.databaseSizeGB,
          database_bandwidth_gb: usage.databaseBandwidthGB,
          storage_size_gb: usage.storageSizeGB,
          database_requests: usage.databaseRequests,
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
      throw new Error(`Failed to record Supabase usage: ${error.message}`);
    }

    console.log(`Recorded Supabase usage for ${snapshotDate}: $${costs.totalCost.toFixed(4)}`);
  } catch (error) {
    console.error('Error recording Supabase usage:', error);
    throw error;
  }
}

/**
 * Get Supabase usage for current month
 */
export async function getSupabaseMonthlyUsage(): Promise<{
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
    .eq('name', 'supabase')
    .single();

  if (!service) {
    throw new Error('Supabase service not found');
  }

  // Get all snapshots for current month
  const { data: snapshots, error } = await supabase
    .from('platform_usage_snapshots')
    .select('*')
    .eq('service_id', service.id)
    .gte('snapshot_date', monthStart)
    .order('snapshot_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to get Supabase usage: ${error.message}`);
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

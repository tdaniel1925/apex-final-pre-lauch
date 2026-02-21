// =============================================
// Service Usage Tracking Utility
// Tracks all 3rd party service usage and costs
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type {
  ServiceName,
  TrackUsageParams,
  CostCalculation,
  ServicePricing,
} from '@/types/service-tracking';

// =============================================
// Cost Calculation
// =============================================

/**
 * Calculate cost based on usage and current pricing
 */
export async function calculateCost(params: {
  service: ServiceName;
  model?: string;
  tokensInput?: number;
  tokensOutput?: number;
  requestsCount?: number;
  emailsSent?: number;
}): Promise<CostCalculation> {
  const supabase = createServiceClient();

  // Get service ID
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', params.service)
    .single();

  if (!service) {
    throw new Error(`Service ${params.service} not found`);
  }

  // Get current pricing
  const query = supabase
    .from('service_pricing')
    .select('*')
    .eq('service_id', service.id)
    .eq('is_active', true)
    .lte('effective_from', new Date().toISOString());

  // If model specified, filter by model
  if (params.model) {
    query.eq('model_name', params.model);
  }

  const { data: pricing } = await query.order('effective_from', { ascending: false }).limit(1).single();

  if (!pricing) {
    console.warn(`No pricing found for ${params.service}${params.model ? ` (${params.model})` : ''}, using $0`);
    return {
      service: params.service,
      model: params.model,
      totalCostUsd: 0,
    };
  }

  let totalCost = 0;
  const calculation: CostCalculation = {
    service: params.service,
    model: params.model,
    totalCostUsd: 0,
  };

  // Calculate based on pricing type
  const pricingData = pricing as ServicePricing;

  if (pricingData.pricing_type === 'per_token' && params.tokensInput && params.tokensOutput) {
    const inputCost = (params.tokensInput / 1000) * (pricingData.input_cost_per_1k || 0);
    const outputCost = (params.tokensOutput / 1000) * (pricingData.output_cost_per_1k || 0);
    totalCost = inputCost + outputCost;

    calculation.tokensInput = params.tokensInput;
    calculation.tokensOutput = params.tokensOutput;
    calculation.inputCostPer1k = pricingData.input_cost_per_1k;
    calculation.outputCostPer1k = pricingData.output_cost_per_1k;
  } else if (pricingData.pricing_type === 'per_email' && params.emailsSent) {
    totalCost = params.emailsSent * (pricingData.request_cost || 0);

    calculation.emailsSent = params.emailsSent;
    calculation.requestCost = pricingData.request_cost;
  } else if (pricingData.pricing_type === 'per_request' && params.requestsCount) {
    totalCost = params.requestsCount * (pricingData.request_cost || 0);

    calculation.requestsCount = params.requestsCount;
    calculation.requestCost = pricingData.request_cost;
  }

  calculation.totalCostUsd = totalCost;

  return calculation;
}

// =============================================
// Usage Tracking
// =============================================

/**
 * Track service usage and cost
 * Call this after every 3rd party API call
 */
export async function trackUsage(params: TrackUsageParams): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Get service ID
    const { data: service } = await supabase
      .from('services')
      .select('id')
      .eq('name', params.service)
      .single();

    if (!service) {
      console.error(`Service ${params.service} not found in tracking system`);
      return;
    }

    // Calculate cost
    const costCalc = await calculateCost({
      service: params.service,
      model: params.requestMetadata?.model,
      tokensInput: params.tokensInput,
      tokensOutput: params.tokensOutput,
      requestsCount: params.requestsCount || 1,
      emailsSent: params.emailsSent,
    });

    // Insert usage log
    const { error } = await supabase.from('service_usage_logs').insert({
      service_id: service.id,
      operation: params.operation,
      endpoint: params.endpoint,

      // Usage metrics
      tokens_input: params.tokensInput,
      tokens_output: params.tokensOutput,
      total_tokens: params.tokensInput && params.tokensOutput
        ? params.tokensInput + params.tokensOutput
        : undefined,
      requests_count: params.requestsCount || 1,
      data_size_bytes: params.dataSizeBytes,
      emails_sent: params.emailsSent,

      // Cost
      cost_usd: costCalc.totalCostUsd,
      cost_calculation: costCalc as any,

      // Context
      triggered_by: params.triggeredBy,
      user_id: params.userId,
      admin_id: params.adminId,
      feature: params.feature,

      // Metadata
      request_metadata: params.requestMetadata,
      response_metadata: params.responseMetadata,
      error: params.error,
      duration_ms: params.durationMs,
    });

    if (error) {
      console.error('Failed to track service usage:', error);
    }
  } catch (error) {
    // Don't throw - tracking failures shouldn't break the main flow
    console.error('Service tracking error:', error);
  }
}

// =============================================
// Budget Management
// =============================================

/**
 * Set or update monthly budget for a service
 */
export async function setServiceBudget(params: {
  service: ServiceName;
  budgetUsd: number;
  alertThresholdPercent?: number;
  month?: Date;
}): Promise<void> {
  const supabase = createServiceClient();

  // Get service ID
  const { data: service } = await supabase
    .from('services')
    .select('id')
    .eq('name', params.service)
    .single();

  if (!service) {
    throw new Error(`Service ${params.service} not found`);
  }

  // Get month (first day of month)
  const month = params.month || new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);

  // Upsert budget
  const { error } = await supabase.from('service_budgets').upsert(
    {
      service_id: service.id,
      month: month.toISOString().split('T')[0],
      budget_usd: params.budgetUsd,
      alert_threshold_percent: params.alertThresholdPercent || 80,
    },
    {
      onConflict: 'service_id,month',
    }
  );

  if (error) {
    throw new Error(`Failed to set budget: ${error.message}`);
  }
}

/**
 * Get current budget status for a service
 */
export async function getServiceBudgetStatus(service: ServiceName) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc('get_service_budget', {
    service_name: service,
  });

  if (error) {
    throw new Error(`Failed to get budget status: ${error.message}`);
  }

  return data?.[0] || null;
}

/**
 * Get all unacknowledged cost alerts
 */
export async function getUnacknowledgedAlerts() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('service_cost_alerts')
    .select('*, services(name, display_name)')
    .eq('acknowledged', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get alerts: ${error.message}`);
  }

  return data || [];
}

/**
 * Acknowledge a cost alert
 */
export async function acknowledgeAlert(alertId: string, adminId: string) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('service_cost_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: adminId,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) {
    throw new Error(`Failed to acknowledge alert: ${error.message}`);
  }
}

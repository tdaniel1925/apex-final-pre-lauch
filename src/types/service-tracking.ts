// =============================================
// Service Usage Tracking Types
// TypeScript definitions for cost tracking system
// =============================================

export type ServiceName = 'openai' | 'anthropic' | 'redis' | 'resend' | 'vercel' | 'supabase';
export type ServiceCategory = 'ai' | 'infrastructure' | 'email' | 'storage';
export type PricingType = 'per_token' | 'per_request' | 'per_email' | 'per_gb';
export type TriggeredBy = 'user' | 'admin' | 'system' | 'cron';
export type AlertType = 'threshold' | 'exceeded' | 'anomaly';
export type AlertSeverity = 'warning' | 'critical';

// =============================================
// Core Service Types
// =============================================

export interface Service {
  id: string;
  name: ServiceName;
  display_name: string;
  category: ServiceCategory;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceUsageLog {
  id: string;
  service_id: string;

  // Request details
  operation: string;
  endpoint?: string;

  // Usage metrics
  tokens_input?: number;
  tokens_output?: number;
  total_tokens?: number;
  requests_count: number;
  data_size_bytes?: number;
  emails_sent?: number;

  // Cost
  cost_usd: number;
  cost_calculation?: Record<string, any>;

  // Context
  triggered_by: TriggeredBy;
  user_id?: string;
  admin_id?: string;
  feature?: string;

  // Metadata
  request_metadata?: Record<string, any>;
  response_metadata?: Record<string, any>;
  error?: string;
  duration_ms?: number;

  created_at: string;
}

export interface ServiceBudget {
  id: string;
  service_id: string;
  month: string; // YYYY-MM-DD format

  budget_usd: number;
  spent_usd: number;
  projected_spend_usd?: number;

  alert_threshold_percent: number;
  alert_sent_at?: string;
  budget_exceeded_at?: string;

  created_at: string;
  updated_at: string;
}

export interface ServiceCostAlert {
  id: string;
  service_id: string;
  budget_id?: string;

  alert_type: AlertType;
  severity: AlertSeverity;

  message: string;
  details?: Record<string, any>;

  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;

  created_at: string;
}

export interface ServicePricing {
  id: string;
  service_id: string;

  pricing_type: PricingType;
  model_name?: string;

  input_cost_per_1k?: number;
  output_cost_per_1k?: number;
  request_cost?: number;
  monthly_base_cost?: number;

  effective_from: string;
  effective_to?: string;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

// =============================================
// Request/Response Types for Service Wrappers
// =============================================

export interface TrackUsageParams {
  service: ServiceName;
  operation: string;
  endpoint?: string;

  // Usage metrics (provide what's relevant for the service)
  tokensInput?: number;
  tokensOutput?: number;
  requestsCount?: number;
  dataSizeBytes?: number;
  emailsSent?: number;

  // Context
  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;

  // Metadata
  requestMetadata?: Record<string, any>;
  responseMetadata?: Record<string, any>;
  error?: string;
  durationMs?: number;
}

export interface CostCalculation {
  service: ServiceName;
  model?: string;
  tokensInput?: number;
  tokensOutput?: number;
  requestsCount?: number;
  emailsSent?: number;
  inputCostPer1k?: number;
  outputCostPer1k?: number;
  requestCost?: number;
  totalCostUsd: number;
}

// =============================================
// Dashboard/Admin Types
// =============================================

export interface ServiceUsageSummary {
  service: Service;
  currentMonth: {
    totalCost: number;
    totalRequests: number;
    totalTokens?: number;
    budget?: ServiceBudget;
  };
  previousMonth: {
    totalCost: number;
    totalRequests: number;
  };
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  topFeatures: Array<{
    feature: string;
    cost: number;
    requests: number;
  }>;
}

export interface CostOverview {
  totalSpendCurrentMonth: number;
  totalBudgetCurrentMonth: number;
  budgetUtilization: number; // Percentage
  projectedMonthlySpend: number;
  services: ServiceUsageSummary[];
  recentAlerts: ServiceCostAlert[];
}

export interface UsageChartData {
  date: string;
  [serviceName: string]: number | string; // Service costs by date
}

export interface SetBudgetParams {
  service: ServiceName;
  budgetUsd: number;
  alertThresholdPercent?: number;
  month?: string; // Optional, defaults to current month
}

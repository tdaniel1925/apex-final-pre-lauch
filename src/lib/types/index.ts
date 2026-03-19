// =============================================
// Apex Affinity Group - TypeScript Types
// =============================================

/**
 * Distributor - Complete database record
 * Matches the distributors table schema exactly
 */
export interface Distributor {
  // Primary Key
  id: string;

  // Authentication Link
  auth_user_id: string | null;

  // Personal Information
  first_name: string;
  last_name: string;
  company_name: string | null;
  email: string;

  // URL Slug (for personalized landing pages)
  slug: string;

  // Affiliate tracking code (8-char unique code)
  affiliate_code: string;

  // MLM Structure
  sponsor_id: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  rep_number: number | null;

  // Flags
  is_master: boolean;
  profile_complete: boolean;
  is_admin: boolean;
  is_licensed_agent: boolean;

  // Profile Completion Fields (nullable until filled)
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  // Banking/ACH Information (for commission payouts)
  bank_name: string | null;
  bank_routing_number: string | null;
  bank_account_number: string | null;
  bank_account_type: 'checking' | 'savings' | null;
  ach_verified: boolean;
  ach_verified_at: string | null;

  // Tax Information
  tax_id: string | null; // SSN or EIN (encrypted/masked)
  tax_id_type: 'ssn' | 'ein' | null;
  date_of_birth: string | null; // YYYY-MM-DD format

  // Admin/Status Fields (Stage 2)
  status?: string | null; // 'active', 'suspended', 'deleted'
  admin_role?: string | null; // 'super_admin', 'admin', 'support', 'viewer'
  suspended_at?: string | null;
  suspended_by?: string | null;
  suspension_reason?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;

  // Licensing Status Fields (Feature Gating System)
  licensing_status: 'licensed' | 'non_licensed';
  licensing_status_set_at: string | null;
  licensing_verified: boolean;
  licensing_verified_at: string | null;
  licensing_verified_by: string | null;

  // Onboarding Tracking
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_completed_at: string | null;
  onboarding_permanently_skipped: boolean;

  // Extended Profile Fields
  profile_photo_url: string | null;
  bio: string | null;
  social_links: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  } | null;

  // Timestamps (ISO 8601 strings from Supabase)
  created_at: string;
  updated_at: string;
}

/**
 * DistributorWithStats - Distributor with computed fields for UI
 * Use this for dashboard and tree visualizations
 */
export interface DistributorWithStats extends Distributor {
  downline_count: number;
  personal_sponsors_count: number;
  available_slots: number;
  personal_enrollees_count: number; // Direct recruits (via sponsor_id)
  organization_enrollees_count: number; // All downline (recursive via sponsor_id)
}

/**
 * DistributorInsert - Type for creating new distributors
 * Omits auto-generated fields (id, timestamps)
 */
export type DistributorInsert = Omit<
  Distributor,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * DistributorUpdate - Type for updating distributors
 * All fields optional except restricted ones
 * Cannot update: id, created_at, updated_at, auth_user_id
 */
export type DistributorUpdate = Partial<
  Omit<Distributor, 'id' | 'created_at' | 'updated_at' | 'auth_user_id'>
>;

/**
 * DistributorPublic - Limited fields for public landing pages
 * Only shows non-sensitive information
 */
export interface DistributorPublic {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  slug: string;
  is_master: boolean;
}

/**
 * MatrixNode - Represents a node in the matrix tree visualization
 * Used for tree rendering and placement calculations
 */
export interface MatrixNode {
  distributor: Distributor;
  children: MatrixNode[];
  depth: number;
  position: number | null;
  available_slots: number;
}

/**
 * MatrixPlacement - Result from BFS placement algorithm
 * Indicates where a new distributor should be placed
 */
export interface MatrixPlacement {
  parent_id: string;
  matrix_position: number; // 1-5
  matrix_depth: number; // 1-7
}

/**
 * DatabaseResponse - Standardized response wrapper for database operations
 */
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

/**
 * ApiResponse - Standardized API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// EXTERNAL INTEGRATIONS TYPES
// Matches migration: 20260317181850_external_integrations_system.sql
// =============================================

/**
 * Integration - External platform configuration
 * Matches the integrations table schema
 */
export interface Integration {
  // Primary Key
  id: string;

  // Platform identification
  platform_name: string; // 'jordyn', 'agentpulse', 'shopify', etc.
  display_name: string; // User-friendly name

  // Configuration
  is_enabled: boolean;
  api_endpoint: string;
  api_key_encrypted: string | null;
  webhook_secret: string | null;

  // Features
  supports_replicated_sites: boolean;
  supports_sales_webhooks: boolean;
  supports_commission_tracking: boolean;

  // Auto-creation settings
  auto_create_site_on_signup: boolean;

  // Metadata
  integration_metadata: Record<string, unknown>;
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * DistributorReplicatedSite - Distributor's replicated site on external platform
 * Matches the distributor_replicated_sites table schema
 */
export interface DistributorReplicatedSite {
  // Primary Key
  id: string;

  // Relationships
  distributor_id: string;
  integration_id: string;

  // External platform identifiers
  external_site_id: string;
  external_user_id: string | null;

  // Site details
  site_url: string;
  site_slug: string | null;
  site_status: 'pending' | 'active' | 'suspended' | 'deleted';

  // Creation details
  created_via: 'manual' | 'auto' | 'import';
  provisioned_at: string | null;

  // Synchronization
  last_synced_at: string | null;
  sync_status: 'synced' | 'pending' | 'error';
  sync_error: string | null;

  // Platform-specific data
  site_metadata: Record<string, unknown>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * IntegrationProductMapping - Maps external products to credits/commissions
 * Matches the integration_product_mappings table schema
 */
export interface IntegrationProductMapping {
  // Primary Key
  id: string;

  // Relationships
  integration_id: string;
  product_id: string | null;

  // External product identification
  external_product_id: string;
  external_product_name: string;
  external_product_sku: string | null;

  // Credit/Commission rules
  tech_credits: number;
  insurance_credits: number;
  direct_commission_percentage: number;
  override_commission_percentage: number;

  // Fixed commission amounts
  fixed_commission_amount: number | null;

  // Mapping configuration
  is_active: boolean;
  commission_type: 'credits' | 'percentage' | 'fixed' | 'none';

  // Metadata
  mapping_metadata: Record<string, unknown>;
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * ExternalSale - Sale from external platform
 * Matches the external_sales table schema
 */
export interface ExternalSale {
  // Primary Key
  id: string;

  // Relationships
  integration_id: string;
  distributor_id: string;
  product_mapping_id: string | null;
  replicated_site_id: string | null;

  // External platform identifiers
  external_sale_id: string;
  external_customer_id: string | null;
  external_product_id: string;

  // Sale details
  sale_amount: number;
  currency: string;
  quantity: number;

  // Commission calculated
  tech_credits_earned: number;
  insurance_credits_earned: number;
  commission_amount: number;
  commission_type: string | null;

  // Sale status
  sale_status: 'pending' | 'completed' | 'refunded' | 'canceled';

  // Timestamps
  sale_date: string;
  processed_at: string;
  refunded_at: string | null;

  // Webhook data
  webhook_payload: Record<string, unknown> | null;

  // Processing status
  commission_applied: boolean;
  commission_applied_at: string | null;

  // Metadata
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * IntegrationWebhookLog - Audit log for webhook requests
 * Matches the integration_webhook_logs table schema
 */
export interface IntegrationWebhookLog {
  // Primary Key
  id: string;

  // Relationships
  integration_id: string | null;
  external_sale_id: string | null;

  // Webhook details
  webhook_event_type: string;
  webhook_source_ip: string | null;
  webhook_signature: string | null;
  signature_verified: boolean;

  // Request data
  http_method: string;
  headers: Record<string, unknown> | null;
  payload: Record<string, unknown>;

  // Processing status
  processing_status: 'pending' | 'processing' | 'success' | 'error' | 'ignored';
  processing_started_at: string | null;
  processing_completed_at: string | null;

  // Error handling
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  retry_count: number;

  // Response
  response_code: number | null;
  response_body: string | null;

  // Timestamps
  received_at: string;
  created_at: string;
}

/**
 * DistributorReplicatedSiteInsert - Type for creating replicated sites
 * Omits auto-generated fields
 */
export type DistributorReplicatedSiteInsert = Omit<
  DistributorReplicatedSite,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * ExternalSaleInsert - Type for creating external sales
 * Omits auto-generated fields
 */
export type ExternalSaleInsert = Omit<
  ExternalSale,
  'id' | 'created_at' | 'updated_at' | 'processed_at'
>;

/**
 * IntegrationWithStats - Integration with usage statistics
 * Used for admin dashboard
 */
export interface IntegrationWithStats extends Integration {
  total_sites: number;
  active_sites: number;
  total_sales: number;
  total_sales_amount: number;
  total_webhooks_received: number;
  last_webhook_at: string | null;
}

// =============================================
// PLATFORM INTEGRATIONS TYPES (User Sync System)
// For automatic replicated site creation
// =============================================

/**
 * PlatformIntegration - External platform configuration for user sync
 * Matches the platform_integrations table schema
 */
export interface PlatformIntegration {
  id: string;
  platform_name: string;
  platform_display_name: string;
  platform_url: string;
  api_endpoint: string;
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  auth_type: 'bearer' | 'basic' | 'api_key';
  sync_users: boolean;
  enabled: boolean;
  site_url_pattern: string;
  max_retry_attempts: number;
  retry_delay_seconds: number;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * DistributorReplicatedSiteNew - New replicated site record for user sync
 * Matches the new distributor_replicated_sites table from 20260317000001 migration
 */
export interface DistributorReplicatedSiteNew {
  id: string;
  distributor_id: string;
  integration_id: string;
  site_url: string;
  external_user_id: string | null;
  external_username: string | null;
  status: 'pending' | 'active' | 'failed' | 'suspended';
  sync_attempts: number;
  last_sync_attempt_at: string | null;
  last_sync_error: string | null;
  activated_at: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * DistributorReplicatedSiteWithIntegration - Replicated site with integration info
 */
export interface DistributorReplicatedSiteWithIntegration extends DistributorReplicatedSiteNew {
  integration: PlatformIntegration;
}

/**
 * CreateReplicatedSiteResult - Result from creating a replicated site
 */
export interface CreateReplicatedSiteResult {
  success: boolean;
  site_url?: string;
  external_user_id?: string;
  error?: string;
}

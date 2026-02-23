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

  // MLM Structure
  sponsor_id: string | null;
  matrix_parent_id: string | null;
  matrix_position: number | null;
  matrix_depth: number;
  rep_number: number | null;

  // Flags
  is_master: boolean;
  profile_complete: boolean;

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

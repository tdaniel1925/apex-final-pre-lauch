/**
 * Profile & Settings TypeScript Types
 * Matches database schema from migration 002_profile_settings_schema.sql
 */

// =============================================================================
// DATABASE TYPES (Match Supabase tables exactly)
// =============================================================================

export interface UserProfileExtended {
  id: string;
  user_id: string;
  date_of_birth: string | null; // ISO date string
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null;
  street_address: string | null;
  zip_code: string | null;
  language: string;
  timezone: string;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPaymentInfo {
  id: string;
  user_id: string;
  payment_method: 'ach' | 'check';
  bank_name: string | null;
  account_type: 'checking' | 'savings' | null;
  routing_number_last4: string | null; // Only last 4 digits
  account_number_last4: string | null; // Only last 4 digits
  account_holder_name: string | null;
  bank_verified: boolean;
  verified_at: string | null;
  minimum_payout_threshold: number;
  payout_schedule: 'weekly' | 'bi-weekly' | 'monthly';
  next_payout_date: string | null; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface UserTaxInfo {
  id: string;
  user_id: string;
  taxpayer_id_type: 'ssn' | 'ein' | 'itin' | null;
  tax_id_last4: string | null; // Only last 4 digits
  legal_name: string | null;
  business_name: string | null;
  federal_tax_classification:
    | 'individual'
    | 'c_corp'
    | 's_corp'
    | 'partnership'
    | 'trust'
    | 'llc'
    | null;
  w9_form_url: string | null;
  w9_uploaded_at: string | null;
  w9_status: 'pending' | 'approved' | 'needs_update';
  created_at: string;
  updated_at: string;
}

export interface UserTaxDocument {
  id: string;
  user_id: string;
  tax_year: number;
  document_type: string;
  total_earnings: number;
  document_url: string | null;
  generated_at: string;
  created_at: string;
}

export interface UserSecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  sms_2fa_enabled: boolean;
  email_2fa_enabled: boolean;
  authenticator_enabled: boolean;
  backup_codes_remaining: number;
  backup_codes_generated_at: string | null;
  last_password_change: string | null;
  password_change_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;

  // Commissions & Payouts
  commission_credited_email: boolean;
  commission_credited_sms: boolean;
  commission_credited_push: boolean;
  commission_credited_inapp: boolean;

  payout_processed_email: boolean;
  payout_processed_sms: boolean;
  payout_processed_push: boolean;
  payout_processed_inapp: boolean;

  bonus_unlocked_email: boolean;
  bonus_unlocked_sms: boolean;
  bonus_unlocked_push: boolean;
  bonus_unlocked_inapp: boolean;

  // Team Activity
  new_recruit_email: boolean;
  new_recruit_sms: boolean;
  new_recruit_push: boolean;
  new_recruit_inapp: boolean;

  team_rankup_email: boolean;
  team_rankup_sms: boolean;
  team_rankup_push: boolean;
  team_rankup_inapp: boolean;

  team_inactive_email: boolean;
  team_inactive_sms: boolean;
  team_inactive_push: boolean;
  team_inactive_inapp: boolean;

  // Customers & Orders
  customer_order_email: boolean;
  customer_order_sms: boolean;
  customer_order_push: boolean;
  customer_order_inapp: boolean;

  autoship_renewal_email: boolean;
  autoship_renewal_sms: boolean;
  autoship_renewal_push: boolean;
  autoship_renewal_inapp: boolean;

  customer_cancellation_email: boolean;
  customer_cancellation_sms: boolean;
  customer_cancellation_push: boolean;
  customer_cancellation_inapp: boolean;

  // System & Security
  new_login_email: boolean;
  new_login_sms: boolean;
  new_login_push: boolean;
  new_login_inapp: boolean;

  corporate_announcements_email: boolean;
  corporate_announcements_sms: boolean;
  corporate_announcements_push: boolean;
  corporate_announcements_inapp: boolean;

  created_at: string;
  updated_at: string;
}

// =============================================================================
// FORM TYPES (For React Hook Form)
// =============================================================================

export interface PersonalInfoFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  language: string;
  timezone: string;
}

export interface PaymentInfoFormData {
  payment_method: 'ach' | 'check';
  bank_name: string;
  account_type: 'checking' | 'savings';
  routing_number: string; // Full number for update (not stored)
  account_number: string; // Full number for update (not stored)
  account_holder_name: string;
  minimum_payout_threshold: number;
  payout_schedule: 'weekly' | 'bi-weekly' | 'monthly';
}

export interface TaxInfoFormData {
  taxpayer_id_type: 'ssn' | 'ein' | 'itin';
  tax_id: string; // Full number for update (not stored)
  legal_name: string;
  business_name: string;
  federal_tax_classification:
    | 'individual'
    | 'c_corp'
    | 's_corp'
    | 'partnership'
    | 'trust'
    | 'llc';
}

export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// =============================================================================
// COMPOSITE TYPES (Joined data from multiple tables)
// =============================================================================

export interface CompleteProfile {
  // From auth.users
  id: string;
  email: string;
  phone: string | null;

  // From user_profiles
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  referral_code: string | null;
  referred_by: string | null;
  tier: string;
  points: number;

  // From user_profile_extended
  date_of_birth: string | null;
  gender: string | null;
  street_address: string | null;
  zip_code: string | null;
  language: string;
  timezone: string;
  profile_photo_url: string | null;
}

export interface ReferrerInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_code: string;
  tier: string;
  points: number;
  profile_photo_url: string | null;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ProfileApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  url: string;
  path: string;
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export type ProfileTab =
  | 'personal'
  | 'payment'
  | 'tax'
  | 'security'
  | 'notifications'
  | 'referral';

export interface TabConfig {
  id: ProfileTab;
  label: string;
  icon: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
] as const;

export const PAYOUT_SCHEDULE_OPTIONS = [
  { value: 'weekly', label: 'Weekly', subtitle: 'Every Friday' },
  { value: 'bi-weekly', label: 'Bi-Weekly', subtitle: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', subtitle: 'Last business day' },
] as const;

export const TAX_CLASSIFICATION_OPTIONS = [
  { value: 'individual', label: 'Individual / Sole Proprietor' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'trust', label: 'Trust / Estate' },
  { value: 'llc', label: 'LLC' },
] as const;

export const TAXPAYER_ID_TYPE_OPTIONS = [
  { value: 'ssn', label: 'SSN (Social Security Number)' },
  { value: 'ein', label: 'EIN (Employer Identification Number)' },
  { value: 'itin', label: 'ITIN (Individual Taxpayer ID)' },
] as const;

export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;

export const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET) UTC-5' },
  { value: 'America/Chicago', label: 'Central Time (CT) UTC-6' },
  { value: 'America/Denver', label: 'Mountain Time (MT) UTC-7' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) UTC-8' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT) UTC-9' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT) UTC-10' },
] as const;

/**
 * Comprehensive Profile Validation Schemas
 * Defines all validation rules for profile fields
 */

import { z } from 'zod';

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const US_PHONE_REGEX = /^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;
const SSN_REGEX = /^\d{3}-?\d{2}-?\d{4}$/;
const EIN_REGEX = /^\d{2}-?\d{7}$/;
const ROUTING_NUMBER_REGEX = /^\d{9}$/;
const ACCOUNT_NUMBER_REGEX = /^\d{4,17}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// US State codes
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

// ============================================================================
// PERSONAL INFORMATION SCHEMA
// ============================================================================

export const personalInfoSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),

  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),

  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters')
    .regex(EMAIL_REGEX, 'Invalid email format'),

  phone: z.string()
    .regex(US_PHONE_REGEX, 'Invalid US phone number format')
    .min(10, 'Phone number is required')
    .optional()
    .or(z.literal('')),

  date_of_birth: z.string()
    .refine((date) => {
      if (!date) return true; // Optional (already set during signup)
      const dob = new Date(date);
      const age = (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18 && age <= 120;
    }, 'Must be between 18 and 120 years old')
    .optional()
    .or(z.literal('')),

  company_name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  // Business-specific fields (editable)
  dba_name: z.string()
    .max(200, 'DBA name must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  business_website: z.string()
    .url('Please enter a valid URL')
    .max(200, 'Website URL must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// ============================================================================
// ADDRESS SCHEMA
// ============================================================================

export const addressSchema = z.object({
  address_line1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  address_line2: z.string()
    .max(200, 'Address line 2 must not exceed 200 characters')
    .optional()
    .or(z.literal('')),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  state: z.enum(US_STATES, {
    errorMap: () => ({ message: 'Invalid US state code' }),
  } as any)
    .optional()
    .or(z.literal('')),

  zip: z.string()
    .regex(ZIP_CODE_REGEX, 'Invalid ZIP code format (must be 12345 or 12345-6789)')
    .optional()
    .or(z.literal('')),
});

export type Address = z.infer<typeof addressSchema>;

// ============================================================================
// BANKING INFORMATION SCHEMA
// ============================================================================

export const bankingInfoSchema = z.object({
  bank_name: z.string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  bank_account_type: z.enum(['checking', 'savings'], {
    errorMap: () => ({ message: 'Account type must be checking or savings' }),
  } as any)
    .optional()
    .or(z.literal('')),

  bank_routing_number: z.string()
    .regex(ROUTING_NUMBER_REGEX, 'Routing number must be exactly 9 digits')
    .refine((routing) => {
      if (!routing) return true;
      // Validate routing number checksum (ABA algorithm)
      const digits = routing.split('').map(Number);
      const checksum = (
        3 * (digits[0] + digits[3] + digits[6]) +
        7 * (digits[1] + digits[4] + digits[7]) +
        (digits[2] + digits[5] + digits[8])
      ) % 10;
      return checksum === 0;
    }, 'Invalid routing number (failed checksum validation)')
    .optional()
    .or(z.literal('')),

  bank_account_number: z.string()
    .regex(ACCOUNT_NUMBER_REGEX, 'Account number must be 4-17 digits')
    .optional()
    .or(z.literal('')),

  account_holder_name: z.string()
    .min(2, 'Account holder name must be at least 2 characters')
    .max(100, 'Account holder name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
});

export type BankingInfo = z.infer<typeof bankingInfoSchema>;

// ============================================================================
// TAX INFORMATION SCHEMA
// ============================================================================

export const taxInfoSchema = z.object({
  tax_id_type: z.enum(['ssn', 'ein', 'itin'], {
    errorMap: () => ({ message: 'Tax ID type must be SSN, EIN, or ITIN' }),
  } as any)
    .optional()
    .or(z.literal('')),

  tax_id: z.string()
    .refine((value) => {
      if (!value) return true; // Optional
      // Remove dashes for validation
      const cleaned = value.replace(/-/g, '');
      // SSN: 9 digits, EIN: 9 digits, ITIN: 9 digits (all same length)
      return cleaned.length === 9 && /^\d+$/.test(cleaned);
    }, 'Tax ID must be 9 digits (with or without dashes)')
    .optional()
    .or(z.literal('')),
});

export type TaxInfo = z.infer<typeof taxInfoSchema>;

// ============================================================================
// COMPREHENSIVE PROFILE UPDATE SCHEMA
// ============================================================================

export const comprehensiveProfileSchema = z.object({
  // Personal information
  ...personalInfoSchema.shape,

  // Address
  ...addressSchema.shape,

  // Banking (optional, handled separately with 2FA)
  ...bankingInfoSchema.shape,

  // Tax (optional, sensitive)
  ...taxInfoSchema.shape,

  // Password confirmation for email changes
  current_password: z.string()
    .min(1, 'Current password is required for email changes')
    .optional(),

  // Registration type and business type (readonly - displayed but not editable)
  registration_type: z.enum(['personal', 'business']).optional(),
  business_type: z.enum(['llc', 'corporation', 's_corporation', 'partnership', 'sole_proprietor']).optional(),
});

export type ComprehensiveProfile = z.infer<typeof comprehensiveProfileSchema>;

// ============================================================================
// EMAIL CHANGE REQUEST SCHEMA
// ============================================================================

export const emailChangeRequestSchema = z.object({
  new_email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters'),

  current_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

export type EmailChangeRequest = z.infer<typeof emailChangeRequestSchema>;

// ============================================================================
// EMAIL VERIFICATION SCHEMA
// ============================================================================

export const emailVerificationSchema = z.object({
  token: z.string()
    .length(64, 'Invalid verification token')
    .regex(/^[a-f0-9]{64}$/, 'Invalid token format'),
});

export type EmailVerification = z.infer<typeof emailVerificationSchema>;

// ============================================================================
// BANKING CHANGE WITH 2FA SCHEMA
// ============================================================================

export const bankingChange2FASchema = z.object({
  ...bankingInfoSchema.shape,

  // 2FA code (6 digits)
  two_factor_code: z.string()
    .length(6, '2FA code must be 6 digits')
    .regex(/^\d{6}$/, '2FA code must be numeric'),

  // Reason for change (required for audit)
  change_reason: z.string()
    .min(10, 'Please provide a detailed reason (at least 10 characters)')
    .max(500, 'Reason must not exceed 500 characters'),
});

export type BankingChange2FA = z.infer<typeof bankingChange2FASchema>;

// ============================================================================
// PROFILE CHANGE AUDIT LOG SCHEMA
// ============================================================================

export const profileChangeAuditSchema = z.object({
  distributor_id: z.string().uuid(),
  changed_by_id: z.string().uuid(),
  change_type: z.enum([
    'personal_info',
    'address',
    'banking',
    'tax_info',
    'email',
  ]),
  old_values: z.record(z.string(), z.any()),
  new_values: z.record(z.string(), z.any()),
  change_reason: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export type ProfileChangeAudit = z.infer<typeof profileChangeAuditSchema>;

// ============================================================================
// EXTERNAL PLATFORM SYNC QUEUE SCHEMA
// ============================================================================

export const profileSyncQueueSchema = z.object({
  distributor_id: z.string().uuid(),
  platform: z.enum(['jordyn', 'agentpulse', 'winflex']),
  change_type: z.enum(['email', 'name', 'phone', 'address', 'all']),
  sync_data: z.record(z.string(), z.any()),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  max_retries: z.number().int().min(0).max(10).default(5),
});

export type ProfileSyncQueue = z.infer<typeof profileSyncQueueSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract last 4 digits from sensitive data
 */
export function extractLast4(value: string): string {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  return cleaned.slice(-4);
}

/**
 * Mask sensitive data showing only last 4 digits
 */
export function maskSensitiveData(value: string, visibleDigits: number = 4): string {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= visibleDigits) return value;
  const last4 = cleaned.slice(-visibleDigits);
  const masked = '•'.repeat(cleaned.length - visibleDigits);
  return `${masked}${last4}`;
}

/**
 * Format phone number to (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Validate if email is unique (not already in use)
 */
export async function isEmailUnique(email: string, currentDistributorId: string): Promise<boolean> {
  // This should be implemented with actual database check
  // For now, return true (will be implemented in API route)
  return true;
}

/**
 * Calculate change severity based on field type
 */
export function calculateChangeSeverity(
  changeType: string,
  oldValue: any,
  newValue: any
): 'low' | 'medium' | 'high' | 'critical' {
  if (changeType === 'email') return 'critical';
  if (changeType === 'banking') return 'critical';
  if (changeType === 'tax_info') return 'high';
  if (changeType === 'address') return 'medium';
  return 'low';
}

/**
 * Determine which external platforms need sync based on change type
 */
export function getPlatformsForSync(
  changeType: string,
  isLicensedAgent: boolean
): Array<'jordyn' | 'agentpulse' | 'winflex'> {
  const platforms: Array<'jordyn' | 'agentpulse' | 'winflex'> = [];

  // Jordyn and AgentPulse always sync for email/name changes
  if (['email', 'name', 'all'].includes(changeType)) {
    platforms.push('jordyn', 'agentpulse');
  }

  // WinFlex only for licensed agents and address/phone/email changes
  if (isLicensedAgent && ['email', 'phone', 'address', 'all'].includes(changeType)) {
    platforms.push('winflex');
  }

  return platforms;
}

/**
 * Validate routing number using ABA checksum algorithm
 */
export function validateRoutingNumber(routing: string): boolean {
  if (!routing || routing.length !== 9) return false;

  const digits = routing.split('').map(Number);
  const checksum = (
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8])
  ) % 10;

  return checksum === 0;
}

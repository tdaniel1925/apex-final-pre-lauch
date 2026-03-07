/**
 * Profile & Settings Validation Schemas
 * Uses Zod for runtime validation + TypeScript type inference
 */

import { z } from 'zod';

// =============================================================================
// PERSONAL INFO VALIDATION
// =============================================================================

export const personalInfoSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),

  phone: z
    .string()
    .regex(/^\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),

  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }, 'Must be at least 18 years old')
    .optional()
    .or(z.literal('')),

  gender: z
    .enum(['male', 'female', 'non-binary', 'prefer_not_to_say'])
    .optional(),

  street_address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  state: z
    .string()
    .length(2, 'State must be a 2-letter code')
    .regex(/^[A-Z]{2}$/, 'Invalid state code')
    .optional()
    .or(z.literal('')),

  zip_code: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .optional()
    .or(z.literal('')),

  language: z
    .string()
    .min(2, 'Language is required')
    .default('en-US'),

  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .default('America/Chicago'),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

// =============================================================================
// PAYMENT INFO VALIDATION
// =============================================================================

export const paymentInfoSchema = z.object({
  payment_method: z.enum(['ach', 'check']),

  bank_name: z
    .string()
    .min(2, 'Bank name is required')
    .max(100, 'Bank name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  account_type: z.enum(['checking', 'savings']).optional(),

  routing_number: z
    .string()
    .regex(/^\d{9}$/, 'Routing number must be exactly 9 digits')
    .optional()
    .or(z.literal('')),

  account_number: z
    .string()
    .min(4, 'Account number must be at least 4 digits')
    .max(17, 'Account number must be less than 17 digits')
    .regex(/^\d+$/, 'Account number must contain only digits')
    .optional()
    .or(z.literal('')),

  account_holder_name: z
    .string()
    .min(2, 'Account holder name is required')
    .max(100, 'Account holder name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  minimum_payout_threshold: z
    .number()
    .min(25, 'Minimum threshold is $25')
    .max(500, 'Maximum threshold is $500')
    .default(50),

  payout_schedule: z
    .enum(['weekly', 'bi-weekly', 'monthly'])
    .default('weekly'),
});

export type PaymentInfoFormData = z.infer<typeof paymentInfoSchema>;

// =============================================================================
// TAX INFO VALIDATION
// =============================================================================

export const taxInfoSchema = z.object({
  taxpayer_id_type: z.enum(['ssn', 'ein', 'itin']).optional(),

  tax_id: z
    .string()
    .regex(
      /^(\d{3}-\d{2}-\d{4})|(\d{2}-\d{7})$/,
      'Invalid format. SSN: XXX-XX-XXXX, EIN: XX-XXXXXXX'
    )
    .optional()
    .or(z.literal('')),

  legal_name: z
    .string()
    .min(2, 'Legal name is required')
    .max(100, 'Legal name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  business_name: z
    .string()
    .max(100, 'Business name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  federal_tax_classification: z
    .enum(['individual', 'c_corp', 's_corp', 'partnership', 'trust', 'llc'])
    .default('individual'),
});

export type TaxInfoFormData = z.infer<typeof taxInfoSchema>;

// =============================================================================
// PASSWORD CHANGE VALIDATION
// =============================================================================

export const passwordChangeSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Current password is required'),

    new_password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),

    confirm_password: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: 'New password must be different from current password',
    path: ['new_password'],
  });

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// =============================================================================
// FILE UPLOAD VALIDATION
// =============================================================================

export const profilePhotoSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type),
      'Only JPG, PNG, or GIF files are allowed'
    ),
});

export const w9UploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(
      (file) =>
        ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
      'Only PDF, JPG, or PNG files are allowed'
    ),
});

// =============================================================================
// NOTIFICATION PREFERENCES VALIDATION
// =============================================================================

export const notificationPreferencesSchema = z.object({
  // Commissions & Payouts
  commission_credited_email: z.boolean().default(true),
  commission_credited_sms: z.boolean().default(true),
  commission_credited_push: z.boolean().default(true),
  commission_credited_inapp: z.boolean().default(true),

  payout_processed_email: z.boolean().default(true),
  payout_processed_sms: z.boolean().default(true),
  payout_processed_push: z.boolean().default(false),
  payout_processed_inapp: z.boolean().default(true),

  bonus_unlocked_email: z.boolean().default(true),
  bonus_unlocked_sms: z.boolean().default(true),
  bonus_unlocked_push: z.boolean().default(true),
  bonus_unlocked_inapp: z.boolean().default(true),

  // Team Activity
  new_recruit_email: z.boolean().default(true),
  new_recruit_sms: z.boolean().default(true),
  new_recruit_push: z.boolean().default(true),
  new_recruit_inapp: z.boolean().default(true),

  team_rankup_email: z.boolean().default(true),
  team_rankup_sms: z.boolean().default(false),
  team_rankup_push: z.boolean().default(true),
  team_rankup_inapp: z.boolean().default(true),

  team_inactive_email: z.boolean().default(true),
  team_inactive_sms: z.boolean().default(false),
  team_inactive_push: z.boolean().default(false),
  team_inactive_inapp: z.boolean().default(true),

  // Customers & Orders
  customer_order_email: z.boolean().default(true),
  customer_order_sms: z.boolean().default(false),
  customer_order_push: z.boolean().default(true),
  customer_order_inapp: z.boolean().default(true),

  autoship_renewal_email: z.boolean().default(true),
  autoship_renewal_sms: z.boolean().default(false),
  autoship_renewal_push: z.boolean().default(false),
  autoship_renewal_inapp: z.boolean().default(true),

  customer_cancellation_email: z.boolean().default(true),
  customer_cancellation_sms: z.boolean().default(true),
  customer_cancellation_push: z.boolean().default(true),
  customer_cancellation_inapp: z.boolean().default(true),

  // System & Security
  new_login_email: z.boolean().default(true),
  new_login_sms: z.boolean().default(true),
  new_login_push: z.boolean().default(true),
  new_login_inapp: z.boolean().default(true),

  corporate_announcements_email: z.boolean().default(true),
  corporate_announcements_sms: z.boolean().default(false),
  corporate_announcements_push: z.boolean().default(true),
  corporate_announcements_inapp: z.boolean().default(true),
});

export type NotificationPreferencesFormData = z.infer<
  typeof notificationPreferencesSchema
>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate password strength (0-4)
 */
export function calculatePasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return Math.min(strength, 4);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return labels[strength] || 'Weak';
}

/**
 * Mask sensitive data (show only last 4 digits)
 */
export function maskSensitiveData(value: string, visibleDigits: number = 4): string {
  if (!value || value.length <= visibleDigits) return value;
  const masked = '•'.repeat(Math.max(0, value.length - visibleDigits));
  const visible = value.slice(-visibleDigits);
  return `${masked}${visible}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Extract last 4 digits for storage
 */
export function extractLast4Digits(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.slice(-4);
}

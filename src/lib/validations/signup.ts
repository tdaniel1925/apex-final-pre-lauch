// =============================================
// Signup Validation Schemas
// Using Zod for type-safe validation
// Supports both personal and business registrations
// =============================================

import { z } from 'zod';
import { validateSSN } from '../utils/ssn';
import { validateEIN } from '../utils/ein';
import { isValidAge } from '../utils/date-validation';

/**
 * Reserved slugs that cannot be used for distributor usernames
 */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'dashboard',
  'login',
  'signup',
  'join',
  'settings',
  'profile',
  'help',
  'support',
  'about',
  'contact',
  'terms',
  'privacy',
  'matrix',
  'referrals',
  'team',
  'downline',
  'upline',
  'apex',
  'apex-vision',
] as const;

/**
 * Slug validation regex
 * - Lowercase letters and numbers only
 * - Hyphens allowed (but not at start/end or consecutive)
 * - 3-50 characters
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * US States enum for validation
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

/**
 * Common fields shared by both personal and business registrations
 */
const baseSignupFields = {
  // Basic information
  first_name: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be less than 100 characters')
    .trim(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be less than 100 characters')
    .trim(),

  email: z
    .string()
    .min(1, 'Email is required')
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, and number'
    ),

  slug: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(SLUG_REGEX, 'Username can only contain lowercase letters, numbers, and hyphens')
    .refine(
      (slug) => !RESERVED_SLUGS.includes(slug as any),
      'This username is reserved and cannot be used'
    )
    .toLowerCase()
    .trim(),

  // Phone number (now required for both types)
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[0-9\s\-\(\)\+]*$/, 'Please enter a valid phone number')
    .trim(),

  // Address fields (now required for both types)
  address_line1: z
    .string()
    .min(1, 'Street address is required')
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be less than 200 characters')
    .trim(),

  address_line2: z
    .string()
    .max(200, 'Address line 2 must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .min(1, 'City is required')
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters')
    .trim(),

  state: z.enum(US_STATES, { message: 'Please select a valid US state' }),

  zip: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .trim(),

  // Sponsor and licensing
  sponsor_slug: z.string().optional(),
  licensing_status: z.enum(['licensed', 'non_licensed']),
};

/**
 * Personal registration schema (individual distributor)
 * Requires: SSN, date of birth (18+ years old)
 */
const personalSignupSchema = z.object({
  ...baseSignupFields,

  registration_type: z.literal('personal'),

  // Company name is optional for personal registrations
  company_name: z
    .string()
    .max(200, 'Company name must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  // Date of birth (required for personal, must be 18+)
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (date) => {
        const dob = new Date(date);
        return !isNaN(dob.getTime());
      },
      'Please enter a valid date'
    )
    .refine(
      (date) => {
        const dob = new Date(date);
        return dob <= new Date();
      },
      'Date of birth cannot be in the future'
    )
    .refine(
      (date) => isValidAge(date, 18, 120),
      'You must be at least 18 years old to register'
    ),

  // SSN required for personal registrations (for 1099 tax reporting)
  ssn: z
    .string()
    .min(1, 'Social Security Number is required')
    .regex(
      /^\d{3}-\d{2}-\d{4}$/,
      'SSN must be in format XXX-XX-XXXX'
    )
    .refine(
      (ssn) => validateSSN(ssn),
      'Please enter a valid Social Security Number'
    ),
});

/**
 * Business registration schema (agency/company)
 * Requires: EIN, business type, company name
 */
const businessSignupSchema = z.object({
  ...baseSignupFields,

  registration_type: z.literal('business'),

  // Company name is REQUIRED for business registrations
  company_name: z
    .string()
    .min(1, 'Company legal name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(200, 'Company name must be less than 200 characters')
    .trim(),

  // Business type (legal structure)
  business_type: z.enum(
    ['llc', 'corporation', 's_corporation', 'partnership', 'sole_proprietor'],
    { message: 'Please select a business type' }
  ),

  // DBA (Doing Business As) name - optional
  dba_name: z
    .string()
    .max(200, 'DBA name must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  // Business website - optional
  business_website: z
    .string()
    .url('Please enter a valid URL (e.g., https://example.com)')
    .max(200, 'Website URL must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  // EIN required for business registrations (for W-9 tax reporting)
  ein: z
    .string()
    .min(1, 'Employer Identification Number (EIN) is required')
    .regex(
      /^\d{2}-\d{7}$/,
      'EIN must be in format XX-XXXXXXX'
    )
    .refine(
      (ein) => validateEIN(ein),
      'Please enter a valid Employer Identification Number'
    ),
});

/**
 * Signup form validation schema - Discriminated union
 * Supports both personal and business registrations
 */
export const signupSchema = z.discriminatedUnion('registration_type', [
  personalSignupSchema,
  businessSignupSchema,
]);

/**
 * Type inference from schema
 */
export type SignupFormData = z.infer<typeof signupSchema>;
export type PersonalSignupData = z.infer<typeof personalSignupSchema>;
export type BusinessSignupData = z.infer<typeof businessSignupSchema>;

/**
 * Slug-only validation (for real-time checking)
 */
export const slugSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(SLUG_REGEX, 'Username can only contain lowercase letters, numbers, and hyphens')
  .refine(
    (slug) => !RESERVED_SLUGS.includes(slug as any),
    'This username is reserved'
  )
  .toLowerCase()
  .trim();

/**
 * Email-only validation (for real-time checking)
 */
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// =============================================
// Signup Validation Schemas
// Using Zod for type-safe validation
// =============================================

import { z } from 'zod';

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
 * Signup form validation schema
 */
export const signupSchema = z.object({
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
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),

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

  company_name: z
    .string()
    .max(200, 'Company name must be less than 200 characters')
    .trim()
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .max(20, 'Phone number must be less than 20 characters')
    .regex(/^[0-9\s\-\(\)\+]*$/, 'Please enter a valid phone number')
    .trim()
    .optional()
    .or(z.literal('')),

  sponsor_slug: z.string().optional(),
});

/**
 * Type inference from schema
 */
export type SignupFormData = z.infer<typeof signupSchema>;

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

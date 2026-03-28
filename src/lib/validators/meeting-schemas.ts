/**
 * Zod validation schemas for Meeting Reservations system
 */

import { z } from 'zod';

// =============================================
// ENUM SCHEMAS
// =============================================

export const locationTypeSchema = z.enum(['virtual', 'physical', 'hybrid'], {
  message: 'Location type must be virtual, physical, or hybrid',
});

export const meetingStatusSchema = z.enum(['draft', 'active', 'closed', 'completed', 'canceled'], {
  message: 'Invalid meeting status',
});

export const registrationStatusSchema = z.enum(['pending', 'confirmed', 'not_going', 'needs_followup'], {
  message: 'Invalid registration status',
});

export const timezoneSchema = z.string().default('America/Chicago');

// =============================================
// FIELD VALIDATION HELPERS
// =============================================

/**
 * Date string validation (YYYY-MM-DD format)
 */
export const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
).refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid date' }
);

/**
 * Time string validation (HH:MM format for API, HH:MM:SS for database)
 */
export const timeStringSchema = z.string().regex(
  /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
  'Time must be in HH:MM or HH:MM:SS format'
);

/**
 * ISO 8601 timestamp validation
 */
export const timestampSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid timestamp' }
);

/**
 * URL validation (optional field)
 */
export const optionalUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val === '') return true; // Allow empty/undefined
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL format' }
  );

/**
 * Slug validation (URL-safe characters only)
 */
export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(100, 'Slug must be less than 100 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain only lowercase letters, numbers, and hyphens (no spaces or special characters)'
  );

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Phone validation (optional, flexible format)
 */
export const phoneSchema = z.string().optional().or(z.literal(''));

// =============================================
// CREATE MEETING SCHEMA
// =============================================

export const createMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),

  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),

  customMessage: z.string().max(1000, 'Custom message must be less than 1000 characters').optional(),

  eventDate: dateStringSchema,

  eventTime: timeStringSchema,

  eventTimezone: timezoneSchema,

  durationMinutes: z.number()
    .int('Duration must be a whole number')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours')
    .default(60),

  locationType: locationTypeSchema,

  virtualLink: optionalUrlSchema,

  physicalAddress: z.string().max(500, 'Address must be less than 500 characters').optional(),

  registrationSlug: slugSchema,

  status: meetingStatusSchema.default('active'),

  maxAttendees: z.number()
    .int('Max attendees must be a whole number')
    .positive('Max attendees must be greater than 0')
    .optional()
    .nullable(),

  registrationDeadline: timestampSchema.optional().nullable(),
})
.refine(
  (data) => {
    // Virtual or hybrid meetings require virtual link
    if ((data.locationType === 'virtual' || data.locationType === 'hybrid') && !data.virtualLink) {
      return false;
    }
    return true;
  },
  {
    message: 'Virtual link is required for virtual or hybrid meetings',
    path: ['virtualLink'],
  }
)
.refine(
  (data) => {
    // Physical or hybrid meetings require physical address
    if ((data.locationType === 'physical' || data.locationType === 'hybrid') && !data.physicalAddress) {
      return false;
    }
    return true;
  },
  {
    message: 'Physical address is required for physical or hybrid meetings',
    path: ['physicalAddress'],
  }
)
.refine(
  (data) => {
    // Event date must be in the future
    const eventDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  },
  {
    message: 'Event date must be today or in the future',
    path: ['eventDate'],
  }
)
.refine(
  (data) => {
    // Registration deadline must be before event date
    if (data.registrationDeadline) {
      const deadline = new Date(data.registrationDeadline);
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}`);
      return deadline < eventDateTime;
    }
    return true;
  },
  {
    message: 'Registration deadline must be before the event date/time',
    path: ['registrationDeadline'],
  }
);

// =============================================
// UPDATE MEETING SCHEMA
// =============================================

export const updateMeetingSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  description: z.string().max(2000, 'Description must be less than 2000 characters').optional().nullable(),

  customMessage: z.string().max(1000, 'Custom message must be less than 1000 characters').optional().nullable(),

  eventDate: dateStringSchema.optional(),

  eventTime: timeStringSchema.optional(),

  eventTimezone: timezoneSchema.optional(),

  durationMinutes: z.number()
    .int('Duration must be a whole number')
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours')
    .optional(),

  locationType: locationTypeSchema.optional(),

  virtualLink: optionalUrlSchema.nullable(),

  physicalAddress: z.string().max(500, 'Address must be less than 500 characters').optional().nullable(),

  status: meetingStatusSchema.optional(),

  maxAttendees: z.number()
    .int('Max attendees must be a whole number')
    .positive('Max attendees must be greater than 0')
    .optional()
    .nullable(),

  registrationDeadline: timestampSchema.optional().nullable(),
})
.refine(
  (data) => {
    // If updating to virtual/hybrid, ensure virtual link exists
    if (data.locationType && (data.locationType === 'virtual' || data.locationType === 'hybrid')) {
      // Note: This only validates if both are updated together
      // API should also check existing meeting data
      if (data.virtualLink === null || data.virtualLink === '') {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Virtual link required when changing to virtual or hybrid location type',
    path: ['virtualLink'],
  }
);

// =============================================
// CREATE REGISTRATION SCHEMA (PUBLIC)
// =============================================

export const createRegistrationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),

  email: emailSchema,

  phone: phoneSchema,

  hasQuestions: z.boolean().default(false),

  questionsText: z.string()
    .max(1000, 'Questions must be less than 1000 characters')
    .optional()
    .nullable(),
})
.refine(
  (data) => {
    // If hasQuestions is true, questionsText must be provided
    if (data.hasQuestions && (!data.questionsText || data.questionsText.trim() === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'Questions text is required when you have questions',
    path: ['questionsText'],
  }
);

// =============================================
// UPDATE REGISTRATION SCHEMA (REP ONLY)
// =============================================

export const updateRegistrationSchema = z.object({
  status: registrationStatusSchema.optional(),

  repNotes: z.string()
    .max(2000, 'Rep notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

// =============================================
// QUERY PARAMETER SCHEMAS
// =============================================

/**
 * Meeting list query parameters
 */
export const meetingListQuerySchema = z.object({
  status: meetingStatusSchema.optional(),
  fromDate: dateStringSchema.optional(),
  toDate: dateStringSchema.optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Registration list query parameters
 */
export const registrationListQuerySchema = z.object({
  status: registrationStatusSchema.optional(),
  hasQuestions: z.coerce.boolean().optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// =============================================
// TYPE EXPORTS (inferred from schemas)
// =============================================

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;
export type MeetingListQuery = z.infer<typeof meetingListQuerySchema>;
export type RegistrationListQuery = z.infer<typeof registrationListQuerySchema>;

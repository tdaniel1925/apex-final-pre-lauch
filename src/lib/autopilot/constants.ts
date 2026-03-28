// =====================================================
// Autopilot Constants
// Centralized constants for the Autopilot system
// =====================================================

/**
 * Special value representing unlimited invitations/resources
 * Used throughout the system to indicate no limit
 */
export const UNLIMITED_INVITES = -1;

/**
 * Display value for unlimited invites in UI
 */
export const UNLIMITED_DISPLAY = '∞ Unlimited';

/**
 * Maximum recipients allowed in a single bulk invitation send
 */
export const MAX_BULK_RECIPIENTS = 10;

/**
 * Minimum time buffer before a meeting can be scheduled (in milliseconds)
 * Set to 1 hour to prevent last-minute scheduling issues
 */
export const MIN_MEETING_SCHEDULE_BUFFER_MS = 60 * 60 * 1000; // 1 hour

/**
 * Maximum time in the future a meeting can be scheduled (in milliseconds)
 * Set to 1 year to prevent far-future scheduling
 */
export const MAX_MEETING_SCHEDULE_FUTURE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

/**
 * Time window (in milliseconds) to check for duplicate invitations
 * Prevents sending duplicate invitations to same recipient within this window
 */
export const DUPLICATE_CHECK_WINDOW_MS = 60 * 1000; // 60 seconds

/**
 * Success message auto-hide delay (in milliseconds)
 */
export const SUCCESS_MESSAGE_DURATION_MS = 3000;

/**
 * Default meeting duration for calendar invites (in minutes)
 */
export const DEFAULT_MEETING_DURATION_MINUTES = 60;

/**
 * Invitation status values
 */
export const INVITATION_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  OPENED: 'opened',
  RESPONDED_YES: 'responded_yes',
  RESPONDED_NO: 'responded_no',
  RESPONDED_MAYBE: 'responded_maybe',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
  FAILED: 'failed', // New status for email send failures
} as const;

/**
 * Response types for meeting invitations
 */
export const RESPONSE_TYPES = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe',
} as const;

/**
 * Invitation types
 */
export const INVITATION_TYPES = {
  PERSONAL: 'personal',
  COMPANY_EVENT: 'company_event',
} as const;

/**
 * Limit types for usage tracking
 */
export const LIMIT_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  CONTACTS: 'contacts',
  SOCIAL: 'social',
  FLYERS: 'flyers',
  BROADCASTS: 'broadcasts',
  TRAINING: 'training',
  MEETINGS: 'meetings',
} as const;

/**
 * TypeScript type definitions for Meeting Reservations system
 */

// =============================================
// DATABASE TYPES (match table structure exactly)
// =============================================

export type MeetingLocationType = 'virtual' | 'physical' | 'hybrid';

export type MeetingStatus = 'draft' | 'active' | 'closed' | 'completed' | 'canceled';

export type RegistrationStatus = 'pending' | 'confirmed' | 'not_going' | 'needs_followup';

/**
 * Meeting event record from database
 * Dates are strings (ISO 8601) NOT Date objects
 */
export interface MeetingEvent {
  id: string;
  distributor_id: string;
  distributor_slug?: string; // Added by API for URL generation (not in database)

  // Meeting details
  title: string;
  description: string | null;
  custom_message: string | null;

  // Date and time (strings from database)
  event_date: string; // DATE format: 'YYYY-MM-DD'
  event_time: string; // TIME format: 'HH:MM:SS'
  event_timezone: string; // e.g., 'America/Chicago'
  duration_minutes: number;

  // Location
  location_type: MeetingLocationType;
  virtual_link: string | null;
  physical_address: string | null;

  // URL slug
  registration_slug: string;

  // Status
  status: MeetingStatus;

  // Capacity
  max_attendees: number | null; // NULL = unlimited
  registration_deadline: string | null; // TIMESTAMPTZ as ISO 8601 string

  // Denormalized stats
  total_registered: number;
  total_confirmed: number;
  total_not_going: number;
  total_needs_followup: number;
  total_with_questions: number;

  // Timestamps (ISO 8601 strings)
  created_at: string;
  updated_at: string;
}

/**
 * Meeting registration record from database
 */
export interface MeetingRegistration {
  id: string;
  meeting_event_id: string;

  // Registrant info
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;

  // Status
  status: RegistrationStatus;

  // Questions
  has_questions: boolean;
  questions_text: string | null;

  // Email tracking
  confirmation_email_sent: boolean;
  confirmation_email_sent_at: string | null;
  reminder_email_sent: boolean;
  reminder_email_sent_at: string | null;

  // Rep notes
  rep_notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// =============================================
// JOINED/ENRICHED TYPES
// =============================================

/**
 * Meeting event with distributor information
 */
export interface MeetingEventWithDistributor extends MeetingEvent {
  distributor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    slug: string;
  };
}

/**
 * Registration with meeting event information
 */
export interface RegistrationWithMeeting extends MeetingRegistration {
  meeting_event: {
    id: string;
    title: string;
    event_date: string;
    event_time: string;
    location_type: MeetingLocationType;
    status: MeetingStatus;
  };
}

// =============================================
// API REQUEST TYPES
// =============================================

/**
 * Request body for creating a new meeting (POST /api/rep/meetings)
 * Uses camelCase for API consistency
 */
export interface CreateMeetingRequest {
  title: string;
  description?: string;
  customMessage?: string;
  eventDate: string; // 'YYYY-MM-DD'
  eventTime: string; // 'HH:MM'
  eventTimezone?: string; // defaults to 'America/Chicago'
  durationMinutes?: number; // defaults to 60
  locationType: MeetingLocationType;
  virtualLink?: string;
  physicalAddress?: string;
  registrationSlug: string;
  status?: MeetingStatus; // defaults to 'active'
  maxAttendees?: number; // null/undefined = unlimited
  registrationDeadline?: string; // ISO 8601 timestamp
}

/**
 * Request body for updating a meeting (PUT /api/rep/meetings/[id])
 * All fields optional
 */
export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  customMessage?: string;
  eventDate?: string;
  eventTime?: string;
  eventTimezone?: string;
  durationMinutes?: number;
  locationType?: MeetingLocationType;
  virtualLink?: string;
  physicalAddress?: string;
  status?: MeetingStatus;
  maxAttendees?: number;
  registrationDeadline?: string;
}

/**
 * Request body for public registration (POST /api/public/meetings/[id]/register)
 */
export interface CreateRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  hasQuestions?: boolean;
  questionsText?: string;
}

/**
 * Request body for updating registration status (PUT /api/rep/meetings/[id]/registrations/[regId])
 */
export interface UpdateRegistrationRequest {
  status?: RegistrationStatus;
  repNotes?: string;
}

// =============================================
// API RESPONSE TYPES
// =============================================

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
}

/**
 * Response from creating a meeting
 */
export interface CreateMeetingResponse {
  success: true;
  data: {
    meeting: MeetingEvent;
    registrationUrl: string; // Full URL: https://reachtheapex.net/[slug]/register/[meetingSlug]
  };
}

/**
 * Response from creating a registration
 */
export interface CreateRegistrationResponse {
  success: true;
  data: {
    registration: MeetingRegistration;
    calendarDownloadUrl: string; // URL to download .ics file
  };
}

/**
 * Response from listing meetings
 */
export interface ListMeetingsResponse {
  success: true;
  data: {
    meetings: MeetingEvent[];
    total: number;
  };
}

/**
 * Response from listing registrations
 */
export interface ListRegistrationsResponse {
  success: true;
  data: {
    registrations: MeetingRegistration[];
    total: number;
  };
}

/**
 * Response from meeting details endpoint (public)
 */
export interface MeetingDetailsResponse {
  success: true;
  data: {
    meeting: {
      id: string;
      title: string;
      description: string | null;
      customMessage: string | null;
      eventDate: string;
      eventTime: string;
      eventTimezone: string;
      durationMinutes: number;
      locationType: MeetingLocationType;
      virtualLink: string | null;
      physicalAddress: string | null;
      maxAttendees: number | null;
      totalRegistered: number;
      isAtCapacity: boolean;
      isDeadlinePassed: boolean;
      status: MeetingStatus;
    };
    distributor: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
  };
}

// =============================================
// UTILITY TYPES
// =============================================

/**
 * Meeting stats summary (for dashboard/cards)
 */
export interface MeetingStats {
  totalMeetings: number;
  activeMeetings: number;
  totalRegistrations: number;
  upcomingMeetings: number;
}

/**
 * Registration stats summary (for meeting detail view)
 */
export interface RegistrationStats {
  total: number;
  confirmed: number;
  pending: number;
  notGoing: number;
  needsFollowup: number;
  withQuestions: number;
}

/**
 * ICS calendar event data
 */
export interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizerName: string;
  organizerEmail: string;
  attendeeName: string;
  attendeeEmail: string;
  url?: string;
}

/**
 * Meeting list filter options
 */
export interface MeetingListFilters {
  status?: MeetingStatus;
  fromDate?: string; // 'YYYY-MM-DD'
  toDate?: string; // 'YYYY-MM-DD'
  search?: string; // Search in title
  limit?: number;
  offset?: number;
}

/**
 * Registration list filter options
 */
export interface RegistrationListFilters {
  status?: RegistrationStatus;
  hasQuestions?: boolean;
  search?: string; // Search in name/email
  limit?: number;
  offset?: number;
}

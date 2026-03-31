// =============================================
// Google Calendar Integration
// Manages onboarding session calendar events
// =============================================

import { google } from 'googleapis';

interface CalendarEventParams {
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  description: string;
  location?: string;
}

interface CalendarEventResult {
  eventId: string;
  htmlLink: string;
}

/**
 * Get authenticated Google Calendar client
 */
function getCalendarClient() {
  const credentials = {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google Calendar credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in environment variables.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

/**
 * Get calendar ID from environment
 */
function getCalendarId(): string {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID not configured in environment variables');
  }
  return calendarId;
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(params: CalendarEventParams): Promise<CalendarEventResult> {
  try {
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const event = {
      summary: params.title,
      description: params.description,
      location: params.location || 'https://meetings.dialpad.com/room/aicallers',
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: 'America/Chicago',
      },
      attendees: params.attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'email', minutes: 4 * 60 },  // 4 hours before
          { method: 'popup', minutes: 15 },      // 15 minutes before
        ],
      },
      conferenceData: {
        notes: 'Meeting link: https://meetings.dialpad.com/room/aicallers',
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all', // Send email invitations to all attendees
    });

    if (!response.data.id || !response.data.htmlLink) {
      throw new Error('Failed to create calendar event - missing event ID or link');
    }

    return {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw new Error(
      `Failed to create calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  params: Partial<CalendarEventParams>
): Promise<void> {
  try {
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    // First, get the existing event
    const existingEvent = await calendar.events.get({
      calendarId,
      eventId,
    });

    if (!existingEvent.data) {
      throw new Error('Event not found');
    }

    // Build update object
    const updateData: any = {};

    if (params.title) {
      updateData.summary = params.title;
    }

    if (params.description) {
      updateData.description = params.description;
    }

    if (params.location) {
      updateData.location = params.location;
    }

    if (params.startTime && params.endTime) {
      updateData.start = {
        dateTime: params.startTime.toISOString(),
        timeZone: 'America/Chicago',
      };
      updateData.end = {
        dateTime: params.endTime.toISOString(),
        timeZone: 'America/Chicago',
      };
    }

    if (params.attendees) {
      updateData.attendees = params.attendees.map(email => ({ email }));
    }

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw new Error(
      `Failed to update calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    await calendar.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all', // Notify all attendees of cancellation
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw new Error(
      `Failed to delete calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get booked time slots for availability checking
 */
export async function getBookedSlots(startDate: Date, endDate: Date): Promise<Date[]> {
  try {
    const calendar = getCalendarClient();
    const calendarId = getCalendarId();

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return events
      .filter(event => event.start?.dateTime) // Only events with specific times
      .map(event => new Date(event.start!.dateTime!));
  } catch (error) {
    console.error('Error fetching booked slots from Google Calendar:', error);
    // Return empty array on error - fallback to database-only availability
    return [];
  }
}

/**
 * Check if Google Calendar is properly configured
 */
export function isCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

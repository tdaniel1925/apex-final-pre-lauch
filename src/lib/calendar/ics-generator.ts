/**
 * ICS Calendar File Generator
 * Generates RFC 5545 compliant .ics calendar files for meeting events
 */

import type { CalendarEventData } from '@/types/meeting';

/**
 * Format a date to ICS format (YYYYMMDDTHHMMSSZ)
 * @param date - Date object to format
 * @returns ICS formatted date string
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters for ICS format
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // Backslash
    .replace(/;/g, '\\;') // Semicolon
    .replace(/,/g, '\\,') // Comma
    .replace(/\n/g, '\\n') // Newline
    .replace(/\r/g, ''); // Remove carriage return
}

/**
 * Fold long lines according to RFC 5545 (75 characters max)
 * @param line - Line to fold
 * @returns Folded line with proper line breaks
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) {
    return line;
  }

  const folded: string[] = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    folded.push(remaining.substring(0, maxLength));
    remaining = ' ' + remaining.substring(maxLength); // Add space for continuation
  }

  if (remaining.length > 0) {
    folded.push(remaining);
  }

  return folded.join('\r\n');
}

/**
 * Generate a unique ID for the calendar event
 * @returns Unique event ID
 */
function generateEventUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@theapexway.net`;
}

/**
 * Generate ICS calendar file content
 * @param eventData - Calendar event data
 * @returns ICS file content as string
 */
export function generateICS(eventData: CalendarEventData): string {
  const {
    title,
    description,
    location,
    startDate,
    endDate,
    organizerName,
    organizerEmail,
    attendeeName,
    attendeeEmail,
    url,
  } = eventData;

  const now = new Date();
  const uid = generateEventUID();

  // Build ICS lines
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apex Affinity Group//Meeting Reservations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    foldLine(`SUMMARY:${escapeICSText(title)}`),
    foldLine(`DESCRIPTION:${escapeICSText(description)}`),
    foldLine(`LOCATION:${escapeICSText(location)}`),
    `ORGANIZER;CN="${escapeICSText(organizerName)}":mailto:${organizerEmail}`,
    `ATTENDEE;CN="${escapeICSText(attendeeName)}";RSVP=TRUE:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
  ];

  // Add URL if provided
  if (url) {
    lines.push(foldLine(`URL:${url}`));
  }

  // Add reminder (15 minutes before)
  lines.push('BEGIN:VALARM');
  lines.push('ACTION:DISPLAY');
  lines.push(`DESCRIPTION:Reminder: ${escapeICSText(title)}`);
  lines.push('TRIGGER:-PT15M');
  lines.push('END:VALARM');

  // Close event and calendar
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  // Join with CRLF (required by RFC 5545)
  return lines.join('\r\n');
}

/**
 * Generate ICS file from meeting data
 * @param meeting - Meeting event data
 * @param distributor - Distributor/organizer data
 * @param attendee - Attendee/registrant data
 * @returns ICS file content
 */
export function generateMeetingICS({
  meeting,
  distributor,
  attendee,
}: {
  meeting: {
    title: string;
    description: string | null;
    event_date: string;
    event_time: string;
    event_timezone: string;
    duration_minutes: number;
    location_type: string;
    virtual_link: string | null;
    physical_address: string | null;
  };
  distributor: {
    first_name: string;
    last_name: string;
    email: string;
  };
  attendee: {
    first_name: string;
    last_name: string;
    email: string;
  };
}): string {
  // Parse event date and time
  const [year, month, day] = meeting.event_date.split('-').map(Number);
  const [hours, minutes] = meeting.event_time.split(':').map(Number);

  // Create start date (in meeting's timezone, but convert to UTC for ICS)
  // Note: This is a simplified conversion. For production, use a library like date-fns-tz
  const startDate = new Date(year, month - 1, day, hours, minutes);

  // Create end date (add duration)
  const endDate = new Date(startDate.getTime() + meeting.duration_minutes * 60 * 1000);

  // Build location string
  let location = '';
  if (meeting.location_type === 'virtual' && meeting.virtual_link) {
    location = `Virtual Meeting: ${meeting.virtual_link}`;
  } else if (meeting.location_type === 'physical' && meeting.physical_address) {
    location = meeting.physical_address;
  } else if (meeting.location_type === 'hybrid') {
    location = meeting.physical_address || '';
    if (meeting.virtual_link) {
      location += location ? ` | Virtual: ${meeting.virtual_link}` : `Virtual: ${meeting.virtual_link}`;
    }
  }

  // Build description
  let description = meeting.description || meeting.title;
  if (meeting.virtual_link && meeting.location_type !== 'physical') {
    description += `\n\nJoin virtual meeting: ${meeting.virtual_link}`;
  }
  description += `\n\nOrganized by: ${distributor.first_name} ${distributor.last_name}`;
  description += `\nContact: ${distributor.email}`;

  // Generate ICS
  return generateICS({
    title: meeting.title,
    description,
    location,
    startDate,
    endDate,
    organizerName: `${distributor.first_name} ${distributor.last_name}`,
    organizerEmail: distributor.email,
    attendeeName: `${attendee.first_name} ${attendee.last_name}`,
    attendeeEmail: attendee.email,
    url: meeting.virtual_link || undefined,
  });
}

/**
 * Get ICS file download headers
 * @param filename - Filename for download (without .ics extension)
 * @returns Headers object for NextResponse
 */
export function getICSHeaders(filename: string): Record<string, string> {
  const safeFilename = filename.replace(/[^a-z0-9-_]/gi, '-').toLowerCase();

  return {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': `attachment; filename="${safeFilename}.ics"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  };
}

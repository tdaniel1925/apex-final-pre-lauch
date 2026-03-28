/**
 * Date utility functions
 * Handles common date operations with proper timezone handling
 */

/**
 * Parse a date-only string (YYYY-MM-DD) as a local date
 *
 * Problem: new Date("2026-06-15") parses as UTC midnight, which gets
 * converted to the user's timezone, potentially shifting to the previous day.
 *
 * Solution: Parse the string manually and create a local Date object.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing the date at local midnight
 *
 * @example
 * // User in PST (UTC-7)
 * new Date("2026-06-15") // → 2026-06-14 17:00 PST (WRONG!)
 * parseLocalDate("2026-06-15") // → 2026-06-15 00:00 PST (CORRECT!)
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);

  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
}

/**
 * Format a date-only string for display
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatLocalDate("2026-06-15") // → "Sunday, June 15, 2026"
 * formatLocalDate("2026-06-15", { month: 'short', day: 'numeric', year: 'numeric' })
 * // → "Jun 15, 2026"
 */
export function formatLocalDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('en-US', options);
}

/**
 * Check if a date string is valid
 *
 * @param dateString - Date string to validate
 * @returns true if valid YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const date = parseLocalDate(dateString);
  return !isNaN(date.getTime());
}

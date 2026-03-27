// =============================================
// Date Parser Utility
// Converts natural language dates to YYYY-MM-DD format
// Handles: tomorrow, next Monday, in 3 weeks, etc.
// =============================================

/**
 * Parses natural language date strings into YYYY-MM-DD format
 * @param dateString - Natural language date like "next Monday", "tomorrow", "in 3 weeks"
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns YYYY-MM-DD formatted date string, or null if invalid
 */
export function parseNaturalDate(dateString: string, referenceDate: Date = new Date()): string | null {
  const input = dateString.toLowerCase().trim();

  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  let targetDate = new Date(today);

  // Handle "today"
  if (input === 'today') {
    return formatDate(targetDate);
  }

  // Handle "tomorrow"
  if (input === 'tomorrow') {
    targetDate.setDate(targetDate.getDate() + 1);
    return formatDate(targetDate);
  }

  // Handle "yesterday" (though usually not wanted for future events)
  if (input === 'yesterday') {
    targetDate.setDate(targetDate.getDate() - 1);
    return formatDate(targetDate);
  }

  // Handle "in X days/weeks/months"
  const inPattern = /^in (\d+) (day|days|week|weeks|month|months|year|years)$/;
  const inMatch = input.match(inPattern);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2];

    if (unit.startsWith('day')) {
      targetDate.setDate(targetDate.getDate() + amount);
    } else if (unit.startsWith('week')) {
      targetDate.setDate(targetDate.getDate() + amount * 7);
    } else if (unit.startsWith('month')) {
      targetDate.setMonth(targetDate.getMonth() + amount);
    } else if (unit.startsWith('year')) {
      targetDate.setFullYear(targetDate.getFullYear() + amount);
    }

    return formatDate(targetDate);
  }

  // Handle "next week" (next Monday)
  if (input === 'next week') {
    const daysUntilNextMonday = (8 - targetDate.getDay()) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilNextMonday);
    return formatDate(targetDate);
  }

  // Handle "next month" (first day of next month)
  if (input === 'next month') {
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(1);
    return formatDate(targetDate);
  }

  // Handle day names: "Monday", "next Monday", "this Monday"
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Check for "next [day]" or "this [day]" or just "[day]"
  const dayPattern = /^(next |this )?([a-z]+day)$/;
  const dayMatch = input.match(dayPattern);

  if (dayMatch) {
    const modifier = dayMatch[1]?.trim(); // "next" or "this" or undefined
    const dayName = dayMatch[2];
    const targetDayIndex = dayNames.indexOf(dayName);

    if (targetDayIndex !== -1) {
      const currentDayIndex = targetDate.getDay();
      let daysToAdd = 0;

      if (modifier === 'next') {
        // "next Monday" = at least 7 days from now (skip this week)
        daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7 || 7;
        if (daysToAdd <= 7) {
          daysToAdd += 7; // Force it to next week
        }
      } else if (modifier === 'this') {
        // "this Monday" = this week's Monday (could be today or in future)
        daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
      } else {
        // Just "Monday" = next occurrence (could be today if it's Monday, or next Monday)
        daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
        if (daysToAdd === 0) {
          daysToAdd = 7; // If today is Monday, "Monday" means next Monday
        }
      }

      targetDate.setDate(targetDate.getDate() + daysToAdd);
      return formatDate(targetDate);
    }
  }

  // Handle specific date formats: "March 15", "Mar 15", "3/15", "March 15th"
  // Try parsing with Date constructor
  const parsedDate = new Date(dateString);
  if (!isNaN(parsedDate.getTime())) {
    // If date parses successfully, use it
    return formatDate(parsedDate);
  }

  // Handle "X days from now"
  const daysFromNowPattern = /^(\d+) days? from now$/;
  const daysFromNowMatch = input.match(daysFromNowPattern);
  if (daysFromNowMatch) {
    const days = parseInt(daysFromNowMatch[1]);
    targetDate.setDate(targetDate.getDate() + days);
    return formatDate(targetDate);
  }

  // Handle "X weeks from now"
  const weeksFromNowPattern = /^(\d+) weeks? from now$/;
  const weeksFromNowMatch = input.match(weeksFromNowPattern);
  if (weeksFromNowMatch) {
    const weeks = parseInt(weeksFromNowMatch[1]);
    targetDate.setDate(targetDate.getDate() + weeks * 7);
    return formatDate(targetDate);
  }

  // If nothing matched, return null
  return null;
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates if a date string is in the future
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Gets a human-readable relative description of a date
 * e.g., "Tomorrow", "Next Monday", "In 5 days"
 */
export function getRelativeDateDescription(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `This ${dayNames[date.getDay()]}`;
  }
  if (diffDays >= 7 && diffDays < 14) {
    return `In ${diffDays} days`;
  }
  if (diffDays >= 14) {
    const weeks = Math.floor(diffDays / 7);
    return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  return dateString;
}

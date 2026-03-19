// =============================================
// Date Validation Utility Functions
// Age verification, date formatting
// =============================================

/**
 * Calculate age from date of birth
 * @param dob - Date of birth (Date object or ISO string)
 * @returns Age in years
 */
export function calculateAge(dob: Date | string): number {
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust age if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate if person is at least minimum age
 * @param dob - Date of birth (Date object or ISO string)
 * @param minAge - Minimum age requirement (default: 18)
 * @returns true if person is at least minAge years old
 */
export function isMinimumAge(dob: Date | string, minAge: number = 18): boolean {
  const age = calculateAge(dob);
  return age >= minAge;
}

/**
 * Validate if age is within reasonable range
 * @param dob - Date of birth (Date object or ISO string)
 * @param minAge - Minimum age (default: 18)
 * @param maxAge - Maximum age (default: 120)
 * @returns true if age is within range
 */
export function isValidAge(
  dob: Date | string,
  minAge: number = 18,
  maxAge: number = 120
): boolean {
  const age = calculateAge(dob);
  return age >= minAge && age <= maxAge;
}

/**
 * Validate date of birth for signup
 * Returns { valid: boolean, age?: number, error?: string }
 */
export function validateDateOfBirth(
  dob: Date | string | null | undefined,
  minAge: number = 18,
  maxAge: number = 120
): {
  valid: boolean;
  age?: number;
  error?: string;
} {
  // Check if date is provided
  if (!dob) {
    return {
      valid: false,
      error: 'Date of birth is required',
    };
  }

  // Parse date
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format',
    };
  }

  // Check if date is in the future
  if (birthDate > new Date()) {
    return {
      valid: false,
      error: 'Date of birth cannot be in the future',
    };
  }

  // Check if date is too far in the past (e.g., before 1900)
  const minDate = new Date('1900-01-01');
  if (birthDate < minDate) {
    return {
      valid: false,
      error: 'Date of birth must be after January 1, 1900',
    };
  }

  // Calculate age
  const age = calculateAge(birthDate);

  // Check minimum age
  if (age < minAge) {
    return {
      valid: false,
      age,
      error: `You must be at least ${minAge} years old to register`,
    };
  }

  // Check maximum age
  if (age > maxAge) {
    return {
      valid: false,
      age,
      error: `Please verify your date of birth (age cannot exceed ${maxAge} years)`,
    };
  }

  // Valid!
  return {
    valid: true,
    age,
  };
}

/**
 * Format date for display
 * @param date - Date object or ISO string
 * @param format - 'short' | 'long' | 'iso' (default: 'long')
 * @returns Formatted date string
 */
export function formatDateForDisplay(
  date: Date | string,
  format: 'short' | 'long' | 'iso' = 'long'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'iso') {
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  if (format === 'short') {
    return d.toLocaleDateString('en-US'); // M/D/YYYY
  }

  // Long format: January 1, 2000
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Get maximum date for date picker (today)
 * @returns Today's date in YYYY-MM-DD format
 */
export function getMaxDate(): string {
  return formatDateForInput(new Date());
}

/**
 * Get minimum date for date picker (18 years ago)
 * @param minAge - Minimum age requirement (default: 18)
 * @returns Date minAge years ago in YYYY-MM-DD format
 */
export function getMinDate(minAge: number = 18): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return formatDateForInput(date);
}

/**
 * Get recommended default date for date picker (30 years ago)
 * This provides a reasonable starting point for the date picker
 */
export function getDefaultDate(defaultAge: number = 30): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - defaultAge);
  return formatDateForInput(date);
}

/**
 * Check if date string is in valid format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns true if format is valid
 */
export function isValidDateFormat(dateString: string): boolean {
  // Check format: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Parse date string to Date object safely
 * @param dateString - Date string (YYYY-MM-DD or ISO format)
 * @returns Date object or null if invalid
 */
export function parseDateSafely(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return date;
}

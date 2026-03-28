// =============================================
// Phone Number Formatting Utility
// Consistent E.164 storage and display formatting
// =============================================

/**
 * Convert any US phone number to E.164 format for storage/Twilio
 * @param phone - Phone number string (any format)
 * @returns E.164 format (+1XXXXXXXXXX) or null if invalid
 * @example
 * formatPhoneToE164('555-123-4567') // '+15551234567'
 * formatPhoneToE164('(555) 123-4567') // '+15551234567'
 * formatPhoneToE164('+1 555 123 4567') // '+15551234567'
 */
export function formatPhoneToE164(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different lengths
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Already has country code: +1XXXXXXXXXX
    return `+${cleaned}`;
  } else if (cleaned.length === 10) {
    // US number without country code: +1XXXXXXXXXX
    return `+1${cleaned}`;
  }

  // Invalid format
  return null;
}

/**
 * Format phone number for display (1-xxx-xxx-xxxx)
 * @param phone - Phone number string (can be E.164 or any format)
 * @returns Formatted display string (1-xxx-xxx-xxxx) or empty if invalid
 * @example
 * formatPhoneForDisplay('+15551234567') // '1-555-123-4567'
 * formatPhoneForDisplay('5551234567') // '1-555-123-4567'
 */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different lengths
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number with country code: 1-xxx-xxx-xxxx
    return `${cleaned[0]}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // US number without country code: 1-xxx-xxx-xxxx (add 1)
    return `1-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // If format doesn't match, return original
  return phone;
}

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use formatPhoneForDisplay instead
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  return formatPhoneForDisplay(phone);
}

/**
 * Format phone as user types for input field
 * @param input - Current input value
 * @returns Formatted string with dashes added automatically
 * @example
 * formatPhoneInput('555') // '555'
 * formatPhoneInput('5551') // '555-1'
 * formatPhoneInput('5551234') // '555-123-4'
 * formatPhoneInput('5551234567') // '555-123-4567'
 */
export function formatPhoneInput(input: string): string {
  if (!input) return '';

  // Remove all non-digits
  const cleaned = input.replace(/\D/g, '');

  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);

  // Format with dashes
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Validate if phone number is valid US format
 * @param phone - Phone number to validate
 * @returns true if valid US phone number
 */
export function isValidUSPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

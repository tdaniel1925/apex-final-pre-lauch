// =============================================
// Phone Number Formatting Utility
// Format phone numbers for display
// =============================================

/**
 * Format phone number to x-xxx-xxx-xxxx format
 * @param phone - Phone number string (can include country code, dashes, spaces, etc.)
 * @returns Formatted phone string or original if invalid
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
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

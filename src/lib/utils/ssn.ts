// =============================================
// SSN Utility Functions
// Validation, formatting, masking, encryption
// =============================================

/**
 * Validate SSN format
 * Accepts: XXX-XX-XXXX or XXXXXXXXX
 */
export function validateSSN(ssn: string): boolean {
  // Remove hyphens
  const cleaned = ssn.replace(/-/g, '');

  // Must be exactly 9 digits
  if (!/^\d{9}$/.test(cleaned)) {
    return false;
  }

  // Invalid SSN patterns
  const invalid = [
    '000000000',
    '111111111',
    '222222222',
    '333333333',
    '444444444',
    '555555555',
    '666666666',
    '777777777',
    '888888888',
    '999999999',
    '123456789',
  ];

  if (invalid.includes(cleaned)) {
    return false;
  }

  // Area number (first 3 digits) cannot be 000, 666, or 900-999
  const area = parseInt(cleaned.substring(0, 3));
  if (area === 0 || area === 666 || area >= 900) {
    return false;
  }

  // Group number (middle 2 digits) cannot be 00
  const group = parseInt(cleaned.substring(3, 5));
  if (group === 0) {
    return false;
  }

  // Serial number (last 4 digits) cannot be 0000
  const serial = parseInt(cleaned.substring(5, 9));
  if (serial === 0) {
    return false;
  }

  return true;
}

/**
 * Format SSN with hyphens: XXX-XX-XXXX
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return ssn; // Return as-is if not 9 digits
  }
  return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5, 9)}`;
}

/**
 * Mask SSN for display: •••-••-1234
 */
export function maskSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return '•••-••-••••';
  }
  const last4 = cleaned.substring(5, 9);
  return `•••-••-${last4}`;
}

/**
 * Get last 4 digits of SSN
 */
export function getSSNLast4(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  return cleaned.substring(5, 9);
}

/**
 * Format SSN as user types (auto-add hyphens)
 * Input: "123456789" -> Output: "123-45-6789"
 */
export function formatSSNInput(value: string): string {
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '');

  // Limit to 9 digits
  const limited = cleaned.substring(0, 9);

  // Add hyphens as user types
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.substring(0, 3)}-${limited.substring(3)}`;
  } else {
    return `${limited.substring(0, 3)}-${limited.substring(3, 5)}-${limited.substring(5)}`;
  }
}

/**
 * Simple encryption for SSN (uses base64 + salt)
 * NOTE: For production, use proper encryption library like @supabase/supabase-js vault
 * or server-side encryption with AWS KMS, Google Cloud KMS, etc.
 */
export function encryptSSN(ssn: string, salt: string = 'APEX_SSN_SALT_2026'): string {
  const cleaned = ssn.replace(/\D/g, '');
  const salted = `${salt}:${cleaned}`;
  return Buffer.from(salted).toString('base64');
}

/**
 * Simple decryption for SSN
 * NOTE: For production, use proper encryption library
 */
export function decryptSSN(encrypted: string, salt: string = 'APEX_SSN_SALT_2026'): string {
  try {
    const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts[0] !== salt) {
      throw new Error('Invalid salt');
    }
    return formatSSN(parts[1]);
  } catch (error) {
    console.error('SSN decryption error:', error);
    return '';
  }
}

/**
 * Validate and format SSN for storage
 * Returns { valid: boolean, formatted: string, last4: string, encrypted: string, error?: string }
 */
export function prepareSSNForStorage(ssn: string): {
  valid: boolean;
  formatted: string;
  last4: string;
  encrypted: string;
  error?: string;
} {
  // Validate
  if (!validateSSN(ssn)) {
    return {
      valid: false,
      formatted: '',
      last4: '',
      encrypted: '',
      error: 'Invalid Social Security Number. Please check the format and try again.',
    };
  }

  // Format and extract
  const formatted = formatSSN(ssn);
  const last4 = getSSNLast4(ssn);
  const encrypted = encryptSSN(ssn);

  return {
    valid: true,
    formatted,
    last4,
    encrypted,
  };
}

/**
 * SSN input mask pattern for React
 * Use with react-input-mask or similar
 */
export const SSN_MASK_PATTERN = '999-99-9999';

/**
 * SSN regex for validation
 */
export const SSN_REGEX = /^\d{3}-\d{2}-\d{4}$/;

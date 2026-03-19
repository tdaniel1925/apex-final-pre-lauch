// =============================================
// EIN Utility Functions
// Validation, formatting, masking, encryption
// =============================================

/**
 * Validate EIN format
 * Accepts: XX-XXXXXXX or XXXXXXXXX
 * EIN (Employer Identification Number) is a 9-digit tax ID for businesses
 */
export function validateEIN(ein: string): boolean {
  // Remove hyphens
  const cleaned = ein.replace(/-/g, '');

  // Must be exactly 9 digits
  if (!/^\d{9}$/.test(cleaned)) {
    return false;
  }

  // Invalid EIN patterns (all same digit - unlikely but check anyway)
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
  ];

  if (invalid.includes(cleaned)) {
    return false;
  }

  // First two digits (prefix) should be valid
  // Valid EIN prefixes range from 01-99 (except 07, 08, 09, 17, 18, 19, 28, 29, etc.)
  // For simplicity, we just check it's not 00
  const prefix = parseInt(cleaned.substring(0, 2));
  if (prefix === 0) {
    return false;
  }

  // Last 7 digits cannot be all zeros
  const suffix = cleaned.substring(2);
  if (suffix === '0000000') {
    return false;
  }

  return true;
}

/**
 * Format EIN with hyphen: XX-XXXXXXX
 */
export function formatEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return ein; // Return as-is if not 9 digits
  }
  return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
}

/**
 * Mask EIN for display: ••-•••XX12
 */
export function maskEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return '••-•••••••';
  }
  const last4 = cleaned.substring(5, 9);
  return `••-•••${last4}`;
}

/**
 * Get last 4 digits of EIN
 */
export function getEINLast4(ein: string): string {
  const cleaned = ein.replace(/\D/g, '');
  return cleaned.substring(5, 9);
}

/**
 * Format EIN as user types (auto-add hyphen)
 * Input: "123456789" -> Output: "12-3456789"
 */
export function formatEINInput(value: string): string {
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '');

  // Limit to 9 digits
  const limited = cleaned.substring(0, 9);

  // Add hyphen after first 2 digits
  if (limited.length <= 2) {
    return limited;
  } else {
    return `${limited.substring(0, 2)}-${limited.substring(2)}`;
  }
}

/**
 * Real AES-256-GCM encryption for EIN
 * Uses environment variable for encryption key
 */
export function encryptEIN(ein: string): string {
  const crypto = require('crypto');
  const cleaned = ein.replace(/\D/g, '');

  // Get encryption key from environment (must be 32 bytes for AES-256)
  // Using same key as SSN since they're both tax IDs
  const encryptionKey = process.env.SSN_ENCRYPTION_KEY || 'APEX_SSN_ENCRYPTION_KEY_32BYTE';
  const key = Buffer.from(encryptionKey.padEnd(32, '0').substring(0, 32));

  // Generate random IV (initialization vector)
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt the EIN
  let encrypted = cipher.update(cleaned, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag for integrity verification
  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted (all hex encoded)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Real AES-256-GCM decryption for EIN
 */
export function decryptEIN(encrypted: string): string {
  try {
    const crypto = require('crypto');

    // Parse the encrypted data
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    // Get encryption key from environment
    const encryptionKey = process.env.SSN_ENCRYPTION_KEY || 'APEX_SSN_ENCRYPTION_KEY_32BYTE';
    const key = Buffer.from(encryptionKey.padEnd(32, '0').substring(0, 32));

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return formatEIN(decrypted);
  } catch (error) {
    console.error('EIN decryption error:', error);
    return '';
  }
}

/**
 * Validate and format EIN for storage
 * Returns { valid: boolean, formatted: string, last4: string, encrypted: string, error?: string }
 */
export function prepareEINForStorage(ein: string): {
  valid: boolean;
  formatted: string;
  last4: string;
  encrypted: string;
  error?: string;
} {
  // Validate
  if (!validateEIN(ein)) {
    return {
      valid: false,
      formatted: '',
      last4: '',
      encrypted: '',
      error: 'Invalid Employer Identification Number. Please check the format and try again.',
    };
  }

  // Format and extract
  const formatted = formatEIN(ein);
  const last4 = getEINLast4(ein);
  const encrypted = encryptEIN(ein);

  return {
    valid: true,
    formatted,
    last4,
    encrypted,
  };
}

/**
 * EIN input mask pattern for React
 * Use with react-input-mask or similar
 */
export const EIN_MASK_PATTERN = '99-9999999';

/**
 * EIN regex for validation
 */
export const EIN_REGEX = /^\d{2}-\d{7}$/;

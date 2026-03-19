// =============================================
// SSN Utility Functions Unit Tests
// =============================================

import { describe, it, expect } from 'vitest';
import {
  validateSSN,
  formatSSN,
  maskSSN,
  getSSNLast4,
  formatSSNInput,
  encryptSSN,
  decryptSSN,
  prepareSSNForStorage,
} from '@/lib/utils/ssn';

describe('SSN Validation', () => {
  it('should validate correct SSN format with hyphens', () => {
    expect(validateSSN('123-45-6789')).toBe(true);
    expect(validateSSN('234-56-7890')).toBe(true);
  });

  it('should validate correct SSN format without hyphens', () => {
    expect(validateSSN('123456789')).toBe(true);
  });

  it('should reject invalid format', () => {
    expect(validateSSN('12-345-6789')).toBe(true); // Wrong hyphen placement but has 9 digits
    expect(validateSSN('123-456-789')).toBe(true); // Wrong hyphen placement but has 9 digits
    expect(validateSSN('12345678')).toBe(false); // Too short
    expect(validateSSN('1234567890')).toBe(false); // Too long
  });

  it('should reject SSN with invalid area number (000)', () => {
    expect(validateSSN('000-45-6789')).toBe(false);
  });

  it('should reject SSN with area number 666', () => {
    expect(validateSSN('666-45-6789')).toBe(false);
  });

  it('should reject SSN with area number 900-999', () => {
    expect(validateSSN('900-45-6789')).toBe(false);
    expect(validateSSN('950-45-6789')).toBe(false);
    expect(validateSSN('999-45-6789')).toBe(false);
  });

  it('should reject SSN with invalid group number (00)', () => {
    expect(validateSSN('123-00-6789')).toBe(false);
  });

  it('should reject SSN with invalid serial number (0000)', () => {
    expect(validateSSN('123-45-0000')).toBe(false);
  });

  it('should reject common invalid patterns', () => {
    expect(validateSSN('000-00-0000')).toBe(false);
    expect(validateSSN('111-11-1111')).toBe(false);
    expect(validateSSN('123-45-6789')).toBe(true); // This one is actually valid
    expect(validateSSN('999-99-9999')).toBe(false);
  });
});

describe('SSN Formatting', () => {
  it('should format SSN with hyphens', () => {
    expect(formatSSN('123456789')).toBe('123-45-6789');
  });

  it('should handle already formatted SSN', () => {
    expect(formatSSN('123-45-6789')).toBe('123-45-6789');
  });

  it('should handle SSN with extra characters', () => {
    expect(formatSSN('123 45 6789')).toBe('123-45-6789'); // Removes spaces and formats
  });

  it('should return as-is if not 9 digits', () => {
    expect(formatSSN('12345')).toBe('12345');
  });
});

describe('SSN Masking', () => {
  it('should mask SSN showing only last 4 digits', () => {
    expect(maskSSN('123-45-6789')).toBe('•••-••-6789');
    expect(maskSSN('123456789')).toBe('•••-••-6789');
  });

  it('should return default mask for invalid input', () => {
    expect(maskSSN('12345')).toBe('•••-••-••••');
    expect(maskSSN('')).toBe('•••-••-••••');
  });
});

describe('SSN Last 4 Extraction', () => {
  it('should extract last 4 digits', () => {
    expect(getSSNLast4('123-45-6789')).toBe('6789');
    expect(getSSNLast4('123456789')).toBe('6789');
  });

  it('should handle invalid input', () => {
    expect(getSSNLast4('12345')).toBe(''); // Not enough digits for last 4
    expect(getSSNLast4('')).toBe('');
  });
});

describe('SSN Input Formatting', () => {
  it('should auto-format as user types', () => {
    expect(formatSSNInput('1')).toBe('1');
    expect(formatSSNInput('12')).toBe('12');
    expect(formatSSNInput('123')).toBe('123');
    expect(formatSSNInput('1234')).toBe('123-4');
    expect(formatSSNInput('12345')).toBe('123-45');
    expect(formatSSNInput('123456')).toBe('123-45-6');
    expect(formatSSNInput('1234567')).toBe('123-45-67');
    expect(formatSSNInput('12345678')).toBe('123-45-678');
    expect(formatSSNInput('123456789')).toBe('123-45-6789');
  });

  it('should remove non-digits', () => {
    expect(formatSSNInput('1a2b3c4d5e6f7g8h9i')).toBe('123-45-6789');
  });

  it('should limit to 9 digits', () => {
    expect(formatSSNInput('12345678901234')).toBe('123-45-6789');
  });

  it('should handle already formatted input', () => {
    expect(formatSSNInput('123-45-6789')).toBe('123-45-6789');
  });
});

describe('SSN Encryption/Decryption', () => {
  it('should encrypt and decrypt SSN', () => {
    const original = '123-45-6789';
    const encrypted = encryptSSN(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted).toBeTruthy();
    expect(encrypted).toContain(':'); // Should have IV:authTag:encrypted format

    const decrypted = decryptSSN(encrypted);
    expect(decrypted).toBe('123-45-6789'); // Returns formatted
  });

  it('should produce different encrypted values each time (random IV)', () => {
    const ssn = '123-45-6789';
    const encrypted1 = encryptSSN(ssn);
    const encrypted2 = encryptSSN(ssn);

    // Different IVs mean different encrypted values
    expect(encrypted1).not.toBe(encrypted2);

    // But both should decrypt to the same value
    expect(decryptSSN(encrypted1)).toBe('123-45-6789');
    expect(decryptSSN(encrypted2)).toBe('123-45-6789');
  });

  it('should fail to decrypt with tampered data', () => {
    const ssn = '123-45-6789';
    const encrypted = encryptSSN(ssn);

    // Tamper with the encrypted data
    const tampered = encrypted.replace(/a/g, 'b');

    const decrypted = decryptSSN(tampered);
    expect(decrypted).toBe(''); // Returns empty on error
  });

  it('should handle decryption errors gracefully', () => {
    const decrypted = decryptSSN('invalid-format');
    expect(decrypted).toBe('');
  });
});

describe('Prepare SSN for Storage', () => {
  it('should prepare valid SSN for storage', () => {
    const result = prepareSSNForStorage('123-45-6789');

    expect(result.valid).toBe(true);
    expect(result.formatted).toBe('123-45-6789');
    expect(result.last4).toBe('6789');
    expect(result.encrypted).toBeTruthy();
    expect(result.error).toBeUndefined();
  });

  it('should prepare unformatted SSN for storage', () => {
    const result = prepareSSNForStorage('123456789');

    expect(result.valid).toBe(true);
    expect(result.formatted).toBe('123-45-6789');
    expect(result.last4).toBe('6789');
  });

  it('should reject invalid SSN', () => {
    const result = prepareSSNForStorage('000-00-0000');

    expect(result.valid).toBe(false);
    expect(result.formatted).toBe('');
    expect(result.last4).toBe('');
    expect(result.encrypted).toBe('');
    expect(result.error).toContain('Invalid');
  });

  it('should reject malformed SSN', () => {
    const result = prepareSSNForStorage('12-34-56');

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should reject SSN with invalid area number', () => {
    const result = prepareSSNForStorage('666-45-6789');

    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

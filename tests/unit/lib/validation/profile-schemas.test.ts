import { describe, it, expect } from 'vitest';
import {
  personalInfoSchema,
  addressSchema,
  bankingInfoSchema,
  taxInfoSchema,
  emailChangeRequestSchema,
  emailVerificationSchema,
  bankingChange2FASchema,
  extractLast4,
  maskSensitiveData,
  formatPhoneNumber,
  calculateChangeSeverity,
  getPlatformsForSync,
  validateRoutingNumber,
} from '@/lib/validation/profile-schemas';

describe('Profile Validation Schemas', () => {
  describe('personalInfoSchema', () => {
    it('should validate valid personal info', () => {
      const validData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '(555) 123-4567',
        date_of_birth: '1990-01-15',
        company_name: 'Acme Corp',
      };

      const result = personalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject first name that is too short', () => {
      const invalidData = {
        first_name: 'J', // Too short (< 2 chars)
        last_name: 'Doe',
        email: 'john@example.com',
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject first name with invalid characters', () => {
      const invalidData = {
        first_name: 'John123', // Contains numbers
        last_name: 'Doe',
        email: 'john@example.com',
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'can only contain letters'
        );
      }
    });

    it('should accept first name with hyphens and apostrophes', () => {
      const validData = {
        first_name: "Mary-Jane O'Brien",
        last_name: 'Smith',
        email: 'mary@example.com',
      };

      const result = personalInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'not-an-email',
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject invalid phone format', () => {
      const invalidData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '12345', // Invalid format
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid US phone number');
      }
    });

    it('should accept various valid phone formats', () => {
      const validFormats = [
        '(555) 123-4567',
        '555-123-4567',
        '5551234567',
        '1 (555) 123-4567', // Format with country code
      ];

      validFormats.forEach((phone) => {
        const data = {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone,
        };
        const result = personalInfoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject date of birth for underage (<18)', () => {
      const today = new Date();
      const recentDate = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate()
      );

      const invalidData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_birth: recentDate.toISOString().split('T')[0],
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('18 and 120 years old');
      }
    });

    it('should reject date of birth that is too old (>120)', () => {
      const today = new Date();
      const ancientDate = new Date(
        today.getFullYear() - 125,
        today.getMonth(),
        today.getDate()
      );

      const invalidData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_birth: ancientDate.toISOString().split('T')[0],
      };

      const result = personalInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('18 and 120 years old');
      }
    });
  });

  describe('addressSchema', () => {
    it('should validate valid address', () => {
      const validData = {
        address_line1: '123 Main Street',
        address_line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      };

      const result = addressSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid ZIP code formats', () => {
      const validZips = ['12345', '12345-6789'];

      validZips.forEach((zip) => {
        const data = {
          address_line1: '123 Main St',
          city: 'Test City',
          state: 'CA',
          zip,
        };
        const result = addressSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid ZIP code formats', () => {
      const invalidZips = ['1234', '123456', 'ABCDE', '12345-678'];

      invalidZips.forEach((zip) => {
        const data = {
          address_line1: '123 Main St',
          city: 'Test City',
          state: 'CA',
          zip,
        };
        const result = addressSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should reject invalid state codes', () => {
      const invalidData = {
        address_line1: '123 Main St',
        city: 'Test City',
        state: 'ZZ', // Invalid state
        zip: '12345',
      };

      const result = addressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod enum error message can be "Invalid input" or "Invalid US state code"
        expect(result.error.issues[0].message).toBeTruthy();
        expect(result.error.issues[0].path).toContain('state');
      }
    });

    it('should accept all 50 US states', () => {
      const states = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      ];

      states.forEach((state) => {
        const data = {
          address_line1: '123 Main St',
          city: 'Test City',
          state,
          zip: '12345',
        };
        const result = addressSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('bankingInfoSchema', () => {
    it('should validate valid banking info', () => {
      const validData = {
        bank_name: 'Chase Bank',
        bank_account_type: 'checking' as const,
        bank_routing_number: '021000021', // Valid Chase routing number
        bank_account_number: '1234567890',
        account_holder_name: 'John Doe',
      };

      const result = bankingInfoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid routing number (wrong length)', () => {
      const invalidData = {
        bank_name: 'Test Bank',
        bank_account_type: 'checking' as const,
        bank_routing_number: '12345678', // Only 8 digits
        bank_account_number: '1234567890',
        account_holder_name: 'John Doe',
      };

      const result = bankingInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exactly 9 digits');
      }
    });

    it('should reject invalid routing number (failed checksum)', () => {
      const invalidData = {
        bank_name: 'Test Bank',
        bank_account_type: 'checking' as const,
        bank_routing_number: '123456789', // Invalid checksum
        bank_account_number: '1234567890',
        account_holder_name: 'John Doe',
      };

      const result = bankingInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('failed checksum');
      }
    });

    it('should accept valid routing numbers', () => {
      // Real routing numbers with valid checksums
      const validRoutingNumbers = [
        '021000021', // Chase
        '011401533', // Wells Fargo
        '026009593', // Bank of America
      ];

      validRoutingNumbers.forEach((routing) => {
        const data = {
          bank_name: 'Test Bank',
          bank_account_type: 'checking' as const,
          bank_routing_number: routing,
          bank_account_number: '1234567890',
          account_holder_name: 'John Doe',
        };
        const result = bankingInfoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject account number outside valid range', () => {
      const tooShort = {
        bank_name: 'Test Bank',
        bank_account_type: 'checking' as const,
        bank_routing_number: '021000021',
        bank_account_number: '123', // Too short
        account_holder_name: 'John Doe',
      };

      const tooLong = {
        bank_name: 'Test Bank',
        bank_account_type: 'checking' as const,
        bank_routing_number: '021000021',
        bank_account_number: '123456789012345678', // Too long (>17)
        account_holder_name: 'John Doe',
      };

      expect(bankingInfoSchema.safeParse(tooShort).success).toBe(false);
      expect(bankingInfoSchema.safeParse(tooLong).success).toBe(false);
    });
  });

  describe('emailChangeRequestSchema', () => {
    it('should validate valid email change request', () => {
      const validData = {
        new_email: 'newemail@example.com',
        current_password: 'SecurePass123!',
      };

      const result = emailChangeRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short passwords', () => {
      const invalidData = {
        new_email: 'newemail@example.com',
        current_password: 'short', // Less than 8 chars
      };

      const result = emailChangeRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });
  });

  describe('emailVerificationSchema', () => {
    it('should validate valid verification token', () => {
      const validToken = 'a'.repeat(64); // 64 hex characters
      const result = emailVerificationSchema.safeParse({ token: validToken });
      expect(result.success).toBe(true);
    });

    it('should reject tokens of wrong length', () => {
      const shortToken = 'a'.repeat(32);
      const result = emailVerificationSchema.safeParse({ token: shortToken });
      expect(result.success).toBe(false);
    });

    it('should reject tokens with invalid characters', () => {
      const invalidToken = 'z'.repeat(64); // 'z' is not valid hex
      const result = emailVerificationSchema.safeParse({ token: invalidToken });
      expect(result.success).toBe(false);
    });
  });

  describe('bankingChange2FASchema', () => {
    it('should validate valid 2FA banking change', () => {
      const validData = {
        bank_name: 'Test Bank',
        bank_account_type: 'savings' as const,
        bank_routing_number: '021000021',
        bank_account_number: '9876543210',
        account_holder_name: 'Jane Doe',
        two_factor_code: '123456',
        change_reason: 'Switching to a new bank account for better interest rates.',
      };

      const result = bankingChange2FASchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid 2FA code length', () => {
      const invalidData = {
        bank_name: 'Test Bank',
        two_factor_code: '12345', // Only 5 digits
        change_reason: 'Valid reason for changing bank info.',
      };

      const result = bankingChange2FASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 digits');
      }
    });

    it('should reject 2FA code with non-numeric characters', () => {
      const invalidData = {
        bank_name: 'Test Bank',
        two_factor_code: '12345a', // Contains letter
        change_reason: 'Valid reason for changing bank info.',
      };

      const result = bankingChange2FASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('numeric');
      }
    });

    it('should reject short change reason', () => {
      const invalidData = {
        bank_name: 'Test Bank',
        bank_routing_number: '021000021',
        bank_account_number: '1234567890',
        account_holder_name: 'John Doe',
        two_factor_code: '123456',
        change_reason: 'Too short', // Less than 10 chars
      };

      const result = bankingChange2FASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 characters');
      }
    });
  });
});

describe('Helper Functions', () => {
  describe('extractLast4', () => {
    it('should extract last 4 digits from string', () => {
      expect(extractLast4('1234567890')).toBe('7890');
      expect(extractLast4('123-45-6789')).toBe('6789');
      expect(extractLast4('(555) 123-4567')).toBe('4567');
    });

    it('should handle short strings', () => {
      expect(extractLast4('123')).toBe('123');
      expect(extractLast4('')).toBe('');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data showing only last 4 digits', () => {
      expect(maskSensitiveData('1234567890')).toBe('••••••7890');
      expect(maskSensitiveData('123-45-6789')).toBe('•••••6789');
    });

    it('should handle custom visible digits', () => {
      expect(maskSensitiveData('1234567890', 2)).toBe('••••••••90');
    });

    it('should handle short strings', () => {
      expect(maskSensitiveData('123', 4)).toBe('123');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('should handle phone numbers with formatting', () => {
      expect(formatPhoneNumber('555-123-4567')).toBe('(555) 123-4567');
      expect(formatPhoneNumber('(555) 123-4567')).toBe('(555) 123-4567');
    });

    it('should return original for invalid lengths', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('')).toBe('');
    });
  });

  describe('calculateChangeSeverity', () => {
    it('should return critical for email changes', () => {
      expect(calculateChangeSeverity('email', 'old@example.com', 'new@example.com')).toBe(
        'critical'
      );
    });

    it('should return critical for banking changes', () => {
      expect(calculateChangeSeverity('banking', '123456789', '987654321')).toBe(
        'critical'
      );
    });

    it('should return high for tax info changes', () => {
      expect(calculateChangeSeverity('tax_info', '123-45-6789', '987-65-4321')).toBe(
        'high'
      );
    });

    it('should return medium for address changes', () => {
      expect(calculateChangeSeverity('address', '123 Old St', '456 New St')).toBe(
        'medium'
      );
    });

    it('should return low for other changes', () => {
      expect(calculateChangeSeverity('phone', '5551234567', '5559876543')).toBe('low');
    });
  });

  describe('getPlatformsForSync', () => {
    it('should return jordyn and agentpulse for email changes', () => {
      const platforms = getPlatformsForSync('email', false);
      expect(platforms).toContain('jordyn');
      expect(platforms).toContain('agentpulse');
      expect(platforms).not.toContain('winflex');
    });

    it('should return jordyn and agentpulse for name changes', () => {
      const platforms = getPlatformsForSync('name', false);
      expect(platforms).toContain('jordyn');
      expect(platforms).toContain('agentpulse');
    });

    it('should include winflex for licensed agents', () => {
      const platforms = getPlatformsForSync('email', true);
      expect(platforms).toContain('jordyn');
      expect(platforms).toContain('agentpulse');
      expect(platforms).toContain('winflex');
    });

    it('should include winflex for address changes when licensed', () => {
      const platforms = getPlatformsForSync('address', true);
      expect(platforms).toContain('winflex');
    });

    it('should not include winflex for non-licensed agents', () => {
      const platforms = getPlatformsForSync('address', false);
      expect(platforms).not.toContain('winflex');
    });
  });

  describe('validateRoutingNumber', () => {
    it('should validate correct routing numbers', () => {
      expect(validateRoutingNumber('021000021')).toBe(true); // Chase
      expect(validateRoutingNumber('011401533')).toBe(true); // Wells Fargo
      expect(validateRoutingNumber('026009593')).toBe(true); // Bank of America
    });

    it('should reject invalid routing numbers', () => {
      expect(validateRoutingNumber('123456789')).toBe(false); // Invalid checksum
      expect(validateRoutingNumber('12345678')).toBe(false); // Wrong length
      expect(validateRoutingNumber('')).toBe(false); // Empty
    });
  });
});

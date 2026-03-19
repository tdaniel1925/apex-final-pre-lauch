/**
 * Unit Tests for Signup Validation Schemas
 * Tests personal and business registration validation
 */

import { describe, it, expect } from 'vitest';
import { signupSchema, US_STATES } from './signup';

describe('Signup Validation Schemas', () => {
  // ========================================
  // PERSONAL REGISTRATION TESTS
  // ========================================

  describe('Personal Registration', () => {
    const basePersonalData = {
      registration_type: 'personal' as const,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123',
      slug: 'john-doe',
      phone: '5551234567',
      address_line1: '123 Main St',
      address_line2: '',
      city: 'Houston',
      state: 'TX' as const,
      zip: '77001',
      licensing_status: 'non_licensed' as const,
      date_of_birth: '1990-01-01',
      ssn: '123-45-6789',
      company_name: '',
    };

    it('should accept valid personal registration', () => {
      const result = signupSchema.safeParse(basePersonalData);
      expect(result.success).toBe(true);
    });

    it('should require date_of_birth for personal registration', () => {
      const data = { ...basePersonalData, date_of_birth: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should require SSN for personal registration', () => {
      const data = { ...basePersonalData, ssn: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should validate SSN format (XXX-XX-XXXX)', () => {
      const invalidSSN = { ...basePersonalData, ssn: '123456789' };
      const result = signupSchema.safeParse(invalidSSN);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('format');
      }
    });

    it('should validate age is 18+', () => {
      const today = new Date();
      const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const data = {
        ...basePersonalData,
        date_of_birth: under18.toISOString().split('T')[0],
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('18');
      }
    });

    it('should reject future date of birth', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const data = {
        ...basePersonalData,
        date_of_birth: future.toISOString().split('T')[0],
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('future');
      }
    });

    it('should allow optional company_name for personal', () => {
      const data = { ...basePersonalData, company_name: 'My LLC' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  // ========================================
  // BUSINESS REGISTRATION TESTS
  // ========================================

  describe('Business Registration', () => {
    const baseBusinessData = {
      registration_type: 'business' as const,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@businessagency.com',
      password: 'SecurePass456',
      slug: 'jane-smith-agency',
      phone: '8005551234',
      address_line1: '456 Business Blvd',
      address_line2: 'Suite 200',
      city: 'Dallas',
      state: 'TX' as const,
      zip: '75201',
      licensing_status: 'licensed' as const,
      company_name: 'Smith Insurance Agency LLC',
      business_type: 'llc' as const,
      ein: '12-3456789',
      dba_name: '',
      business_website: '',
    };

    it('should accept valid business registration', () => {
      const result = signupSchema.safeParse(baseBusinessData);
      expect(result.success).toBe(true);
    });

    it('should require company_name for business registration', () => {
      const data = { ...baseBusinessData, company_name: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should require business_type for business registration', () => {
      const data = { ...baseBusinessData, business_type: '' as any };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require EIN for business registration', () => {
      const data = { ...baseBusinessData, ein: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should validate EIN format (XX-XXXXXXX)', () => {
      const invalidEIN = { ...baseBusinessData, ein: '123456789' };
      const result = signupSchema.safeParse(invalidEIN);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('format');
      }
    });

    it('should accept valid business types', () => {
      const types: Array<'llc' | 'corporation' | 's_corporation' | 'partnership' | 'sole_proprietor'> = [
        'llc',
        'corporation',
        's_corporation',
        'partnership',
        'sole_proprietor',
      ];

      types.forEach((type) => {
        const data = { ...baseBusinessData, business_type: type };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should accept optional dba_name', () => {
      const data = { ...baseBusinessData, dba_name: 'Smith Agency' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept optional business_website with valid URL', () => {
      const data = { ...baseBusinessData, business_website: 'https://www.smithagency.com' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid business_website URL', () => {
      const data = { ...baseBusinessData, business_website: 'not-a-url' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('URL');
      }
    });
  });

  // ========================================
  // COMMON FIELD TESTS (Both Types)
  // ========================================

  describe('Common Fields (Personal and Business)', () => {
    const baseData = {
      registration_type: 'personal' as const,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'Password123',
      slug: 'test-user',
      phone: '5551234567',
      address_line1: '123 Test St',
      city: 'Austin',
      state: 'TX' as const,
      zip: '78701',
      licensing_status: 'non_licensed' as const,
      date_of_birth: '1990-01-01',
      ssn: '123-45-6789',
    };

    it('should require first_name', () => {
      const data = { ...baseData, first_name: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require last_name', () => {
      const data = { ...baseData, last_name: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
      const data = { ...baseData, email: 'not-an-email' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('should require password with minimum complexity', () => {
      const weakPasswords = ['short', '12345678', 'alllowercase', 'ALLUPPERCASE', 'NoNumbers'];

      weakPasswords.forEach((password) => {
        const data = { ...baseData, password };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should validate slug format (lowercase, alphanumeric, hyphens)', () => {
      const invalidSlugs = ['UPPERCASE', 'has spaces', 'has_underscores', 'special!chars'];

      invalidSlugs.forEach((slug) => {
        const data = { ...baseData, slug };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should require phone number', () => {
      const data = { ...baseData, phone: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require address_line1', () => {
      const data = { ...baseData, address_line1: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require city', () => {
      const data = { ...baseData, city: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require valid US state', () => {
      const data = { ...baseData, state: 'XX' as any };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept all valid US states', () => {
      US_STATES.forEach((state) => {
        const data = { ...baseData, state };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should validate ZIP code format', () => {
      const invalidZips = ['1234', '123456', 'ABCDE', '12345-'];

      invalidZips.forEach((zip) => {
        const data = { ...baseData, zip };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it('should accept 5-digit ZIP code', () => {
      const data = { ...baseData, zip: '12345' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept ZIP+4 format', () => {
      const data = { ...baseData, zip: '12345-6789' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

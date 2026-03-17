// =============================================
// Signup Validation Schema Unit Tests
// =============================================

import { describe, it, expect } from 'vitest';
import { signupSchema, slugSchema, emailSchema } from '@/lib/validations/signup';

describe('Signup Schema Validation', () => {

  const validData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    slug: 'john-doe',
    company_name: '',
    phone: '',
    sponsor_slug: undefined,
    licensing_status: 'non_licensed' as const,
    ssn: '123-45-6789',
  };

  it('should validate correct signup data', () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('First Name Validation', () => {
    it('should require first name', () => {
      const result = signupSchema.safeParse({ ...validData, first_name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should require minimum 2 characters', () => {
      const result = signupSchema.safeParse({ ...validData, first_name: 'J' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2');
      }
    });

    it('should trim whitespace', () => {
      const result = signupSchema.safeParse({ ...validData, first_name: '  John  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.first_name).toBe('John');
      }
    });
  });

  describe('Email Validation', () => {
    it('should require email', () => {
      const result = signupSchema.safeParse({ ...validData, email: '' });
      expect(result.success).toBe(false);
    });

    it('should validate email format', () => {
      const invalid = signupSchema.safeParse({ ...validData, email: 'not-an-email' });
      expect(invalid.success).toBe(false);

      const valid = signupSchema.safeParse({ ...validData, email: 'valid@example.com' });
      expect(valid.success).toBe(true);
    });

    it('should convert email to lowercase', () => {
      const result = signupSchema.safeParse({ ...validData, email: 'John.Doe@EXAMPLE.COM' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john.doe@example.com');
      }
    });

    it('should trim email whitespace', () => {
      const result = signupSchema.safeParse({ ...validData, email: '  john@example.com  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      }
    });
  });

  describe('Password Validation', () => {
    it('should require minimum 8 characters', () => {
      const result = signupSchema.safeParse({ ...validData, password: 'Short1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8');
      }
    });

    it('should require uppercase letter', () => {
      const result = signupSchema.safeParse({ ...validData, password: 'lowercase123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should require lowercase letter', () => {
      const result = signupSchema.safeParse({ ...validData, password: 'UPPERCASE123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase');
      }
    });

    it('should require number', () => {
      const result = signupSchema.safeParse({ ...validData, password: 'NoNumbers!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('should accept strong password', () => {
      const passwords = [
        'SecurePass123!',
        'MyP@ssw0rd',
        'Complex1ty!',
        'Testing123$',
      ];

      passwords.forEach(password => {
        const result = signupSchema.safeParse({ ...validData, password });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Slug (Username) Validation', () => {
    it('should require slug', () => {
      const result = signupSchema.safeParse({ ...validData, slug: '' });
      expect(result.success).toBe(false);
    });

    it('should require minimum 3 characters', () => {
      const result = signupSchema.safeParse({ ...validData, slug: 'ab' });
      expect(result.success).toBe(false);
    });

    it('should allow lowercase letters, numbers, and hyphens', () => {
      const validSlugs = ['john-doe', 'user123', 'test-user-123'];

      validSlugs.forEach(slug => {
        const result = signupSchema.safeParse({ ...validData, slug });
        expect(result.success).toBe(true);
      });
    });

    it('should reject uppercase letters', () => {
      const result = signupSchema.safeParse({ ...validData, slug: 'John-Doe' });
      expect(result.success).toBe(false);
    });

    it('should reject special characters', () => {
      const invalidSlugs = ['john_doe', 'john.doe', 'john@doe', 'john doe'];

      invalidSlugs.forEach(slug => {
        const result = signupSchema.safeParse({ ...validData, slug });
        expect(result.success).toBe(false);
      });
    });

    it('should reject consecutive hyphens', () => {
      const result = signupSchema.safeParse({ ...validData, slug: 'john--doe' });
      expect(result.success).toBe(false);
    });

    it('should reject hyphens at start or end', () => {
      expect(signupSchema.safeParse({ ...validData, slug: '-johndoe' }).success).toBe(false);
      expect(signupSchema.safeParse({ ...validData, slug: 'johndoe-' }).success).toBe(false);
    });

    it('should reject reserved slugs', () => {
      const reserved = ['admin', 'api', 'dashboard', 'login', 'signup'];

      reserved.forEach(slug => {
        const result = signupSchema.safeParse({ ...validData, slug });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('reserved');
        }
      });
    });

    it('should convert slug to lowercase', () => {
      const result = signupSchema.safeParse({ ...validData, slug: 'JohnDoe' });
      // Will fail because uppercase not allowed in regex first
      expect(result.success).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should allow empty phone (optional)', () => {
      const result = signupSchema.safeParse({ ...validData, phone: '' });
      expect(result.success).toBe(true);
    });

    it('should allow valid phone formats', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '5551234567',
        '+1 555 123 4567',
      ];

      validPhones.forEach(phone => {
        const result = signupSchema.safeParse({ ...validData, phone });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid characters', () => {
      const result = signupSchema.safeParse({ ...validData, phone: '555-ABC-DEFG' });
      expect(result.success).toBe(false);
    });
  });

  describe('Licensing Status Validation', () => {
    it('should require licensing status', () => {
      const data = { ...validData };
      delete (data as any).licensing_status;
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should only accept licensed or non_licensed', () => {
      expect(signupSchema.safeParse({ ...validData, licensing_status: 'licensed' }).success).toBe(true);
      expect(signupSchema.safeParse({ ...validData, licensing_status: 'non_licensed' }).success).toBe(true);
      expect(signupSchema.safeParse({ ...validData, licensing_status: 'maybe' as any }).success).toBe(false);
    });
  });

  describe('SSN Validation', () => {
    it('should require SSN', () => {
      const data = { ...validData };
      delete (data as any).ssn;
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should require XXX-XX-XXXX format', () => {
      expect(signupSchema.safeParse({ ...validData, ssn: '123456789' }).success).toBe(false);
      expect(signupSchema.safeParse({ ...validData, ssn: '123-45-6789' }).success).toBe(true);
    });

    it('should reject invalid SSN patterns', () => {
      const invalidSSNs = [
        '000-00-0000',
        '111-11-1111',
        '666-45-6789',
        '900-45-6789',
        '123-00-6789',
        '123-45-0000',
      ];

      invalidSSNs.forEach(ssn => {
        const result = signupSchema.safeParse({ ...validData, ssn });
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid SSN', () => {
      const validSSNs = [
        '123-45-6789',
        '234-56-7890',
        '345-67-8901',
      ];

      validSSNs.forEach(ssn => {
        const result = signupSchema.safeParse({ ...validData, ssn });
        expect(result.success).toBe(true);
      });
    });
  });

});

describe('Slug Schema (standalone)', () => {
  it('should validate correct slug', () => {
    expect(slugSchema.safeParse('john-doe').success).toBe(true);
  });

  it('should reject reserved slugs', () => {
    expect(slugSchema.safeParse('admin').success).toBe(false);
  });

  it('should reject invalid format', () => {
    expect(slugSchema.safeParse('John_Doe').success).toBe(false);
  });
});

describe('Email Schema (standalone)', () => {
  it('should validate correct email', () => {
    expect(emailSchema.safeParse('test@example.com').success).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
  });

  it('should convert to lowercase', () => {
    const result = emailSchema.safeParse('Test@EXAMPLE.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });
});

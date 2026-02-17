import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildTemplateVariables,
  replaceTemplateVariables,
  renderEmailTemplate,
  getAvailableVariables,
} from '@/lib/email/template-variables';
import type { Distributor } from '@/lib/types';

describe('Email Template Variable System', () => {
  let mockDistributor: Distributor;

  beforeEach(() => {
    mockDistributor = {
      id: 'test-id-123',
      auth_user_id: 'auth-id-123',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com',
      slug: 'john-smith',
      company_name: 'Acme Insurance',
      phone: '555-1234',
      licensing_status: 'licensed',
      licensing_status_set_at: '2024-01-15T10:00:00Z',
      licensing_verified: true,
      licensing_verified_at: '2024-01-16T12:00:00Z',
      licensing_verified_by: 'admin-id',
      sponsor_id: null,
      matrix_parent_id: null,
      matrix_position: null,
      matrix_depth: 0,
      is_master: false,
      profile_complete: true,
      status: 'active',
      address_line1: null,
      address_line2: null,
      city: null,
      state: null,
      zip: null,
      suspension_reason: null,
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:00:00Z',
    };

    // Set base URL for testing
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.com';
  });

  describe('buildTemplateVariables', () => {
    it('should build variables object from distributor', () => {
      const variables = buildTemplateVariables(mockDistributor);

      expect(variables.first_name).toBe('John');
      expect(variables.last_name).toBe('Smith');
      expect(variables.email).toBe('john.smith@example.com');
      expect(variables.company_name).toBe('Acme Insurance');
    });

    it('should format licensing status for display', () => {
      const variables = buildTemplateVariables(mockDistributor);
      expect(variables.licensing_status).toBe('Licensed Agent');

      const nonLicensed = { ...mockDistributor, licensing_status: 'non_licensed' as const };
      const nonLicensedVars = buildTemplateVariables(nonLicensed);
      expect(nonLicensedVars.licensing_status).toBe('Non-Licensed Distributor');
    });

    it('should generate correct URLs', () => {
      const variables = buildTemplateVariables(mockDistributor);

      expect(variables.dashboard_link).toBe('https://test.com/dashboard');
      expect(variables.profile_link).toBe('https://test.com/dashboard/profile');
      expect(variables.referral_link).toBe('https://test.com/signup?ref=john-smith');
      expect(variables.team_link).toBe('https://test.com/dashboard/team');
    });

    it('should calculate days since signup', () => {
      const variables = buildTemplateVariables(mockDistributor);
      expect(variables.days_since_signup).toBeDefined();
      expect(parseInt(variables.days_since_signup!)).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing company name', () => {
      const dist = { ...mockDistributor, company_name: null };
      const variables = buildTemplateVariables(dist);
      expect(variables.company_name).toBe('');
    });

    it('should generate licensing status badge HTML', () => {
      const variables = buildTemplateVariables(mockDistributor);
      expect(variables.licensing_status_badge).toContain('<span');
      expect(variables.licensing_status_badge).toContain('Licensed Agent');
      expect(variables.licensing_status_badge).toContain('style=');
    });
  });

  describe('replaceTemplateVariables', () => {
    it('should replace single variable', () => {
      const text = 'Hello {first_name}!';
      const variables = { first_name: 'John' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('Hello John!');
    });

    it('should replace multiple variables', () => {
      const text = 'Hi {first_name} {last_name}, your email is {email}';
      const variables = {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
      };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('Hi John Smith, your email is john@example.com');
    });

    it('should handle variables appearing multiple times', () => {
      const text = '{first_name} is great! {first_name} should know that {first_name} is awesome!';
      const variables = { first_name: 'John' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('John is great! John should know that John is awesome!');
    });

    it('should handle missing variables gracefully', () => {
      const text = 'Hello {first_name}!';
      const variables = {};
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('Hello !');
    });

    it('should not replace non-variable curly braces', () => {
      const text = 'This is {not a variable} but {first_name} is';
      const variables = { first_name: 'John' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('This is {not a variable} but John is');
    });

    it('should handle HTML content with variables', () => {
      const text = '<h2>Hi {first_name},</h2><p>Welcome to {company_name}!</p>';
      const variables = { first_name: 'John', company_name: 'Apex' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('<h2>Hi John,</h2><p>Welcome to Apex!</p>');
    });

    it('should handle URLs with variables', () => {
      const text = '<a href="{dashboard_link}">Go to Dashboard</a>';
      const variables = { dashboard_link: 'https://test.com/dashboard' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('<a href="https://test.com/dashboard">Go to Dashboard</a>');
    });
  });

  describe('renderEmailTemplate', () => {
    it('should render both subject and body', () => {
      const template = {
        subject: 'Welcome {first_name}!',
        body: '<h2>Hi {first_name},</h2><p>Your email: {email}</p>',
      };

      const result = renderEmailTemplate(template, mockDistributor);

      expect(result.subject).toBe('Welcome John!');
      expect(result.body).toContain('Hi John,');
      expect(result.body).toContain('john.smith@example.com');
    });

    it('should render complete welcome email template', () => {
      const template = {
        subject: 'Welcome to Apex, {first_name}!',
        body: `
          <div>
            <h2>Welcome {first_name} {last_name}!</h2>
            <p>Your licensing status: {licensing_status}</p>
            <a href="{dashboard_link}">Go to Dashboard</a>
            <a href="{referral_link}">Share your referral link</a>
          </div>
        `,
      };

      const result = renderEmailTemplate(template, mockDistributor);

      expect(result.subject).toBe('Welcome to Apex, John!');
      expect(result.body).toContain('Welcome John Smith!');
      expect(result.body).toContain('Licensed Agent');
      expect(result.body).toContain('https://test.com/dashboard');
      expect(result.body).toContain('signup?ref=john-smith');
    });

    it('should handle empty company name', () => {
      const dist = { ...mockDistributor, company_name: null };
      const template = {
        subject: 'Hello',
        body: 'Company: {company_name}',
      };

      const result = renderEmailTemplate(template, dist);
      expect(result.body).toBe('Company: ');
    });
  });

  describe('getAvailableVariables', () => {
    it('should return array of available variables', () => {
      const variables = getAvailableVariables();

      expect(Array.isArray(variables)).toBe(true);
      expect(variables.length).toBeGreaterThan(0);
    });

    it('should include required variables', () => {
      const variables = getAvailableVariables();
      const keys = variables.map(v => v.key);

      const requiredKeys = [
        'first_name',
        'last_name',
        'email',
        'dashboard_link',
        'referral_link',
        'licensing_status',
      ];

      requiredKeys.forEach(key => {
        expect(keys).toContain(key);
      });
    });

    it('should have description for each variable', () => {
      const variables = getAvailableVariables();

      variables.forEach(variable => {
        expect(variable.key).toBeDefined();
        expect(variable.description).toBeDefined();
        expect(variable.example).toBeDefined();
        expect(variable.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Variable Edge Cases', () => {
    it('should handle special characters in variable values', () => {
      const text = 'Email: {email}';
      const variables = { email: 'test+special@example.com' };
      const result = replaceTemplateVariables(text, variables);
      expect(result).toBe('Email: test+special@example.com');
    });

    it('should handle unicode characters', () => {
      const dist = { ...mockDistributor, first_name: 'José', last_name: 'García' };
      const template = {
        subject: 'Hola {first_name}!',
        body: 'Bienvenido {first_name} {last_name}',
      };

      const result = renderEmailTemplate(template, dist);
      expect(result.subject).toBe('Hola José!');
      expect(result.body).toBe('Bienvenido José García');
    });

    it('should handle very long variable values', () => {
      const longName = 'A'.repeat(1000);
      const dist = { ...mockDistributor, first_name: longName };
      const template = {
        subject: '{first_name}',
        body: '{first_name}',
      };

      const result = renderEmailTemplate(template, dist);
      expect(result.subject).toBe(longName);
      expect(result.body).toBe(longName);
    });
  });
});

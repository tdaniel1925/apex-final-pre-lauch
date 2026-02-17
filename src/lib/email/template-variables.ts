// =============================================
// Email Template Variable Replacement
// Replace {variable_name} with actual values
// =============================================

import type { Distributor } from '@/lib/types';

interface TemplateVariables {
  first_name?: string;
  last_name?: string;
  email?: string;
  company_name?: string;
  licensing_status?: string;
  licensing_status_badge?: string;
  dashboard_link?: string;
  profile_link?: string;
  referral_link?: string;
  team_link?: string;
  matrix_link?: string;
  sponsor_name?: string;
  sponsor_email?: string;
  signup_date?: string;
  days_since_signup?: string;
  unsubscribe_link?: string;
}

/**
 * Get base URL for links
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

/**
 * Build variables object from distributor data
 */
export function buildTemplateVariables(distributor: Distributor): TemplateVariables {
  const baseUrl = getBaseUrl();

  // Calculate days since signup
  const signupDate = new Date(distributor.created_at);
  const today = new Date();
  const daysSinceSignup = Math.floor(
    (today.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Format licensing status for display
  const licensingStatusDisplay =
    distributor.licensing_status === 'licensed' ? 'Licensed Agent' : 'Non-Licensed Distributor';

  return {
    first_name: distributor.first_name,
    last_name: distributor.last_name,
    email: distributor.email,
    company_name: distributor.company_name || '',
    licensing_status: licensingStatusDisplay,
    licensing_status_badge: `<span style="background: ${
      distributor.licensing_status === 'licensed' ? '#DBEAFE' : '#F3F4F6'
    }; color: ${
      distributor.licensing_status === 'licensed' ? '#1E40AF' : '#374151'
    }; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${licensingStatusDisplay}</span>`,
    dashboard_link: `${baseUrl}/dashboard`,
    profile_link: `${baseUrl}/dashboard/profile`,
    referral_link: `${baseUrl}/signup?ref=${distributor.slug}`,
    team_link: `${baseUrl}/dashboard/team`,
    matrix_link: `${baseUrl}/dashboard/matrix`,
    sponsor_name: '', // Will be populated if sponsor info is passed
    sponsor_email: '',
    signup_date: signupDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    days_since_signup: daysSinceSignup.toString(),
    unsubscribe_link: `${baseUrl}/api/email/unsubscribe?id=${distributor.id}`, // Future endpoint
  };
}

/**
 * Replace all {variable} placeholders in text with actual values
 */
export function replaceTemplateVariables(text: string, variables: TemplateVariables): string {
  let result = text;

  // Replace each variable
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value || '');
  });

  return result;
}

/**
 * Render email template with distributor data
 */
export function renderEmailTemplate(template: { subject: string; body: string }, distributor: Distributor): {
  subject: string;
  body: string;
} {
  const variables = buildTemplateVariables(distributor);

  return {
    subject: replaceTemplateVariables(template.subject, variables),
    body: replaceTemplateVariables(template.body, variables),
  };
}

/**
 * Get list of all available variables with descriptions
 */
export function getAvailableVariables(): Array<{ key: string; description: string; example: string }> {
  return [
    { key: 'first_name', description: "Distributor's first name", example: 'John' },
    { key: 'last_name', description: "Distributor's last name", example: 'Smith' },
    { key: 'email', description: "Distributor's email", example: 'john@example.com' },
    { key: 'company_name', description: 'Company name', example: 'Acme Insurance' },
    {
      key: 'licensing_status',
      description: 'Licensing status text',
      example: 'Licensed Agent',
    },
    {
      key: 'licensing_status_badge',
      description: 'Visual badge (HTML)',
      example: '<span style="...">Licensed Agent</span>',
    },
    {
      key: 'dashboard_link',
      description: 'Link to dashboard',
      example: 'https://app.apexaffinity.com/dashboard',
    },
    {
      key: 'profile_link',
      description: 'Link to profile',
      example: 'https://app.apexaffinity.com/dashboard/profile',
    },
    {
      key: 'referral_link',
      description: 'Unique referral URL',
      example: 'https://app.apexaffinity.com/signup?ref=john-smith',
    },
    {
      key: 'team_link',
      description: 'Link to team page',
      example: 'https://app.apexaffinity.com/dashboard/team',
    },
    {
      key: 'matrix_link',
      description: 'Link to matrix view',
      example: 'https://app.apexaffinity.com/dashboard/matrix',
    },
    { key: 'sponsor_name', description: "Sponsor's name", example: 'Jane Doe' },
    { key: 'sponsor_email', description: "Sponsor's email", example: 'jane@example.com' },
    { key: 'signup_date', description: 'Signup date', example: 'January 15, 2024' },
    { key: 'days_since_signup', description: 'Days since signup', example: '7' },
    {
      key: 'unsubscribe_link',
      description: 'Unsubscribe link',
      example: 'https://app.apexaffinity.com/api/email/unsubscribe',
    },
  ];
}

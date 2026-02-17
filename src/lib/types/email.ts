// =============================================
// Email Nurture Campaign Types
// =============================================

export type LicensingStatusForEmail = 'licensed' | 'non_licensed' | 'all';

export type EmailSendStatus = 'pending' | 'sent' | 'failed' | 'bounced' | 'opened' | 'clicked';

/**
 * Email Template
 * Stores the template content and configuration
 */
export interface EmailTemplate {
  id: string;
  template_key: string;
  template_name: string;
  description: string | null;

  // Content
  subject: string;
  body: string; // HTML
  preview_text: string | null;

  // Targeting
  licensing_status: LicensingStatusForEmail;
  sequence_order: number;
  delay_days: number;

  // Variables
  variables_used: string[];

  // Status
  is_active: boolean;

  // AI metadata
  ai_generated: boolean;
  ai_prompt: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * Email Campaign
 * Tracks a distributor's progress through the email sequence
 */
export interface EmailCampaign {
  id: string;
  distributor_id: string;
  licensing_status: LicensingStatusForEmail;
  current_step: number;

  // Status
  is_active: boolean;
  completed_at: string | null;
  paused_at: string | null;

  // Timestamps
  started_at: string;
  last_email_sent_at: string | null;
  next_email_scheduled_for: string | null;

  // Stats
  total_emails_sent: number;
}

/**
 * Email Send
 * Log of each email sent
 */
export interface EmailSend {
  id: string;
  distributor_id: string;
  template_id: string | null;
  campaign_id: string;

  // Email details
  email_address: string;
  subject: string;
  body: string; // Rendered HTML with variables replaced

  // Sequence
  sequence_step: number;

  // Status
  status: EmailSendStatus;
  sent_at: string | null;
  failed_reason: string | null;

  // External tracking
  external_id: string | null;

  // Engagement
  opened_at: string | null;
  clicked_at: string | null;

  // Timestamps
  created_at: string;
}

/**
 * Available variables for email templates
 */
export const EMAIL_VARIABLES = {
  // Distributor info
  first_name: 'Distributor\'s first name',
  last_name: 'Distributor\'s last name',
  email: 'Distributor\'s email address',
  company_name: 'Company name (if provided)',

  // Status
  licensing_status: 'Licensing status (Licensed Agent or Non-Licensed Distributor)',
  licensing_status_badge: 'Visual badge showing licensing status',

  // Links
  dashboard_link: 'Link to user dashboard',
  profile_link: 'Link to user profile',
  referral_link: 'User\'s unique referral link',
  team_link: 'Link to team page',
  matrix_link: 'Link to matrix view',

  // Sponsor info
  sponsor_name: 'Sponsor\'s full name (if applicable)',
  sponsor_email: 'Sponsor\'s email (if applicable)',

  // Dates
  signup_date: 'Date user signed up',
  days_since_signup: 'Number of days since signup',

  // Custom
  unsubscribe_link: 'Link to unsubscribe from emails',
} as const;

export type EmailVariableKey = keyof typeof EMAIL_VARIABLES;

/**
 * AI Email Generation Request
 */
export interface AIEmailGenerationRequest {
  prompt: string;
  licensing_status: LicensingStatusForEmail;
  sequence_order?: number;
  context?: string; // Additional context about the email
}

/**
 * AI Email Generation Response
 */
export interface AIEmailGenerationResponse {
  subject: string;
  body: string;
  preview_text?: string;
  variables_used: string[];
  reasoning?: string; // Why AI made certain choices
}

/**
 * Email Template Create/Update
 */
export interface EmailTemplateFormData {
  template_name: string;
  description?: string;
  subject: string;
  body: string;
  preview_text?: string;
  licensing_status: LicensingStatusForEmail;
  sequence_order: number;
  delay_days: number;
  variables_used: string[];
  is_active: boolean;
  ai_generated?: boolean;
  ai_prompt?: string;
}

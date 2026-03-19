// =============================================
// Shared Test Helpers for Autopilot E2E Tests
// =============================================

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@apextest.local`;
}

/**
 * Generate unique slug
 */
export function generateTestSlug(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate test SSN
 */
export function generateTestSSN(): string {
  const area = Math.floor(Math.random() * 699) + 100;
  const group = Math.floor(Math.random() * 99) + 1;
  const serial = Math.floor(Math.random() * 9999) + 1;
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

/**
 * Create test distributor with all required fields
 */
export async function createTestDistributor(params: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  slug?: string;
  sponsorId?: string | null;
}) {
  const testEmail = params.email || generateTestEmail();
  const testPassword = params.password || 'TestPass123!';
  const firstName = params.firstName || 'Test';
  const lastName = params.lastName || 'User';
  const slug = params.slug || generateTestSlug();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create test auth user: ${authError?.message}`);
  }

  const authUserId = authData.user.id;

  // Generate affiliate code (8 character random)
  const affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  // Create distributor with all required fields
  const { data: distributor, error: distError} = await supabase
    .from('distributors')
    .insert({
      auth_user_id: authUserId,
      first_name: firstName,
      last_name: lastName,
      email: testEmail,
      slug: slug,
      phone: '5551234567', // Required field
      affiliate_code: affiliateCode, // Required field
      sponsor_id: params.sponsorId || null,
    })
    .select()
    .single();

  if (distError || !distributor) {
    throw new Error(`Failed to create test distributor: ${distError?.message}`);
  }

  return {
    distributorId: distributor.id,
    authUserId: authUserId,
    email: testEmail,
    password: testPassword,
    slug: slug,
  };
}

/**
 * Create autopilot subscription for a distributor
 */
export async function createAutopilotSubscription(
  distributorId: string,
  tier: 'free' | 'social_connector' | 'lead_autopilot_pro' | 'team_edition' = 'free'
) {
  const { error } = await supabase.from('autopilot_subscriptions').insert({
    distributor_id: distributorId,
    tier: tier,
    status: 'active',
  });

  if (error) {
    throw new Error(`Failed to create autopilot subscription: ${error.message}`);
  }
}

/**
 * Clean up test data for a distributor
 */
export async function cleanupTestDistributor(distributorId: string, authUserId: string) {
  if (distributorId) {
    // Delete all related autopilot data
    await supabase.from('meeting_invitations').delete().eq('distributor_id', distributorId);
    await supabase.from('social_posts').delete().eq('distributor_id', distributorId);
    await supabase.from('event_flyers').delete().eq('distributor_id', distributorId);
    await supabase.from('crm_contacts').delete().eq('distributor_id', distributorId);
    await supabase.from('crm_pipeline').delete().eq('distributor_id', distributorId);
    await supabase.from('crm_tasks').delete().eq('distributor_id', distributorId);
    await supabase.from('sms_campaigns').delete().eq('distributor_id', distributorId);
    await supabase.from('sms_messages').delete().eq('distributor_id', distributorId);
    await supabase.from('team_broadcasts').delete().eq('distributor_id', distributorId);
    await supabase.from('training_shares').delete().eq('shared_by_distributor_id', distributorId);
    await supabase.from('training_shares').delete().eq('shared_with_distributor_id', distributorId);
    await supabase.from('autopilot_usage_limits').delete().eq('distributor_id', distributorId);
    await supabase.from('autopilot_subscriptions').delete().eq('distributor_id', distributorId);
    await supabase.from('distributors').delete().eq('id', distributorId);
  }

  if (authUserId) {
    await supabase.auth.admin.deleteUser(authUserId);
  }
}

/**
 * Login to the application
 */
export async function loginToApp(page: any, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Wait for element with timeout
 */
export async function waitForElement(page: any, selector: string, timeout: number = 5000) {
  await page.waitForSelector(selector, { timeout });
}

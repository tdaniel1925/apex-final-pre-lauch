/**
 * E2E Test Helpers
 *
 * Centralized utilities for E2E tests to reduce code duplication
 * and maintain consistency across test files.
 */

import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// =============================================
// Configuration
// =============================================

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3050';

// Test credentials (for tests that need pre-configured users)
export const TEST_CREDENTIALS = {
  admin: {
    email: 'test-admin@example.com',
    password: 'TestAdmin123!',
  },
  distributor: {
    email: 'test-distributor@example.com',
    password: 'TestDist123!',
  },
};

// =============================================
// Supabase Client
// =============================================

/**
 * Create Supabase service client for test data manipulation
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials in .env.test. Run: npm run setup:test'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// =============================================
// Test Data Generators
// =============================================

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}@example.com`;
}

/**
 * Generate random valid SSN for testing
 */
export function generateTestSSN(): string {
  const area = Math.floor(Math.random() * 699) + 100; // 100-799 (avoid 666, 900+)
  const group = Math.floor(Math.random() * 99) + 1; // 01-99
  const serial = Math.floor(Math.random() * 9999) + 1; // 0001-9999
  return `${area.toString().padStart(3, '0')}-${group
    .toString()
    .padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

/**
 * Generate unique slug for testing
 */
export function generateTestSlug(prefix = 'test'): string {
  return `${prefix}-${Date.now()}`;
}

// =============================================
// Authentication Helpers
// =============================================

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_CREDENTIALS.admin.email);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.admin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 });
}

/**
 * Login as distributor user
 */
export async function loginAsDistributor(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', TEST_CREDENTIALS.distributor.email);
  await page.fill('input[name="password"]', TEST_CREDENTIALS.distributor.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Login with custom credentials
 */
export async function loginAsUser(
  page: Page,
  email: string,
  password: string
) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard|\/admin/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Try to find and click logout button (implementation may vary)
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
  if (await logoutButton.count() > 0) {
    await logoutButton.first().click();
    await page.waitForURL(/\/login/, { timeout: 5000 });
  }
}

// =============================================
// Database Cleanup Helpers
// =============================================

/**
 * Delete distributor by email (including auth user and member records)
 */
export async function deleteDistributorByEmail(email: string) {
  const supabase = createTestClient();

  // Get distributor with auth_user_id
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, auth_user_id')
    .eq('email', email)
    .single();

  if (!distributor) {
    return; // Already deleted or doesn't exist
  }

  // Delete auth user (cascades to related records)
  if (distributor.auth_user_id) {
    await supabase.auth.admin.deleteUser(distributor.auth_user_id);
  }

  // Delete distributor record (member table has ON DELETE CASCADE)
  await supabase.from('distributors').delete().eq('id', distributor.id);
}

/**
 * Delete all test data created during test run
 * WARNING: Only use in test environment!
 */
export async function cleanupTestData() {
  const supabase = createTestClient();

  // Delete all test distributors (email starts with 'test-')
  const { data: testDistributors } = await supabase
    .from('distributors')
    .select('id, auth_user_id')
    .like('email', 'test-%');

  if (testDistributors) {
    for (const dist of testDistributors) {
      if (dist.auth_user_id) {
        await supabase.auth.admin.deleteUser(dist.auth_user_id);
      }
      await supabase.from('distributors').delete().eq('id', dist.id);
    }
  }
}

// =============================================
// API Request Helpers
// =============================================

/**
 * Make authenticated API request using page context cookies
 */
export async function makeAuthenticatedRequest(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: any
) {
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  const options: any = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
  };

  if (data) {
    options.data = data;
  }

  const response = await page.context().request[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](
    `${BASE_URL}${path}`,
    options
  );

  return response;
}

// =============================================
// Assertion Helpers
// =============================================

/**
 * Wait for toast notification with specific message
 */
export async function waitForToast(page: Page, messagePattern: string | RegExp, timeout = 5000) {
  await expect(
    page.locator('[role="alert"], .toast, .notification').filter({ hasText: messagePattern })
  ).toBeVisible({ timeout });
}

/**
 * Wait for API response and verify status
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus = 200
) {
  const response = await page.waitForResponse(
    resp => {
      const matches = typeof urlPattern === 'string'
        ? resp.url().includes(urlPattern)
        : urlPattern.test(resp.url());
      return matches && resp.status() === expectedStatus;
    },
    { timeout: 10000 }
  );
  return response;
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

// =============================================
// Navigation Helpers
// =============================================

/**
 * Navigate to admin page (verifies admin access)
 */
export async function navigateToAdmin(page: Page, path = '') {
  await page.goto(`${BASE_URL}/admin${path}`);
  // Verify we didn't get redirected to login
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Navigate to dashboard page
 */
export async function navigateToDashboard(page: Page, path = '') {
  await page.goto(`${BASE_URL}/dashboard${path}`);
  // Verify we didn't get redirected to login
  await expect(page).not.toHaveURL(/\/login/);
}

// =============================================
// Wait Helpers
// =============================================

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingComplete(page: Page, timeout = 10000) {
  await page.waitForSelector('.loading, .spinner, [aria-busy="true"]', {
    state: 'hidden',
    timeout,
  }).catch(() => {
    // Spinner might not exist, that's ok
  });
}

/**
 * Wait for page to be fully hydrated (Next.js)
 */
export async function waitForHydration(page: Page) {
  await page.waitForLoadState('networkidle');
}

// =============================================
// Form Helpers
// =============================================

/**
 * Fill form and submit
 */
export async function fillAndSubmitForm(
  page: Page,
  formData: Record<string, string>,
  submitButtonSelector = 'button[type="submit"]'
) {
  for (const [field, value] of Object.entries(formData)) {
    await page.fill(`[name="${field}"], #${field}`, value);
  }
  await page.click(submitButtonSelector);
}

/**
 * Check for validation error message
 */
export async function expectValidationError(
  page: Page,
  fieldName: string,
  errorPattern: string | RegExp
) {
  const errorSelector = `[data-error-for="${fieldName}"], .error-${fieldName}, [id="${fieldName}-error"]`;
  await expect(page.locator(errorSelector).filter({ hasText: errorPattern })).toBeVisible();
}

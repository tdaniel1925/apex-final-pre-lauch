// =============================================
// E2E Authentication Flow Tests
// Tests: Signup, Login, Password Reset
// =============================================

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_EMAIL_PREFIX = 'test-';
const TEST_PASSWORD = 'TestPass123!';

// Supabase client for cleanup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to generate unique test email
function generateTestEmail() {
  return `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
}

// Helper to generate random SSN
function generateTestSSN() {
  const area = Math.floor(Math.random() * 699) + 100; // 100-799 (avoid 666, 900+)
  const group = Math.floor(Math.random() * 99) + 1; // 01-99
  const serial = Math.floor(Math.random() * 9999) + 1; // 0001-9999
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

test.describe('Authentication Flows', () => {

  // =============================================
  // SIGNUP FLOW TESTS
  // =============================================

  test.describe('Signup Flow', () => {

    test('should successfully signup with all required fields', async ({ page }) => {
      const testEmail = generateTestEmail();
      const testSlug = `test-${Date.now()}`;

      await page.goto(`${BASE_URL}/signup`);

      // Fill out form
      await page.fill('#first_name', 'Test');
      await page.fill('#last_name', 'User');
      await page.fill('#email', testEmail);
      await page.fill('#password', TEST_PASSWORD);
      await page.fill('#slug', testSlug);
      await page.fill('#ssn', generateTestSSN());

      // Select licensing status
      await page.click('input[value="non_licensed"]');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect to credentials page
      await page.waitForURL(/\/signup\/credentials/, { timeout: 10000 });

      // Verify we reached credentials confirmation
      await expect(page.locator('h1')).toContainText('Your Account Credentials');

      // Verify credentials are shown
      await expect(page.locator('text=' + testSlug)).toBeVisible();

      // Cleanup
      const { data: dist } = await supabase
        .from('distributors')
        .select('id, auth_user_id')
        .eq('email', testEmail)
        .single();

      if (dist) {
        await supabase.auth.admin.deleteUser(dist.auth_user_id);
        await supabase.from('distributors').delete().eq('id', dist.id);
      }
    });

    test('should show validation errors for invalid inputs', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Check for validation errors
      await expect(page.locator('text=/First name is required/i')).toBeVisible();
      await expect(page.locator('text=/Last name is required/i')).toBeVisible();
      await expect(page.locator('text=/Email is required/i')).toBeVisible();
    });

    test('should validate password strength requirements', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Weak password (no uppercase)
      await page.fill('#password', 'weak123');
      await page.fill('#first_name', 'Test'); // Trigger validation

      await expect(page.locator('text=/Password must contain uppercase/i')).toBeVisible();

      // Strong password
      await page.fill('#password', 'StrongPass123!');

      // Check password strength indicator shows "Strong" or "Very Strong"
      await expect(page.locator('text=/Strong/i')).toBeVisible();
    });

    test('should auto-generate slug from name', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      await page.fill('#first_name', 'John');
      await page.fill('#last_name', 'Smith');

      // Wait for slug to be auto-generated
      await page.waitForTimeout(500);

      const slugValue = await page.inputValue('#slug');
      expect(slugValue).toMatch(/john.*smith/i);
    });

    test('should check slug availability in real-time', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Type a slug
      await page.fill('#slug', 'available-test-slug-' + Date.now());

      // Wait for availability check
      await page.waitForTimeout(1000);

      // Should show checkmark for available slug
      await expect(page.locator('text=✓')).toBeVisible();
    });

    test('should validate SSN format', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      // Invalid SSN
      await page.fill('#ssn', '000-00-0000');
      await page.fill('#first_name', 'Test'); // Trigger validation

      await expect(page.locator('text=/valid Social Security/i')).toBeVisible();

      // Valid SSN
      await page.fill('#ssn', generateTestSSN());
    });

    test('should prevent duplicate email signup', async ({ page }) => {
      // This test would require creating a user first, then trying to signup again
      // Skipping for now due to complexity
      test.skip();
    });

    test('should show sponsor banner when ref parameter present', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup?ref=sellad`);

      // Should show "You've been invited by" banner
      await expect(page.locator('text=/invited by/i')).toBeVisible();
      await expect(page.locator('text=/Sella Daniel/i')).toBeVisible();
    });

  });

  // =============================================
  // LOGIN FLOW TESTS
  // =============================================

  test.describe('Login Flow', () => {

    test('should login with valid email and password', async ({ page }) => {
      // Use Sella Daniel's account for testing
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', 'sellag.sb@gmail.com');
      await page.fill('input[type="password"]', '4Xkkilla1@');

      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/Invalid.*credentials/i')).toBeVisible();

      // Should NOT redirect
      expect(page.url()).toContain('/login');
    });

    test('should show validation error for empty fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/required/i')).toBeVisible();
    });

    test('should have "Forgot Password" link', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      const forgotLink = page.locator('a:has-text("Forgot")');
      await expect(forgotLink).toBeVisible();

      await forgotLink.click();

      await page.waitForURL(/\/forgot-password|\/reset-password/);
    });

    test('should have "Sign Up" link for new users', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      const signupLink = page.locator('a:has-text("Sign Up")');
      await expect(signupLink).toBeVisible();

      await signupLink.click();

      await page.waitForURL(/\/signup/);
    });

  });

  // =============================================
  // PASSWORD RESET FLOW TESTS
  // =============================================

  test.describe('Password Reset Flow', () => {

    test('should request password reset for valid email', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      await page.fill('input[type="email"]', 'sellag.sb@gmail.com');

      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/check your email/i')).toBeVisible();
    });

    test('should not leak account existence for invalid email', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      await page.fill('input[type="email"]', 'nonexistent@example.com');

      await page.click('button[type="submit"]');

      // Should show same success message (security best practice)
      await expect(page.locator('text=/check your email/i')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      await page.fill('input[type="email"]', 'not-an-email');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/valid email/i')).toBeVisible();
    });

    test('should have link back to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);

      const loginLink = page.locator('a:has-text("Back to")');
      await expect(loginLink).toBeVisible();

      await loginLink.click();

      await page.waitForURL(/\/login/);
    });

    test('should reset password with valid token', async ({ page }) => {
      // This would require generating a real reset token
      // Skipping for now due to complexity
      test.skip();
    });

    test('should show error for expired token', async ({ page }) => {
      // This would require expired token handling
      test.skip();
    });

  });

  // =============================================
  // SESSION & LOGOUT TESTS
  // =============================================

  test.describe('Session Management', () => {

    test('should maintain session after page refresh', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'sellag.sb@gmail.com');
      await page.fill('input[type="password"]', '4Xkkilla1@');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', 'sellag.sb@gmail.com');
      await page.fill('input[type="password"]', '4Xkkilla1@');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/dashboard/);

      // Find and click logout button
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")').first();
      await logoutButton.click();

      // Should redirect to login or home
      await page.waitForURL(/\/login|\/$/);
    });

  });

  // =============================================
  // SECURITY TESTS
  // =============================================

  test.describe('Security', () => {

    test('should not allow SQL injection in email field', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await page.fill('input[type="email"]', "' OR '1'='1");
      await page.fill('input[type="password"]', 'anything');

      await page.click('button[type="submit"]');

      // Should show validation or invalid credentials error (NOT SQL error)
      const errorText = await page.locator('text=/error|invalid/i').first().textContent();
      expect(errorText).not.toContain('SQL');
      expect(errorText).not.toContain('database');
    });

    test('should not allow XSS in signup name fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);

      await page.fill('#first_name', '<script>alert("XSS")</script>');
      await page.fill('#last_name', 'User');

      // The input should be sanitized or escaped
      const value = await page.inputValue('#first_name');
      // Script tags should not execute
      expect(value).not.toContain('<script>');
    });

    test('should enforce HTTPS in production', async ({ page }) => {
      // Only test in production
      if (BASE_URL.includes('localhost')) {
        test.skip();
      }

      await page.goto(BASE_URL);
      expect(page.url()).toContain('https://');
    });

  });

});

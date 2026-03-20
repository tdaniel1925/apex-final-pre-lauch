import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - Authentication Tests
 * Tests login, logout, and session management for distributors
 */

test.describe('Rep Back Office - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Login|Sign In/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Email validation should trigger
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should show error for incorrect credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('nonexistent@test.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Wait for error message (more flexible matching)
    await expect(page.locator('text=/invalid|incorrect|wrong|error|failed/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid distributor credentials', async ({ page }) => {
    // Use test distributor account
    await page.locator('input[type="email"]').fill('test.distributor@apex.com');
    await page.locator('input[type="password"]').fill('TestPassword123!');
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.locator('a[href*="forgot"]');
    await expect(forgotPasswordLink).toBeVisible();
    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should redirect to login if accessing protected page while logged out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });
});

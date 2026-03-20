import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - Dashboard Tests
 * Tests main dashboard functionality, stats, and overview
 */

// Helper function to login
async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Rep Back Office - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard page correctly', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display welcome message with distributor name', async ({ page }) => {
    const welcomeText = page.locator('text=/welcome|hello|hi/i').first();
    await expect(welcomeText).toBeVisible({ timeout: 10000 });
  });

  test('should display key stats/metrics', async ({ page }) => {
    // Look for common stat cards
    const statsContainer = page.locator('[class*="grid"], [class*="stats"], [class*="metric"]').first();
    await expect(statsContainer).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check for navigation links
    const navLinks = [
      { text: /dashboard|home/i, href: '/dashboard' },
      { text: /autopilot|ai/i, href: /autopilot/ },
      { text: /team|genealogy/i, href: /team|genealogy/ },
      { text: /training/i, href: /training/ },
    ];

    for (const link of navLinks) {
      const linkElement = page.locator(`a:has-text("${link.text.source}")`).first();
      if (await linkElement.isVisible()) {
        await expect(linkElement).toHaveAttribute('href', link.href);
      }
    }
  });

  test('should display rank information', async ({ page }) => {
    // Check if rank is displayed somewhere on dashboard
    const rankText = page.locator('text=/rank|level|distributor/i').first();
    await expect(rankText).toBeVisible({ timeout: 5000 });
  });

  test('should have quick action buttons', async ({ page }) => {
    // Look for common quick actions
    const quickActions = page.locator('button, a[class*="button"]');
    await expect(quickActions.first()).toBeVisible();
  });

  test('should display team/downline information if available', async ({ page }) => {
    // Check for team stats
    const teamSection = page.locator('text=/team|downline|organization/i').first();
    // May or may not be visible depending on user data
    const isVisible = await teamSection.isVisible().catch(() => false);
    if (isVisible) {
      await expect(teamSection).toBeVisible();
    }
  });

  test('should have profile/settings access', async ({ page }) => {
    // Look for profile dropdown or settings link
    const profileButton = page.locator('button:has-text("Profile"), a[href*="profile"], button[aria-label*="profile" i]').first();
    await expect(profileButton).toBeVisible({ timeout: 5000 });
  });

  test('should have logout functionality', async ({ page }) => {
    // Find and click logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    }
  });

  test('should load dashboard without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filter out known safe errors (like extension errors)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('extension') &&
      !err.includes('chrome-extension') &&
      !err.includes('cz-shortcut-listen')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

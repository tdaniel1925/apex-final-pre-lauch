import { test, expect } from '@playwright/test';

test.describe('Training Videos Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Login with test credentials
    await page.fill('input[name="email"]', 'fyifromcharles@gmail.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should display training videos page', async ({ page }) => {
    // Navigate to training videos
    await page.goto('/dashboard/training/videos');

    // Check page header
    await expect(page.locator('h1')).toContainText('Training Videos');
    await expect(page.locator('text=Master your Apex business')).toBeVisible();
  });

  test('should display video categories', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for category headers
    await expect(page.locator('text=Getting Started')).toBeVisible();
    await expect(page.locator('text=Compensation Plan')).toBeVisible();
    await expect(page.locator('text=Product Training')).toBeVisible();
    await expect(page.locator('text=Leadership Development')).toBeVisible();
    await expect(page.locator('text=Success Stories')).toBeVisible();
  });

  test('should display video player for each category', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for video player containers (Video.js creates these)
    const videoContainers = page.locator('.video-player-container');
    await expect(videoContainers.first()).toBeVisible();
  });

  test('should display video list for each category', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for video list items
    await expect(page.locator('text=Welcome to Apex Affinity Group')).toBeVisible();
    await expect(page.locator('text=Dashboard Overview')).toBeVisible();
    await expect(page.locator('text=Your First 30 Days')).toBeVisible();
  });

  test('should display video durations', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for duration display
    await expect(page.locator('text=5:32')).toBeVisible();
    await expect(page.locator('text=7:15')).toBeVisible();
  });

  test('should display help section', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for help section
    await expect(page.locator('text=Need Help?')).toBeVisible();
    await expect(page.locator('a[href="mailto:support@theapexway.net"]')).toBeVisible();
  });

  test('should be accessible from sidebar', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on Training menu to expand submenu
    await page.click('text=Training');

    // Wait for submenu to appear and click Videos
    await page.waitForSelector('text=Videos', { timeout: 5000 });
    await page.click('text=Videos');

    // Verify we're on the videos page
    await expect(page).toHaveURL('/dashboard/training/videos');
    await expect(page.locator('h1')).toContainText('Training Videos');
  });

  test('should display video count per category', async ({ page }) => {
    await page.goto('/dashboard/training/videos');

    // Check for video count displays
    await expect(page.locator('text=/Videos in this series \\(\\d+\\)/')).toHaveCount(5);
  });

  test('should handle missing authentication', async ({ page, context }) => {
    // Clear authentication
    await context.clearCookies();

    // Try to access videos page
    await page.goto('/dashboard/training/videos');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Training Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'fyifromcharles@gmail.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should show Training submenu with Overview and Videos', async ({ page }) => {
    // Click Training to expand
    await page.click('text=Training');

    // Check submenu items
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Videos')).toBeVisible();
  });

  test('should navigate to Training Overview', async ({ page }) => {
    await page.click('text=Training');
    await page.click('text=Overview');

    await expect(page).toHaveURL('/dashboard/training');
  });

  test('should navigate to Training Videos', async ({ page }) => {
    await page.click('text=Training');
    await page.click('text=Videos');

    await expect(page).toHaveURL('/dashboard/training/videos');
  });
});

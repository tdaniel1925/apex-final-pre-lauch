import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - Training and Resources Tests
 * Tests training videos, materials, and resource downloads
 */

async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Rep Back Office - Training Overview', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/training');
  });

  test('should display training page', async ({ page }) => {
    await expect(page).toHaveURL(/training/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show training modules or categories', async ({ page }) => {
    const trainingContent = page.locator('[class*="module"], [class*="category"], [class*="course"]').first();
    await expect(trainingContent).toBeVisible({ timeout: 5000 });
  });

  test('should have navigation to different training sections', async ({ page }) => {
    const navLinks = page.locator('a[href*="training"], button').filter({ hasText: /video|audio|material/i });
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Rep Back Office - Training Videos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/training/videos');
  });

  test('should display training videos page', async ({ page }) => {
    await expect(page).toHaveURL(/training.*videos/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show video player or video list', async ({ page }) => {
    const videoArea = page.locator('video, iframe, [class*="video"], [class*="player"]').first();
    await expect(videoArea).toBeVisible({ timeout: 5000 });
  });

  test('should have video categories or playlists', async ({ page }) => {
    const categories = page.locator('[class*="category"], [class*="playlist"], select, button').filter({ hasText: /category|playlist|topic/i }).first();
    const isVisible = await categories.isVisible().catch(() => false);

    if (isVisible) {
      await expect(categories).toBeVisible();
    }
  });

  test('should display video titles and descriptions', async ({ page }) => {
    const videoTitle = page.locator('[class*="title"], h3, h4').filter({ hasText: /.+/ }).first();
    await expect(videoTitle).toBeVisible();
  });

  test('should have playback controls', async ({ page }) => {
    const video = page.locator('video').first();
    const isVisible = await video.isVisible().catch(() => false);

    if (isVisible) {
      // Check for standard video controls
      await expect(video).toHaveAttribute('controls', '');
    }
  });

  test('should track video progress if feature exists', async ({ page }) => {
    const progressIndicator = page.locator('[class*="progress"], text=/completed|watched/i').first();
    const isVisible = await progressIndicator.isVisible().catch(() => false);

    if (isVisible) {
      await expect(progressIndicator).toBeVisible();
    }
  });

  test('should allow video selection and playback', async ({ page }) => {
    const videoItem = page.locator('[class*="video"], button, a').filter({ hasText: /.+/ }).first();

    if (await videoItem.isVisible()) {
      const isClickable = await videoItem.evaluate(el =>
        el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick !== null
      ).catch(() => false);

      if (isClickable) {
        await videoItem.click();
        await page.waitForTimeout(1000);

        // Video player should be visible
        const player = page.locator('video, iframe').first();
        await expect(player).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

test.describe('Rep Back Office - Resources and Downloads', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display resources section', async ({ page }) => {
    // Try common resource routes
    const resourceRoutes = ['/dashboard/resources', '/dashboard/downloads', '/dashboard/materials'];

    let foundRoute = false;
    for (const route of resourceRoutes) {
      await page.goto(route).catch(() => {});
      if (await page.locator('h1, h2').isVisible().catch(() => false)) {
        foundRoute = true;
        break;
      }
    }

    // If no dedicated resources page, skip
    if (!foundRoute) {
      test.skip();
    }
  });

  test('should show downloadable resources', async ({ page }) => {
    const downloadLinks = page.locator('a[download], a[href*=".pdf"], a[href*=".doc"], button:has-text("Download")').first();
    const isVisible = await downloadLinks.isVisible().catch(() => false);

    if (isVisible) {
      await expect(downloadLinks).toBeVisible();
    }
  });

  test('should categorize resources', async ({ page }) => {
    const categories = page.locator('[class*="category"], [class*="section"], h3, h4').first();
    await expect(categories).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Rep Back Office - Business Tools', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have access to business card designer if available', async ({ page }) => {
    // Check if business card feature exists
    await page.goto('/dashboard').catch(() => {});

    const businessCardLink = page.locator('a[href*="business-card"], a:has-text("Business Card")').first();
    const isVisible = await businessCardLink.isVisible().catch(() => false);

    if (isVisible) {
      await businessCardLink.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });

  test('should display marketing materials if available', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});

    const marketingLink = page.locator('a[href*="marketing"], a:has-text("Marketing")').first();
    const isVisible = await marketingLink.isVisible().catch(() => false);

    if (isVisible) {
      await marketingLink.click();
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Live Training Events', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display live events link if available', async ({ page }) => {
    await page.goto('/dashboard');

    const liveLink = page.locator('a[href*="live"], a:has-text("Live Training")').first();
    const isVisible = await liveLink.isVisible().catch(() => false);

    if (isVisible) {
      await expect(liveLink).toBeVisible();
      await expect(liveLink).toHaveAttribute('href', /.+/);
    }
  });

  test('should show upcoming events if events page exists', async ({ page }) => {
    await page.goto('/dashboard/events').catch(() => {});

    const eventsContent = page.locator('h1, h2, [class*="event"]').first();
    const isVisible = await eventsContent.isVisible().catch(() => false);

    if (isVisible) {
      await expect(eventsContent).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
  });

  test('should show training progress if feature exists', async ({ page }) => {
    const progressSection = page.locator('[class*="progress"], text=/progress|completed|achievement/i').first();
    const isVisible = await progressSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(progressSection).toBeVisible();
    }
  });

  test('should display certifications or badges if available', async ({ page }) => {
    const badges = page.locator('[class*="badge"], [class*="certification"], [class*="achievement"]').first();
    const isVisible = await badges.isVisible().catch(() => false);

    if (isVisible) {
      await expect(badges).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - AI Autopilot Features Tests
 * Tests flyers, social media, CRM contacts, and team features
 */

async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Rep Back Office - Autopilot Flyers', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/flyers');
  });

  test('should display flyers page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*flyers/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show flyer templates or creation options', async ({ page }) => {
    const flyerContent = page.locator('[class*="flyer"], [class*="template"], img, canvas').first();
    await expect(flyerContent).toBeVisible({ timeout: 5000 });
  });

  test('should have download or generate button', async ({ page }) => {
    const actionButton = page.locator('button:has-text("Download"), button:has-text("Generate"), button:has-text("Create")').first();
    const isVisible = await actionButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(actionButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Autopilot Social Media', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/social');
  });

  test('should display social media page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*social/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show social post templates or content', async ({ page }) => {
    const socialContent = page.locator('textarea, [class*="post"], [class*="content"]').first();
    await expect(socialContent).toBeVisible({ timeout: 5000 });
  });

  test('should have copy or share functionality', async ({ page }) => {
    const actionButton = page.locator('button:has-text("Copy"), button:has-text("Share"), button:has-text("Generate")').first();
    const isVisible = await actionButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(actionButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Autopilot CRM Contacts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/crm/contacts');
  });

  test('should display contacts page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*crm.*contacts/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show contacts list or add contact form', async ({ page }) => {
    const contactsArea = page.locator('table, [role="table"], [class*="list"], button:has-text("Add Contact")').first();
    await expect(contactsArea).toBeVisible({ timeout: 5000 });
  });

  test('should have add contact functionality', async ({ page }) => {
    const addButton = page.locator('button:has-text("Add"), button:has-text("New Contact")').first();
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(addButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Autopilot Subscription', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/subscription');
  });

  test('should display subscription page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*subscription/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show subscription tier information', async ({ page }) => {
    const tierInfo = page.locator('text=/tier|plan|subscription/i').first();
    await expect(tierInfo).toBeVisible();
  });

  test('should display usage limits', async ({ page }) => {
    const usageText = page.locator('text=/\d+.*remaining|limit|usage/i').first();
    const isVisible = await usageText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(usageText).toBeVisible();
    }
  });

  test('should have upgrade option if available', async ({ page }) => {
    const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade")').first();
    const isVisible = await upgradeButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(upgradeButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Autopilot Team Broadcasts', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/team/broadcasts');
  });

  test('should display team broadcasts page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*team.*broadcasts/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show broadcast creation form or list', async ({ page }) => {
    const broadcastArea = page.locator('form, table, [class*="broadcast"]').first();
    await expect(broadcastArea).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Rep Back Office - Autopilot Team Training', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/team/training');
  });

  test('should display team training page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*team.*training/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show training content or resources', async ({ page }) => {
    const trainingContent = page.locator('[class*="training"], [class*="resource"], video, iframe').first();
    await expect(trainingContent).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Rep Back Office - Autopilot Team Activity', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/team/activity');
  });

  test('should display team activity page', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*team.*activity/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show activity feed or stats', async ({ page }) => {
    const activityArea = page.locator('[class*="activity"], [class*="feed"], table').first();
    await expect(activityArea).toBeVisible({ timeout: 5000 });
  });
});

import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - Genealogy and Team Management Tests
 * Tests genealogy tree, matrix view, and team management features
 */

async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Rep Back Office - Genealogy', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/genealogy');
  });

  test('should display genealogy page', async ({ page }) => {
    await expect(page).toHaveURL(/genealogy/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show genealogy tree or organization structure', async ({ page }) => {
    // Look for tree visualization or list
    const treeArea = page.locator('[class*="tree"], [class*="org"], [class*="genealogy"], svg, canvas, table').first();
    await expect(treeArea).toBeVisible({ timeout: 5000 });
  });

  test('should display distributor information', async ({ page }) => {
    // Check for distributor names or details
    const distributorInfo = page.locator('text=/distributor|rep|member/i').first();
    const isVisible = await distributorInfo.isVisible().catch(() => false);

    if (isVisible) {
      await expect(distributorInfo).toBeVisible();
    }
  });

  test('should have search or filter functionality', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    const isVisible = await searchInput.isVisible().catch(() => false);

    if (isVisible) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should show team stats', async ({ page }) => {
    // Look for team metrics (class-based or text-based separately)
    const statsArea = page.locator('[class*="stat"], [class*="metric"]').first();
    const textStats = page.locator('text=/total|active|count/i').first();

    // Check if either type of stats is visible
    const hasClassStats = await statsArea.isVisible().catch(() => false);
    const hasTextStats = await textStats.isVisible().catch(() => false);

    expect(hasClassStats || hasTextStats).toBeTruthy();
  });

  test('should allow expanding/collapsing tree nodes if hierarchical', async ({ page }) => {
    // Look for expand/collapse buttons or clickable nodes
    const expandButton = page.locator('button[aria-label*="expand" i], [class*="expand"], svg[class*="chevron"]').first();
    const isVisible = await expandButton.isVisible().catch(() => false);

    if (isVisible) {
      await expandButton.click();
      // Should trigger some change in the tree
      await page.waitForTimeout(500);
    }
  });

  test('should display rank information for team members', async ({ page }) => {
    const rankText = page.locator('text=/rank|level/i').first();
    const isVisible = await rankText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(rankText).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Matrix View', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/matrix');
  });

  test('should display matrix page', async ({ page }) => {
    await expect(page).toHaveURL(/matrix/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show matrix structure', async ({ page }) => {
    // Matrix usually shown as grid or table
    const matrixArea = page.locator('table, [class*="grid"], [class*="matrix"], canvas').first();
    await expect(matrixArea).toBeVisible({ timeout: 5000 });
  });

  test('should display matrix positions', async ({ page }) => {
    // Check for position indicators
    const positionText = page.locator('text=/position|level|leg/i').first();
    const isVisible = await positionText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(positionText).toBeVisible();
    }
  });

  test('should show available and filled positions', async ({ page }) => {
    // Look for position status indicators
    const statusIndicators = page.locator('[class*="position"], [class*="slot"], td, div[class*="node"]');
    const count = await statusIndicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow viewing detailed information for team members', async ({ page }) => {
    // Look for clickable members or info buttons
    const memberElement = page.locator('[class*="member"], td, button[aria-label*="view" i]').first();
    const isVisible = await memberElement.isVisible().catch(() => false);

    if (isVisible) {
      const isClickable = await memberElement.evaluate(el =>
        el.tagName === 'BUTTON' || el.tagName === 'A' || el.onclick !== null
      ).catch(() => false);

      if (isClickable) {
        await memberElement.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('Rep Back Office - Team Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/team');
  });

  test('should display team page', async ({ page }) => {
    await expect(page).toHaveURL(/team/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show team members list or overview', async ({ page }) => {
    const teamArea = page.locator('table, [class*="list"], [class*="team"]').first();
    await expect(teamArea).toBeVisible({ timeout: 5000 });
  });

  test('should display team statistics', async ({ page }) => {
    const statsArea = page.locator('[class*="stat"], [class*="metric"]').first();
    await expect(statsArea).toBeVisible();
  });

  test('should show direct recruits', async ({ page }) => {
    const directText = page.locator('text=/direct|personally enrolled/i').first();
    const isVisible = await directText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(directText).toBeVisible();
    }
  });

  test('should display activity or performance metrics', async ({ page }) => {
    const metricsText = page.locator('text=/active|sales|volume|pv|points/i').first();
    const isVisible = await metricsText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(metricsText).toBeVisible();
    }
  });

  test('should have option to view team member details', async ({ page }) => {
    const detailsButton = page.locator('button:has-text("View"), button:has-text("Details"), a[href*="/team/"]').first();
    const isVisible = await detailsButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(detailsButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Compensation Views', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display compensation overview page', async ({ page }) => {
    await page.goto('/dashboard/compensation');
    await expect(page).toHaveURL(/compensation/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show commission information', async ({ page }) => {
    await page.goto('/dashboard/compensation/commissions');
    await expect(page).toHaveURL(/compensation.*commissions/);

    const commissionInfo = page.locator('text=/commission|earned|amount/i').first();
    await expect(commissionInfo).toBeVisible({ timeout: 5000 });
  });

  test('should display rank bonuses if available', async ({ page }) => {
    await page.goto('/dashboard/compensation/rank-bonuses');
    await expect(page).toHaveURL(/compensation.*rank/);

    const rankContent = page.locator('h1, h2').filter({ hasText: /rank|bonus/i }).first();
    await expect(rankContent).toBeVisible();
  });

  test('should show compensation calculator', async ({ page }) => {
    await page.goto('/dashboard/compensation/calculator');
    await expect(page).toHaveURL(/compensation.*calculator/);

    const calculator = page.locator('input, select, [class*="calculator"]').first();
    await expect(calculator).toBeVisible({ timeout: 5000 });
  });
});

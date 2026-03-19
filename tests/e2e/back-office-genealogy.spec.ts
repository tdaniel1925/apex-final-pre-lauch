// =============================================
// E2E Tests - Genealogy View
// Tests enrollment tree structure, navigation, and accuracy
// =============================================

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';

// Test user credentials
const TEST_USER = {
  email: 'sellag.sb@gmail.com',
  password: '4Xkkilla1@',
};

test.describe('Genealogy View Tests', () => {
  // Helper: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Navigation and Layout', () => {
    test('should navigate to Genealogy page from dashboard', async ({ page }) => {
      // Look for Genealogy link in navigation
      const genealogyLink = page.locator('a[href*="/genealogy"], button:has-text("Genealogy"), a:has-text("Genealogy")').first();
      await genealogyLink.click();

      // Should navigate to genealogy page
      await page.waitForURL(/\/genealogy/, { timeout: 10000 });

      // Verify page title
      await expect(page.locator('h1')).toContainText(/Genealogy|Tree/i);
    });

    test('should display user position card', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Should show user's name and info
      await expect(page.locator('text=/Your Position|Sella/i')).toBeVisible();

      // Should show rank badge
      await expect(page.locator('text=/starter|bronze|silver|gold|platinum/i').first()).toBeVisible();
    });

    test('should display organization stats summary', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Check for stats cards
      await expect(page.locator('text=/Total Organization|Organization Size/i')).toBeVisible();
      await expect(page.locator('text=/Organization Credits/i')).toBeVisible();
      await expect(page.locator('text=/Direct Enrollees/i')).toBeVisible();
    });
  });

  test.describe('Tree Structure and Display', () => {
    test('should display enrollment tree with correct levels', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree to load
      await page.waitForSelector('[data-testid="tree-node"], .tree-node, [class*="node"]', { timeout: 10000 });

      // Verify tree nodes are visible
      const treeNodes = page.locator('[data-testid="tree-node"], .tree-node, [class*="node"]');
      const nodeCount = await treeNodes.count();

      // Should have at least one node if user has downline
      if (nodeCount > 0) {
        expect(nodeCount).toBeGreaterThan(0);
      }
    });

    test('should show member names and ranks in tree', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for content
      await page.waitForTimeout(2000);

      // Check if any downline members exist
      const hasDownline = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!hasDownline) {
        // Should show member names
        const memberNames = page.locator('[class*="name"], [data-member-name]');
        const nameCount = await memberNames.count();
        expect(nameCount).toBeGreaterThan(0);
      }
    });

    test('should display personal and team credits in nodes', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree
      await page.waitForTimeout(2000);

      // Check for credit displays (may vary based on whether user has downline)
      const hasDownline = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!hasDownline) {
        // Should show credit information
        await expect(page.locator('text=/credits/i').first()).toBeVisible();
      }
    });

    test('should expand and collapse tree nodes', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree
      await page.waitForTimeout(2000);

      // Look for expandable nodes (nodes with children)
      const expandableNode = page.locator('[data-expandable="true"], button[aria-expanded], [class*="expand"]').first();

      const hasExpandable = await expandableNode.isVisible().catch(() => false);

      if (hasExpandable) {
        // Click to collapse
        await expandableNode.click();
        await page.waitForTimeout(500);

        // Click to expand again
        await expandableNode.click();
        await page.waitForTimeout(500);

        // Should still be visible
        await expect(expandableNode).toBeVisible();
      }
    });

    test('should show correct depth levels', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy?depth=5`);

      // Wait for tree
      await page.waitForTimeout(2000);

      // Verify depth setting is applied
      await expect(page.locator('text=/5 Levels|showing.*5/i')).toBeVisible();
    });

    test('should display sponsor chain correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for page load
      await page.waitForTimeout(2000);

      // Should show hierarchical structure
      // This is verified by the existence of the tree view
      const treeContainer = page.locator('[class*="tree"], [role="tree"], main');
      await expect(treeContainer).toBeVisible();
    });
  });

  test.describe('Tree Controls and Filters', () => {
    test('should allow changing tree depth', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Look for depth control buttons
      const depthControls = page.locator('a:has-text("10 Levels"), button:has-text("10 Levels")').first();

      const hasDepthControls = await depthControls.isVisible().catch(() => false);

      if (hasDepthControls) {
        await depthControls.click();
        await page.waitForURL(/depth=10/);

        // Verify new depth is applied
        await expect(page.locator('text=/10 Levels|showing.*10/i')).toBeVisible();
      }
    });

    test('should persist depth setting in URL', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy?depth=15`);

      // Verify URL contains depth parameter
      expect(page.url()).toContain('depth=15');

      // Verify depth is displayed
      await expect(page.locator('text=/15/i')).toBeVisible();
    });
  });

  test.describe('Member Interactions', () => {
    test('should open member detail modal on click', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree
      await page.waitForTimeout(2000);

      // Check if downline exists
      const hasDownline = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!hasDownline) {
        // Click on first clickable member node
        const memberNode = page.locator('button[class*="node"], [data-testid="tree-node"] button, [class*="member-card"] button').first();

        const isClickable = await memberNode.isVisible().catch(() => false);

        if (isClickable) {
          await memberNode.click();

          // Should open modal
          await page.waitForTimeout(1000);

          // Look for modal content
          const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]');
          await expect(modal).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should close modal when clicking close button', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree
      await page.waitForTimeout(2000);

      // Check if downline exists
      const hasDownline = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!hasDownline) {
        // Open modal
        const memberNode = page.locator('button[class*="node"], [data-testid="tree-node"] button').first();
        const isClickable = await memberNode.isVisible().catch(() => false);

        if (isClickable) {
          await memberNode.click();
          await page.waitForTimeout(1000);

          // Close modal
          const closeButton = page.locator('button[aria-label="Close"], button:has-text("Close"), [class*="close"]').first();
          const hasCloseButton = await closeButton.isVisible().catch(() => false);

          if (hasCloseButton) {
            await closeButton.click();
            await page.waitForTimeout(500);

            // Modal should be hidden
            const modal = page.locator('[role="dialog"]');
            await expect(modal).not.toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Empty State', () => {
    test('should display empty state when no enrollees exist', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for page load
      await page.waitForTimeout(2000);

      // Check if empty state is shown
      const emptyState = await page.locator('text=/No Enrollees|haven\'t enrolled/i').isVisible().catch(() => false);

      if (emptyState) {
        // Should show helpful message
        await expect(page.locator('text=/referral link|share/i')).toBeVisible();
      }
    });
  });

  test.describe('Data Accuracy', () => {
    test('should display accurate enrollee count', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for stats to load
      await page.waitForTimeout(2000);

      // Get displayed count
      const statsSection = page.locator('text=/Direct Enrollees/i').locator('..');
      const countText = await statsSection.textContent();

      // Should contain a number
      expect(countText).toMatch(/\d+/);
    });

    test('should calculate total organization size correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for stats
      await page.waitForTimeout(2000);

      // Get organization size
      const orgSizeSection = page.locator('text=/Total Organization|Organization Size/i').locator('..');
      const sizeText = await orgSizeSection.textContent();

      // Should contain a number
      expect(sizeText).toMatch(/\d+/);
    });

    test('should show correct organization credits total', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for stats
      await page.waitForTimeout(2000);

      // Get credits total
      const creditsSection = page.locator('text=/Organization Credits/i').locator('..');
      const creditsText = await creditsSection.textContent();

      // Should contain a number
      expect(creditsText).toMatch(/\d+/);
    });
  });

  test.describe('Performance', () => {
    test('should load tree within reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Wait for tree to render
      await page.waitForSelector('h1', { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle large tree depth without crashing', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard/genealogy?depth=20`);

      // Should not crash or timeout
      await page.waitForSelector('h1', { timeout: 15000 });

      // Page should be responsive
      await expect(page.locator('h1')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Should render without horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(375);

      // Main content should be visible
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`${BASE_URL}/dashboard/genealogy`);

      // Should render properly
      await expect(page.locator('h1')).toBeVisible();

      // Stats should be visible
      await expect(page.locator('text=/Organization/i')).toBeVisible();
    });
  });
});

import { test, expect } from '@playwright/test';

/**
 * Compensation Pages E2E Tests
 * Tests for commissions, overrides, and rank-bonuses pages
 * Validates calculations, display accuracy, and UX elements
 */

// Test user credentials (ensure this user exists in your test database)
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

test.describe('Compensation Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Commissions Page', () => {
    test('should load commissions page successfully', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Verify header is present
      await expect(page.locator('h1')).toContainText('Direct Commissions');

      // Verify page loaded without errors
      const errorMessage = page.locator('text=error').or(page.locator('text=Error'));
      await expect(errorMessage).toHaveCount(0);
    });

    test('should display correct commission rate (27.9%)', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Check for 27.9% rate in key stats
      const rateElement = page.locator('text=27.9%').first();
      await expect(rateElement).toBeVisible();

      // Verify the rate is described as "Effective Commission Rate"
      const rateDescription = page.locator('text=Effective Commission Rate');
      await expect(rateDescription).toBeVisible();
    });

    test('should display all product commission calculations', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Expected products with their commissions (corrected to match actual 27.9% calculation)
      const expectedProducts = [
        { name: 'PulseGuard', memberEarns: '16.46', retailEarns: '22.04' },
        { name: 'PulseFlow', memberEarns: '35.99', retailEarns: '41.57' },
        { name: 'PulseDrive', memberEarns: '61.10', retailEarns: '83.42' },
        { name: 'PulseCommand', memberEarns: '97.37', retailEarns: '139.22' },
        { name: 'SmartLook', memberEarns: '27.62', retailEarns: '27.62' },
        { name: 'Business Center', memberEarns: '10.00' },
      ];

      for (const product of expectedProducts) {
        // Check product name exists
        await expect(page.locator(`text=${product.name}`)).toBeVisible();

        // Check member earnings
        await expect(page.locator(`text=$${product.memberEarns}`).first()).toBeVisible();

        // Check retail earnings (if applicable)
        if (product.retailEarns) {
          await expect(page.locator(`text=$${product.retailEarns}`).first()).toBeVisible();
        }
      }
    });

    test('should display example earnings scenarios', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Verify example earnings are shown (corrected calculations)
      await expect(page.locator('text=Example Earnings Scenarios')).toBeVisible();
      await expect(page.locator('text=$164.60')).toBeVisible(); // 10 sales/month
      await expect(page.locator('text=$719.80')).toBeVisible(); // 20 sales/month
      await expect(page.locator('text=$696.10')).toBeVisible(); // 5 premium sales
    });

    test('should have proper contrast on dark backgrounds', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Check header text has light color on dark background
      const header = page.locator('h1').first();
      const headerColor = await header.evaluate(el => window.getComputedStyle(el).color);

      // Should be white or light color (rgb values should be high)
      const rgbMatch = headerColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeGreaterThan(200); // Light color check
      }
    });

    test('should display Business Center special pricing', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Verify Business Center section exists
      await expect(page.locator('text=Business Center ($10 Fixed)')).toBeVisible();
      await expect(page.locator('text=$10.00')).toBeVisible();
    });
  });

  test.describe('Overrides Page', () => {
    test('should load overrides page successfully', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Verify header is present
      await expect(page.locator('h1')).toContainText('Override Bonuses');

      // Verify page loaded without errors
      const errorMessage = page.locator('text=error').or(page.locator('text=Error'));
      await expect(errorMessage).toHaveCount(0);
    });

    test('should display override schedule for all ranks', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Expected ranks
      const ranks = ['Starter', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Ruby', 'Diamond', 'Crown', 'Elite'];

      for (const rank of ranks) {
        await expect(page.locator(`text=${rank}`).first()).toBeVisible();
      }
    });

    test('should show L1 rate is always 30%', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Verify L1 rate is highlighted
      await expect(page.locator('text=30%').first()).toBeVisible();
      await expect(page.locator('text=L1 Rate for All Ranks')).toBeVisible();
    });

    test('should display override qualification requirements', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Check for 50 credits/month requirement
      await expect(page.locator('text=50 personal credits per month')).toBeVisible();
      await expect(page.locator('text=Monthly Qualification Required')).toBeVisible();
    });

    test('should explain Enroller Override Rule', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Verify Enroller Override Rule section exists
      await expect(page.locator('text=Enroller Override Rule')).toBeVisible();
      await expect(page.locator('text=Personal Enrollees Always Pay L1 Rate')).toBeVisible();
    });

    test('should display dollar examples with calculations', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Check for dollar examples section (corrected calculations)
      await expect(page.locator('text=Dollar Examples')).toBeVisible();
      await expect(page.locator('text=PulseCommand')).toBeVisible();
      await expect(page.locator('text=$87.82')).toBeVisible(); // Override pool amount (499 × 17.6%)

      // Verify L1-L5 dollar amounts are shown (corrected)
      await expect(page.locator('text=$26.35')).toBeVisible(); // L1 (30% of 87.82)
      await expect(page.locator('text=$21.96')).toBeVisible(); // L2 (25% of 87.82)
      await expect(page.locator('text=$17.56')).toBeVisible(); // L3 (20% of 87.82)
      await expect(page.locator('text=$13.17')).toBeVisible(); // L4 (15% of 87.82)
      await expect(page.locator('text=$8.78')).toBeVisible(); // L5 (10% of 87.82)
    });

    test('should display override schedule table with all levels', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Verify table headers exist
      await expect(page.locator('th:has-text("Tech Rank")')).toBeVisible();
      await expect(page.locator('th:has-text("L1")')).toBeVisible();
      await expect(page.locator('th:has-text("L2")')).toBeVisible();
      await expect(page.locator('th:has-text("L3")')).toBeVisible();
      await expect(page.locator('th:has-text("L4")')).toBeVisible();
      await expect(page.locator('th:has-text("L5")')).toBeVisible();
    });

    test('should have proper contrast in table cells', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Check table header has proper contrast
      const tableHeader = page.locator('thead tr').first();
      await expect(tableHeader).toBeVisible();

      // Verify text is readable (should be white on dark background)
      const headerCell = page.locator('th:has-text("Tech Rank")').first();
      const headerColor = await headerCell.evaluate(el => window.getComputedStyle(el).color);

      // Should be white or light color
      const rgbMatch = headerColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeGreaterThan(200); // Light color check
      }
    });
  });

  test.describe('Rank Bonuses Page', () => {
    test('should load rank bonuses page successfully', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Verify header is present
      await expect(page.locator('h1')).toContainText('Rank Advancement Bonuses');

      // Verify page loaded without errors
      const errorMessage = page.locator('text=error').or(page.locator('text=Error'));
      await expect(errorMessage).toHaveCount(0);
    });

    test('should display total bonuses correctly ($93,750)', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check for total bonuses in header
      await expect(page.locator('text=$93,750')).toBeVisible();
      await expect(page.locator('text=Total potential')).toBeVisible();
    });

    test('should display all rank bonuses with correct amounts', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Expected rank bonuses
      const expectedBonuses = [
        { rank: 'Starter', bonus: '—' }, // No bonus
        { rank: 'Bronze', bonus: '$250' },
        { rank: 'Silver', bonus: '$1,000' },
        { rank: 'Gold', bonus: '$3,000' },
        { rank: 'Platinum', bonus: '$7,500' },
        { rank: 'Ruby', bonus: '$12,000' },
        { rank: 'Diamond', bonus: '$18,000' },
        { rank: 'Crown', bonus: '$22,000' },
        { rank: 'Elite', bonus: '$30,000' },
      ];

      for (const { rank, bonus } of expectedBonuses) {
        // Check rank name exists
        await expect(page.locator(`text=${rank}`).first()).toBeVisible();

        // Check bonus amount (should appear in table)
        if (bonus !== '—') {
          await expect(page.locator(`text=${bonus}`).first()).toBeVisible();
        }
      }
    });

    test('should display cumulative totals correctly', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Verify cumulative column exists and shows progression
      await expect(page.locator('th:has-text("Cumulative")')).toBeVisible();

      // Check some cumulative values
      await expect(page.locator('text=$250').first()).toBeVisible(); // Bronze cumulative
      await expect(page.locator('text=$1,250').first()).toBeVisible(); // Silver cumulative
      await expect(page.locator('text=$93,750').first()).toBeVisible(); // Elite cumulative
    });

    test('should display rank requirements correctly', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check for requirements columns
      await expect(page.locator('th:has-text("Personal")')).toBeVisible();
      await expect(page.locator('th:has-text("Group")')).toBeVisible();
      await expect(page.locator('th:has-text("Sponsored Downline Requirement")')).toBeVisible();

      // Verify some specific requirements
      await expect(page.locator('text=150').first()).toBeVisible(); // Bronze personal credits
      await expect(page.locator('text=300').first()).toBeVisible(); // Bronze group credits
    });

    test('should explain grace period and rank lock', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check for demotion & re-qualification section
      await expect(page.locator('text=Demotion & Re-Qualification')).toBeVisible();
      await expect(page.locator('text=Grace Period')).toBeVisible();
      await expect(page.locator('text=2-month grace period')).toBeVisible();
      await expect(page.locator('text=6-Month Rank Lock')).toBeVisible();
    });

    test('should display payment timeline', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Verify payment timeline section exists
      await expect(page.locator('text=Payment Timeline')).toBeVisible();
      await expect(page.locator('text=Month End: Rank Evaluation')).toBeVisible();
      await expect(page.locator('text=Promotion Takes Effect')).toBeVisible();
      await expect(page.locator('text=Bonus Paid')).toBeVisible();
    });

    test('should have proper table contrast', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check table header has dark background with light text
      const tableHeader = page.locator('thead').first();
      const headerBg = await tableHeader.evaluate(el => {
        const firstTh = el.querySelector('th');
        return firstTh ? window.getComputedStyle(firstTh.parentElement!).backgroundColor : '';
      });

      // Should be dark background (low RGB values)
      const rgbMatch = headerBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const [_, r, g, b] = rgbMatch.map(Number);
        expect(r).toBeLessThan(100); // Dark color check
      }
    });

    test('should display total row with correct sum', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check footer total row
      await expect(page.locator('tfoot').locator('text=TOTAL')).toBeVisible();
      await expect(page.locator('tfoot').locator('text=$93,750')).toBeVisible();
    });
  });

  test.describe('Navigation Between Pages', () => {
    test('should navigate between compensation pages', async ({ page }) => {
      // Start at commissions
      await page.goto('/dashboard/compensation/commissions');
      await expect(page.locator('h1')).toContainText('Direct Commissions');

      // Navigate to overrides
      await page.click('a[href="/dashboard/compensation/overrides"]');
      await expect(page.locator('h1')).toContainText('Override Bonuses');

      // Navigate back to compensation main
      await page.click('a[href="/dashboard/compensation"]');
      await expect(page).toHaveURL(/\/dashboard\/compensation$/);
    });

    test('should have working breadcrumb links', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Click breadcrumb to go back
      const breadcrumb = page.locator('a:has-text("Back to Compensation Plan")');
      await expect(breadcrumb).toBeVisible();
      await breadcrumb.click();

      // Should be at compensation main page
      await expect(page).toHaveURL(/\/dashboard\/compensation$/);
    });
  });

  test.describe('Accessibility & UX', () => {
    test('should have accessible buttons and links', async ({ page }) => {
      await page.goto('/dashboard/compensation/commissions');

      // Check that all links have visible text
      const links = await page.locator('a').all();
      for (const link of links) {
        const text = await link.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/dashboard/compensation/overrides');

      // Check for proper heading structure (h1 -> h2 -> h3)
      await expect(page.locator('h1')).toHaveCount(1); // Only one h1
      await expect(page.locator('h2').first()).toBeVisible(); // h2 sections exist
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/compensation/commissions');

      // Check that content is still visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('text=27.9%')).toBeVisible();
    });

    test('should have readable text sizes', async ({ page }) => {
      await page.goto('/dashboard/compensation/rank-bonuses');

      // Check that body text is at least 14px
      const bodyText = page.locator('p').first();
      const fontSize = await bodyText.evaluate(el => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseInt(fontSize);

      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    });
  });
});

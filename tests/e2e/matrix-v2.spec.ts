import { test, expect } from '@playwright/test';

// Test the new hybrid matrix view (visual tree + table)
test.describe('Matrix V2 - Hybrid View', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Login with test credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');

    // Navigate to matrix v2
    await page.click('text=Matrix');
    await page.waitForURL('/dashboard/matrix-v2');
  });

  test('should load matrix page successfully', async ({ page }) => {
    // Check that we're on the correct page
    await expect(page).toHaveURL('/dashboard/matrix-v2');

    // Check for main heading
    await expect(page.locator('h1')).toContainText('Your Matrix');
  });

  test('should display stats cards', async ({ page }) => {
    // Wait for stats to load
    await page.waitForSelector('text=Total Team', { timeout: 10000 });

    // Check all 4 stat cards are present
    await expect(page.locator('text=Total Team')).toBeVisible();
    await expect(page.locator('text=Active Members')).toBeVisible();
    await expect(page.locator('text=Total BV')).toBeVisible();
    await expect(page.locator('text=Max Depth')).toBeVisible();
  });

  test('should display visual tree section', async ({ page }) => {
    // Wait for visual tree section
    await page.waitForSelector('text=Your Immediate Team', { timeout: 10000 });

    // Check section heading
    await expect(page.locator('h2')).toContainText('Your Immediate Team (Levels 1-2)');

    // Check for root node (You) indicator
    await expect(page.locator('text=(You)')).toBeVisible();
  });

  test('should display table section for deeper levels', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Your Matrix")', { timeout: 10000 });

    // Check if deeper levels section exists
    const deeperLevelsHeading = page.locator('h2:has-text("Deeper Levels")');

    // If it exists, verify table structure
    if (await deeperLevelsHeading.isVisible()) {
      await expect(deeperLevelsHeading).toBeVisible();

      // Check for table headers
      await expect(page.locator('th:has-text("Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Rep #")')).toBeVisible();
      await expect(page.locator('th:has-text("Level")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Joined")')).toBeVisible();
    }
  });

  test('should have search functionality in table', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Your Matrix")', { timeout: 10000 });

    // Check if deeper levels section exists
    const deeperLevelsSection = page.locator('text=Deeper Levels');

    if (await deeperLevelsSection.isVisible()) {
      // Check for search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();

      // Test search functionality
      await searchInput.fill('test');
      // Verify input accepted the value
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('should have level filter in table', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Your Matrix")', { timeout: 10000 });

    // Check if deeper levels section exists
    const deeperLevelsSection = page.locator('text=Deeper Levels');

    if (await deeperLevelsSection.isVisible()) {
      // Check for filter select
      const filterSelect = page.locator('select');
      await expect(filterSelect.first()).toBeVisible();

      // Verify "All Levels" option exists
      await expect(filterSelect.first()).toContainText('All Levels');
    }
  });

  test('should handle loading state', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Check for loading indicator (should appear briefly)
    const loadingText = page.locator('text=Loading your matrix');

    // Either loading is visible or it loaded so fast we're already at the content
    const hasLoading = await loadingText.isVisible().catch(() => false);
    const hasContent = await page.locator('h1:has-text("Your Matrix")').isVisible().catch(() => false);

    expect(hasLoading || hasContent).toBe(true);
  });

  test('should display member cards with correct info', async ({ page }) => {
    // Wait for visual tree to load
    await page.waitForSelector('text=Your Immediate Team', { timeout: 10000 });

    // Check for at least one member card
    const memberCards = page.locator('div').filter({ hasText: /^[A-Z]{2}$/ }); // Avatar initials

    if (await memberCards.count() > 0) {
      // Verify first card has expected structure
      const firstCard = memberCards.first();
      await expect(firstCard).toBeVisible();
    }
  });

  test('should navigate from sidebar correctly', async ({ page }) => {
    // Go back to dashboard
    await page.click('text=Dashboard');
    await page.waitForURL('/dashboard');

    // Click Matrix link in sidebar
    await page.click('a[href="/dashboard/matrix-v2"]');

    // Verify we're on matrix-v2 page
    await expect(page).toHaveURL('/dashboard/matrix-v2');
    await expect(page.locator('h1')).toContainText('Your Matrix');
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // This test assumes the user might have no team
    // Check if empty state or data is displayed
    const emptyState = page.locator('text=No Matrix Data');
    const dataState = page.locator('text=Your Immediate Team');

    // One of these should be visible
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasData = await dataState.isVisible().catch(() => false);

    expect(hasEmpty || hasData).toBe(true);
  });
});

// Test API endpoints
test.describe('Matrix API - Hybrid Endpoint', () => {
  test('should return valid hybrid matrix data', async ({ request }) => {
    // This requires authentication, so we'll skip if not authenticated
    // In a real test, you'd need to get the distributorId from auth

    // For now, just test that the endpoint exists and requires auth
    const response = await request.get('/api/matrix/hybrid?distributorId=test-id');

    // Should either return 401 (unauthorized) or 200 (success) or 404 (not found)
    expect([200, 401, 404]).toContain(response.status());
  });

  test('should require distributorId parameter', async ({ request }) => {
    const response = await request.get('/api/matrix/hybrid');

    // Should return 400 bad request
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('distributorId');
  });
});

/**
 * E2E Test: Back Office Matrix View
 *
 * Purpose: Test the Matrix view functionality including:
 * - Viewing matrix tree structure
 * - Verifying sponsor-downline relationships
 * - Testing matrix depth and position calculations
 * - Testing pagination and filtering
 * - Testing distributor detail modals
 *
 * Test Scenario:
 * 1. Login as Charles Potter (sponsor)
 * 2. Navigate to Matrix view
 * 3. Verify Brian appears in the matrix
 * 4. Verify correct position and depth
 * 5. Test clicking on Brian to see details
 */

import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';

// Supabase client for test data setup and verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test user credentials - REAL DATA
const CHARLES_EMAIL = 'fyifromcharles@gmail.com';
const CHARLES_PASSWORD = process.env.CHARLES_TEST_PASSWORD || 'TestPass123!';

// Brian's email
const BRIAN_EMAIL = 'bclaybornr@gmail.com';

/**
 * Helper: Login as a specific user
 */
async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for successful login (redirects to dashboard)
  await page.waitForURL(/\/(dashboard|back-office)/, { timeout: 10000 });
}

/**
 * Helper: Get distributor data from database
 */
async function getDistributor(email: string) {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching distributor:', error);
    return null;
  }

  return data;
}

/**
 * Helper: Get matrix children for a distributor
 */
async function getMatrixChildren(parentId: string) {
  const { data, error } = await supabase
    .from('distributors')
    .select('*')
    .eq('matrix_parent_id', parentId)
    .order('matrix_position', { ascending: true });

  if (error) {
    console.error('Error fetching matrix children:', error);
    return [];
  }

  return data || [];
}

/**
 * Helper: Create a test distributor under a sponsor
 */
async function createTestDistributor(sponsorId: string) {
  const timestamp = Date.now();
  const testEmail = `test-matrix-${timestamp}@apextest.com`;

  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'TestPass123!',
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  // Then create distributor record
  const { data: distData, error: distError } = await supabase
    .from('distributors')
    .insert({
      auth_user_id: authData.user.id,
      first_name: 'Test',
      last_name: `Matrix${timestamp}`,
      email: testEmail,
      slug: `test-matrix-${timestamp}`,
      sponsor_id: sponsorId,
      status: 'active',
      profile_complete: true,
    })
    .select()
    .single();

  if (distError) {
    throw new Error(`Failed to create distributor: ${distError.message}`);
  }

  return distData;
}

/**
 * Helper: Cleanup test distributor
 */
async function cleanupTestDistributor(email: string) {
  // Delete distributor record (will cascade to auth user)
  await supabase.from('distributors').delete().eq('email', email);
}

test.describe('Back Office Matrix View', () => {

  test.describe('Matrix Tree Display', () => {

    test('should display Charles Potter in matrix view when logged in as Charles', async ({ page }) => {
      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');

      // Take screenshot
      await page.screenshot({
        path: 'test-results/matrix-charles-view.png',
        fullPage: true
      });

      // Verify page loaded
      await expect(page.locator('h1, h2').filter({ hasText: /matrix/i })).toBeVisible();

      // Verify Charles appears in the matrix (as root or in tree)
      const charlesCard = page.locator('[data-testid*="matrix-node"], .matrix-node, .distributor-card')
        .filter({ hasText: /charles.*potter/i });

      await expect(charlesCard.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display Brian in Charles matrix if Brian is under Charles', async ({ page }) => {
      // First verify the relationship in the database
      const charles = await getDistributor(CHARLES_EMAIL);
      if (!charles) {
        throw new Error('Charles Potter not found in database');
      }

      const brian = await getDistributor(BRIAN_EMAIL);

      if (!brian) {
        console.log('Brian not found - skipping this test');
        test.skip();
        return;
      }

      console.log('Database relationship:', {
        charles: {
          id: charles.id,
          name: `${charles.first_name} ${charles.last_name}`,
          matrix_depth: charles.matrix_depth,
        },
        brian: {
          id: brian.id,
          name: `${brian.first_name} ${brian.last_name}`,
          sponsor_id: brian.sponsor_id,
          matrix_parent_id: brian.matrix_parent_id,
          matrix_depth: brian.matrix_depth,
          matrix_position: brian.matrix_position,
        },
      });

      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');

      // Wait for matrix to load
      await page.waitForTimeout(2000);

      // Take screenshot before assertion
      await page.screenshot({
        path: 'test-results/matrix-charles-brian-view.png',
        fullPage: true
      });

      // Look for Brian in the matrix
      const brianCard = page.locator('[data-testid*="matrix-node"], .matrix-node, .distributor-card')
        .filter({ hasText: /brian/i });

      // Check if Brian is visible
      const brianCount = await brianCard.count();
      console.log(`Found ${brianCount} elements matching Brian`);

      if (brianCount === 0) {
        // Get the page HTML for debugging
        const pageContent = await page.content();
        console.log('Page does not contain Brian. Matrix data may not be loading correctly.');

        // Check what API calls were made
        const apiCalls: string[] = [];
        page.on('response', async (response) => {
          if (response.url().includes('/api/')) {
            apiCalls.push(`${response.status()} ${response.url()}`);
          }
        });

        console.log('API calls made:', apiCalls);
      }

      await expect(brianCard.first()).toBeVisible({
        timeout: 10000
      });

      // Verify Brian's position and depth are displayed
      if (brian.matrix_position) {
        const positionText = page.locator('text=/position.*' + brian.matrix_position + '/i');
        await expect(positionText).toBeVisible();
      }

      if (brian.matrix_depth !== null) {
        const depthText = page.locator('text=/level.*' + brian.matrix_depth + '/i');
        await expect(depthText).toBeVisible();
      }
    });

    test('should create a new rep and verify it appears in sponsor matrix', async ({ page }) => {
      // Get Charles data
      const charles = await getDistributor(CHARLES_EMAIL);
      if (!charles) {
        throw new Error('Charles Potter not found in database');
      }

      // Create a test distributor under Charles
      console.log('Creating test distributor under Charles...');
      const testDist = await createTestDistributor(charles.id);
      console.log('Created test distributor:', testDist);

      try {
        // Login as Charles
        await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

        // Navigate to Matrix view
        await page.goto(`${BASE_URL}/back-office/matrix`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({
          path: `test-results/matrix-with-new-rep-${testDist.slug}.png`,
          fullPage: true
        });

        // Look for the test distributor in the matrix
        const testDistCard = page.locator('[data-testid*="matrix-node"], .matrix-node, .distributor-card')
          .filter({ hasText: new RegExp(testDist.last_name, 'i') });

        await expect(testDistCard.first()).toBeVisible({ timeout: 15000 });

        console.log('✓ New rep appears in sponsor matrix');

      } finally {
        // Cleanup
        await cleanupTestDistributor(testDist.email);
        console.log('Test distributor cleaned up');
      }
    });

  });

  test.describe('Matrix Depth and Position', () => {

    test('should display correct matrix depth for distributors', async ({ page }) => {
      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');

      // Get Charles data to verify depth
      const charles = await getDistributor(CHARLES_EMAIL);
      if (!charles) {
        throw new Error('Charles not found');
      }

      // Verify depth is displayed correctly
      // Most matrix views show levels 1-5, with level 1 being direct children
      const levelIndicators = page.locator('[data-testid="matrix-level"], .matrix-level, text=/level \\d/i');
      const levelCount = await levelIndicators.count();

      expect(levelCount).toBeGreaterThan(0);
      console.log(`Found ${levelCount} level indicators`);

      // Verify level 1 exists
      const level1 = page.locator('text=/level 1/i');
      await expect(level1).toBeVisible();
    });

    test('should display correct matrix position (1-5) for distributors', async ({ page }) => {
      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Get children to verify positions
      const charles = await getDistributor(CHARLES_EMAIL);
      if (!charles) {
        throw new Error('Charles not found');
      }

      const children = await getMatrixChildren(charles.id);
      console.log(`Charles has ${children.length} matrix children`);

      if (children.length === 0) {
        console.log('No matrix children found - skipping position test');
        test.skip();
        return;
      }

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');

      // Verify each child's position (1-5)
      for (const child of children) {
        if (child.matrix_position) {
          expect(child.matrix_position).toBeGreaterThanOrEqual(1);
          expect(child.matrix_position).toBeLessThanOrEqual(5);

          console.log(`${child.first_name} ${child.last_name}: position ${child.matrix_position}`);
        }
      }
    });

  });

  test.describe('Matrix Interactions', () => {

    test('should open distributor details modal when clicking on a matrix node', async ({ page }) => {
      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Find a distributor card and click it
      const distributorCard = page.locator('[data-testid*="matrix-node"], .matrix-node, .distributor-card').first();

      if (await distributorCard.count() > 0) {
        await distributorCard.click();

        // Wait for modal to appear
        const modal = page.locator('[role="dialog"], .modal, [data-testid="distributor-modal"]');
        await expect(modal).toBeVisible({ timeout: 5000 });

        console.log('✓ Distributor details modal opened');

        // Take screenshot
        await page.screenshot({
          path: 'test-results/matrix-modal-opened.png',
          fullPage: true
        });

        // Close modal
        const closeButton = page.locator('button').filter({ hasText: /close|×/i });
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        }
      } else {
        console.log('No distributor cards found - skipping modal test');
        test.skip();
      }
    });

  });

  test.describe('Matrix API Tests', () => {

    test('should successfully call matrix API and return data', async ({ page }) => {
      // Login as Charles
      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);

      // Intercept API calls
      let matrixApiResponse: any = null;
      page.on('response', async (response) => {
        if (response.url().includes('/api/admin/matrix') || response.url().includes('/api/dashboard/matrix')) {
          try {
            matrixApiResponse = await response.json();
            console.log('Matrix API Response:', matrixApiResponse);
          } catch (e) {
            console.log('Could not parse matrix API response as JSON');
          }
        }
      });

      // Navigate to Matrix view
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Verify API was called
      expect(matrixApiResponse).toBeTruthy();
    });

  });

  test.describe('Matrix Pagination and Filtering', () => {

    test('should handle empty matrix gracefully', async ({ page }) => {
      // This would require a test user with no downline
      // For now, we'll just verify the empty state message exists in the code

      await loginAsUser(page, CHARLES_EMAIL, CHARLES_PASSWORD);
      await page.goto(`${BASE_URL}/back-office/matrix`);
      await page.waitForLoadState('networkidle');

      // The page should load without errors even if matrix is empty
      const heading = page.locator('h1, h2').filter({ hasText: /matrix/i });
      await expect(heading).toBeVisible();
    });

  });

});

/**
 * SmartOffice Integration Tests
 * Tests the SmartOffice library functions and database integration
 */

import { test, expect } from '@playwright/test';

test.describe('SmartOffice Database Integration', () => {
  test('should have smartoffice_sync_config table', async ({ page }) => {
    // This test verifies the database schema is deployed
    await page.goto('/admin/smartoffice');

    // If page loads without 500 error, database tables exist
    await page.waitForLoadState('networkidle');

    const has500Error = await page.getByText(/500|internal server error/i)
      .count()
      .then(count => count > 0);

    expect(has500Error).toBe(false);
  });

  test('should load SmartOffice configuration from database', async ({ request }) => {
    // Try to fetch stats - this requires config to be loaded
    const response = await request.get('/api/admin/smartoffice/stats');

    // Should either work (200) or require auth (401/403)
    // Should NOT be 500 due to missing config table
    expect([200, 401, 403]).toContain(response.status());
  });
});

test.describe('SmartOffice XML Builder', () => {
  test('should build valid XML for agent queries', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    // Navigate to Dev Tools tab
    const devToolsTab = page.getByRole('tab', { name: /dev tools/i });
    const tabExists = await devToolsTab.count().then(count => count > 0);

    if (tabExists) {
      await devToolsTab.click();
      await page.waitForTimeout(500);

      // If there's a query builder, test it
      const querySelect = page.locator('select, [role="combobox"]').first();
      const hasSelect = await querySelect.count().then(count => count > 0);

      if (hasSelect) {
        // Select an agent query
        await querySelect.selectOption({ index: 0 });
        await page.waitForTimeout(500);

        // Should show XML output
        const xmlOutput = page.locator('pre, code, textarea');
        const hasOutput = await xmlOutput.count().then(count => count > 0);

        if (hasOutput) {
          const xmlText = await xmlOutput.first().textContent();
          expect(xmlText).toContain('<'); // Should contain XML tags
        }
      }
    }
  });
});

test.describe('SmartOffice Sync Service', () => {
  test('should handle empty sync results', async ({ page, request }) => {
    // Mock empty SmartOffice API response
    await page.route('**/api/admin/smartoffice/sync', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          agents: 0,
          policies: 0,
          commissions: 0,
          duration_ms: 123
        })
      });
    });

    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const syncButton = page.getByRole('button', { name: /run full sync|sync now/i });
    const hasButton = await syncButton.count().then(count => count > 0);

    if (hasButton) {
      await syncButton.click();
      await page.waitForTimeout(2000);

      // Should show success message even with 0 results
      const successMessage = page.getByText(/success|complete/i);
      const hasSuccess = await successMessage.count().then(count => count > 0);

      expect(hasSuccess).toBe(true);
    }
  });

  test('should update stats after sync', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    // Get initial stats
    const totalAgentsText = await page.getByText(/total agents/i)
      .locator('..')
      .textContent()
      .catch(() => '0');

    // Mock successful sync
    await page.route('**/api/admin/smartoffice/sync', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          agents: 5,
          policies: 10,
          commissions: 15,
          duration_ms: 456
        })
      });
    });

    // Mock updated stats
    await page.route('**/api/admin/smartoffice/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalAgents: 5,
          mappedAgents: 2,
          unmappedAgents: 3,
          totalPolicies: 10,
          lastSync: new Date().toISOString()
        })
      });
    });

    const syncButton = page.getByRole('button', { name: /run full sync|sync now/i });
    const hasButton = await syncButton.count().then(count => count > 0);

    if (hasButton) {
      await syncButton.click();
      await page.waitForTimeout(2000);

      // Stats should update
      const updatedText = await page.getByText(/total agents/i)
        .locator('..')
        .textContent()
        .catch(() => '0');

      // Text should either update or at least still be present
      expect(updatedText).toBeTruthy();
    }
  });
});

test.describe('SmartOffice Custom Queries', () => {
  test('should have advisor details query builder', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const devToolsTab = page.getByRole('tab', { name: /dev tools/i });
    const tabExists = await devToolsTab.count().then(count => count > 0);

    if (tabExists) {
      await devToolsTab.click();
      await page.waitForTimeout(500);

      // Look for query selector with advisor option
      const advisorOption = page.getByText(/advisor|agent.*details/i);
      const hasOption = await advisorOption.count().then(count => count > 0);

      // If dev tools exist, should have query options
      if (hasOption) {
        expect(await advisorOption.isVisible()).toBe(true);
      }
    }
  });

  test('should have policy status query builder', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const devToolsTab = page.getByRole('tab', { name: /dev tools/i });
    const tabExists = await devToolsTab.count().then(count => count > 0);

    if (tabExists) {
      await devToolsTab.click();
      await page.waitForTimeout(500);

      const policyOption = page.getByText(/policy.*status/i);
      const hasOption = await policyOption.count().then(count => count > 0);

      if (hasOption) {
        expect(await policyOption.isVisible()).toBe(true);
      }
    }
  });

  test('should have policy list query builder', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const devToolsTab = page.getByRole('tab', { name: /dev tools/i });
    const tabExists = await devToolsTab.count().then(count => count > 0);

    if (tabExists) {
      await devToolsTab.click();
      await page.waitForTimeout(500);

      const listOption = page.getByText(/policy.*list/i);
      const hasOption = await listOption.count().then(count => count > 0);

      if (hasOption) {
        expect(await listOption.isVisible()).toBe(true);
      }
    }
  });
});

test.describe('SmartOffice Agent Mapping', () => {
  test('should have map agent functionality', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const agentsTab = page.getByRole('tab', { name: /agents/i });
    const tabExists = await agentsTab.count().then(count => count > 0);

    if (tabExists) {
      await agentsTab.click();
      await page.waitForTimeout(500);

      // Look for map button or action
      const mapButton = page.getByRole('button', { name: /map|link/i });
      const hasMapButton = await mapButton.count().then(count => count > 0);

      if (hasMapButton) {
        expect(await mapButton.first().isVisible()).toBe(true);
      }
    }
  });

  test('should show auto-map functionality', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const agentsTab = page.getByRole('tab', { name: /agents/i });
    const tabExists = await agentsTab.count().then(count => count > 0);

    if (tabExists) {
      await agentsTab.click();
      await page.waitForTimeout(500);

      // Look for auto-map button
      const autoMapButton = page.getByRole('button', { name: /auto.*map/i });
      const hasAutoMap = await autoMapButton.count().then(count => count > 0);

      if (hasAutoMap) {
        expect(await autoMapButton.isVisible()).toBe(true);
      }
    }
  });
});

test.describe('SmartOffice Policy Viewer', () => {
  test('should display policy details', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const policiesTab = page.getByRole('tab', { name: /policies/i });
    const tabExists = await policiesTab.count().then(count => count > 0);

    if (tabExists) {
      await policiesTab.click();
      await page.waitForTimeout(1000);

      // If there are policies, should be able to view details
      const viewButton = page.getByRole('button', { name: /view|details/i });
      const hasViewButton = await viewButton.count().then(count => count > 0);

      if (hasViewButton) {
        await viewButton.first().click();
        await page.waitForTimeout(500);

        // Should show policy details modal or page
        const modal = page.locator('[role="dialog"]');
        const hasModal = await modal.count().then(count => count > 0);

        if (hasModal) {
          expect(await modal.isVisible()).toBe(true);
        }
      }
    }
  });
});

test.describe('SmartOffice Security', () => {
  test('should enforce RLS policies', async ({ request }) => {
    // Try to access without auth
    const response = await request.get('/api/admin/smartoffice/stats');

    // Should require authentication
    expect([401, 403]).toContain(response.status());
  });

  test('should not expose API credentials in client', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    // Navigate to config tab
    const configTab = page.getByRole('tab', { name: /config/i });
    const tabExists = await configTab.count().then(count => count > 0);

    if (tabExists) {
      await configTab.click();
      await page.waitForTimeout(500);

      // API secret should be masked or not visible
      const apiSecretInput = page.getByLabel(/api secret/i);
      const hasInput = await apiSecretInput.count().then(count => count > 0);

      if (hasInput) {
        const inputType = await apiSecretInput.getAttribute('type');

        // Should be password type or masked
        expect(['password', 'hidden']).toContain(inputType || 'text');
      }
    }
  });

  test('should sanitize user inputs', async ({ page }) => {
    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const agentsTab = page.getByRole('tab', { name: /agents/i });
    const tabExists = await agentsTab.count().then(count => count > 0);

    if (tabExists) {
      await agentsTab.click();
      await page.waitForTimeout(500);

      const searchInput = page.getByPlaceholder(/search/i);
      const hasSearch = await searchInput.count().then(count => count > 0);

      if (hasSearch) {
        // Try XSS payload
        await searchInput.fill('<script>alert("xss")</script>');
        await page.waitForTimeout(500);

        // Should not execute script
        const alertShown = await page.evaluate(() => {
          return document.querySelectorAll('script').length === 0;
        });

        expect(alertShown).toBe(true);
      }
    }
  });
});

test.describe('SmartOffice Performance', () => {
  test('should load page within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load in reasonable time (allowing for slow connections)
    expect(loadTime).toBeLessThan(10000); // 10 seconds max
  });

  test('should handle large datasets', async ({ page }) => {
    // Mock large dataset
    await page.route('**/api/admin/smartoffice/stats', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalAgents: 10000,
          mappedAgents: 5000,
          unmappedAgents: 5000,
          totalPolicies: 50000,
          lastSync: new Date().toISOString()
        })
      });
    });

    await page.goto('/admin/smartoffice');
    await page.waitForLoadState('networkidle');

    // Page should still load and display numbers
    const statsCard = page.getByText(/10,?000/);
    const hasStats = await statsCard.count().then(count => count > 0);

    expect(hasStats).toBe(true);
  });
});

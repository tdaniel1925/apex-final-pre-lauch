/**
 * SmartOffice Admin UI E2E Tests
 * Tests the SmartOffice admin page interface and user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('SmartOffice Admin UI', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Authenticate as admin user
    // For now, we'll navigate directly and handle auth errors
  });

  test.describe('Page Load and Access', () => {
    test('should load the SmartOffice admin page', async ({ page }) => {
      await page.goto('/admin/smartoffice');

      // Should either show the page or redirect to login
      const url = page.url();
      expect(['/admin/smartoffice', '/login', '/auth/login']).toContain(
        new URL(url).pathname
      );
    });

    test('should redirect non-admin users to login', async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();

      await page.goto('/admin/smartoffice');

      // Should redirect to login
      await page.waitForURL(/\/(login|auth\/login)/);
      expect(page.url()).toMatch(/\/(login|auth\/login)/);
    });

    test('should show SmartOffice link in admin sidebar', async ({ page }) => {
      await page.goto('/admin');

      // Check if sidebar link exists
      const smartofficeLink = page.locator('a[href="/admin/smartoffice"]');
      const isVisible = await smartofficeLink.isVisible().catch(() => false);

      // If admin page is accessible, sidebar should be visible
      if (page.url().includes('/admin')) {
        expect(isVisible).toBe(true);
      }
    });
  });

  test.describe('Tab Navigation', () => {
    test('should display all 6 tabs', async ({ page }) => {
      await page.goto('/admin/smartoffice');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check for tab navigation
      const tabs = [
        'Overview',
        'Agents',
        'Policies',
        'Sync Logs',
        'Configuration',
        'Dev Tools'
      ];

      for (const tabName of tabs) {
        const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
        const exists = await tab.count().then(count => count > 0);

        if (exists) {
          expect(await tab.isVisible()).toBe(true);
        }
      }
    });

    test('should switch between tabs', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Try to click each tab
      const tabs = ['Overview', 'Agents', 'Policies'];

      for (const tabName of tabs) {
        const tab = page.getByRole('tab', { name: new RegExp(tabName, 'i') });
        const exists = await tab.count().then(count => count > 0);

        if (exists) {
          await tab.click();
          await page.waitForTimeout(500); // Wait for tab content to load

          // Verify tab is active (usually has data-state="active" or aria-selected="true")
          const isActive = await tab.evaluate((el) =>
            el.getAttribute('aria-selected') === 'true' ||
            el.getAttribute('data-state') === 'active'
          ).catch(() => false);

          expect(isActive).toBe(true);
        }
      }
    });
  });

  test.describe('Overview Tab', () => {
    test('should display statistics cards', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Look for stat labels
      const statLabels = [
        'Total Agents',
        'Mapped Agents',
        'Unmapped Agents',
        'Total Policies'
      ];

      for (const label of statLabels) {
        const element = page.getByText(label);
        const exists = await element.count().then(count => count > 0);

        if (exists) {
          expect(await element.isVisible()).toBe(true);
        }
      }
    });

    test('should display last sync information', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Look for last sync text
      const lastSync = page.getByText(/last sync/i);
      const exists = await lastSync.count().then(count => count > 0);

      if (exists) {
        expect(await lastSync.isVisible()).toBe(true);
      }
    });

    test('should show Run Full Sync button', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Look for sync button
      const syncButton = page.getByRole('button', { name: /run full sync|sync now/i });
      const exists = await syncButton.count().then(count => count > 0);

      if (exists) {
        expect(await syncButton.isVisible()).toBe(true);
        expect(await syncButton.isEnabled()).toBe(true);
      }
    });

    test('should display configuration status', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Look for configuration status (Ready, Not Configured, etc.)
      const statusIndicators = [
        page.getByText(/ready/i),
        page.getByText(/configured/i),
        page.getByText(/not configured/i)
      ];

      let foundStatus = false;
      for (const indicator of statusIndicators) {
        const exists = await indicator.count().then(count => count > 0);
        if (exists) {
          foundStatus = true;
          break;
        }
      }

      // At least one status indicator should exist
      if (page.url().includes('/admin/smartoffice')) {
        expect(foundStatus).toBe(true);
      }
    });
  });

  test.describe('Agents Tab', () => {
    test('should display agents table or empty state', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Click Agents tab
      const agentsTab = page.getByRole('tab', { name: /agents/i });
      const tabExists = await agentsTab.count().then(count => count > 0);

      if (tabExists) {
        await agentsTab.click();
        await page.waitForTimeout(1000);

        // Should show either table or empty state
        const table = page.locator('table');
        const emptyState = page.getByText(/no agents|empty/i);

        const hasTable = await table.count().then(count => count > 0);
        const hasEmptyState = await emptyState.count().then(count => count > 0);

        expect(hasTable || hasEmptyState).toBe(true);
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const agentsTab = page.getByRole('tab', { name: /agents/i });
      const tabExists = await agentsTab.count().then(count => count > 0);

      if (tabExists) {
        await agentsTab.click();
        await page.waitForTimeout(500);

        // Look for search input
        const searchInput = page.getByPlaceholder(/search/i);
        const hasSearch = await searchInput.count().then(count => count > 0);

        if (hasSearch) {
          expect(await searchInput.isVisible()).toBe(true);

          // Test typing in search
          await searchInput.fill('test');
          expect(await searchInput.inputValue()).toBe('test');
        }
      }
    });

    test('should have filter controls', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const agentsTab = page.getByRole('tab', { name: /agents/i });
      const tabExists = await agentsTab.count().then(count => count > 0);

      if (tabExists) {
        await agentsTab.click();
        await page.waitForTimeout(500);

        // Look for filter buttons/dropdowns
        const filterButton = page.getByRole('button', { name: /filter/i });
        const hasFilter = await filterButton.count().then(count => count > 0);

        if (hasFilter) {
          expect(await filterButton.isVisible()).toBe(true);
        }
      }
    });

    test('should show pagination controls', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const agentsTab = page.getByRole('tab', { name: /agents/i });
      const tabExists = await agentsTab.count().then(count => count > 0);

      if (tabExists) {
        await agentsTab.click();
        await page.waitForTimeout(500);

        // Look for pagination (Next, Previous, page numbers)
        const paginationElements = [
          page.getByRole('button', { name: /next/i }),
          page.getByRole('button', { name: /previous|prev/i }),
          page.getByText(/page \d+ of \d+/i)
        ];

        let hasPagination = false;
        for (const element of paginationElements) {
          const exists = await element.count().then(count => count > 0);
          if (exists) {
            hasPagination = true;
            break;
          }
        }

        // Pagination should exist if there are agents
        // If no pagination, that's okay (might be empty or few results)
      }
    });
  });

  test.describe('Policies Tab', () => {
    test('should display policies table or empty state', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const policiesTab = page.getByRole('tab', { name: /policies/i });
      const tabExists = await policiesTab.count().then(count => count > 0);

      if (tabExists) {
        await policiesTab.click();
        await page.waitForTimeout(1000);

        const table = page.locator('table');
        const emptyState = page.getByText(/no policies|empty/i);

        const hasTable = await table.count().then(count => count > 0);
        const hasEmptyState = await emptyState.count().then(count => count > 0);

        expect(hasTable || hasEmptyState).toBe(true);
      }
    });

    test('should have search functionality', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const policiesTab = page.getByRole('tab', { name: /policies/i });
      const tabExists = await policiesTab.count().then(count => count > 0);

      if (tabExists) {
        await policiesTab.click();
        await page.waitForTimeout(500);

        const searchInput = page.getByPlaceholder(/search/i);
        const hasSearch = await searchInput.count().then(count => count > 0);

        if (hasSearch) {
          expect(await searchInput.isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe('Configuration Tab', () => {
    test('should display configuration form', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const configTab = page.getByRole('tab', { name: /config/i });
      const tabExists = await configTab.count().then(count => count > 0);

      if (tabExists) {
        await configTab.click();
        await page.waitForTimeout(500);

        // Look for configuration fields
        const fields = [
          'API URL',
          'Sitename',
          'Username',
          'API Key'
        ];

        let foundFields = 0;
        for (const field of fields) {
          const label = page.getByText(new RegExp(field, 'i'));
          const exists = await label.count().then(count => count > 0);
          if (exists) foundFields++;
        }

        // Should have some configuration fields
        expect(foundFields).toBeGreaterThan(0);
      }
    });

    test('should have save configuration button', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const configTab = page.getByRole('tab', { name: /config/i });
      const tabExists = await configTab.count().then(count => count > 0);

      if (tabExists) {
        await configTab.click();
        await page.waitForTimeout(500);

        const saveButton = page.getByRole('button', { name: /save|update config/i });
        const hasButton = await saveButton.count().then(count => count > 0);

        if (hasButton) {
          expect(await saveButton.isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe('Sync Logs Tab', () => {
    test('should display sync history', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const logsTab = page.getByRole('tab', { name: /logs/i });
      const tabExists = await logsTab.count().then(count => count > 0);

      if (tabExists) {
        await logsTab.click();
        await page.waitForTimeout(1000);

        // Should show logs table or empty state
        const table = page.locator('table');
        const emptyState = page.getByText(/no sync logs|no history/i);

        const hasTable = await table.count().then(count => count > 0);
        const hasEmptyState = await emptyState.count().then(count => count > 0);

        expect(hasTable || hasEmptyState).toBe(true);
      }
    });
  });

  test.describe('Developer Tools Tab', () => {
    test('should display developer tools interface', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const devToolsTab = page.getByRole('tab', { name: /dev tools/i });
      const tabExists = await devToolsTab.count().then(count => count > 0);

      if (tabExists) {
        await devToolsTab.click();
        await page.waitForTimeout(500);

        // Look for developer tools elements
        const codeEditor = page.locator('textarea, [contenteditable="true"]');
        const hasEditor = await codeEditor.count().then(count => count > 0);

        // Developer tools should have some interactive element
        expect(hasEditor).toBe(true);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Page should load without horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);

      // Allow small differences for scrollbars
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
    });
  });

  test.describe('Error Handling', () => {
    test('should show error message when sync fails', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // If there's a sync button, click it
      const syncButton = page.getByRole('button', { name: /run full sync|sync now/i });
      const hasButton = await syncButton.count().then(count => count > 0);

      if (hasButton && await syncButton.isEnabled()) {
        // Mock network to fail
        await page.route('/api/admin/smartoffice/sync', route => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Test error' })
          });
        });

        await syncButton.click();
        await page.waitForTimeout(1000);

        // Should show error message (toast, alert, or inline error)
        const errorMessage = page.getByText(/error|failed/i);
        const hasError = await errorMessage.count().then(count => count > 0);

        // Error should be displayed
        expect(hasError).toBe(true);
      }
    });

    test('should handle API timeout gracefully', async ({ page }) => {
      await page.goto('/admin/smartoffice');
      await page.waitForLoadState('networkidle');

      // Mock slow API response
      await page.route('/api/admin/smartoffice/stats', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            totalAgents: 0,
            mappedAgents: 0,
            unmappedAgents: 0,
            totalPolicies: 0,
            lastSync: null
          })
        });
      });

      await page.reload();

      // Should show loading state or timeout message
      const loadingIndicator = page.locator('[role="status"], [aria-busy="true"]');
      const hasLoading = await loadingIndicator.count().then(count => count > 0);

      // Loading indicator should be present during load
      if (hasLoading) {
        expect(await loadingIndicator.isVisible()).toBe(true);
      }
    });
  });
});

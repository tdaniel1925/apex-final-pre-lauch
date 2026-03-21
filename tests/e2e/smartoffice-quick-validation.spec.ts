/**
 * SmartOffice Quick Validation Tests
 * Fast smoke tests to verify basic functionality
 */

import { test, expect } from '@playwright/test';

test.describe('SmartOffice Quick Validation', () => {
  test('SmartOffice files exist', async () => {
    const fs = require('fs');
    const path = require('path');

    const files = [
      'src/lib/smartoffice/client.ts',
      'src/lib/smartoffice/types.ts',
      'src/lib/smartoffice/xml-builder.ts',
      'src/lib/smartoffice/xml-parser.ts',
      'src/lib/smartoffice/sync-service.ts',
      'src/lib/smartoffice/custom-queries.ts',
      'src/app/admin/smartoffice/page.tsx',
    ];

    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath), `File should exist: ${file}`).toBe(true);
    }
  });

  test('API endpoints respond', async ({ request }) => {
    // Test stats endpoint exists
    const statsResponse = await request.get('/api/admin/smartoffice/stats');
    expect([200, 401, 403, 500]).toContain(statsResponse.status());

    // Test sync endpoint exists
    const syncResponse = await request.post('/api/admin/smartoffice/sync');
    expect([200, 401, 403, 500]).toContain(syncResponse.status());
  });

  test('Admin page loads', async ({ page }) => {
    await page.goto('/admin/smartoffice', { waitUntil: 'domcontentloaded', timeout: 30000 });

    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('Database migration exists', async () => {
    const fs = require('fs');
    const migrationPath = 'supabase/migrations/20260321000001_smartoffice_integration.sql';
    expect(fs.existsSync(migrationPath)).toBe(true);

    const content = fs.readFileSync(migrationPath, 'utf-8');
    expect(content).toContain('smartoffice_sync_config');
    expect(content).toContain('smartoffice_agents');
    expect(content).toContain('smartoffice_policies');
  });

  test('Documentation exists', async () => {
    const fs = require('fs');
    const docs = [
      'SMARTOFFICE-READY.md',
      'SMARTOFFICE-CONFIG.md',
      'src/lib/smartoffice/USAGE-EXAMPLES.md',
    ];

    for (const doc of docs) {
      expect(fs.existsSync(doc), `Documentation should exist: ${doc}`).toBe(true);
    }
  });
});

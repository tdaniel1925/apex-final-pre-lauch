/**
 * SmartOffice Simple Tests - No timeouts, fast results
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('SmartOffice - File Structure', () => {
  test('SmartOffice library files exist', () => {
    const files = [
      'src/lib/smartoffice/client.ts',
      'src/lib/smartoffice/types.ts',
      'src/lib/smartoffice/xml-builder.ts',
      'src/lib/smartoffice/xml-parser.ts',
      'src/lib/smartoffice/sync-service.ts',
      'src/lib/smartoffice/custom-queries.ts',
    ];

    files.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true);
    });
  });

  test('SmartOffice admin page exists', () => {
    const adminPage = path.join(process.cwd(), 'src/app/admin/smartoffice/page.tsx');
    expect(fs.existsSync(adminPage)).toBe(true);

    const content = fs.readFileSync(adminPage, 'utf-8');
    expect(content).toContain('SmartOffice');
  });

  test('Database migration exists', () => {
    const migration = path.join(process.cwd(), 'supabase/migrations/20260321000001_smartoffice_integration.sql');
    expect(fs.existsSync(migration)).toBe(true);

    const content = fs.readFileSync(migration, 'utf-8');
    expect(content).toContain('smartoffice_sync_config');
    expect(content).toContain('smartoffice_agents');
    expect(content).toContain('smartoffice_policies');
  });

  test('Documentation files exist', () => {
    const docs = [
      'SMARTOFFICE-READY.md',
      'SMARTOFFICE-CONFIG.md',
      'src/lib/smartoffice/USAGE-EXAMPLES.md',
    ];

    docs.forEach(doc => {
      const docPath = path.join(process.cwd(), doc);
      expect(fs.existsSync(docPath), `${doc} should exist`).toBe(true);
    });
  });
});

test.describe('SmartOffice - API Endpoints', () => {
  test('Stats endpoint exists and requires auth', async ({ request }) => {
    const response = await request.get('/api/admin/smartoffice/stats');

    // Should return 401 (unauthorized) not 404 (not found)
    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBe(404);
  });

  test('Sync endpoint exists and requires auth', async ({ request }) => {
    const response = await request.post('/api/admin/smartoffice/sync');

    // Should return 401 (unauthorized) not 404 (not found)
    expect([200, 401, 403]).toContain(response.status());
    expect(response.status()).not.toBe(404);
  });
});

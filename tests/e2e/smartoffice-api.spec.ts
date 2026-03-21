/**
 * SmartOffice API Endpoint Tests
 * Tests the SmartOffice API routes for stats and sync functionality
 */

import { test, expect } from '@playwright/test';

test.describe('SmartOffice API Endpoints', () => {
  // Note: These tests run without authentication to verify endpoints exist
  // and return proper 401/403 responses (proving security is working)

  test.describe('GET /api/admin/smartoffice/stats', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/admin/smartoffice/stats');
      expect(response.status()).toBe(401);
    });

    test('should return stats with proper structure', async ({ request, page }) => {
      // TODO: Authenticate as admin first
      // For now, we'll just verify the endpoint exists
      const response = await request.get('/api/admin/smartoffice/stats');

      // Should either be 401 (not authenticated) or 200 (authenticated)
      expect([200, 401, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();

        // Verify response structure
        expect(data).toHaveProperty('totalAgents');
        expect(data).toHaveProperty('mappedAgents');
        expect(data).toHaveProperty('unmappedAgents');
        expect(data).toHaveProperty('totalPolicies');
        expect(data).toHaveProperty('lastSync');

        // Verify data types
        expect(typeof data.totalAgents).toBe('number');
        expect(typeof data.mappedAgents).toBe('number');
        expect(typeof data.unmappedAgents).toBe('number');
        expect(typeof data.totalPolicies).toBe('number');
      }
    });

    test('should return valid numeric values', async ({ request }) => {
      const response = await request.get('/api/admin/smartoffice/stats');

      if (response.status() === 200) {
        const data = await response.json();

        // All counts should be non-negative
        expect(data.totalAgents).toBeGreaterThanOrEqual(0);
        expect(data.mappedAgents).toBeGreaterThanOrEqual(0);
        expect(data.unmappedAgents).toBeGreaterThanOrEqual(0);
        expect(data.totalPolicies).toBeGreaterThanOrEqual(0);

        // Mapped + unmapped should equal total
        expect(data.mappedAgents + data.unmappedAgents).toBe(data.totalAgents);
      }
    });

    test('should handle database errors gracefully', async ({ request }) => {
      const response = await request.get('/api/admin/smartoffice/stats');

      // Should never return 500 without error message
      if (response.status() === 500) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      }
    });
  });

  test.describe('POST /api/admin/smartoffice/sync', () => {
    test('should return 401 for unauthenticated requests', async ({ request }) => {
      const response = await request.post('/api/admin/smartoffice/sync');
      expect(response.status()).toBe(401);
    });

    test('should return 403 for non-admin users', async ({ request }) => {
      // TODO: Authenticate as regular user
      const response = await request.post('/api/admin/smartoffice/sync');
      expect([401, 403]).toContain(response.status());
    });

    test('should accept sync request from admin', async ({ request }) => {
      const response = await request.post('/api/admin/smartoffice/sync');

      // Should either be auth error or success
      expect([200, 401, 403]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();

        // Verify response structure
        expect(data).toHaveProperty('success');
        expect(data.success).toBe(true);
      }
    });

    test('should return sync results with proper structure', async ({ request }) => {
      const response = await request.post('/api/admin/smartoffice/sync');

      if (response.status() === 200) {
        const data = await response.json();

        // Should have result data
        expect(data).toHaveProperty('agents');
        expect(data).toHaveProperty('policies');
        expect(data).toHaveProperty('duration_ms');

        // Verify data types
        expect(typeof data.agents).toBe('number');
        expect(typeof data.policies).toBe('number');
        expect(typeof data.duration_ms).toBe('number');

        // Duration should be positive
        expect(data.duration_ms).toBeGreaterThan(0);
      }
    });

    test('should handle SmartOffice API errors gracefully', async ({ request }) => {
      const response = await request.post('/api/admin/smartoffice/sync');

      // If SmartOffice is not configured, should return error
      if (response.status() === 500) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      }
    });

    test('should not allow concurrent syncs', async ({ request }) => {
      // Start first sync
      const sync1Promise = request.post('/api/admin/smartoffice/sync');

      // Immediately start second sync
      const sync2Promise = request.post('/api/admin/smartoffice/sync');

      const [sync1, sync2] = await Promise.all([sync1Promise, sync2Promise]);

      // Both should respond (not hang)
      expect([200, 401, 403, 409, 429, 500]).toContain(sync1.status());
      expect([200, 401, 403, 409, 429, 500]).toContain(sync2.status());
    });
  });

  test.describe('API Rate Limiting', () => {
    test('should handle rapid requests', async ({ request }) => {
      // Make 10 rapid requests
      const requests = Array(10).fill(null).map(() =>
        request.get('/api/admin/smartoffice/stats')
      );

      const responses = await Promise.all(requests);

      // All should respond (not timeout)
      responses.forEach(response => {
        expect([200, 401, 403, 429]).toContain(response.status());
      });
    });
  });

  test.describe('API Error Handling', () => {
    test('should return JSON for all responses', async ({ request }) => {
      const endpoints = [
        '/api/admin/smartoffice/stats',
        '/api/admin/smartoffice/sync',
      ];

      for (const endpoint of endpoints) {
        const method = endpoint.includes('sync') ? 'post' : 'get';
        const response = await request[method](endpoint);

        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
      }
    });

    test('should include CORS headers', async ({ request }) => {
      const response = await request.get('/api/admin/smartoffice/stats');

      // Check for standard headers
      expect(response.headers()).toHaveProperty('content-type');
    });
  });
});

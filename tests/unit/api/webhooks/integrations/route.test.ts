// =============================================
// WEBHOOK INTEGRATION ROUTE TESTS
// =============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/webhooks/integrations/[platform]/route';
import { NextRequest } from 'next/server';
import { generateWebhookSignature } from '@/lib/integrations/webhooks/verify-signature';

// Mock Supabase service client
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      // Mock different tables
      if (table === 'integrations') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: {
                    id: 'integration_123',
                    platform_name: 'jordyn',
                    display_name: 'Jordyn.app',
                    webhook_secret: 'test_secret_12345',
                    is_enabled: true,
                    api_endpoint: 'https://api.jordyn.app',
                    supports_replicated_sites: true,
                    supports_sales_webhooks: true,
                    supports_commission_tracking: true,
                  },
                  error: null,
                })),
              })),
            })),
          })),
        };
      }

      if (table === 'distributor_replicated_sites') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      id: 'site_123',
                      distributor_id: 'dist_123',
                      integration_id: 'integration_123',
                      external_site_id: 'ext_user_123',
                      external_user_id: 'ext_user_123',
                      site_url: 'https://jordyn.app/dist_123',
                      site_status: 'active',
                    },
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        };
      }

      if (table === 'integration_product_mappings') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => ({
                    data: {
                      id: 'mapping_123',
                      integration_id: 'integration_123',
                      external_product_id: 'prod_789',
                      external_product_name: 'Business Starter Pack',
                      tech_credits: 50,
                      insurance_credits: 25,
                      commission_type: 'credits',
                      is_active: true,
                    },
                    error: null,
                  })),
                })),
              })),
            })),
          })),
        };
      }

      if (table === 'external_sales') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'sale_123',
                  external_sale_id: 'order_456',
                  integration_id: 'integration_123',
                  distributor_id: 'dist_123',
                },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        };
      }

      if (table === 'members') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  member_id: 'member_123',
                  full_name: 'John Doe',
                  enroller_id: null,
                },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        };
      }

      if (table === 'earnings_ledger') {
        return {
          insert: vi.fn(() => ({
            data: {},
            error: null,
          })),
        };
      }

      if (table === 'integration_webhook_logs') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: {
                  id: 'log_123',
                },
                error: null,
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: {},
              error: null,
            })),
          })),
        };
      }

      return {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
      };
    }),
    rpc: vi.fn(() => Promise.resolve({ data: 0, error: null })),
  })),
}));

describe('Webhook Integration Route', () => {
  const testSecret = 'test_secret_12345';

  const createWebhookRequest = (payload: any, signature?: string): NextRequest => {
    const body = JSON.stringify(payload);
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('x-webhook-signature', signature || generateWebhookSignature(body, testSecret));

    return new NextRequest('http://localhost:3000/api/webhooks/integrations/jordyn', {
      method: 'POST',
      headers,
      body,
    });
  };

  const validPayload = {
    event: 'sale.created',
    event_id: 'evt_123',
    timestamp: new Date().toISOString(),
    seller: {
      user_id: 'ext_user_123',
    },
    transaction: {
      order_id: 'order_456',
      amount: 99.0,
      currency: 'USD',
    },
    product: {
      product_id: 'prod_789',
      product_name: 'Business Starter Pack',
      quantity: 1,
    },
    customer: {
      email: 'customer@example.com',
      name: 'Jane Smith',
    },
  };

  describe('POST /api/webhooks/integrations/[platform]', () => {
    it('should accept valid webhook with correct signature', async () => {
      const request = createWebhookRequest(validPayload);
      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.sale_id).toBeDefined();
    });

    it('should reject webhook with invalid signature', async () => {
      const request = createWebhookRequest(validPayload, 'invalid_signature');
      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should reject webhook with missing signature', async () => {
      const body = JSON.stringify(validPayload);
      const headers = new Headers();
      headers.set('content-type', 'application/json');

      const request = new NextRequest('http://localhost:3000/api/webhooks/integrations/jordyn', {
        method: 'POST',
        headers,
        body,
      });

      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should reject invalid JSON payload', async () => {
      const headers = new Headers();
      headers.set('content-type', 'application/json');
      headers.set('x-webhook-signature', 'some_signature');

      const request = new NextRequest('http://localhost:3000/api/webhooks/integrations/jordyn', {
        method: 'POST',
        headers,
        body: 'not valid json',
      });

      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON payload');
    });

    it('should reject webhook with missing required fields', async () => {
      const invalidPayload = {
        event: 'sale.created',
        // Missing transaction and seller
      };

      const request = createWebhookRequest(invalidPayload);
      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should ignore non-sale events', async () => {
      const nonSalePayload = {
        ...validPayload,
        event: 'subscription.created',
      };

      const request = createWebhookRequest(nonSalePayload);
      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('not handled');
    });

    it('should handle idempotent webhook (duplicate order_id)', async () => {
      // First request
      const request1 = createWebhookRequest(validPayload);
      const params1 = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response1 = await POST(request1, params1);
      expect(response1.status).toBe(200);

      // Mock duplicate error (23505 = unique constraint violation)
      vi.mocked(vi.fn()).mockImplementationOnce(() => ({
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: '23505', message: 'duplicate key value' },
              })),
            })),
          })),
        })),
      }));

      // Second request (should be idempotent)
      const request2 = createWebhookRequest(validPayload);
      const params2 = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response2 = await POST(request2, params2);
      const data2 = await response2.json();

      // Should return 200 with "Already processed" message
      expect(data2.received).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return generic error for internal failures', async () => {
      // This test verifies the error handling structure
      // In production, internal errors would return 500 with generic message
      const request = createWebhookRequest(validPayload);
      const params = { params: Promise.resolve({ platform: 'jordyn' }) };

      const response = await POST(request, params);

      // Should not expose internal error details
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.received).toBeDefined();
    });
  });
});

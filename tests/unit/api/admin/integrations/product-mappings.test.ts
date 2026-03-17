// =============================================
// Product Mappings API Tests
// Tests for CRUD operations and bulk import
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/admin/integrations/product-mappings/route';
import { GET as GET_SINGLE, PUT, DELETE } from '@/app/api/admin/integrations/product-mappings/[id]/route';
import { POST as BULK_IMPORT } from '@/app/api/admin/integrations/product-mappings/bulk-import/route';

// Mock dependencies
vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
        order: vi.fn(() => ({
          eq: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  })),
}));

vi.mock('@/lib/auth/admin', () => ({
  getAdminUser: vi.fn(() =>
    Promise.resolve({
      user: { id: 'test-user-id', email: 'admin@test.com' },
      admin: { id: 'test-admin-id', role: 'admin' },
    })
  ),
}));

describe('Product Mappings API - List & Create', () => {
  describe('GET /api/admin/integrations/product-mappings', () => {
    it('should require admin authentication', async () => {
      const { getAdminUser } = await import('@/lib/auth/admin');
      vi.mocked(getAdminUser).mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should list all product mappings', async () => {
      const mockMappings = [
        {
          id: 'mapping-1',
          integration_id: 'int-1',
          external_product_id: 'prod_123',
          external_product_name: 'Test Product',
          tech_credits: 100,
          insurance_credits: 50,
          is_active: true,
        },
      ];

      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();
      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockMappings, error: null })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.mappings).toHaveLength(1);
    });

    it('should filter by integration_id when provided', async () => {
      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings?integration_id=int-1');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/admin/integrations/product-mappings', () => {
    it('should require admin authentication', async () => {
      const { getAdminUser } = await import('@/lib/auth/admin');
      vi.mocked(getAdminUser).mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('integration_id');
    });

    it('should validate credits are >= 0', async () => {
      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings', {
        method: 'POST',
        body: JSON.stringify({
          integration_id: 'int-1',
          external_product_id: 'prod_123',
          external_product_name: 'Test Product',
          tech_credits: -10,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Credits must be >= 0');
    });

    it('should validate commission percentages are 0-100', async () => {
      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings', {
        method: 'POST',
        body: JSON.stringify({
          integration_id: 'int-1',
          external_product_id: 'prod_123',
          external_product_name: 'Test Product',
          direct_commission_percentage: 150,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('between 0 and 100');
    });

    it('should create product mapping with valid data', async () => {
      const mockMapping = {
        id: 'new-mapping',
        integration_id: 'int-1',
        external_product_id: 'prod_123',
        external_product_name: 'Test Product',
        tech_credits: 100,
        insurance_credits: 50,
        direct_commission_percentage: 20,
        is_active: true,
      };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();

      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockMapping, error: null })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings', {
        method: 'POST',
        body: JSON.stringify({
          integration_id: 'int-1',
          external_product_id: 'prod_123',
          external_product_name: 'Test Product',
          tech_credits: 100,
          insurance_credits: 50,
          direct_commission_percentage: 20,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.mapping).toBeDefined();
    });
  });
});

describe('Product Mappings API - Single Resource', () => {
  describe('GET /api/admin/integrations/product-mappings/[id]', () => {
    it('should get single product mapping', async () => {
      const mockMapping = {
        id: 'mapping-1',
        external_product_name: 'Test Product',
      };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();

      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockMapping, error: null })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/mapping-1');
      const response = await GET_SINGLE(request, { params: { id: 'mapping-1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.mapping).toBeDefined();
    });

    it('should return 404 for non-existent mapping', async () => {
      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();

      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/invalid-id');
      const response = await GET_SINGLE(request, { params: { id: 'invalid-id' } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/admin/integrations/product-mappings/[id]', () => {
    it('should update product mapping', async () => {
      const mockUpdated = {
        id: 'mapping-1',
        external_product_name: 'Updated Product',
      };

      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();

      vi.mocked(mockClient.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockUpdated, error: null })),
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/mapping-1', {
        method: 'PUT',
        body: JSON.stringify({
          external_product_name: 'Updated Product',
          tech_credits: 200,
          insurance_credits: 100,
        }),
      });

      const response = await PUT(request, { params: { id: 'mapping-1' } });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/admin/integrations/product-mappings/[id]', () => {
    it('should delete product mapping', async () => {
      const { createServiceClient } = await import('@/lib/supabase/service');
      const mockClient = createServiceClient();

      vi.mocked(mockClient.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'mapping-1' }, error: null })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      } as any);

      const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/mapping-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'mapping-1' } });

      expect(response.status).toBe(200);
    });
  });
});

describe('Product Mappings API - Bulk Import', () => {
  it('should validate bulk import request structure', async () => {
    const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/bulk-import', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await BULK_IMPORT(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should reject imports with more than 100 mappings', async () => {
    const mappings = Array(101).fill({
      external_product_id: 'prod_1',
      external_product_name: 'Product',
    });

    const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/bulk-import', {
      method: 'POST',
      body: JSON.stringify({
        integration_id: 'int-1',
        mappings,
      }),
    });

    const response = await BULK_IMPORT(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('100');
  });

  it('should validate each mapping in bulk import', async () => {
    const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/bulk-import', {
      method: 'POST',
      body: JSON.stringify({
        integration_id: 'int-1',
        mappings: [
          { external_product_id: 'prod_1' }, // Missing name
        ],
      }),
    });

    const response = await BULK_IMPORT(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.validation_errors).toBeDefined();
  });

  it('should handle skip_duplicates flag', async () => {
    const { createServiceClient } = await import('@/lib/supabase/service');
    const mockClient = createServiceClient();

    vi.mocked(mockClient.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'int-1' }, error: null })),
          in: vi.fn(() => Promise.resolve({ data: [{ external_product_id: 'prod_1' }], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    } as any);

    const request = new NextRequest('http://localhost/api/admin/integrations/product-mappings/bulk-import', {
      method: 'POST',
      body: JSON.stringify({
        integration_id: 'int-1',
        skip_duplicates: true,
        mappings: [
          {
            external_product_id: 'prod_1',
            external_product_name: 'Product 1',
          },
        ],
      }),
    });

    const response = await BULK_IMPORT(request);

    expect(response.status).toBe(200);
  });
});

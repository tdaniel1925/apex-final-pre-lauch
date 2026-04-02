// =============================================
// API Route Test: Update Onboarding Session Stage
// =============================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/admin/onboarding/update-stage/route';

// Mock dependencies
vi.mock('@/lib/auth/admin', () => ({
  requireAdmin: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                id: 'session-123',
                fulfillment_stage: 'building_pages',
                updated_at: new Date().toISOString(),
              },
              error: null,
            })),
          })),
        })),
      })),
    })),
  })),
}));

describe('PATCH /api/admin/onboarding/update-stage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update fulfillment stage successfully', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/onboarding/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        fulfillment_stage: 'building_pages',
      }),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.fulfillment_stage).toBe('building_pages');
  });

  it('should reject invalid session_id format', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/onboarding/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: 'invalid-id',
        fulfillment_stage: 'building_pages',
      }),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should reject invalid fulfillment stage', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/onboarding/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        fulfillment_stage: 'invalid_stage',
      }),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should handle missing fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/onboarding/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123e4567-e89b-12d3-a456-426614174000',
      }),
    });

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });
});

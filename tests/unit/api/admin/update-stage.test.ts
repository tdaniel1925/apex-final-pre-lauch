import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH } from '@/app/api/admin/onboarding-sessions/update-stage/route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Update Fulfillment Stage API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new Request('http://localhost/api/admin/onboarding-sessions/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('session_id and fulfillment_stage are required');
  });

  it('should return 401 if user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/admin/onboarding-sessions/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123',
        fulfillment_stage: 'onboarding_complete',
      }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 403 if user is not admin', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { is_admin: false, is_master: false },
        }),
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/admin/onboarding-sessions/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123',
        fulfillment_stage: 'onboarding_complete',
      }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Forbidden');
  });

  it('should update stage for valid admin request', async () => {
    let fromCallCount = 0;

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'admin-1' } },
        }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        fromCallCount++;

        // First call is for distributors (auth check)
        if (fromCallCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { is_admin: true, is_master: false },
            }),
          };
        }

        // Second call is for onboarding_sessions (update)
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

    const request = new Request('http://localhost/api/admin/onboarding-sessions/update-stage', {
      method: 'PATCH',
      body: JSON.stringify({
        session_id: '123',
        fulfillment_stage: 'onboarding_complete',
      }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

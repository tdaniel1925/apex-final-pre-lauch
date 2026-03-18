/**
 * Profile Comprehensive API Integration Tests
 * Tests PUT /api/profile/comprehensive endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock modules before importing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(),
}));

vi.mock('@/lib/services/profile-sync-service', () => ({
  queueMultiPlatformSync: vi.fn(),
  logProfileChange: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  queueMultiPlatformSync,
  logProfileChange,
} from '@/lib/services/profile-sync-service';
import { PUT, GET } from '@/app/api/profile/comprehensive/route';

// Helper to create mock request
function createMockRequest(body: any, method: string = 'PUT') {
  return {
    json: async () => body,
    method,
    headers: new Map([
      ['x-forwarded-for', '192.168.1.1'],
      ['user-agent', 'Test User Agent'],
    ]),
  } as unknown as NextRequest;
}

// Helper to create mock supabase client
function createMockSupabaseClient(mockResponses: Record<string, any> = {}) {
  return {
    auth: {
      getUser: vi.fn(async () => mockResponses.auth || { data: { user: null }, error: null }),
    },
  };
}

// Helper to create mock service client
function createMockServiceClient(mockResponses: Record<string, any> = {}) {
  return {
    from: (table: string) => ({
      select: (fields?: string) => ({
        eq: (field: string, value: any) => ({
          single: async () => mockResponses[`${table}.select.single`] || { data: null, error: null },
        }),
        order: (field: string, options?: any) => ({
          limit: (count: number) => ({
            then: async (callback: any) => {
              const result = mockResponses[`${table}.select`] || { data: [], error: null };
              return result;
            },
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          select: () => ({
            single: async () => mockResponses[`${table}.update`] || { data, error: null },
          }),
        }),
      }),
    }),
  };
}

describe('PUT /api/profile/comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthenticated user
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: null }, error: new Error('Not authenticated') },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);

    const request = createMockRequest({
      first_name: 'John',
      last_name: 'Doe',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 400 if validation fails', async () => {
    // Mock authenticated user
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);

    const request = createMockRequest({
      first_name: 'J', // Too short (< 2 chars)
      last_name: 'Doe',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should return 400 if no fields to update', async () => {
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);

    const request = createMockRequest({});

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('No fields to update');
  });

  it('should return 404 if distributor not found', async () => {
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: null, error: new Error('Not found') },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);

    const request = createMockRequest({
      first_name: 'John',
      last_name: 'Doe',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Distributor not found');
  });

  it('should successfully update basic profile info', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      company_name: 'Old Company',
      address_line1: '123 Old St',
      address_line2: null,
      city: 'Old City',
      state: 'CA',
      zip: '12345',
      date_of_birth: '1990-01-01',
      is_licensed_agent: false,
    };

    const mockUpdatedDistributor = {
      ...mockCurrentDistributor,
      first_name: 'Jane',
      last_name: 'Smith',
      company_name: 'New Company',
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
      'distributors.update': { data: mockUpdatedDistributor, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);
    vi.mocked(queueMultiPlatformSync).mockResolvedValue([
      { success: true, platform: 'jordyn' },
      { success: true, platform: 'agentpulse' },
    ]);
    vi.mocked(logProfileChange).mockResolvedValue({ success: true });

    const request = createMockRequest({
      first_name: 'Jane',
      last_name: 'Smith',
      company_name: 'New Company',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Profile updated successfully');
    expect(data.changes.count).toBe(3);
    expect(data.changes.updated).toContain('first_name');
    expect(data.changes.updated).toContain('last_name');
    expect(data.changes.updated).toContain('company_name');
  });

  it('should update members table when name changes', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      is_licensed_agent: false,
    };

    const mockUpdatedDistributor = {
      ...mockCurrentDistributor,
      first_name: 'Jane',
      last_name: 'Smith',
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
      'distributors.update': { data: mockUpdatedDistributor, error: null },
      'members.update': { data: { full_name: 'Jane Smith' }, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);
    vi.mocked(queueMultiPlatformSync).mockResolvedValue([
      { success: true, platform: 'jordyn' },
      { success: true, platform: 'agentpulse' },
    ]);
    vi.mocked(logProfileChange).mockResolvedValue({ success: true });

    const request = createMockRequest({
      first_name: 'Jane',
      last_name: 'Smith',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify queueMultiPlatformSync was called with name change
    expect(queueMultiPlatformSync).toHaveBeenCalledWith(
      'dist-123',
      'name',
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Smith',
      }),
      false
    );
  });

  it('should queue platform sync for address changes', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      address_line1: '123 Old St',
      city: 'Old City',
      state: 'CA',
      zip: '12345',
      is_licensed_agent: false,
    };

    const mockUpdatedDistributor = {
      ...mockCurrentDistributor,
      address_line1: '456 New Ave',
      city: 'New City',
      state: 'NY',
      zip: '67890',
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
      'distributors.update': { data: mockUpdatedDistributor, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);
    vi.mocked(queueMultiPlatformSync).mockResolvedValue([]);
    vi.mocked(logProfileChange).mockResolvedValue({ success: true });

    const request = createMockRequest({
      address_line1: '456 New Ave',
      city: 'New City',
      state: 'NY',
      zip: '67890',
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify queueMultiPlatformSync was called with address change type
    expect(queueMultiPlatformSync).toHaveBeenCalledWith(
      'dist-123',
      'address',
      expect.any(Object),
      false
    );
  });

  it('should include winflex in sync for licensed agents', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      is_licensed_agent: true, // Licensed agent
    };

    const mockUpdatedDistributor = {
      ...mockCurrentDistributor,
      phone: '555-999-8888',
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
      'distributors.update': { data: mockUpdatedDistributor, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);
    vi.mocked(queueMultiPlatformSync).mockResolvedValue([
      { success: true, platform: 'winflex' },
    ]);
    vi.mocked(logProfileChange).mockResolvedValue({ success: true });

    const request = createMockRequest({
      phone: '555-999-8888',
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);

    // Verify winflex was included for licensed agent
    expect(queueMultiPlatformSync).toHaveBeenCalledWith(
      'dist-123',
      'phone',
      expect.any(Object),
      true // isLicensedAgent = true
    );
  });

  it('should log profile changes to audit trail', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      is_licensed_agent: false,
    };

    const mockUpdatedDistributor = {
      ...mockCurrentDistributor,
      phone: '555-999-8888',
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
      'distributors.update': { data: mockUpdatedDistributor, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);
    vi.mocked(queueMultiPlatformSync).mockResolvedValue([]);
    vi.mocked(logProfileChange).mockResolvedValue({ success: true });

    const request = createMockRequest({
      phone: '555-999-8888',
    });

    await PUT(request);

    // Verify audit logging was called
    expect(logProfileChange).toHaveBeenCalledWith(
      'dist-123',
      'user-123',
      'personal_info',
      { phone: '555-123-4567' },
      { phone: '555-999-8888' },
      'low',
      'User updated profile via dashboard',
      '192.168.1.1',
      'Test User Agent'
    );
  });

  it('should return early if no changes detected', async () => {
    const mockCurrentDistributor = {
      id: 'dist-123',
      auth_user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      is_licensed_agent: false,
    };

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: mockCurrentDistributor, error: null },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);

    const request = createMockRequest({
      first_name: 'John', // Same as current
      last_name: 'Doe', // Same as current
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('No changes detected');

    // Verify no sync or audit logging occurred
    expect(queueMultiPlatformSync).not.toHaveBeenCalled();
    expect(logProfileChange).not.toHaveBeenCalled();
  });
});

describe('GET /api/profile/comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: null }, error: new Error('Not authenticated') },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);

    const request = createMockRequest({}, 'GET');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return distributor profile data', async () => {
    const mockDistributor = {
      id: 'dist-123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      company_name: 'Acme Corp',
      address_line1: '123 Main St',
      address_line2: 'Suite 100',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      date_of_birth: '1990-01-15',
      profile_photo_url: 'https://example.com/photo.jpg',
      created_at: '2023-01-01T00:00:00Z',
      is_licensed_agent: true,
    };

    const mockRecentChanges = [
      { change_type: 'personal_info', created_at: '2023-12-01T00:00:00Z', severity: 'low' },
    ];

    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    // Create enhanced mock service client for GET endpoint
    const mockServiceClient = {
      from: (table: string) => {
        if (table === 'distributors') {
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({ data: mockDistributor, error: null }),
              }),
            }),
          };
        }
        if (table === 'profile_change_audit_log') {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({ data: mockRecentChanges, error: null }),
                }),
              }),
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
          }),
        };
      },
    };

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);

    const request = createMockRequest({}, 'GET');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.distributor).toEqual(mockDistributor);
    expect(data.recentChanges).toEqual(mockRecentChanges);
  });

  it('should return 404 if distributor not found', async () => {
    const mockClient = createMockSupabaseClient({
      auth: { data: { user: { id: 'user-123' } }, error: null },
    });

    const mockServiceClient = createMockServiceClient({
      'distributors.select.single': { data: null, error: new Error('Not found') },
    });

    vi.mocked(createClient).mockResolvedValue(mockClient as any);
    vi.mocked(createServiceClient).mockReturnValue(mockServiceClient as any);

    const request = createMockRequest({}, 'GET');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Distributor not found');
  });
});

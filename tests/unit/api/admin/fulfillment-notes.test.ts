import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from '@/app/api/admin/fulfillment-notes/route';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('Fulfillment Notes API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/fulfillment-notes', () => {
    it('should return 400 if session_id is missing', async () => {
      const request = new Request('http://localhost/api/admin/fulfillment-notes');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('session_id is required');
    });

    it('should return 401 if user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request(
        'http://localhost/api/admin/fulfillment-notes?session_id=123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return notes for valid admin request', async () => {
      const mockNotes = [
        {
          id: '1',
          onboarding_session_id: '123',
          admin_id: 'admin-1',
          note_text: 'Test note',
          created_at: new Date().toISOString(),
          admin_distributor: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
          },
        },
      ];

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

          // Second call is for fulfillment_notes (fetch notes)
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockNotes,
              error: null,
            }),
          };
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request(
        'http://localhost/api/admin/fulfillment-notes?session_id=123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notes).toEqual(mockNotes);
    });
  });

  describe('POST /api/admin/fulfillment-notes', () => {
    it('should return 400 if required fields are missing', async () => {
      const request = new Request('http://localhost/api/admin/fulfillment-notes', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('session_id and note_text are required');
    });

    it('should create note for valid admin request', async () => {
      const mockNote = {
        id: '1',
        onboarding_session_id: '123',
        admin_id: 'admin-1',
        note_text: 'New note',
        created_at: new Date().toISOString(),
        admin_distributor: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        },
      };

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

          // Second call is for fulfillment_notes (insert)
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockNote,
              error: null,
            }),
          };
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request('http://localhost/api/admin/fulfillment-notes', {
        method: 'POST',
        body: JSON.stringify({
          session_id: '123',
          note_text: 'New note',
        }),
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('PATCH /api/admin/fulfillment-notes', () => {
    it('should return 400 if note_id is missing', async () => {
      const request = new Request('http://localhost/api/admin/fulfillment-notes', {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('note_id is required');
    });

    it('should soft delete note for valid admin request', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'admin-1' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new Request('http://localhost/api/admin/fulfillment-notes', {
        method: 'PATCH',
        body: JSON.stringify({
          note_id: '123',
        }),
      });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

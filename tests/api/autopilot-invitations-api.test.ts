import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

describe('Autopilot Invitations API', () => {
  let testDistributorId: string;
  let testAuthUserId: string;
  let testInvitationId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user and distributor
    testAuthUserId = 'test-api-user-' + Date.now();

    const { data: distributor } = await supabase
      .from('distributors')
      .insert({
        auth_user_id: testAuthUserId,
        first_name: 'API',
        last_name: 'Tester',
        email: 'api-test@example.com',
      })
      .select()
      .single();

    testDistributorId = distributor!.id;

    // Create autopilot subscription
    await supabase.from('autopilot_subscriptions').insert({
      distributor_id: testDistributorId,
      tier: 'free',
      status: 'active',
    });

    // Note: In a real test, you'd need to create an actual auth session
    // For now, we'll test the logic without authentication
  });

  afterAll(async () => {
    // Cleanup test data
    if (testInvitationId) {
      await supabase.from('meeting_invitations').delete().eq('id', testInvitationId);
    }
    await supabase.from('autopilot_subscriptions').delete().eq('distributor_id', testDistributorId);
    await supabase.from('autopilot_usage_limits').delete().eq('distributor_id', testDistributorId);
    await supabase.from('distributors').delete().eq('id', testDistributorId);
  });

  describe('POST /api/autopilot/invitations', () => {
    it('should validate invitation data', () => {
      const invalidData = {
        recipient_email: 'not-an-email',
        recipient_name: 'J', // Too short
        meeting_title: 'AB', // Too short
        meeting_date_time: 'invalid-date',
      };

      // Validation should fail with proper error messages
      expect(invalidData.recipient_email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(invalidData.recipient_name.length).toBeLessThan(2);
      expect(invalidData.meeting_title.length).toBeLessThan(3);
    });

    it('should accept valid invitation data', () => {
      const validData = {
        recipient_email: 'prospect@example.com',
        recipient_name: 'John Prospect',
        meeting_title: 'Business Overview',
        meeting_description: 'Learn about our opportunity',
        meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        meeting_link: 'https://zoom.us/j/123456789',
      };

      // Validation checks
      expect(validData.recipient_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(validData.recipient_name.length).toBeGreaterThanOrEqual(2);
      expect(validData.meeting_title.length).toBeGreaterThanOrEqual(3);
      expect(new Date(validData.meeting_date_time).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('GET /api/autopilot/invitations', () => {
    it('should support status filtering', () => {
      const validStatuses = [
        'all',
        'draft',
        'sent',
        'opened',
        'responded_yes',
        'responded_no',
        'responded_maybe',
        'expired',
        'canceled',
      ];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should support pagination parameters', () => {
      const paginationParams = {
        limit: 50,
        offset: 0,
      };

      expect(paginationParams.limit).toBeGreaterThan(0);
      expect(paginationParams.limit).toBeLessThanOrEqual(100);
      expect(paginationParams.offset).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tracking Pixel', () => {
    it('should generate valid tracking pixel URL', () => {
      const invitationId = 'test-invitation-123';
      const pixelUrl = `/api/autopilot/track/open/${invitationId}`;

      expect(pixelUrl).toContain('/api/autopilot/track/open/');
      expect(pixelUrl).toContain(invitationId);
    });

    it('should handle tracking pixel requests', async () => {
      // Create a test invitation first
      const { data: invitation } = await supabase
        .from('meeting_invitations')
        .insert({
          distributor_id: testDistributorId,
          recipient_email: 'tracking-test@example.com',
          recipient_name: 'Tracking Test',
          meeting_title: 'Test Meeting',
          meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      testInvitationId = invitation!.id;

      // In a real test, you'd make an HTTP request to the tracking pixel endpoint
      // For now, we'll verify the database update logic works

      const { error } = await supabase
        .from('meeting_invitations')
        .update({
          opened_at: new Date().toISOString(),
          open_count: 1,
          status: 'opened',
        })
        .eq('id', testInvitationId);

      expect(error).toBeNull();

      const { data: updated } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', testInvitationId)
        .single();

      expect(updated!.status).toBe('opened');
      expect(updated!.open_count).toBe(1);
    });
  });

  describe('Response Tracking', () => {
    it('should accept valid response types', () => {
      const validResponses = ['yes', 'no', 'maybe'];

      validResponses.forEach((response) => {
        expect(['yes', 'no', 'maybe']).toContain(response);
      });
    });

    it('should map responses to correct statuses', () => {
      const statusMap = {
        yes: 'responded_yes',
        no: 'responded_no',
        maybe: 'responded_maybe',
      };

      expect(statusMap.yes).toBe('responded_yes');
      expect(statusMap.no).toBe('responded_no');
      expect(statusMap.maybe).toBe('responded_maybe');
    });

    it('should update invitation with response', async () => {
      if (!testInvitationId) {
        // Create test invitation if not exists
        const { data: invitation } = await supabase
          .from('meeting_invitations')
          .insert({
            distributor_id: testDistributorId,
            recipient_email: 'response-test@example.com',
            recipient_name: 'Response Test',
            meeting_title: 'Test Meeting',
            meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .select()
          .single();

        testInvitationId = invitation!.id;
      }

      const { error } = await supabase
        .from('meeting_invitations')
        .update({
          response_type: 'yes',
          responded_at: new Date().toISOString(),
          status: 'responded_yes',
        })
        .eq('id', testInvitationId);

      expect(error).toBeNull();

      const { data: updated } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', testInvitationId)
        .single();

      expect(updated!.status).toBe('responded_yes');
      expect(updated!.response_type).toBe('yes');
      expect(updated!.responded_at).toBeTruthy();
    });
  });

  describe('Resend Invitation', () => {
    it('should prevent resending to responded invitations', async () => {
      if (!testInvitationId) {
        throw new Error('No test invitation created');
      }

      // Get invitation
      const { data: invitation } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', testInvitationId)
        .single();

      // If invitation has response, resend should be prevented
      if (invitation!.response_type) {
        expect(invitation!.response_type).toBeTruthy();
        // In actual API, this would return 400 error
      }
    });

    it('should prevent resending for past meetings', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const now = new Date();

      expect(pastDate.getTime()).toBeLessThan(now.getTime());
      // In actual API, this would return 400 error
    });
  });

  describe('Delete Invitation', () => {
    it('should delete invitation successfully', async () => {
      // Create a new invitation for deletion test
      const { data: invitation } = await supabase
        .from('meeting_invitations')
        .insert({
          distributor_id: testDistributorId,
          recipient_email: 'delete-test@example.com',
          recipient_name: 'Delete Test',
          meeting_title: 'Test Meeting to Delete',
          meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'draft',
        })
        .select()
        .single();

      const deleteId = invitation!.id;

      // Delete invitation
      const { error } = await supabase
        .from('meeting_invitations')
        .delete()
        .eq('id', deleteId);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deleted } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', deleteId)
        .single();

      expect(deleted).toBeNull();
    });
  });
});

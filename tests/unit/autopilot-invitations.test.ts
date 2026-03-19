import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import {
  canSendInvitation,
  getRemainingInvites,
  generateInvitationLink,
  generateTrackingPixelUrl,
  generateCalendarFile,
  isInvitationExpired,
  validateInvitationData,
  formatMeetingDateTime,
  type MeetingInvitation,
} from '@/lib/autopilot/invitation-helpers';

// Test database setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe('Autopilot Meeting Invitations', () => {
  let testDistributorId: string;
  let testInvitationId: string;

  beforeAll(async () => {
    // Use existing active distributor for tests
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id')
      .eq('status', 'active')
      .limit(1)
      .single();

    if (!distributor) {
      console.warn('No active distributor found - skipping invitation tests');
      return;
    }

    testDistributorId = distributor.id;

    // Ensure autopilot subscription exists (upsert)
    await supabase.from('autopilot_subscriptions').upsert({
      distributor_id: testDistributorId,
      tier: 'free',
      status: 'active',
    }, {
      onConflict: 'distributor_id',
    });

    // Ensure usage limits exist
    await supabase.from('autopilot_usage_limits').upsert({
      distributor_id: testDistributorId,
      email_invites_used: 0,
      sms_messages_used: 0,
      social_posts_used: 0,
      event_flyers_used: 0,
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, {
      onConflict: 'distributor_id',
    });
  });

  afterAll(async () => {
    // Cleanup only test invitation data (keep distributor for other tests)
    if (testInvitationId) {
      await supabase.from('meeting_invitations').delete().eq('id', testInvitationId);
    }
    // Don't delete distributor, subscription, or usage limits - reused for tests
  });

  describe('Helper Functions', () => {
    it('should validate invitation data correctly', () => {
      const validData = {
        recipient_email: 'prospect@example.com',
        recipient_name: 'John Prospect',
        meeting_title: 'Business Overview',
        meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = validateInvitationData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        recipient_email: 'not-an-email',
        recipient_name: 'John Prospect',
        meeting_title: 'Business Overview',
        meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = validateInvitationData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });

    it('should reject past meeting dates', () => {
      const pastData = {
        recipient_email: 'prospect@example.com',
        recipient_name: 'John Prospect',
        meeting_title: 'Business Overview',
        meeting_date_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };

      const result = validateInvitationData(pastData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Meeting date must be in the future');
    });

    it('should generate invitation links correctly', () => {
      const invitationId = 'test-invitation-123';
      const yesLink = generateInvitationLink(invitationId, 'yes');
      const noLink = generateInvitationLink(invitationId, 'no');
      const maybeLink = generateInvitationLink(invitationId, 'maybe');

      expect(yesLink).toContain(invitationId);
      expect(yesLink).toContain('response=yes');
      expect(noLink).toContain('response=no');
      expect(maybeLink).toContain('response=maybe');
    });

    it('should generate tracking pixel URL correctly', () => {
      const invitationId = 'test-invitation-123';
      const pixelUrl = generateTrackingPixelUrl(invitationId);

      expect(pixelUrl).toContain('/api/autopilot/track/open/');
      expect(pixelUrl).toContain(invitationId);
    });

    it('should generate calendar file (.ics) correctly', () => {
      const invitation: MeetingInvitation = {
        id: 'test-123',
        distributor_id: testDistributorId,
        recipient_email: 'test@example.com',
        recipient_name: 'Test User',
        meeting_title: 'Test Meeting',
        meeting_description: 'This is a test meeting',
        meeting_date_time: '2026-04-01T19:00:00Z',
        meeting_location: '123 Main St',
        meeting_link: null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        opened_at: null,
        open_count: 0,
        responded_at: null,
        response_type: null,
        reminder_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const icsContent = generateCalendarFile(invitation);

      expect(icsContent).toContain('BEGIN:VCALENDAR');
      expect(icsContent).toContain('BEGIN:VEVENT');
      expect(icsContent).toContain('SUMMARY:Test Meeting');
      expect(icsContent).toContain('DESCRIPTION:This is a test meeting');
      expect(icsContent).toContain('LOCATION:123 Main St');
      expect(icsContent).toContain('END:VEVENT');
      expect(icsContent).toContain('END:VCALENDAR');
    });

    it('should detect expired invitations', () => {
      const pastInvitation: MeetingInvitation = {
        id: 'test-123',
        distributor_id: testDistributorId,
        recipient_email: 'test@example.com',
        recipient_name: 'Test User',
        meeting_title: 'Past Meeting',
        meeting_description: null,
        meeting_date_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        meeting_location: null,
        meeting_link: null,
        status: 'sent',
        sent_at: new Date().toISOString(),
        opened_at: null,
        open_count: 0,
        responded_at: null,
        response_type: null,
        reminder_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(isInvitationExpired(pastInvitation)).toBe(true);

      const futureInvitation: MeetingInvitation = {
        ...pastInvitation,
        meeting_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(isInvitationExpired(futureInvitation)).toBe(false);
    });

    it('should format meeting date/time for display', () => {
      const dateTime = '2026-04-01T19:00:00Z';
      const formatted = formatMeetingDateTime(dateTime);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      // Should contain month, day, year, and time
      expect(formatted).toMatch(/\d{1,2}/); // Day or hour
    });
  });

  describe('Usage Limits', () => {
    it('should check if distributor can send invitations', async () => {
      const canSend = await canSendInvitation(testDistributorId);
      expect(typeof canSend).toBe('boolean');
      // Free tier has 10 invites, should be able to send
      expect(canSend).toBe(true);
    });

    it('should get remaining invites count', async () => {
      const remaining = await getRemainingInvites(testDistributorId);
      expect(typeof remaining).toBe('number');
      // Free tier starts with 10
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(10);
    });
  });

  describe('Database Operations', () => {
    it('should create meeting invitation', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const { data: invitation, error } = await supabase
        .from('meeting_invitations')
        .insert({
          distributor_id: testDistributorId,
          recipient_email: 'prospect@example.com',
          recipient_name: 'John Prospect',
          meeting_title: 'Business Opportunity Discussion',
          meeting_description: 'Learn about building your future',
          meeting_date_time: futureDate.toISOString(),
          meeting_link: 'https://zoom.us/j/123456789',
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(invitation).toBeTruthy();
      expect(invitation!.recipient_email).toBe('prospect@example.com');
      expect(invitation!.status).toBe('sent');

      testInvitationId = invitation!.id;
    });

    it('should update invitation when opened', async () => {
      if (!testInvitationId) {
        throw new Error('No test invitation created');
      }

      const { error } = await supabase
        .from('meeting_invitations')
        .update({
          opened_at: new Date().toISOString(),
          open_count: 1,
          status: 'opened',
        })
        .eq('id', testInvitationId);

      expect(error).toBeNull();

      // Verify update
      const { data: updated } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', testInvitationId)
        .single();

      expect(updated!.status).toBe('opened');
      expect(updated!.open_count).toBe(1);
      expect(updated!.opened_at).toBeTruthy();
    });

    it('should update invitation with response', async () => {
      if (!testInvitationId) {
        throw new Error('No test invitation created');
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

      // Verify update
      const { data: updated } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('id', testInvitationId)
        .single();

      expect(updated!.status).toBe('responded_yes');
      expect(updated!.response_type).toBe('yes');
      expect(updated!.responded_at).toBeTruthy();
    });

    it('should fetch invitations for distributor', async () => {
      const { data: invitations, error } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(invitations).toBeTruthy();
      expect(Array.isArray(invitations)).toBe(true);
      expect(invitations!.length).toBeGreaterThan(0);
    });

    it('should filter invitations by status', async () => {
      const { data: yesInvitations, error } = await supabase
        .from('meeting_invitations')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .eq('status', 'responded_yes');

      expect(error).toBeNull();
      expect(yesInvitations).toBeTruthy();
      if (yesInvitations!.length > 0) {
        expect(yesInvitations![0].status).toBe('responded_yes');
      }
    });
  });

  describe('Usage Counter', () => {
    it('should increment usage counter', async () => {
      // Get current usage
      const { data: beforeUsage } = await supabase
        .from('autopilot_usage_limits')
        .select('email_invites_used_this_month')
        .eq('distributor_id', testDistributorId)
        .single();

      const beforeCount = beforeUsage!.email_invites_used_this_month;

      // Increment usage
      const { data: result } = await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: testDistributorId,
        p_limit_type: 'email',
        p_increment: 1,
      });

      expect(result).toBe(true);

      // Verify increment
      const { data: afterUsage } = await supabase
        .from('autopilot_usage_limits')
        .select('email_invites_used_this_month')
        .eq('distributor_id', testDistributorId)
        .single();

      expect(afterUsage!.email_invites_used_this_month).toBe(beforeCount + 1);
    });

    it('should check limit status', async () => {
      const { data: canSend } = await supabase.rpc('check_autopilot_limit', {
        p_distributor_id: testDistributorId,
        p_limit_type: 'email',
      });

      expect(typeof canSend).toBe('boolean');
    });
  });
});

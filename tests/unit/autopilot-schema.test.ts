/**
 * APEX LEAD AUTOPILOT SCHEMA TESTS
 * Tests the database schema for the Lead Autopilot system
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Apex Lead Autopilot Schema', () => {
  let testDistributorId: string;

  beforeAll(async () => {
    // Get a test distributor
    const { data: distributors } = await supabase
      .from('distributors')
      .select('id')
      .limit(1)
      .single();

    if (distributors) {
      testDistributorId = distributors.id;
    }
  });

  describe('autopilot_subscriptions table', () => {
    it('should create a subscription', async () => {
      const { data, error} = await supabase
        .from('autopilot_subscriptions')
        .upsert({
          distributor_id: testDistributorId,
          tier: 'free',
          status: 'active',
        }, {
          onConflict: 'distributor_id'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.tier).toBe('free');
      expect(data?.status).toBe('active');
    });

    it('should enforce tier enum constraint', async () => {
      const { error } = await supabase
        .from('autopilot_subscriptions')
        .insert({
          distributor_id: testDistributorId,
          tier: 'invalid_tier',
          status: 'active',
        });

      expect(error).not.toBeNull();
    });
  });

  describe('meeting_invitations table', () => {
    it('should create a meeting invitation', async () => {
      const { data, error } = await supabase
        .from('meeting_invitations')
        .insert({
          distributor_id: testDistributorId,
          recipient_email: 'test@example.com',
          recipient_name: 'Test Recipient',
          meeting_title: 'Business Overview',
          meeting_description: 'Learn about our opportunity',
          meeting_date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          meeting_link: 'https://zoom.us/j/123456789',
          status: 'draft',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.meeting_title).toBe('Business Overview');
      expect(data?.status).toBe('draft');
    });

    it('should track open count', async () => {
      const { data: invitation } = await supabase
        .from('meeting_invitations')
        .insert({
          distributor_id: testDistributorId,
          recipient_email: 'test2@example.com',
          meeting_title: 'Follow-up Meeting',
          meeting_date_time: new Date().toISOString(),
          status: 'sent',
        })
        .select()
        .single();

      if (invitation) {
        const { data, error } = await supabase
          .from('meeting_invitations')
          .update({ open_count: 3, opened_at: new Date().toISOString() })
          .eq('id', invitation.id)
          .select()
          .single();

        expect(error).toBeNull();
        expect(data?.open_count).toBe(3);
      }
    });
  });

  describe('event_flyers table', () => {
    it('should create an event flyer', async () => {
      const { data, error } = await supabase
        .from('event_flyers')
        .insert({
          distributor_id: testDistributorId,
          flyer_template_id: 'template_001',
          flyer_title: 'Grand Opening Event',
          event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          event_location: 'Community Center',
          status: 'draft',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.flyer_title).toBe('Grand Opening Event');
      expect(data?.status).toBe('draft');
    });
  });

  describe('sms_campaigns table', () => {
    it('should create an SMS campaign', async () => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          distributor_id: testDistributorId,
          campaign_name: 'Spring Promotion',
          message_content: 'Join us for our spring promotion! Limited time offer.',
          status: 'draft',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.campaign_name).toBe('Spring Promotion');
      expect(data?.character_count).toBeGreaterThan(0);
      expect(data?.estimated_segments).toBeGreaterThan(0);
    });

    it('should calculate character count automatically', async () => {
      const message = 'Test message';
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          distributor_id: testDistributorId,
          campaign_name: 'Test Campaign',
          message_content: message,
          status: 'draft',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.character_count).toBe(message.length);
    });
  });

  describe('sms_messages table', () => {
    it('should create an SMS message', async () => {
      const { data: campaign } = await supabase
        .from('sms_campaigns')
        .insert({
          distributor_id: testDistributorId,
          campaign_name: 'Test Campaign for Messages',
          message_content: 'Test message',
          status: 'draft',
        })
        .select()
        .single();

      if (campaign) {
        const { data, error } = await supabase
          .from('sms_messages')
          .insert({
            campaign_id: campaign.id,
            distributor_id: testDistributorId,
            recipient_phone: '+15551234567',
            recipient_name: 'Test Recipient',
            message_content: 'Hello from Apex!',
            status: 'pending',
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.status).toBe('pending');
      }
    });
  });

  describe('autopilot_usage_limits table', () => {
    it('should initialize usage limits via trigger', async () => {
      // First, update the subscription to trigger the usage limits update
      const { data: subscription } = await supabase
        .from('autopilot_subscriptions')
        .update({ tier: 'lead_autopilot_pro' })
        .eq('distributor_id', testDistributorId)
        .select()
        .single();

      expect(subscription).toBeDefined();
      expect(subscription?.tier).toBe('lead_autopilot_pro');

      // Check if usage limits were updated
      const { data: limits, error } = await supabase
        .from('autopilot_usage_limits')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .single();

      expect(error).toBeNull();
      expect(limits).toBeDefined();
      expect(limits?.tier).toBe('lead_autopilot_pro');
      expect(limits?.contacts_limit).toBe(500); // Pro tier limit
      expect(limits?.email_invites_limit).toBe(-1); // Unlimited
    });

    it('should track usage counts', async () => {
      const { data, error } = await supabase
        .from('autopilot_usage_limits')
        .select('*')
        .eq('distributor_id', testDistributorId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.email_invites_used_this_month).toBeGreaterThanOrEqual(0);
      expect(data?.sms_sent_this_month).toBeGreaterThanOrEqual(0);
    });
  });

  describe('helper functions', () => {
    it('should check autopilot limits', async () => {
      const { data, error } = await supabase.rpc('check_autopilot_limit', {
        p_distributor_id: testDistributorId,
        p_limit_type: 'email',
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should increment usage', async () => {
      const { data, error } = await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: testDistributorId,
        p_limit_type: 'email',
        p_increment: 1,
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });
});

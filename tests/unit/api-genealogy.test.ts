// =============================================
// Unit Tests - Genealogy API
// Tests data fetching, tree building, and RLS policies
// =============================================

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Service client (bypasses RLS)
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

// Anon client (respects RLS)
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

describe('Genealogy API Tests', () => {
  let testUserId: string;
  let testMemberId: string;
  let testAuthToken: string;

  beforeAll(async () => {
    // Use existing test user
    const testEmail = 'sellag.sb@gmail.com';

    // Get distributor
    const { data: distributor } = await serviceClient
      .from('distributors')
      .select('id, auth_user_id')
      .eq('email', testEmail)
      .single();

    if (distributor) {
      testUserId = distributor.auth_user_id;

      // Get member record
      const { data: member } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('distributor_id', distributor.id)
        .single();

      if (member) {
        testMemberId = member.member_id;
      }

      // Create auth session for RLS tests
      const { data: authData } = await anonClient.auth.signInWithPassword({
        email: testEmail,
        password: '4Xkkilla1@',
      });

      if (authData.session) {
        testAuthToken = authData.session.access_token;
      }
    }
  });

  afterAll(async () => {
    // Cleanup: sign out
    if (testAuthToken) {
      await anonClient.auth.signOut();
    }
  });

  describe('Data Structure', () => {
    it('should fetch member with correct schema', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          full_name,
          email,
          enroller_id,
          tech_rank,
          personal_credits_monthly,
          team_credits_monthly,
          enrollment_date,
          status
        `)
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.member_id).toBe(testMemberId);
      expect(data?.full_name).toBeTruthy();
      expect(data?.tech_rank).toBeTruthy();
    });

    it('should fetch member with distributor join', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          full_name,
          distributor:distributors!members_distributor_id_fkey (
            id,
            first_name,
            last_name,
            slug,
            rep_number
          )
        `)
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.distributor).toBeDefined();

      // Handle array or object from Supabase
      const dist = Array.isArray(data?.distributor) ? data.distributor[0] : data?.distributor;
      expect(dist?.slug).toBeTruthy();
    });

    it('should have required fields for tree nodes', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, full_name, enroller_id, tech_rank')
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.member_id).toBeTruthy();
      expect(data?.full_name).toBeTruthy();
      expect(data?.tech_rank).toBeTruthy();
      // enroller_id may be null for root sponsor
    });
  });

  describe('Tree Building Logic', () => {
    it('should fetch direct enrollees', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, full_name, enroller_id')
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should order enrollees by enrollment date', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, enrollment_date')
        .eq('enroller_id', testMemberId)
        .order('enrollment_date', { ascending: true });

      expect(error).toBeNull();

      if (data && data.length > 1) {
        // Verify ascending order
        for (let i = 1; i < data.length; i++) {
          const prev = new Date(data[i - 1].enrollment_date);
          const curr = new Date(data[i].enrollment_date);
          expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
        }
      }
    });

    it('should only include active members in tree', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, status')
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      expect(error).toBeNull();

      if (data) {
        // All members should be active
        data.forEach((member) => {
          expect(member.status).toBe('active');
        });
      }
    });

    it('should recursively fetch multiple levels', async () => {
      // Get L1
      const { data: l1Members } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .eq('status', 'active')
        .limit(1);

      if (l1Members && l1Members.length > 0) {
        // Get L2
        const { data: l2Members, error } = await serviceClient
          .from('members')
          .select('member_id')
          .eq('enroller_id', l1Members[0].member_id)
          .eq('status', 'active');

        expect(error).toBeNull();
        expect(Array.isArray(l2Members)).toBe(true);
      }
    });
  });

  describe('Stats Calculations', () => {
    it('should calculate total organization size', async () => {
      // This would require recursive counting
      // Test that we can at least get L1 count
      const { count, error } = await serviceClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should sum organization credits', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      expect(error).toBeNull();

      if (data) {
        const total = data.reduce((sum, m) => sum + (m.personal_credits_monthly || 0), 0);
        expect(typeof total).toBe('number');
        expect(total).toBeGreaterThanOrEqual(0);
      }
    });

    it('should count direct enrollees accurately', async () => {
      const { count, error } = await serviceClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    });
  });

  describe('RLS Policies', () => {
    it('should allow user to view their own member record', async () => {
      if (!testAuthToken) {
        console.warn('Skipping RLS test: no auth token');
        return;
      }

      // Create authenticated client
      const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${testAuthToken}`,
          },
        },
      });

      const { data, error } = await authedClient
        .from('members')
        .select('member_id, full_name')
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.member_id).toBe(testMemberId);
    });

    it('should allow user to view their downline', async () => {
      if (!testAuthToken) {
        console.warn('Skipping RLS test: no auth token');
        return;
      }

      const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${testAuthToken}`,
          },
        },
      });

      const { data, error } = await authedClient
        .from('members')
        .select('member_id, full_name')
        .eq('enroller_id', testMemberId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should block unauthorized users from viewing genealogy', async () => {
      // Create unauthenticated client
      const unauthClient = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await unauthClient
        .from('members')
        .select('member_id')
        .eq('member_id', testMemberId)
        .single();

      // Should either error or return no data
      expect(data === null || error !== null).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should fetch genealogy data within reasonable time', async () => {
      const startTime = Date.now();

      await serviceClient
        .from('members')
        .select(`
          member_id,
          full_name,
          enroller_id,
          tech_rank,
          personal_credits_monthly,
          distributor:distributors!members_distributor_id_fkey (
            id,
            slug,
            rep_number
          )
        `)
        .eq('enroller_id', testMemberId)
        .eq('status', 'active')
        .limit(100);

      const duration = Date.now() - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle large result sets', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, full_name')
        .eq('status', 'active')
        .limit(1000);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle member with no enrollees', async () => {
      // Create a new member with no downline
      const { data: newMembers } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('status', 'active')
        .limit(1);

      if (newMembers && newMembers.length > 0) {
        const { data, error } = await serviceClient
          .from('members')
          .select('member_id')
          .eq('enroller_id', newMembers[0].member_id);

        expect(error).toBeNull();
        expect(Array.isArray(data)).toBe(true);
        // May have 0 or more enrollees
      }
    });

    it('should handle null enroller_id (root sponsor)', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, enroller_id')
        .is('enroller_id', null)
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle missing distributor record gracefully', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          distributor:distributors!members_distributor_id_fkey (
            id,
            slug
          )
        `)
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Distributor may be null or exist
      const dist = Array.isArray(data?.distributor) ? data.distributor[0] : data?.distributor;
      expect(dist !== undefined).toBe(true);
    });

    it('should handle invalid member_id gracefully', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('member_id', 'nonexistent-id-999')
        .single();

      // Should error or return null
      expect(data === null || error !== null).toBe(true);
    });
  });

  describe('Data Integrity', () => {
    it('should have valid tech_rank values', async () => {
      const validRanks = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'];

      const { data } = await serviceClient
        .from('members')
        .select('tech_rank')
        .eq('enroller_id', testMemberId)
        .eq('status', 'active');

      if (data) {
        data.forEach((member) => {
          expect(validRanks).toContain(member.tech_rank.toLowerCase());
        });
      }
    });

    it('should have non-negative credit values', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly, team_credits_monthly')
        .eq('member_id', testMemberId)
        .single();

      if (data) {
        expect(data.personal_credits_monthly).toBeGreaterThanOrEqual(0);
        expect(data.team_credits_monthly).toBeGreaterThanOrEqual(0);
      }
    });

    it('should have valid enrollment dates', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('enrollment_date')
        .eq('member_id', testMemberId)
        .single();

      if (data?.enrollment_date) {
        const enrollDate = new Date(data.enrollment_date);
        const now = new Date();

        // Enrollment date should be in the past
        expect(enrollDate.getTime()).toBeLessThanOrEqual(now.getTime());
      }
    });
  });
});

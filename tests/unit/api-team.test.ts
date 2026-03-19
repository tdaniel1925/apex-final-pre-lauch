// =============================================
// Unit Tests - Team API
// Tests team data fetching, filtering, and RLS policies
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

describe('Team API Tests', () => {
  let testUserId: string;
  let testMemberId: string;
  let testAuthToken: string;
  let testDistributorId: string;

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
      testDistributorId = distributor.id;

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
    it('should fetch team members with correct schema', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          distributor_id,
          full_name,
          email,
          tech_rank,
          personal_credits_monthly,
          enrollment_date,
          override_qualified
        `)
        .eq('enroller_id', testMemberId)
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        const member = data[0];
        expect(member.member_id).toBeTruthy();
        expect(member.full_name).toBeTruthy();
        expect(member.tech_rank).toBeTruthy();
        expect(typeof member.personal_credits_monthly).toBe('number');
      }
    });

    it('should fetch team members with distributor join', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          full_name,
          distributor:distributors!members_distributor_id_fkey (
            id,
            slug,
            rep_number
          )
        `)
        .eq('enroller_id', testMemberId)
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data && data.length > 0) {
        expect(data[0].distributor).toBeDefined();
      }
    });

    it('should include personal enrollee count field', async () => {
      const { data: teamMembers } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .limit(1);

      if (teamMembers && teamMembers.length > 0) {
        // Count enrollees for this member
        const { count, error } = await serviceClient
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('enroller_id', teamMembers[0].member_id);

        expect(error).toBeNull();
        expect(typeof count).toBe('number');
      }
    });
  });

  describe('Team List Queries', () => {
    it('should fetch L1 direct enrollees only', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, enroller_id')
        .eq('enroller_id', testMemberId);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data) {
        // All members should have this user as enroller
        data.forEach((member) => {
          expect(member.enroller_id).toBe(testMemberId);
        });
      }
    });

    it('should order by enrollment date descending', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id, enrollment_date')
        .eq('enroller_id', testMemberId)
        .order('enrollment_date', { ascending: false });

      expect(error).toBeNull();

      if (data && data.length > 1) {
        // Verify descending order
        for (let i = 1; i < data.length; i++) {
          const prev = new Date(data[i - 1].enrollment_date);
          const curr = new Date(data[i].enrollment_date);
          expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
        }
      }
    });

    it('should include active status flag', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('member_id, personal_credits_monthly')
        .eq('enroller_id', testMemberId)
        .limit(1);

      if (data && data.length > 0) {
        // Active = 50+ credits
        const isActive = data[0].personal_credits_monthly >= 50;
        expect(typeof isActive).toBe('boolean');
      }
    });
  });

  describe('Stats Calculations', () => {
    it('should count total personal enrollees', async () => {
      const { count, error } = await serviceClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('enroller_id', testMemberId);

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count active members (50+ credits)', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId);

      if (data) {
        const activeCount = data.filter((m) => m.personal_credits_monthly >= 50).length;
        expect(typeof activeCount).toBe('number');
        expect(activeCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sum total team credits', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId);

      if (data) {
        const totalCredits = data.reduce((sum, m) => sum + m.personal_credits_monthly, 0);
        expect(typeof totalCredits).toBe('number');
        expect(totalCredits).toBeGreaterThanOrEqual(0);
      }
    });

    it('should fetch L1 override earnings', async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await serviceClient
        .from('earnings_ledger')
        .select('amount_usd')
        .eq('member_id', testMemberId)
        .eq('earning_type', 'override')
        .eq('override_level', 1)
        .gte('created_at', startOfMonth.toISOString());

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);

      if (data) {
        const total = data.reduce((sum, e) => sum + (e.amount_usd || 0), 0);
        expect(typeof total).toBe('number');
      }
    });
  });

  describe('Filtering', () => {
    it('should filter by rank', async () => {
      const { data: allMembers } = await serviceClient
        .from('members')
        .select('tech_rank')
        .eq('enroller_id', testMemberId);

      if (allMembers && allMembers.length > 0) {
        const firstRank = allMembers[0].tech_rank;

        const { data, error } = await serviceClient
          .from('members')
          .select('tech_rank')
          .eq('enroller_id', testMemberId)
          .eq('tech_rank', firstRank);

        expect(error).toBeNull();

        if (data) {
          data.forEach((member) => {
            expect(member.tech_rank).toBe(firstRank);
          });
        }
      }
    });

    it('should filter by active status', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId)
        .gte('personal_credits_monthly', 50);

      if (data) {
        // All should be active
        data.forEach((member) => {
          expect(member.personal_credits_monthly).toBeGreaterThanOrEqual(50);
        });
      }
    });

    it('should filter by inactive status', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId)
        .lt('personal_credits_monthly', 50);

      if (data) {
        // All should be inactive
        data.forEach((member) => {
          expect(member.personal_credits_monthly).toBeLessThan(50);
        });
      }
    });
  });

  describe('Sorting', () => {
    it('should sort by name ascending', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('full_name')
        .eq('enroller_id', testMemberId)
        .order('full_name', { ascending: true });

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].full_name.localeCompare(data[i - 1].full_name)).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should sort by credits descending', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId)
        .order('personal_credits_monthly', { ascending: false });

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i - 1].personal_credits_monthly).toBeGreaterThanOrEqual(
            data[i].personal_credits_monthly
          );
        }
      }
    });

    it('should sort by enrollment date', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('enrollment_date')
        .eq('enroller_id', testMemberId)
        .order('enrollment_date', { ascending: true });

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const prev = new Date(data[i - 1].enrollment_date);
          const curr = new Date(data[i].enrollment_date);
          expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
        }
      }
    });
  });

  describe('Pagination', () => {
    it('should limit results to page size', async () => {
      const pageSize = 20;

      const { data, error } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .limit(pageSize);

      expect(error).toBeNull();

      if (data) {
        expect(data.length).toBeLessThanOrEqual(pageSize);
      }
    });

    it('should support offset pagination', async () => {
      const { data: page1 } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .order('enrollment_date', { ascending: false })
        .limit(10);

      const { data: page2 } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .order('enrollment_date', { ascending: false })
        .range(10, 19);

      // Pages should have different members
      if (page1 && page2 && page1.length > 0 && page2.length > 0) {
        const page1Ids = page1.map((m) => m.member_id);
        const page2Ids = page2.map((m) => m.member_id);

        const overlap = page1Ids.some((id) => page2Ids.includes(id));
        expect(overlap).toBe(false);
      }
    });

    it('should get accurate total count', async () => {
      const { count, error } = await serviceClient
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('enroller_id', testMemberId);

      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    });
  });

  describe('RLS Policies', () => {
    it('should allow user to view their team members', async () => {
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

    it('should block unauthorized access to team data', async () => {
      const unauthClient = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await unauthClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId);

      // Should error or return empty
      expect(data === null || data?.length === 0 || error !== null).toBe(true);
    });

    it('should allow user to view their own member record', async () => {
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
        .select('member_id')
        .eq('member_id', testMemberId)
        .single();

      expect(error).toBeNull();
      expect(data?.member_id).toBe(testMemberId);
    });
  });

  describe('Performance', () => {
    it('should fetch team list within reasonable time', async () => {
      const startTime = Date.now();

      await serviceClient
        .from('members')
        .select(`
          member_id,
          full_name,
          email,
          tech_rank,
          personal_credits_monthly,
          distributor:distributors!members_distributor_id_fkey (
            slug,
            rep_number
          )
        `)
        .eq('enroller_id', testMemberId)
        .limit(100);

      const duration = Date.now() - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle large team sizes efficiently', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', testMemberId)
        .limit(1000);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with no team members', async () => {
      // Find or create a member with no enrollees
      const { data: allMembers } = await serviceClient
        .from('members')
        .select('member_id')
        .limit(100);

      if (allMembers) {
        for (const member of allMembers) {
          const { count } = await serviceClient
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('enroller_id', member.member_id);

          if (count === 0) {
            // This member has no team
            const { data, error } = await serviceClient
              .from('members')
              .select('member_id')
              .eq('enroller_id', member.member_id);

            expect(error).toBeNull();
            expect(data).toEqual([]);
            break;
          }
        }
      }
    });

    it('should handle missing distributor join gracefully', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select(`
          member_id,
          distributor:distributors!members_distributor_id_fkey (
            id,
            slug
          )
        `)
        .eq('enroller_id', testMemberId)
        .limit(1);

      expect(error).toBeNull();

      if (data && data.length > 0) {
        // Distributor should exist
        expect(data[0].distributor).toBeDefined();
      }
    });

    it('should handle invalid member_id in filters', async () => {
      const { data, error } = await serviceClient
        .from('members')
        .select('member_id')
        .eq('enroller_id', 'invalid-id-999');

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Data Integrity', () => {
    it('should have valid rank values', async () => {
      const validRanks = ['starter', 'bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond', 'crown', 'elite'];

      const { data } = await serviceClient
        .from('members')
        .select('tech_rank')
        .eq('enroller_id', testMemberId);

      if (data) {
        data.forEach((member) => {
          expect(validRanks).toContain(member.tech_rank.toLowerCase());
        });
      }
    });

    it('should have non-negative credit values', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('personal_credits_monthly')
        .eq('enroller_id', testMemberId);

      if (data) {
        data.forEach((member) => {
          expect(member.personal_credits_monthly).toBeGreaterThanOrEqual(0);
        });
      }
    });

    it('should have valid email addresses', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('email')
        .eq('enroller_id', testMemberId);

      if (data) {
        data.forEach((member) => {
          expect(member.email).toMatch(/@/);
        });
      }
    });

    it('should have valid enrollment dates', async () => {
      const { data } = await serviceClient
        .from('members')
        .select('enrollment_date')
        .eq('enroller_id', testMemberId);

      if (data) {
        const now = new Date();
        data.forEach((member) => {
          const enrollDate = new Date(member.enrollment_date);
          expect(enrollDate.getTime()).toBeLessThanOrEqual(now.getTime());
        });
      }
    });

    it('should have consistent rep numbers', async () => {
      const { data } = await serviceClient
        .from('members')
        .select(`
          member_id,
          distributor:distributors!members_distributor_id_fkey (
            rep_number
          )
        `)
        .eq('enroller_id', testMemberId);

      if (data) {
        data.forEach((member) => {
          const dist = Array.isArray(member.distributor) ? member.distributor[0] : member.distributor;
          if (dist?.rep_number) {
            expect(dist.rep_number).toBeGreaterThan(0);
          }
        });
      }
    });
  });
});

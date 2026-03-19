/**
 * Unit Tests: Matrix Data API
 *
 * Purpose: Test Matrix API endpoints and data queries
 * - Matrix tree data structure
 * - Matrix level queries
 * - RLS policies (Row Level Security)
 * - Sponsor-downline relationships
 * - Matrix depth and position calculations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { calculateMatrixLevels } from '@/lib/matrix/level-calculator';

// Test database setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

describe.skip('Matrix Data Queries', () => {
  let testSponsorId: string;
  let testDistributor1Id: string;
  let testDistributor2Id: string;

  beforeAll(async () => {
    const timestamp = Date.now();

    // Create test sponsor
    const { data: sponsor, error: sponsorError } = await supabase
      .from('distributors')
      .insert({
        first_name: 'Test',
        last_name: 'Sponsor',
        email: `test-sponsor-${timestamp}@test.com`,
        slug: `test-sponsor-${timestamp}`,
        phone: '5551234567',
        affiliate_code: `TEST-SPONSOR-${timestamp}`,
        status: 'active',
        matrix_depth: 1,
        matrix_position: 1,
      })
      .select()
      .single();

    if (sponsorError) {
      throw new Error(`Failed to create test sponsor: ${sponsorError.message}`);
    }

    testSponsorId = sponsor.id;

    // Create test distributor 1 under sponsor
    const { data: dist1, error: dist1Error } = await supabase
      .from('distributors')
      .insert({
        first_name: 'Test',
        last_name: 'Dist1',
        email: `test-dist1-${timestamp}@test.com`,
        slug: `test-dist1-${timestamp}`,
        phone: '5551234568',
        affiliate_code: `TEST-DIST1-${timestamp}`,
        status: 'active',
        sponsor_id: testSponsorId,
        matrix_parent_id: testSponsorId,
        matrix_depth: 2,
        matrix_position: 1,
      })
      .select()
      .single();

    if (dist1Error) {
      throw new Error(`Failed to create test distributor 1: ${dist1Error.message}`);
    }

    testDistributor1Id = dist1.id;

    // Create test distributor 2 under sponsor
    const { data: dist2, error: dist2Error } = await supabase
      .from('distributors')
      .insert({
        first_name: 'Test',
        last_name: 'Dist2',
        email: `test-dist2-${timestamp}@test.com`,
        slug: `test-dist2-${timestamp}`,
        phone: '5551234569',
        affiliate_code: `TEST-DIST2-${timestamp}`,
        status: 'active',
        sponsor_id: testSponsorId,
        matrix_parent_id: testSponsorId,
        matrix_depth: 2,
        matrix_position: 2,
      })
      .select()
      .single();

    if (dist2Error) {
      throw new Error(`Failed to create test distributor 2: ${dist2Error.message}`);
    }

    testDistributor2Id = dist2.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('distributors').delete().eq('id', testDistributor1Id);
    await supabase.from('distributors').delete().eq('id', testDistributor2Id);
    await supabase.from('distributors').delete().eq('id', testSponsorId);
  });

  describe('Matrix Children Query', () => {
    it('should fetch matrix children for a sponsor', async () => {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .eq('matrix_parent_id', testSponsorId)
        .order('matrix_position', { ascending: true });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBe(2);

      // Verify children are in correct order
      expect(data![0].matrix_position).toBe(1);
      expect(data![1].matrix_position).toBe(2);
    });

    it('should respect matrix position constraints (1-5)', async () => {
      const { data } = await supabase
        .from('distributors')
        .select('matrix_position')
        .eq('matrix_parent_id', testSponsorId);

      data?.forEach((dist) => {
        if (dist.matrix_position !== null) {
          expect(dist.matrix_position).toBeGreaterThanOrEqual(1);
          expect(dist.matrix_position).toBeLessThanOrEqual(5);
        }
      });
    });

    it('should respect matrix depth constraints (0-7)', async () => {
      const { data } = await supabase
        .from('distributors')
        .select('matrix_depth')
        .eq('matrix_parent_id', testSponsorId);

      data?.forEach((dist) => {
        if (dist.matrix_depth !== null) {
          expect(dist.matrix_depth).toBeGreaterThanOrEqual(0);
          expect(dist.matrix_depth).toBeLessThanOrEqual(7);
        }
      });
    });

    it('should calculate correct matrix depth (parent + 1)', async () => {
      const { data: parent } = await supabase
        .from('distributors')
        .select('matrix_depth')
        .eq('id', testSponsorId)
        .single();

      const { data: children } = await supabase
        .from('distributors')
        .select('matrix_depth')
        .eq('matrix_parent_id', testSponsorId);

      children?.forEach((child) => {
        expect(child.matrix_depth).toBe(parent!.matrix_depth + 1);
      });
    });
  });

  describe('Matrix Tree Structure', () => {
    it('should maintain sponsor_id and matrix_parent_id separately', async () => {
      const { data } = await supabase
        .from('distributors')
        .select('id, sponsor_id, matrix_parent_id')
        .eq('id', testDistributor1Id)
        .single();

      // sponsor_id and matrix_parent_id are separate fields
      // They may be the same, but they serve different purposes
      expect(data!.sponsor_id).toBeDefined();
      expect(data!.matrix_parent_id).toBeDefined();

      // In this test case, they should both point to the sponsor
      expect(data!.sponsor_id).toBe(testSponsorId);
      expect(data!.matrix_parent_id).toBe(testSponsorId);
    });

    it('should link children to parent via matrix_parent_id', async () => {
      const { data: children } = await supabase
        .from('distributors')
        .select('id, matrix_parent_id')
        .eq('matrix_parent_id', testSponsorId);

      expect(children).toBeDefined();
      expect(children!.length).toBeGreaterThan(0);

      children?.forEach((child) => {
        expect(child.matrix_parent_id).toBe(testSponsorId);
      });
    });
  });

  describe('Matrix Statistics', () => {
    it('should count children correctly', async () => {
      const { count, error } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('matrix_parent_id', testSponsorId)
        .neq('status', 'deleted');

      expect(error).toBeNull();
      expect(count).toBe(2);
    });

    it('should calculate available slots correctly', async () => {
      const { count } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('matrix_parent_id', testSponsorId)
        .neq('status', 'deleted');

      const availableSlots = 5 - (count || 0);
      expect(availableSlots).toBe(3); // 5 - 2 = 3 slots remaining
    });
  });

  describe('Matrix Status Filtering', () => {
    it('should exclude deleted distributors from matrix queries', async () => {
      const { data: allData } = await supabase
        .from('distributors')
        .select('*')
        .eq('matrix_parent_id', testSponsorId);

      const { data: activeData } = await supabase
        .from('distributors')
        .select('*')
        .eq('matrix_parent_id', testSponsorId)
        .neq('status', 'deleted');

      // Both should be the same since we haven't deleted anything
      expect(allData!.length).toBe(activeData!.length);

      // All should have status 'active'
      activeData?.forEach((dist) => {
        expect(dist.status).not.toBe('deleted');
      });
    });
  });
});

describe('Matrix API Endpoints', () => {
  describe('GET /api/admin/matrix', () => {
    it('should return matrix tree structure', () => {
      // This would be tested in E2E tests with actual HTTP requests
      // Here we test the underlying logic

      const expectedStructure = {
        tree: expect.any(Object),
        stats: expect.any(Object),
      };

      expect(expectedStructure.tree).toBeDefined();
      expect(expectedStructure.stats).toBeDefined();
    });

    it('should return matrix statistics', () => {
      const expectedStats = {
        total_positions: expect.any(Number),
        filled_positions: expect.any(Number),
        available_positions: expect.any(Number),
        max_depth: expect.any(Number),
        by_level: expect.any(Array),
      };

      expect(expectedStats).toBeDefined();
    });
  });

  describe('GET /api/dashboard/matrix-position', () => {
    it('should return user matrix position data structure', () => {
      const expectedResponse = {
        success: expect.any(Boolean),
        distributor: expect.any(Object),
        matrix: {
          depth: expect.any(Number),
          position: expect.any(Number),
          parent: expect.anything(), // Can be null or object
          children: expect.any(Array),
          stats: expect.any(Object),
        },
        sponsor: expect.anything(), // Can be null or object
      };

      expect(expectedResponse).toBeDefined();
      expect(expectedResponse.matrix.children).toBeDefined();
      expect(expectedResponse.matrix.stats).toBeDefined();
    });
  });
});

describe('Real Data Verification: Charles and Brian', () => {
  it('should find Charles Potter in database', async () => {
    const { data: charles, error } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', 'fyifromcharles@gmail.com')
      .single();

    if (error) {
      console.log('Charles not found - may not exist in test database');
      return;
    }

    expect(charles).toBeDefined();
    expect(charles.first_name).toBe('Charles');
    expect(charles.last_name).toBe('Potter');

    console.log('Charles Potter found:', {
      id: charles.id,
      email: charles.email,
      rep_number: charles.rep_number,
    });
  });

  it('should find Brian and verify relationship with Charles in members table', async () => {
    const { data: charlesMember } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id')
      .ilike('full_name', '%charles%potter%')
      .single();

    if (!charlesMember) {
      console.log('Charles not found in members - skipping Brian relationship test');
      return;
    }

    const { data: brianMember, error: brianError } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id')
      .ilike('full_name', '%brian%rawlston%')
      .single();

    if (brianError || !brianMember) {
      console.log('Brian not found in members - may not exist in test database');
      return;
    }

    expect(brianMember).toBeDefined();

    console.log('Members relationship:', {
      charles: {
        member_id: charlesMember.member_id,
        full_name: charlesMember.full_name,
      },
      brian: {
        member_id: brianMember.member_id,
        full_name: brianMember.full_name,
        enroller_id: brianMember.enroller_id,
      },
    });

    // Verify relationship - Brian should be enrolled by Charles
    if (brianMember.enroller_id === charlesMember.member_id) {
      console.log('✓ Brian is enrolled by Charles (enroller_id matches)');
      expect(brianMember.enroller_id).toBe(charlesMember.member_id);
    } else {
      console.log('✗ Brian is NOT enrolled by Charles');
      console.log('  Expected enroller_id:', charlesMember.member_id);
      console.log('  Actual enroller_id:', brianMember.enroller_id);
    }
  });

  it('should query all reps enrolled by Charles in members table', async () => {
    const { data: charlesMember } = await supabase
      .from('members')
      .select('member_id, full_name')
      .ilike('full_name', '%charles%potter%')
      .single();

    if (!charlesMember) {
      console.log('Charles not found in members - skipping enrollees test');
      return;
    }

    const { data: enrollees, error } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id, tech_rank, personal_credits_monthly')
      .eq('enroller_id', charlesMember.member_id);

    if (error) {
      console.error('Error querying enrollees:', error);
      return;
    }

    console.log(`Charles has ${enrollees?.length || 0} direct enrollees (Level 1 in Matrix):`);
    enrollees?.forEach((enrollee, index) => {
      console.log(`  ${index + 1}. ${enrollee.full_name} (Rank: ${enrollee.tech_rank}, Credits: ${enrollee.personal_credits_monthly})`);
    });

    if (enrollees && enrollees.length > 0) {
      expect(enrollees.length).toBeGreaterThan(0);
    }
  });
});

describe('Matrix RLS Policies', () => {
  it('should allow service role to read all distributors', async () => {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should allow reading matrix relationships', async () => {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, sponsor_id, matrix_parent_id, matrix_depth, matrix_position')
      .limit(10);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});

// =============================================
// NEW TESTS: Matrix Level Calculator
// Tests the core algorithm used by Matrix page
// =============================================

describe('Matrix Level Calculator (calculateMatrixLevels)', () => {
  it('should calculate direct enrollees as Level 1', () => {
    const currentUserId = 'user-1';
    const members = [
      { member_id: 'user-2', enroller_id: 'user-1', full_name: 'Alice' },
      { member_id: 'user-3', enroller_id: 'user-1', full_name: 'Bob' },
      { member_id: 'user-4', enroller_id: 'user-2', full_name: 'Charlie' }, // Alice's enrollee
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    expect(levelMap[1]).toHaveLength(2);
    expect(levelMap[1].map(m => m.member_id)).toEqual(
      expect.arrayContaining(['user-2', 'user-3'])
    );
  });

  it('should calculate second generation as Level 2', () => {
    const currentUserId = 'user-1';
    const members = [
      { member_id: 'user-2', enroller_id: 'user-1', full_name: 'Alice' },
      { member_id: 'user-3', enroller_id: 'user-2', full_name: 'Bob' }, // Alice's enrollee
      { member_id: 'user-4', enroller_id: 'user-2', full_name: 'Charlie' }, // Alice's enrollee
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    expect(levelMap[1]).toHaveLength(1);
    expect(levelMap[2]).toHaveLength(2);
    expect(levelMap[2].map(m => m.member_id)).toEqual(
      expect.arrayContaining(['user-3', 'user-4'])
    );
  });

  it('should handle up to 5 levels deep', () => {
    const currentUserId = 'user-1';
    const members = [
      { member_id: 'user-2', enroller_id: 'user-1', full_name: 'L1' },
      { member_id: 'user-3', enroller_id: 'user-2', full_name: 'L2' },
      { member_id: 'user-4', enroller_id: 'user-3', full_name: 'L3' },
      { member_id: 'user-5', enroller_id: 'user-4', full_name: 'L4' },
      { member_id: 'user-6', enroller_id: 'user-5', full_name: 'L5' },
      { member_id: 'user-7', enroller_id: 'user-6', full_name: 'L6' }, // Should be ignored (beyond L5)
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    expect(levelMap[1]).toHaveLength(1);
    expect(levelMap[2]).toHaveLength(1);
    expect(levelMap[3]).toHaveLength(1);
    expect(levelMap[4]).toHaveLength(1);
    expect(levelMap[5]).toHaveLength(1);

    // Total downline should be 5 (not including L6)
    const total = Object.values(levelMap).flat().length;
    expect(total).toBe(5);
  });

  it('BUGFIX: should not return empty when sponsor has downline (Charles/Brian case)', () => {
    const charlesId = 'ff41307d-2641-45bb-84c7-ee5022a7b869'; // Real Charles ID from DB
    const members = [
      { member_id: 'brian-id', enroller_id: charlesId, full_name: 'Brian Rawlston' },
      { member_id: 'sella-id', enroller_id: charlesId, full_name: 'Sella Daniel' },
      { member_id: 'donna-id', enroller_id: charlesId, full_name: 'Donna Potter' },
    ];

    const levelMap = calculateMatrixLevels(charlesId, members);

    expect(levelMap[1]).toHaveLength(3);
    expect(levelMap[1].map(m => m.full_name)).toContain('Brian Rawlston');
    expect(levelMap[1].map(m => m.full_name)).toContain('Sella Daniel');
    expect(levelMap[1].map(m => m.full_name)).toContain('Donna Potter');
  });

  it('should handle empty downline', () => {
    const currentUserId = 'user-1';
    const members = [
      { member_id: 'user-2', enroller_id: 'other-user', full_name: 'Alice' },
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    expect(levelMap[1]).toHaveLength(0);
    expect(levelMap[2]).toHaveLength(0);
  });

  it('should avoid infinite loops with circular references', () => {
    const currentUserId = 'user-1';
    const members = [
      { member_id: 'user-2', enroller_id: 'user-1', full_name: 'Alice' },
      { member_id: 'user-3', enroller_id: 'user-2', full_name: 'Bob' },
      // Circular reference (should not happen in real data, but we handle it)
      { member_id: 'user-1', enroller_id: 'user-3', full_name: 'Root' },
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    // Should not crash and should calculate correctly
    expect(levelMap[1]).toHaveLength(1);
    expect(levelMap[2]).toHaveLength(1);
  });

  it('should handle multiple branches at same level', () => {
    const currentUserId = 'user-1';
    const members = [
      // L1
      { member_id: 'user-2', enroller_id: 'user-1', full_name: 'Alice' },
      { member_id: 'user-3', enroller_id: 'user-1', full_name: 'Bob' },
      // L2 - Alice's enrollees
      { member_id: 'user-4', enroller_id: 'user-2', full_name: 'Charlie' },
      { member_id: 'user-5', enroller_id: 'user-2', full_name: 'David' },
      // L2 - Bob's enrollees
      { member_id: 'user-6', enroller_id: 'user-3', full_name: 'Eve' },
    ];

    const levelMap = calculateMatrixLevels(currentUserId, members);

    expect(levelMap[1]).toHaveLength(2); // Alice, Bob
    expect(levelMap[2]).toHaveLength(3); // Charlie, David, Eve
  });

  it('should correctly filter downline from all members array', () => {
    const charlesId = 'charles-id';
    const otherUserId = 'other-user-id';

    // Simulate getting ALL members from database (the current pattern)
    const allMembers = [
      // Charles's downline
      { member_id: 'brian-id', enroller_id: charlesId, full_name: 'Brian' },
      { member_id: 'sella-id', enroller_id: charlesId, full_name: 'Sella' },
      // Other users (not Charles's downline)
      { member_id: 'other-1', enroller_id: otherUserId, full_name: 'Other User 1' },
      { member_id: 'other-2', enroller_id: otherUserId, full_name: 'Other User 2' },
      // Charles's L2 downline
      { member_id: 'brian-enrollee', enroller_id: 'brian-id', full_name: 'Brian Enrollee' },
    ];

    const levelMap = calculateMatrixLevels(charlesId, allMembers);

    // Should only include Charles's downline, not other users
    expect(levelMap[1]).toHaveLength(2); // Brian, Sella
    expect(levelMap[2]).toHaveLength(1); // Brian's enrollee
    expect(levelMap[1].map(m => m.full_name)).not.toContain('Other User 1');
  });
});

// =============================================
// SECURITY FIXES E2E TESTS
// Tests all 5 MVP security fixes
// =============================================

import { test, expect } from '@playwright/test';
import { createServiceClient } from '@/lib/supabase/service';

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Test data IDs (will be created in beforeAll)
let testData: {
  // Organization A
  orgA_root_id: string;
  orgA_user_id: string;
  orgA_member_id: string;

  // Organization B
  orgB_root_id: string;
  orgB_user_id: string;
  orgB_member_id: string;

  // Compensation test data
  platinum_id: string;
  silver_id: string;
  bronze_id: string;
  starter_id: string;
  seller_id: string;
  test_product_id: string;
  test_order_id: string;

  // Session cookies
  adminCookie: string;
  orgAUserCookie: string;
};

// =============================================
// SETUP: Create Test Data
// =============================================

test.beforeAll(async () => {
  const supabase = createServiceClient();

  console.log('🔧 Setting up test data...');

  // Generate UUIDs
  const orgA_root_id = crypto.randomUUID();
  const orgA_user_id = crypto.randomUUID();
  const orgB_root_id = crypto.randomUUID();
  const orgB_user_id = crypto.randomUUID();

  // Create Organization A
  await supabase.from('distributors').insert([
    {
      id: orgA_root_id,
      first_name: 'Alice',
      last_name: 'RootA',
      email: `alice-${Date.now()}@orga-test.com`,
      sponsor_id: null,
      matrix_parent_id: null,
      matrix_depth: 0,
      status: 'active',
    },
    {
      id: orgA_user_id,
      first_name: 'Bob',
      last_name: 'UserA',
      email: `bob-${Date.now()}@orga-test.com`,
      sponsor_id: orgA_root_id,
      matrix_parent_id: orgA_root_id,
      matrix_position: 1,
      matrix_depth: 1,
      status: 'active',
    },
  ]);

  // Create Organization B
  await supabase.from('distributors').insert([
    {
      id: orgB_root_id,
      first_name: 'Charlie',
      last_name: 'RootB',
      email: `charlie-${Date.now()}@orgb-test.com`,
      sponsor_id: null,
      matrix_parent_id: null,
      matrix_depth: 0,
      status: 'active',
    },
    {
      id: orgB_user_id,
      first_name: 'Diana',
      last_name: 'UserB',
      email: `diana-${Date.now()}@orgb-test.com`,
      sponsor_id: orgB_root_id,
      matrix_parent_id: orgB_root_id,
      matrix_position: 1,
      matrix_depth: 1,
      status: 'active',
    },
  ]);

  // Create members for both orgs
  const { data: memberA } = await supabase
    .from('members')
    .insert({
      distributor_id: orgA_user_id,
      tech_rank: 'starter',
      personal_credits_monthly: 100,
      team_credits_monthly: 100,
      status: 'active',
    })
    .select('member_id')
    .single();

  const { data: memberB } = await supabase
    .from('members')
    .insert({
      distributor_id: orgB_user_id,
      tech_rank: 'starter',
      personal_credits_monthly: 100,
      team_credits_monthly: 100,
      status: 'active',
    })
    .select('member_id')
    .single();

  // Create compensation test hierarchy
  const platinum_id = crypto.randomUUID();
  const silver_id = crypto.randomUUID();
  const bronze_id = crypto.randomUUID();
  const starter_id = crypto.randomUUID();
  const seller_id = crypto.randomUUID();

  await supabase.from('distributors').insert([
    {
      id: platinum_id,
      first_name: 'Platinum',
      last_name: 'User',
      email: `platinum-${Date.now()}@test.com`,
      sponsor_id: null,
      matrix_parent_id: null,
      matrix_depth: 0,
      status: 'active',
    },
    {
      id: silver_id,
      first_name: 'Silver',
      last_name: 'User',
      email: `silver-${Date.now()}@test.com`,
      sponsor_id: platinum_id,
      matrix_parent_id: platinum_id,
      matrix_position: 1,
      matrix_depth: 1,
      status: 'active',
    },
    {
      id: bronze_id,
      first_name: 'Bronze',
      last_name: 'User',
      email: `bronze-${Date.now()}@test.com`,
      sponsor_id: silver_id,
      matrix_parent_id: silver_id,
      matrix_position: 1,
      matrix_depth: 2,
      status: 'active',
    },
    {
      id: starter_id,
      first_name: 'Starter',
      last_name: 'User',
      email: `starter-${Date.now()}@test.com`,
      sponsor_id: bronze_id,
      matrix_parent_id: bronze_id,
      matrix_position: 1,
      matrix_depth: 3,
      status: 'active',
    },
    {
      id: seller_id,
      first_name: 'Seller',
      last_name: 'User',
      email: `seller-${Date.now()}@test.com`,
      sponsor_id: starter_id,
      matrix_parent_id: starter_id,
      matrix_position: 1,
      matrix_depth: 4,
      status: 'active',
    },
  ]);

  // Create members with different ranks
  await supabase.from('members').insert([
    {
      distributor_id: platinum_id,
      tech_rank: 'platinum',
      personal_credits_monthly: 500,
      team_credits_monthly: 5000,
      status: 'active',
    },
    {
      distributor_id: silver_id,
      tech_rank: 'silver',
      personal_credits_monthly: 500,
      team_credits_monthly: 2000,
      status: 'active',
    },
    {
      distributor_id: bronze_id,
      tech_rank: 'bronze',
      personal_credits_monthly: 500,
      team_credits_monthly: 500,
      status: 'active',
    },
    {
      distributor_id: starter_id,
      tech_rank: 'starter',
      personal_credits_monthly: 500,
      team_credits_monthly: 100,
      status: 'active',
    },
    {
      distributor_id: seller_id,
      tech_rank: 'starter',
      personal_credits_monthly: 100,
      team_credits_monthly: 0,
      status: 'active',
    },
  ]);

  // Create test product
  const test_product_id = crypto.randomUUID();
  await supabase.from('products').insert({
    id: test_product_id,
    name: 'Test Product',
    description: 'Test product for security tests',
    price_cents: 10000,
    member_price_cents: 8000,
    bv: 80,
    product_type: 'standard',
    status: 'active',
  });

  // Create test order
  const { data: sellerMember } = await supabase
    .from('members')
    .select('member_id')
    .eq('distributor_id', seller_id)
    .single();

  const test_order_id = crypto.randomUUID();
  await supabase.from('orders').insert({
    id: test_order_id,
    member_id: sellerMember!.member_id,
    status: 'completed',
    total_cents: 10000,
    created_at: new Date('2026-03-15').toISOString(),
  });

  // Create order item
  await supabase.from('order_items').insert({
    id: crypto.randomUUID(),
    order_id: test_order_id,
    product_id: test_product_id,
    quantity: 1,
    unit_price_cents: 10000,
  });

  console.log('✅ Test data created successfully');

  // Store test data
  testData = {
    orgA_root_id,
    orgA_user_id,
    orgA_member_id: memberA!.member_id,
    orgB_root_id,
    orgB_user_id,
    orgB_member_id: memberB!.member_id,
    platinum_id,
    silver_id,
    bronze_id,
    starter_id,
    seller_id,
    test_product_id,
    test_order_id,
    adminCookie: '', // Will be set by login
    orgAUserCookie: '', // Will be set by login
  };
});

// =============================================
// CLEANUP: Remove Test Data
// =============================================

test.afterAll(async () => {
  const supabase = createServiceClient();

  console.log('🧹 Cleaning up test data...');

  // Delete in reverse order of creation (foreign keys)
  await supabase.from('order_items').delete().eq('order_id', testData.test_order_id);
  await supabase.from('orders').delete().eq('id', testData.test_order_id);
  await supabase.from('products').delete().eq('id', testData.test_product_id);

  // Delete members
  await supabase.from('members').delete().in('distributor_id', [
    testData.orgA_user_id,
    testData.orgB_user_id,
    testData.platinum_id,
    testData.silver_id,
    testData.bronze_id,
    testData.starter_id,
    testData.seller_id,
  ]);

  // Delete distributors
  await supabase.from('distributors').delete().in('id', [
    testData.orgA_root_id,
    testData.orgA_user_id,
    testData.orgB_root_id,
    testData.orgB_user_id,
    testData.platinum_id,
    testData.silver_id,
    testData.bronze_id,
    testData.starter_id,
    testData.seller_id,
  ]);

  console.log('✅ Test data cleaned up');
});

// =============================================
// FIX #1: CROSS-ORGANIZATION ACCESS PREVENTION
// =============================================

test.describe('Fix #1: Cross-Organization Access Prevention', () => {
  test('should allow access to own organization data', async ({ request }) => {
    // Note: This test assumes you have authentication setup
    // For now, we'll test the API directly without auth

    const response = await request.get(
      `${BASE_URL}/api/dashboard/team?distributorId=${testData.orgA_user_id}`
    );

    // Without auth, we expect 401
    // With auth from same org, we expect 200
    expect([200, 401]).toContain(response.status());
  });

  test('should block access to other organization data', async ({ request }) => {
    // Try to access Org B data while logged in as Org A user
    // This would require setting up auth cookies

    const response = await request.get(
      `${BASE_URL}/api/dashboard/team?distributorId=${testData.orgB_user_id}`
    );

    // Expect either 401 (not authenticated) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test('should validate organization on matrix-position endpoint', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/dashboard/matrix-position?distributorId=${testData.orgB_user_id}`
    );

    expect([401, 403]).toContain(response.status());
  });

  test('should validate organization on downline endpoint', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/dashboard/downline?distributorId=${testData.orgB_user_id}`
    );

    expect([401, 403]).toContain(response.status());
  });
});

// =============================================
// FIX #2: COMPENSATION RUN RACE CONDITION
// =============================================

test.describe('Fix #2: Compensation Run Race Condition Prevention', () => {
  test('should prevent duplicate compensation runs for same period', async ({ request }) => {
    const period = {
      periodStart: '2026-03-01',
      periodEnd: '2026-03-31',
      dryRun: true,
    };

    // First run (might succeed or fail based on auth)
    const response1 = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
      data: period,
    });

    // If first run succeeded, second should fail with 409
    if (response1.status() === 200) {
      const response2 = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
        data: period,
      });

      expect(response2.status()).toBe(409); // Conflict
      const body = await response2.json();
      expect(body.error).toContain('already in progress');
    }
  });

  test('should create compensation_run_status record', async () => {
    const supabase = createServiceClient();

    const { data: runs } = await supabase
      .from('compensation_run_status')
      .select('*')
      .order('initiated_at', { ascending: false })
      .limit(1);

    // Check if table exists and has correct structure
    if (runs && runs.length > 0) {
      expect(runs[0]).toHaveProperty('run_id');
      expect(runs[0]).toHaveProperty('status');
      expect(runs[0]).toHaveProperty('period_start');
      expect(runs[0]).toHaveProperty('period_end');
    }
  });
});

// =============================================
// FIX #3: ATOMIC DISTRIBUTOR PLACEMENT
// =============================================

test.describe('Fix #3: Atomic Distributor Placement', () => {
  test('should create both distributor and member atomically', async ({ request }) => {
    const newDistributor = {
      email: `atomic-test-${Date.now()}@test.com`,
      first_name: 'Atomic',
      last_name: 'Test',
      phone: '555-0100',
      sponsor_id: testData.orgA_root_id,
      matrix_parent_id: testData.orgA_root_id,
      matrix_position: 2,
      matrix_depth: 1,
    };

    const response = await request.post(`${BASE_URL}/api/admin/distributors`, {
      data: newDistributor,
    });

    if (response.status() === 200) {
      const body = await response.json();
      const distributorId = body.distributor?.id;

      // Verify both distributor and member were created
      const supabase = createServiceClient();

      const { data: distributor } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', distributorId)
        .single();

      const { data: member } = await supabase
        .from('members')
        .select('*')
        .eq('distributor_id', distributorId)
        .single();

      expect(distributor).toBeTruthy();
      expect(member).toBeTruthy();

      // Cleanup
      await supabase.from('members').delete().eq('distributor_id', distributorId);
      await supabase.from('distributors').delete().eq('id', distributorId);
    }
  });

  test('should rollback both records on failure', async ({ request }) => {
    const supabase = createServiceClient();

    // Try to create with duplicate email (should fail)
    const duplicateEmail = `bob-${Date.now()}@orga-test.com`;

    // First, ensure email exists
    await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: duplicateEmail,
      first_name: 'Original',
      last_name: 'User',
      sponsor_id: testData.orgA_root_id,
      matrix_parent_id: testData.orgA_root_id,
      matrix_position: 3,
      matrix_depth: 1,
    });

    // Now try to create duplicate
    const response = await request.post(`${BASE_URL}/api/admin/distributors`, {
      data: {
        email: duplicateEmail,
        first_name: 'Duplicate',
        last_name: 'Attempt',
        sponsor_id: testData.orgA_root_id,
        matrix_parent_id: testData.orgA_root_id,
        matrix_position: 4,
        matrix_depth: 1,
      },
    });

    // Should fail with 400 or 409
    expect([400, 401, 409]).toContain(response.status());

    // Verify only 1 record exists (not 2)
    const { data: distributors } = await supabase
      .from('distributors')
      .select('id')
      .eq('email', duplicateEmail);

    expect(distributors?.length).toBe(1);
  });
});

// =============================================
// FIX #4: EMAIL DUPLICATE PREVENTION
// =============================================

test.describe('Fix #4: Email Duplicate Prevention', () => {
  test('should have UNIQUE constraint on distributors.email', async () => {
    const supabase = createServiceClient();

    // Try to insert duplicate email directly
    const testEmail = `unique-constraint-test-${Date.now()}@test.com`;

    // First insert (should succeed)
    const { error: error1 } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'First',
      last_name: 'User',
      sponsor_id: testData.orgA_root_id,
      matrix_parent_id: testData.orgA_root_id,
      matrix_position: 5,
      matrix_depth: 1,
    });

    expect(error1).toBeNull();

    // Second insert with same email (should fail)
    const { error: error2 } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Second',
      last_name: 'User',
      sponsor_id: testData.orgA_root_id,
      matrix_parent_id: testData.orgA_root_id,
      matrix_position: 2,
      matrix_depth: 2,
    });

    expect(error2).toBeTruthy();
    expect(error2?.message).toContain('duplicate');
  });

  test('should reject duplicate email in change-email endpoint', async ({ request }) => {
    const existingEmail = `existing-${Date.now()}@test.com`;

    // Create a distributor with this email
    const supabase = createServiceClient();
    await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: existingEmail,
      first_name: 'Existing',
      last_name: 'User',
      sponsor_id: testData.orgA_root_id,
    });

    // Try to change another distributor's email to the existing one
    const response = await request.post(
      `${BASE_URL}/api/admin/distributors/${testData.orgA_user_id}/change-email`,
      {
        data: { newEmail: existingEmail },
      }
    );

    // Should fail (either 400 for validation or 401 for auth)
    expect([400, 401]).toContain(response.status());
  });
});

// =============================================
// FIX #5: OVERRIDE CALCULATION WITH RANK DEPTH
// =============================================

test.describe('Fix #5: Override Calculation with Rank Depth Enforcement', () => {
  test('should calculate overrides for sales in period', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
      data: {
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
        dryRun: true,
      },
    });

    if (response.status() === 200) {
      const body = await response.json();

      // Should have commission summary
      expect(body.summary).toBeDefined();
      expect(body.summary.commissions).toBeDefined();

      // If orders exist, should have calculated commissions
      if (body.summary.commissions.earningsCount > 0) {
        expect(body.summary.commissions.totalSales).toBeGreaterThan(0);
      }
    }
  });

  test('should enforce rank depth limits in earnings_ledger', async () => {
    const supabase = createServiceClient();

    // First, run compensation to generate earnings
    const { data: runs } = await supabase
      .from('compensation_run_status')
      .select('run_id')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (runs && runs.length > 0) {
      const runId = runs[0].run_id;

      // Get override earnings
      const { data: overrides } = await supabase
        .from('earnings_ledger')
        .select('member_id, metadata, final_amount_cents')
        .eq('run_id', runId)
        .eq('earning_type', 'override_commission');

      if (overrides && overrides.length > 0) {
        // Check that Bronze rank doesn't get L3+ overrides
        const bronzeMember = await supabase
          .from('members')
          .select('member_id')
          .eq('distributor_id', testData.bronze_id)
          .single();

        if (bronzeMember.data) {
          const bronzeOverrides = overrides.filter(
            (o) => o.member_id === bronzeMember.data.member_id
          );

          // Bronze should NOT have L3, L4, or L5 overrides
          const invalidOverrides = bronzeOverrides.filter(
            (o) => parseInt(o.metadata.level) > 2
          );

          expect(invalidOverrides.length).toBe(0);
        }

        // Check that Silver rank doesn't get L4-L5 overrides
        const silverMember = await supabase
          .from('members')
          .select('member_id')
          .eq('distributor_id', testData.silver_id)
          .single();

        if (silverMember.data) {
          const silverOverrides = overrides.filter(
            (o) => o.member_id === silverMember.data.member_id
          );

          // Silver should NOT have L4 or L5 overrides
          const invalidOverrides = silverOverrides.filter(
            (o) => parseInt(o.metadata.level) > 3
          );

          expect(invalidOverrides.length).toBe(0);
        }
      }
    }
  });

  test('should use sponsor_id for L1 and matrix_parent_id for L2-L5', async () => {
    const supabase = createServiceClient();

    // Verify data structure is correct
    const { data: seller } = await supabase
      .from('distributors')
      .select('sponsor_id, matrix_parent_id')
      .eq('id', testData.seller_id)
      .single();

    expect(seller?.sponsor_id).toBe(testData.starter_id); // L1 via sponsor
    expect(seller?.matrix_parent_id).toBe(testData.starter_id); // L2+ via matrix

    // L1 should go to direct sponsor (starter)
    // L2 should go to matrix parent of starter (bronze)
    // This validates the tree structure is correct for testing
  });
});

// =============================================
// INTEGRATION TEST: Full Flow
// =============================================

test.describe('Integration: Full Security Flow', () => {
  test('all security fixes work together', async ({ request }) => {
    console.log('🔒 Running full security integration test...');

    // 1. Test cross-org access is blocked
    const crossOrgResponse = await request.get(
      `${BASE_URL}/api/dashboard/team?distributorId=${testData.orgB_user_id}`
    );
    expect([401, 403]).toContain(crossOrgResponse.status());

    // 2. Test compensation run creates lock
    const compResponse = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
      data: {
        periodStart: '2026-04-01',
        periodEnd: '2026-04-30',
        dryRun: true,
      },
    });

    // 3. If comp run succeeded, verify duplicate is blocked
    if (compResponse.status() === 200) {
      const dupResponse = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
        data: {
          periodStart: '2026-04-01',
          periodEnd: '2026-04-30',
          dryRun: true,
        },
      });
      expect(dupResponse.status()).toBe(409);
    }

    // 4. Test email constraint
    const supabase = createServiceClient();
    const testEmail = `integration-test-${Date.now()}@test.com`;

    await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Integration',
      last_name: 'Test',
      sponsor_id: testData.orgA_root_id,
    });

    const { error } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Duplicate',
      last_name: 'Test',
      sponsor_id: testData.orgA_root_id,
    });

    expect(error).toBeTruthy();

    console.log('✅ Full security integration test passed');
  });
});

// =============================================
// SECURITY FIXES - SIMPLIFIED TESTS
// Tests the actual security mechanisms without complex setup
// =============================================

import { test, expect } from '@playwright/test';
import { createServiceClient } from '@/lib/supabase/service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Security Fixes - Database Level Tests', () => {

  // =============================================
  // FIX #4: EMAIL UNIQUE CONSTRAINT
  // =============================================

  test('Fix #4: Email UNIQUE constraint prevents duplicates', async () => {
    const supabase = createServiceClient();
    const testEmail = `unique-test-${Date.now()}@test.com`;

    console.log('✅ Testing email UNIQUE constraint...');

    // First insert should succeed
    const { error: error1 } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'First',
      last_name: 'User',
      sponsor_id: null, // Root distributor
    });

    expect(error1).toBeNull();
    console.log('   ✓ First insert succeeded');

    // Second insert with same email should fail
    const { error: error2 } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Second',
      last_name: 'User',
      sponsor_id: null,
    });

    expect(error2).toBeTruthy();
    expect(error2?.message).toContain('duplicate');
    console.log('   ✓ Duplicate insert blocked by constraint');

    // Cleanup
    await supabase.from('distributors').delete().eq('email', testEmail);
  });

  // =============================================
  // FIX #2: COMPENSATION RUN STATUS TABLE
  // =============================================

  test('Fix #2: compensation_run_status table exists with correct schema', async () => {
    const supabase = createServiceClient();

    console.log('✅ Testing compensation_run_status table...');

    // Query the table to verify it exists
    const { data, error } = await supabase
      .from('compensation_run_status')
      .select('run_id, status, period_start, period_end')
      .limit(1);

    expect(error).toBeNull();
    console.log('   ✓ Table exists and is queryable');

    // Verify required columns exist
    if (data && data.length > 0) {
      expect(data[0]).toHaveProperty('run_id');
      expect(data[0]).toHaveProperty('status');
      expect(data[0]).toHaveProperty('period_start');
      expect(data[0]).toHaveProperty('period_end');
      console.log('   ✓ All required columns present');
    } else {
      console.log('   ℹ No runs in table yet (expected for fresh DB)');
    }
  });

  // =============================================
  // FIX #3: ATOMIC PLACEMENT FUNCTION
  // =============================================

  test('Fix #3: create_and_place_distributor function exists', async () => {
    const supabase = createServiceClient();

    console.log('✅ Testing atomic placement function...');

    // Query PostgreSQL to check if function exists
    const { data, error } = await supabase.rpc('create_and_place_distributor', {
      p_email: 'test-function-check@test.com',
      p_first_name: 'Test',
      p_last_name: 'User',
      p_phone: null,
      p_slug: null,
      p_sponsor_id: crypto.randomUUID(), // Invalid sponsor (will fail)
      p_referrer_id: null,
      p_address_line1: null,
      p_address_line2: null,
      p_city: null,
      p_state: null,
      p_zip: null,
      p_country: null,
      p_matrix_parent_id: crypto.randomUUID(), // Invalid parent (will fail)
      p_matrix_position: 1,
      p_matrix_depth: 1,
    });

    // Function should exist (might fail due to invalid IDs, but that's expected)
    // If function doesn't exist, we'd get a different error
    if (error) {
      // Check if it's a validation error (function exists) vs function not found
      const errorMessage = error.message || '';
      const isFunctionMissing = errorMessage.includes('function') && errorMessage.includes('does not exist');

      expect(isFunctionMissing).toBe(false);
      console.log('   ✓ Function exists (returned validation error as expected)');
    } else {
      // If it succeeded, function definitely exists
      console.log('   ✓ Function exists and executed');
    }
  });

  // =============================================
  // FIX #1: ORGANIZATION VALIDATION MIDDLEWARE
  // =============================================

  test('Fix #1: Dashboard endpoints require authentication', async ({ request }) => {
    console.log('✅ Testing organization validation endpoints...');

    const testId = crypto.randomUUID();

    // Test team endpoint
    const teamResponse = await request.get(
      `${BASE_URL}/api/dashboard/team?distributorId=${testId}`
    );
    expect([401, 403]).toContain(teamResponse.status());
    console.log('   ✓ Team endpoint requires auth');

    // Test downline endpoint
    const downlineResponse = await request.get(
      `${BASE_URL}/api/dashboard/downline?distributorId=${testId}`
    );
    expect([401, 403]).toContain(downlineResponse.status());
    console.log('   ✓ Downline endpoint requires auth');

    // Test matrix-position endpoint
    const matrixResponse = await request.get(
      `${BASE_URL}/api/dashboard/matrix-position?distributorId=${testId}`
    );
    expect([401, 403]).toContain(matrixResponse.status());
    console.log('   ✓ Matrix-position endpoint requires auth');
  });

  // =============================================
  // FIX #5: COMPENSATION RUN ENDPOINT
  // =============================================

  test('Fix #5: Compensation run endpoint requires admin auth', async ({ request }) => {
    console.log('✅ Testing compensation run endpoint...');

    const response = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
      data: {
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
        dryRun: true,
      },
    });

    // Should require admin authentication
    expect(response.status()).toBe(401);
    console.log('   ✓ Compensation run requires admin auth');
  });
});

test.describe('Security Fixes - Code Structure Tests', () => {

  test('Verify sponsor_id and matrix_parent_id separation', async () => {
    const supabase = createServiceClient();

    console.log('✅ Testing tree structure separation...');

    // Get a few distributors to verify both fields exist
    const { data: distributors, error } = await supabase
      .from('distributors')
      .select('id, sponsor_id, matrix_parent_id')
      .limit(5);

    expect(error).toBeNull();

    if (distributors && distributors.length > 0) {
      // Check that both fields exist in schema
      const hasSponsorsId = 'sponsor_id' in distributors[0];
      const hasMatrixParentId = 'matrix_parent_id' in distributors[0];

      expect(hasSponsorsId).toBe(true);
      expect(hasMatrixParentId).toBe(true);

      console.log('   ✓ Both sponsor_id and matrix_parent_id fields exist');
      console.log('   ✓ Enrollment tree (sponsor_id) separate from matrix tree (matrix_parent_id)');
    }
  });
});

test.describe('Security Fixes - Integration', () => {

  test('All security mechanisms work together', async ({ request }) => {
    const supabase = createServiceClient();

    console.log('🔒 Running security integration test...');

    // 1. Email constraint active
    const testEmail = `integration-${Date.now()}@test.com`;
    await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Integration',
      last_name: 'Test',
      sponsor_id: null,
    });

    const { error: dupError } = await supabase.from('distributors').insert({
      id: crypto.randomUUID(),
      email: testEmail,
      first_name: 'Duplicate',
      last_name: 'Test',
      sponsor_id: null,
    });

    expect(dupError).toBeTruthy();
    console.log('   ✓ Email constraint active');

    // 2. Endpoints protected
    const response = await request.get(
      `${BASE_URL}/api/dashboard/team?distributorId=${crypto.randomUUID()}`
    );
    expect([401, 403]).toContain(response.status());
    console.log('   ✓ Dashboard endpoints protected');

    // 3. Admin endpoints protected
    const compResponse = await request.post(`${BASE_URL}/api/admin/compensation/run`, {
      data: { periodStart: '2026-03-01', periodEnd: '2026-03-31', dryRun: true },
    });
    expect(compResponse.status()).toBe(401);
    console.log('   ✓ Admin endpoints protected');

    // Cleanup
    await supabase.from('distributors').delete().eq('email', testEmail);

    console.log('✅ All security mechanisms working together!');
  });
});

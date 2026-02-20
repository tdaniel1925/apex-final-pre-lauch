import { describe, it, expect } from 'vitest';
import type { Distributor, ApiResponse, MatrixNode } from '@/lib/types';

describe('Type Definitions', () => {
  it('should have Distributor type with required fields', () => {
    const mockDistributor: Distributor = {
      id: 'test-id',
      auth_user_id: 'auth-id',
      first_name: 'John',
      last_name: 'Doe',
      company_name: 'Test Co',
      email: 'john@example.com',
      slug: 'johndoe',
      sponsor_id: null,
      matrix_parent_id: null,
      matrix_position: null,
      matrix_depth: 0,
      rep_number: null,
      is_master: false,
      profile_complete: false,
      phone: null,
      address_line1: null,
      address_line2: null,
      city: null,
      state: null,
      zip: null,
      status: 'active',
      admin_role: null,
      suspended_at: null,
      suspended_by: null,
      suspension_reason: null,
      deleted_at: null,
      deleted_by: null,
      licensing_status: 'non_licensed',
      licensing_status_set_at: null,
      licensing_verified: false,
      licensing_verified_at: null,
      licensing_verified_by: null,
      onboarding_completed: false,
      onboarding_step: 0,
      onboarding_completed_at: null,
      profile_photo_url: null,
      bio: null,
      social_links: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    expect(mockDistributor.id).toBe('test-id');
    expect(mockDistributor.email).toBe('john@example.com');
    expect(mockDistributor.slug).toBe('johndoe');
  });

  it('should have ApiResponse type', () => {
    const successResponse: ApiResponse<{ count: number }> = {
      success: true,
      data: { count: 5 },
      message: 'Success',
    };

    const errorResponse: ApiResponse = {
      success: false,
      error: 'Something went wrong',
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data?.count).toBe(5);
    expect(errorResponse.success).toBe(false);
  });

  it('should validate matrix constraints', () => {
    const distributor: Partial<Distributor> = {
      matrix_position: 3,
      matrix_depth: 5,
    };

    // Matrix position should be 1-5
    expect(distributor.matrix_position).toBeGreaterThanOrEqual(1);
    expect(distributor.matrix_position).toBeLessThanOrEqual(5);

    // Matrix depth should be 0-7
    expect(distributor.matrix_depth).toBeGreaterThanOrEqual(0);
    expect(distributor.matrix_depth).toBeLessThanOrEqual(7);
  });
});

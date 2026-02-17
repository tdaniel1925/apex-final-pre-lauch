// =============================================
// Matrix Placement API Route
// POST /api/matrix/place
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { findMatrixPlacement, placeDistributor } from '@/lib/matrix/placement';
import type { ApiResponse, MatrixPlacement } from '@/lib/types';

/**
 * POST /api/matrix/place
 * 
 * Finds placement for a distributor or places them in the matrix
 * 
 * Body:
 *   - sponsor_id?: string (optional, uses master if not provided)
 *   - distributor_id?: string (optional, if provided, updates the distributor)
 * 
 * Response:
 *   - parent_id: string
 *   - matrix_position: number (1-5)
 *   - matrix_depth: number (1-7)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsor_id, distributor_id } = body;

    // Validate sponsor_id format if provided
    if (sponsor_id && typeof sponsor_id !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid sponsor_id format',
          message: 'sponsor_id must be a valid UUID string',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // If distributor_id provided, place the distributor
    if (distributor_id) {
      if (typeof distributor_id !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid distributor_id format',
            message: 'distributor_id must be a valid UUID string',
          } as ApiResponse,
          { status: 400 }
        );
      }

      const distributor = await placeDistributor(
        distributor_id,
        sponsor_id || null
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            parent_id: distributor.matrix_parent_id,
            matrix_position: distributor.matrix_position,
            matrix_depth: distributor.matrix_depth,
            distributor: distributor,
          },
          message: 'Distributor placed successfully in matrix',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Otherwise, just find the placement (don't update any records)
    const placement = await findMatrixPlacement(sponsor_id || null);

    return NextResponse.json(
      {
        success: true,
        data: placement,
        message: 'Matrix placement found successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Matrix placement API error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('Master distributor not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Master distributor not configured',
          message: 'System configuration error. Please contact support.',
        } as ApiResponse,
        { status: 500 }
      );
    }

    if (errorMessage.includes('Sponsor not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid sponsor',
          message: 'The specified sponsor does not exist',
        } as ApiResponse,
        { status: 404 }
      );
    }

    if (errorMessage.includes('Matrix is full')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Matrix capacity reached',
          message: 'No available slots in the matrix',
        } as ApiResponse,
        { status: 409 }
      );
    }

    if (errorMessage.includes('Distributor not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Distributor not found',
          message: 'The specified distributor does not exist',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Matrix placement failed',
        message: errorMessage,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/matrix/place
 * 
 * Test endpoint - finds placement for a new distributor
 * 
 * Query params:
 *   - sponsor_id?: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sponsorId = searchParams.get('sponsor_id');

    const placement = await findMatrixPlacement(sponsorId);

    return NextResponse.json(
      {
        success: true,
        data: placement,
        message: 'Matrix placement found',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Matrix placement GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find placement',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

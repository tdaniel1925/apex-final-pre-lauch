// =============================================
// Slug Availability Check API
// GET /api/slugs/check?slug=johndoe
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import {
  checkSlugAvailability,
  validateSlugFormat,
  isReservedSlug,
  suggestAlternativeSlugs,
} from '@/lib/utils/slug';
import type { ApiResponse } from '@/lib/types';

/**
 * GET /api/slugs/check
 * 
 * Checks if a slug is available for use
 * 
 * Query params:
 *   - slug: string (required)
 * 
 * Response:
 *   - available: boolean
 *   - slug: string (normalized)
 *   - error?: string
 *   - suggestions?: string[] (if not available)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // Validate slug parameter provided
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug parameter is required',
          message: 'Please provide a slug to check',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Validate slug format
    const formatValidation = validateSlugFormat(normalizedSlug);
    if (!formatValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          data: {
            available: false,
            slug: normalizedSlug,
            error: formatValidation.error,
          },
          message: formatValidation.error,
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Check if reserved
    if (isReservedSlug(normalizedSlug)) {
      return NextResponse.json(
        {
          success: false,
          data: {
            available: false,
            slug: normalizedSlug,
            error: 'This username is reserved and cannot be used',
            suggestions: suggestAlternativeSlugs(normalizedSlug),
          },
          message: 'Username is reserved',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Check database availability
    const isAvailable = await checkSlugAvailability(normalizedSlug);

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: true,
          data: {
            available: false,
            slug: normalizedSlug,
            error: 'This username is already taken',
            suggestions: suggestAlternativeSlugs(normalizedSlug),
          },
          message: 'Username is taken',
        } as ApiResponse,
        { status: 200 }
      );
    }

    // Available!
    return NextResponse.json(
      {
        success: true,
        data: {
          available: true,
          slug: normalizedSlug,
        },
        message: 'Username is available',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Slug check API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check username availability',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

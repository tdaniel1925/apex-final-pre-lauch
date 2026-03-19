import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { canSendTeamBroadcast } from '@/lib/autopilot/team-helpers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for listing shares
const listSharesSchema = z.object({
  direction: z.enum(['sent', 'received', 'all']).optional().default('all'),
  accessed: z.enum(['true', 'false', 'all']).optional().default('all'),
  completed: z.enum(['true', 'false', 'all']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

/**
 * GET /api/autopilot/team/training/shared
 * List training shares (sent and received)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Training Shared API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      direction: searchParams.get('direction') || 'all',
      accessed: searchParams.get('accessed') || 'all',
      completed: searchParams.get('completed') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Validate parameters
    const validation = listSharesSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { direction, accessed, completed, limit, offset } = validation.data;

    // Build query based on direction
    let query = supabase
      .from('training_shares')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply direction filter
    if (direction === 'sent') {
      query = query.eq('shared_by_distributor_id', distributor.id);
    } else if (direction === 'received') {
      query = query.eq('shared_with_distributor_id', distributor.id);
    } else {
      // Show both sent and received
      query = query.or(
        `shared_by_distributor_id.eq.${distributor.id},shared_with_distributor_id.eq.${distributor.id}`
      );
    }

    // Apply accessed filter
    if (accessed !== 'all') {
      query = query.eq('accessed', accessed === 'true');
    }

    // Apply completed filter
    if (completed !== 'all') {
      query = query.eq('completed', completed === 'true');
    }

    const { data: shares, error: listError, count } = await query;

    if (listError) {
      console.error('[Training Shared API] Error listing shares:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch training shares',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      shares: shares || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error: any) {
    console.error('[Training Shared API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch training shares',
      },
      { status: 500 }
    );
  }
}

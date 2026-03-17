// =============================================
// DUAL-LADDER COMPENSATION CONFIG HISTORY API
// =============================================
// Phase: 4 (Update APIs)
// Agent: 4
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Get Compensation Configuration Change History
 *
 * GET /api/admin/compensation/config/history
 *
 * Returns the audit log of all compensation configuration changes.
 *
 * Query params:
 * - engineType: 'saas' | 'insurance' (optional, filters by engine type)
 * - key: string (optional, filters by config key)
 * - limit: number (optional, default 100, max 500)
 * - offset: number (optional, default 0, for pagination)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const engineType = searchParams.get('engineType');
    const key = searchParams.get('key');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate and set defaults
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 500) : 100;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Build query
    let query = supabase
      .from('comp_engine_change_log')
      .select('*', { count: 'exact' })
      .order('changed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (engineType) {
      if (engineType !== 'saas' && engineType !== 'insurance') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid engineType',
            message: 'engineType must be "saas" or "insurance"',
          },
          { status: 400 }
        );
      }
      query = query.eq('engine_type', engineType);
    }

    if (key) {
      query = query.eq('field_key', key);
    }

    // Execute query
    const { data: history, error: historyError, count } = await query;

    if (historyError) {
      console.error('[Config History] Query error:', historyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch history', details: historyError.message },
        { status: 500 }
      );
    }

    // Fetch user information for changed_by fields
    const userIds = [...new Set((history || []).map((h: any) => h.changed_by).filter(Boolean))];
    const { data: users } = await supabase
      .from('admins')
      .select('id, auth_user_id, email, first_name, last_name')
      .in('auth_user_id', userIds);

    // Create user lookup map
    const userMap = (users || []).reduce((acc: any, user: any) => {
      acc[user.auth_user_id] = user;
      return acc;
    }, {});

    // Enrich history with user information
    const enrichedHistory = (history || []).map((item: any) => ({
      ...item,
      changed_by_user: item.changed_by ? userMap[item.changed_by] || null : null,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedHistory,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('[Config History] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

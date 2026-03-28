/**
 * Admin Compensation Clawback API
 *
 * POST /api/admin/compensation/clawback
 * - Process clawback for refunded orders
 * - Reverse commissions and create negative earnings_ledger entries
 *
 * GET /api/admin/compensation/clawback
 * - Get active clawback queue (pending within 60-day window)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  processOrderClawback,
  batchProcessClawbacks,
  getActiveClawbackQueue,
  clearExpiredClawbackQueue,
} from '@/lib/compensation/clawback-processor';
import { z } from 'zod';

const ClawbackRequestSchema = z.object({
  order_id: z.string().uuid().optional(),
  order_ids: z.array(z.string().uuid()).optional(),
  clear_expired: z.boolean().optional(),
}).refine(
  (data) => data.order_id || data.order_ids || data.clear_expired,
  { message: 'Must provide order_id, order_ids, or clear_expired' }
);

/**
 * POST /api/admin/compensation/clawback
 * Process clawback for refunded orders
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Verify admin access
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const validation = ClawbackRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { order_id, order_ids, clear_expired } = validation.data;

    // 4. Process clawbacks
    if (clear_expired) {
      const clearedCount = await clearExpiredClawbackQueue();
      return NextResponse.json({
        success: true,
        message: `Cleared ${clearedCount} expired clawback queue entries`,
        cleared_count: clearedCount,
      });
    }

    if (order_id) {
      // Single order clawback
      const result = await processOrderClawback(order_id);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Clawback processing failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        result,
      });
    }

    if (order_ids) {
      // Batch order clawbacks
      const results = await batchProcessClawbacks(order_ids);

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return NextResponse.json({
        success: true,
        summary: {
          total: results.length,
          success: successCount,
          failed: failureCount,
        },
        results,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Clawback API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/compensation/clawback
 * Get active clawback queue (pending within 60-day window)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 1. Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Verify admin access
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // 3. Get active clawback queue
    const queue = await getActiveClawbackQueue();

    return NextResponse.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    console.error('Clawback GET API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

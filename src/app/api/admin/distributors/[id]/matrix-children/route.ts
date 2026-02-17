// =============================================
// Get Matrix Children API
// Returns the 5 matrix positions under this distributor
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';
import type { Distributor } from '@/lib/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface MatrixSlot {
  position: number;
  distributor: Distributor | null;
  isEmpty: boolean;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Check admin auth
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const serviceClient = createServiceClient();

    // Get all matrix children (where matrix_parent_id = this distributor's id)
    const { data: children, error } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('matrix_parent_id', id)
      .neq('status', 'deleted')
      .order('matrix_position', { ascending: true });

    if (error) {
      console.error('Error fetching matrix children:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch matrix children' },
        { status: 500 }
      );
    }

    // Create 5-slot array with filled and empty slots
    const slots: MatrixSlot[] = [];

    for (let position = 1; position <= 5; position++) {
      const child = children?.find((c) => c.matrix_position === position);

      slots.push({
        position,
        distributor: child || null,
        isEmpty: !child,
      });
    }

    // Calculate statistics
    const filledCount = children?.length || 0;
    const emptyCount = 5 - filledCount;
    const fillPercentage = Math.round((filledCount / 5) * 100);

    return NextResponse.json({
      success: true,
      data: {
        slots,
        statistics: {
          total: 5,
          filled: filledCount,
          empty: emptyCount,
          fillPercentage,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching matrix children:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matrix children' },
      { status: 500 }
    );
  }
}

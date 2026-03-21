// =============================================
// Update Matrix Position API
// Allows admin to manually adjust matrix placement
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getAdminUser } from '@/lib/auth/admin';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    // Check admin auth
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { matrix_parent_id, matrix_position, matrix_depth } = body;

    const serviceClient = createServiceClient();

    // Get current distributor
    const { data: distributor, error: fetchError } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !distributor) {
      return NextResponse.json(
        { success: false, error: 'Distributor not found' },
        { status: 404 }
      );
    }

    // Basic client-side validation before calling stored procedure
    // (The stored procedure will do full validation with locks)
    if (matrix_position && (matrix_position < 1 || matrix_position > 5)) {
      return NextResponse.json(
        { success: false, error: 'Matrix position must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (matrix_depth !== undefined && (matrix_depth < 0 || matrix_depth > 7)) {
      return NextResponse.json(
        { success: false, error: 'Matrix depth must be between 0 and 7' },
        { status: 400 }
      );
    }

    // FIX: Use transaction function with advisory lock to prevent race conditions
    const { data: result, error: updateError } = await serviceClient.rpc(
      'update_distributor_matrix_position',
      {
        p_distributor_id: id,
        p_matrix_parent_id: matrix_parent_id,
        p_matrix_position: matrix_position,
        p_matrix_depth: matrix_depth
      }
    );

    if (updateError) {
      console.error('Error updating matrix position:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || 'Failed to update matrix position' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Matrix position updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating matrix position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update matrix position' },
      { status: 500 }
    );
  }
}

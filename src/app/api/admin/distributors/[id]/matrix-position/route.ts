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

    // Validation: Check if position is already taken by another distributor
    if (matrix_parent_id && matrix_position) {
      const { data: existing } = await serviceClient
        .from('distributors')
        .select('id')
        .eq('matrix_parent_id', matrix_parent_id)
        .eq('matrix_position', matrix_position)
        .neq('id', id)
        .neq('status', 'deleted')
        .single();

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `Position ${matrix_position} under this parent is already occupied`
          },
          { status: 400 }
        );
      }
    }

    // Validation: Matrix position must be 1-5
    if (matrix_position && (matrix_position < 1 || matrix_position > 5)) {
      return NextResponse.json(
        { success: false, error: 'Matrix position must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validation: Matrix depth must be 0-7
    if (matrix_depth !== undefined && (matrix_depth < 0 || matrix_depth > 7)) {
      return NextResponse.json(
        { success: false, error: 'Matrix depth must be between 0 and 7' },
        { status: 400 }
      );
    }

    // Validation: If parent is provided, verify it exists
    if (matrix_parent_id) {
      const { data: parent } = await serviceClient
        .from('distributors')
        .select('id, matrix_depth')
        .eq('id', matrix_parent_id)
        .neq('status', 'deleted')
        .single();

      if (!parent) {
        return NextResponse.json(
          { success: false, error: 'Matrix parent not found' },
          { status: 400 }
        );
      }
    }

    // Update matrix position
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (matrix_parent_id !== undefined) updates.matrix_parent_id = matrix_parent_id;
    if (matrix_position !== undefined) updates.matrix_position = matrix_position;
    if (matrix_depth !== undefined) updates.matrix_depth = matrix_depth;

    const { error: updateError } = await serviceClient
      .from('distributors')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating matrix position:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update matrix position' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Matrix position updated successfully',
    });
  } catch (error) {
    console.error('Error updating matrix position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update matrix position' },
      { status: 500 }
    );
  }
}

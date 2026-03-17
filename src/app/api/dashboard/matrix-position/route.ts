import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboard/matrix-position
 *
 * Returns the user's matrix position information including:
 * - Current position in the 5x7 forced matrix
 * - Matrix parent information
 * - Matrix children (up to 5)
 * - Sponsor information
 * - Rep number and status
 */
export async function GET() {
  try {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's distributor record with matrix info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        email,
        slug,
        rep_number,
        status,
        matrix_depth,
        matrix_position,
        matrix_parent_id,
        sponsor_id,
        created_at
      `)
      .eq('email', user.email)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        { error: 'Distributor record not found' },
        { status: 404 }
      );
    }

    // Get matrix parent info
    let matrixParent = null;
    if (distributor.matrix_parent_id) {
      const { data: parent } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug, rep_number, matrix_depth')
        .eq('id', distributor.matrix_parent_id)
        .single();

      if (parent) {
        matrixParent = {
          id: parent.id,
          name: `${parent.first_name} ${parent.last_name}`,
          slug: parent.slug,
          rep_number: parent.rep_number,
          matrix_depth: parent.matrix_depth,
        };
      }
    }

    // Get sponsor info (who recruited them)
    let sponsor = null;
    if (distributor.sponsor_id) {
      const { data: sponsorData } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, slug, rep_number')
        .eq('id', distributor.sponsor_id)
        .single();

      if (sponsorData) {
        sponsor = {
          id: sponsorData.id,
          name: `${sponsorData.first_name} ${sponsorData.last_name}`,
          slug: sponsorData.slug,
          rep_number: sponsorData.rep_number,
        };
      }
    }

    // Get matrix children (up to 5 positions)
    const { data: children } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, rep_number, matrix_position, status')
      .eq('matrix_parent_id', distributor.id)
      .order('matrix_position', { ascending: true });

    const matrixChildren = children?.map(child => ({
      id: child.id,
      name: `${child.first_name} ${child.last_name}`,
      slug: child.slug,
      rep_number: child.rep_number,
      position: child.matrix_position,
      status: child.status,
    })) || [];

    // Calculate matrix stats
    const matrixStats = {
      current_level: distributor.matrix_depth,
      position_in_level: distributor.matrix_position,
      positions_filled: matrixChildren.length,
      positions_available: 5 - matrixChildren.length,
      is_full: matrixChildren.length >= 5,
    };

    return NextResponse.json({
      success: true,
      distributor: {
        id: distributor.id,
        name: `${distributor.first_name} ${distributor.last_name}`,
        email: distributor.email,
        slug: distributor.slug,
        rep_number: distributor.rep_number,
        status: distributor.status,
        created_at: distributor.created_at,
      },
      matrix: {
        depth: distributor.matrix_depth,
        position: distributor.matrix_position,
        parent: matrixParent,
        children: matrixChildren,
        stats: matrixStats,
      },
      sponsor,
    });

  } catch (error) {
    console.error('Error in /api/dashboard/matrix-position:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

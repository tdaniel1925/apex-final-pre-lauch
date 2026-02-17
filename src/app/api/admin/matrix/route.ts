// =============================================
// Admin Matrix API
// Get matrix tree and statistics
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { getMatrixTree, getMatrixStatistics } from '@/lib/admin/matrix-manager';

// GET /api/admin/matrix - Get matrix tree and stats
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const rootId = searchParams.get('rootId') || undefined;
  const statsOnly = searchParams.get('statsOnly') === 'true';

  try {
    if (statsOnly) {
      const stats = await getMatrixStatistics();
      return NextResponse.json({ stats });
    }

    const tree = await getMatrixTree(rootId);
    const stats = await getMatrixStatistics();

    return NextResponse.json({ tree, stats });
  } catch (error: any) {
    console.error('Error fetching matrix data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

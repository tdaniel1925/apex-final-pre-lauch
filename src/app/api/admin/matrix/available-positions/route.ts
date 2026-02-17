// =============================================
// Admin Matrix Available Positions API
// Find positions with available slots
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { findAvailablePositions } from '@/lib/admin/matrix-manager';

// GET /api/admin/matrix/available-positions - Find open positions
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const maxResults = parseInt(searchParams.get('max') || '20');

    const positions = await findAvailablePositions(maxResults);
    return NextResponse.json({ positions });
  } catch (error: any) {
    console.error('Error finding available positions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

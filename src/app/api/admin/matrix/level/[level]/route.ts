// =============================================
// Admin Matrix Level API
// Get distributors at a specific level
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { getMatrixLevel } from '@/lib/admin/matrix-manager';

// GET /api/admin/matrix/level/[level] - Get specific level data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { level } = await params;
    const levelNum = parseInt(level);

    if (isNaN(levelNum) || levelNum < 0 || levelNum > 7) {
      return NextResponse.json({ error: 'Invalid level (must be 0-7)' }, { status: 400 });
    }

    const levelData = await getMatrixLevel(levelNum);
    return NextResponse.json(levelData);
  } catch (error: any) {
    console.error('Error fetching level data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

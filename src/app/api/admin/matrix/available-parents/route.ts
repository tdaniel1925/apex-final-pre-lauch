// =============================================
// Get Available Parents API
// Returns distributors with available matrix slots
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { findAvailablePositions } from '@/lib/admin/matrix-manager';

export async function GET() {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distributors with available slots (limit to 50 for dropdown)
    const availableParents = await findAvailablePositions(50);

    return NextResponse.json({
      success: true,
      parents: availableParents,
    });
  } catch (error) {
    console.error('Error in available-parents API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

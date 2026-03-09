// =============================================
// Impersonate Status API
// Checks if currently impersonating
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('impersonate_admin_id')?.value;

    return NextResponse.json({
      isImpersonating: !!adminId,
      adminId: adminId || null,
    });
  } catch (error) {
    console.error('Error checking impersonation status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}

// API Endpoint: Run monthly commission processing
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executeCommissionRun } from '@/lib/compensation/commission-run';
import { getAdminUser } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  // CRITICAL: Only Admin can run commission processing
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    // Execute commission run
    const result = await executeCommissionRun(month, year, db);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Commission run error:', error);
    return NextResponse.json(
      { error: error.message || 'Commission run failed' },
      { status: 500 }
    );
  }
}

// GET: Retrieve commission run status
export async function GET(request: NextRequest) {
  // CRITICAL: Only Admin can view commission run status
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const db = createServiceClient();

    const { data: run, error } = await db
      .from('commission_runs')
      .select('*')
      .eq('month', parseInt(month))
      .eq('year', parseInt(year))
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      run: run || null,
    });
  } catch (error: any) {
    console.error('Error fetching commission run:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commission run' },
      { status: 500 }
    );
  }
}

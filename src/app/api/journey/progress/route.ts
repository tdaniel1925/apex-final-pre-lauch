// =============================================
// Journey Progress API (Stub)
// Returns empty progress until feature is implemented
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Journey progress feature not yet implemented
    // Return empty/default response to prevent 404 errors
    return NextResponse.json({
      success: true,
      progress: {
        currentStep: 0,
        totalSteps: 0,
        completedSteps: [],
      },
    });
  } catch (error) {
    console.error('Error fetching journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// =============================================
// Test Endpoint - List All Distributors
// GET /api/test/distributors
// =============================================

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: distributors, error } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, slug, status, is_master, sponsor_id, matrix_parent_id, matrix_position, matrix_depth')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching distributors:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: distributors?.length || 0,
      distributors: distributors || [],
    });
  } catch (error: any) {
    console.error('Test distributors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// =============================================
// Database Connection Test API
// Tests Supabase connection and returns stats
// =============================================

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/test/db
 *
 * Tests the database connection and returns basic stats
 *
 * @returns {ApiResponse} Connection status and distributor count
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Test 1: Check database connection by querying distributors table
    const { count, error } = await supabase
      .from('distributors')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed',
          error: error.message,
          details: error.details || null,
        },
        { status: 500 }
      );
    }

    // Test 2: Check if master distributor exists
    const { data: master, error: masterError } = await supabase
      .from('distributors')
      .select('id, slug, first_name, last_name, is_master')
      .eq('is_master', true)
      .single();

    if (masterError && masterError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is okay if master hasn't been seeded yet
      console.error('Master distributor query error:', masterError);
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        distributor_count: count || 0,
        master_exists: master ? true : false,
        master_slug: master?.slug || null,
        timestamp: new Date().toISOString(),
        database: 'Supabase PostgreSQL',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  } catch (error) {
    console.error('Unexpected error in database test:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// Event Templates API
// Create and manage reusable event templates
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  event_type: z.enum(['training', 'webinar', 'conference', 'workshop', 'social']),

  // Default values for events created from this template
  default_title: z.string().min(1).max(200),
  default_description: z.string().max(2000).optional().nullable(),
  default_location: z.string().max(300).optional().nullable(),
  default_duration_minutes: z.number().int().min(15).max(480).default(60),
  default_max_attendees: z.number().int().positive().optional().nullable(),
  default_status: z.enum(['draft', 'active', 'full', 'canceled', 'completed', 'archived']).default('draft'),

  is_active: z.boolean().default(true),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

// =====================================================
// GET - List all templates
// =====================================================

export async function GET(request: NextRequest) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const event_type = searchParams.get('event_type');
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('event_templates')
      .select('*', { count: 'exact' });

    // Apply filters
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,default_title.ilike.%${search}%`);
    }

    // Sort by usage count (most used first) then name
    query = query
      .order('usage_count', { ascending: false })
      .order('name', { ascending: true });

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return errorResponse('Failed to fetch templates', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({
      data: templates || [],
      meta: {
        total: count || 0,
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/event-templates error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =====================================================
// POST - Create new template
// =====================================================

export async function POST(request: NextRequest) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await request.json();

    // Validate request body
    const result = createTemplateSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const supabase = await createClient();

    // Insert template
    const { data: template, error } = await supabase
      .from('event_templates')
      .insert([
        {
          ...result.data,
          created_by: admin.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return errorResponse('Failed to create template', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/event-templates error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

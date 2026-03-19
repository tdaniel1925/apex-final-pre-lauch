// =====================================================
// Event Template Detail API
// Get, update, or delete a specific template
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminUser } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  event_type: z.enum(['training', 'webinar', 'conference', 'workshop', 'social']).optional(),
  default_title: z.string().min(1).max(200).optional(),
  default_description: z.string().max(2000).optional().nullable(),
  default_location: z.string().max(300).optional().nullable(),
  default_duration_minutes: z.number().int().min(15).max(480).optional(),
  default_max_attendees: z.number().int().positive().optional().nullable(),
  default_status: z.enum(['draft', 'active', 'full', 'canceled', 'completed', 'archived']).optional(),
  is_active: z.boolean().optional(),
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function errorResponse(message: string, code: string, status: number, details?: any) {
  return NextResponse.json({ error: message, code, details }, { status });
}

// =====================================================
// GET - Get template by ID
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const supabase = await createClient();

    const { data: template, error } = await supabase
      .from('event_templates')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !template) {
      return errorResponse('Template not found', 'NOT_FOUND', 404);
    }

    return NextResponse.json({ data: template });
  } catch (error: any) {
    console.error('GET /api/admin/event-templates/[id] error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =====================================================
// PUT - Update template
// =====================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const body = await request.json();

    // Validate request body
    const result = updateTemplateSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        result.error.flatten().fieldErrors
      );
    }

    const supabase = await createClient();

    // Update template
    const { data: template, error } = await supabase
      .from('event_templates')
      .update(result.data)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      if (error.code === 'PGRST116') {
        return errorResponse('Template not found', 'NOT_FOUND', 404);
      }
      return errorResponse('Failed to update template', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({ data: template });
  } catch (error: any) {
    console.error('PUT /api/admin/event-templates/[id] error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

// =====================================================
// DELETE - Delete template
// =====================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin auth check
  const admin = await getAdminUser();
  if (!admin) {
    return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
  }

  try {
    const supabase = await createClient();

    // Check if template is in use
    const { data: eventsUsingTemplate, error: checkError } = await supabase
      .from('company_events')
      .select('id')
      .eq('template_id', params.id)
      .limit(1);

    if (checkError) {
      console.error('Error checking template usage:', checkError);
      return errorResponse('Failed to check template usage', 'DATABASE_ERROR', 500, checkError);
    }

    if (eventsUsingTemplate && eventsUsingTemplate.length > 0) {
      return errorResponse(
        'Cannot delete template that is in use by events. Set is_active to false instead.',
        'TEMPLATE_IN_USE',
        409
      );
    }

    // Delete template
    const { error } = await supabase
      .from('event_templates')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting template:', error);
      if (error.code === 'PGRST116') {
        return errorResponse('Template not found', 'NOT_FOUND', 404);
      }
      return errorResponse('Failed to delete template', 'DATABASE_ERROR', 500, error);
    }

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/admin/event-templates/[id] error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}

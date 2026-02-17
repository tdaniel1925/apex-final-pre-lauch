// =============================================
// Email Templates Admin API
// GET /api/admin/email-templates - List all templates
// POST /api/admin/email-templates - Create new template
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';
import type { EmailTemplateFormData } from '@/lib/types/email';

/**
 * GET /api/admin/email-templates
 *
 * List all email templates
 *
 * Query params:
 *   - licensing_status?: 'licensed' | 'non_licensed' | 'all' - Filter by status
 *   - active_only?: boolean - Only return active templates
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Check if user is admin (use service client to bypass RLS)
    const serviceClient = createServiceClient();
    const { data: admin } = await serviceClient
      .from('distributors')
      .select('is_master')
      .eq('auth_user_id', user.id)
      .single();

    if (!admin || !admin.is_master) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const licensingStatus = searchParams.get('licensing_status');
    const activeOnly = searchParams.get('active_only') === 'true';

    // Build query
    let query = serviceClient.from('email_templates').select('*').order('sequence_order', { ascending: true });

    if (licensingStatus && licensingStatus !== 'all') {
      query = query.eq('licensing_status', licensingStatus);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Failed to fetch templates:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to fetch email templates',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { templates },
        message: `Found ${templates.length} templates`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Email templates API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/email-templates
 *
 * Create new email template
 *
 * Body: EmailTemplateFormData
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Check if user is admin and get distributor ID (use service client to bypass RLS)
    const serviceClient = createServiceClient();
    const { data: admin } = await serviceClient
      .from('distributors')
      .select('id, is_master')
      .eq('auth_user_id', user.id)
      .single();

    if (!admin || !admin.is_master) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to perform this action',
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body: EmailTemplateFormData = await request.json();

    // Validate required fields
    if (
      !body.template_name ||
      !body.subject ||
      !body.body ||
      !body.licensing_status ||
      body.sequence_order === undefined ||
      body.delay_days === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'Missing required fields',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate template_key from template_name
    const templateKey = body.template_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Create template
    const { data: template, error } = await serviceClient
      .from('email_templates')
      .insert({
        template_key: templateKey,
        template_name: body.template_name,
        description: body.description || null,
        subject: body.subject,
        body: body.body,
        preview_text: body.preview_text || null,
        licensing_status: body.licensing_status,
        sequence_order: body.sequence_order,
        delay_days: body.delay_days,
        variables_used: body.variables_used || [],
        is_active: body.is_active !== undefined ? body.is_active : true,
        ai_generated: body.ai_generated || false,
        ai_prompt: body.ai_prompt || null,
        created_by: admin.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create template:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: error.message || 'Failed to create email template',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { template },
        message: 'Email template created successfully',
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error('Create template API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ApiResponse,
      { status: 500 }
    );
  }
}

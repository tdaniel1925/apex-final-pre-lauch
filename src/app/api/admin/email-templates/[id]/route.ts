// =============================================
// Email Template Admin API
// PATCH /api/admin/email-templates/:id - Update template
// DELETE /api/admin/email-templates/:id - Delete template
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse } from '@/lib/types';
import type { EmailTemplateFormData } from '@/lib/types/email';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/email-templates/:id
 *
 * Update email template
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    const body: Partial<EmailTemplateFormData> = await request.json();

    // Build update object
    const updateData: any = {};

    if (body.template_name) updateData.template_name = body.template_name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.subject) updateData.subject = body.subject;
    if (body.body) updateData.body = body.body;
    if (body.preview_text !== undefined) updateData.preview_text = body.preview_text;
    if (body.licensing_status) updateData.licensing_status = body.licensing_status;
    if (body.sequence_order !== undefined) updateData.sequence_order = body.sequence_order;
    if (body.delay_days !== undefined) updateData.delay_days = body.delay_days;
    if (body.variables_used) updateData.variables_used = body.variables_used;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Update template
    const { data: template, error } = await serviceClient
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update template:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to update email template',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { template },
        message: 'Email template updated successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Update template API error:', error);

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
 * DELETE /api/admin/email-templates/:id
 *
 * Delete email template
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Delete template
    const { error } = await serviceClient.from('email_templates').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete template:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to delete email template',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {},
        message: 'Email template deleted successfully',
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete template API error:', error);

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

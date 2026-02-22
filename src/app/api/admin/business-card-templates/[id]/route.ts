// ============================================================
// API: Admin Business Card Template Management
// Update template configurations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const body = await request.json();
    const {
      name,
      description,
      is_active,
      is_default,
      layout_config,
      colors,
      fonts,
    } = body;

    // If setting as default, unset other defaults first
    if (is_default) {
      await serviceClient
        .from('business_card_templates')
        .update({ is_default: false })
        .neq('id', params.id);
    }

    // Update the template
    const { data, error } = await serviceClient
      .from('business_card_templates')
      .update({
        name,
        description,
        is_active,
        is_default,
        layout_config,
        colors,
        fonts,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Template update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Template update error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const adminContext = await getAdminUser();

    if (!adminContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Don't allow deleting the default template
    const { data: template } = await serviceClient
      .from('business_card_templates')
      .select('is_default')
      .eq('id', params.id)
      .single();

    if (template?.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default template' },
        { status: 400 }
      );
    }

    const { error } = await serviceClient
      .from('business_card_templates')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Template delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

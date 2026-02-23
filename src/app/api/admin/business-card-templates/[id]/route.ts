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
      front_elements,
      back_elements,
      required_fields,
      optional_fields,
    } = body;

    // If setting as default, unset other defaults first
    if (is_default) {
      await serviceClient
        .from('business_card_templates')
        .update({ is_default: false })
        .neq('id', params.id);
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (layout_config !== undefined) updateData.layout_config = layout_config;
    if (colors !== undefined) updateData.colors = colors;
    if (fonts !== undefined) updateData.fonts = fonts;
    if (front_elements !== undefined) updateData.front_elements = front_elements;
    if (back_elements !== undefined) updateData.back_elements = back_elements;
    if (required_fields !== undefined) updateData.required_fields = required_fields;
    if (optional_fields !== undefined) updateData.optional_fields = optional_fields;

    // Update the template
    const { data, error} = await serviceClient
      .from('business_card_templates')
      .update(updateData)
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

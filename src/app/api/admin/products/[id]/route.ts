// =============================================
// Admin Products API - Update & Delete
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireAdmin } from '@/lib/auth/admin';

// PATCH /api/admin/products/[id] - Update product
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      category_id,
      description,
      retail_price_cents,
      wholesale_price_cents,
      bv,
      is_subscription,
      subscription_interval,
      is_active,
      is_featured,
    } = body;

    // Validation
    if (retail_price_cents && wholesale_price_cents) {
      if (retail_price_cents <= wholesale_price_cents) {
        return NextResponse.json(
          { error: 'Retail price must be greater than wholesale price' },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceClient();

    // Check if slug is taken by another product
    if (slug) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Build update object (only include provided fields)
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (category_id !== undefined) updates.category_id = category_id;
    if (description !== undefined) updates.description = description;
    if (retail_price_cents !== undefined) updates.retail_price_cents = retail_price_cents;
    if (wholesale_price_cents !== undefined) updates.wholesale_price_cents = wholesale_price_cents;
    if (bv !== undefined) updates.bv = bv;
    if (is_subscription !== undefined) {
      updates.is_subscription = is_subscription;
      updates.subscription_interval = is_subscription ? subscription_interval : null;
    }
    if (is_active !== undefined) updates.is_active = is_active;
    if (is_featured !== undefined) updates.is_featured = is_featured;

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    await requireAdmin();

    const supabase = createServiceClient();

    // Check if product has any orders
    const { count } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', params.id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Consider deactivating instead.' },
        { status: 400 }
      );
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

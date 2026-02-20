// =============================================
// Training Content Detail API
// Get, update, delete individual content
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminUser, hasAdminRole } from '@/lib/auth/admin';

// GET /api/training/content/[id] - Get single content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { data, error } = await supabase
      .from('training_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if published (unless admin)
    const adminUser = await getAdminUser();
    const isAdmin = adminUser && hasAdminRole(adminUser.admin, 'admin');

    if (!data.is_published && !isAdmin) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in GET /api/training/content/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/training/content/[id] - Update content (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser || !hasAdminRole(adminUser.admin, 'admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('training_content')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating content:', error);
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in PATCH /api/training/content/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/training/content/[id] - Delete content (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser || !hasAdminRole(adminUser.admin, 'super_admin')) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('training_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/training/content/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

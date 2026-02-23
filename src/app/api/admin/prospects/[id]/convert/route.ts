// =============================================
// Admin API - Convert Prospect to Distributor
// POST: Convert a prospect into a distributor
// =============================================

import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { z } from 'zod';

const convertSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  sponsorId: z.string().uuid('Valid sponsor ID required'),
  matrixParentId: z.string().uuid('Valid matrix parent ID required').optional(),
  sendWelcomeEmail: z.boolean().optional().default(true),
});

// POST /api/admin/prospects/[id]/convert
// Convert prospect to distributor
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: prospectId } = await params;
    const body = await request.json();

    // Validate input
    const validation = convertSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, sponsorId, matrixParentId, sendWelcomeEmail } = validation.data;
    const serviceClient = createServiceClient();

    // Get the prospect
    const { data: prospect, error: prospectError } = await serviceClient
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (prospectError || !prospect) {
      return NextResponse.json(
        { success: false, error: 'Prospect not found' },
        { status: 404 }
      );
    }

    // Check if already converted
    if (prospect.status === 'converted' && prospect.converted_to_distributor_id) {
      return NextResponse.json(
        { success: false, error: 'Prospect has already been converted' },
        { status: 400 }
      );
    }

    // Check if username is available
    const { data: existingUsername } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('slug', username)
      .single();

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Check if email is already used
    const { data: existingEmail } = await serviceClient
      .from('distributors')
      .select('id')
      .eq('email', prospect.email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is already registered as a distributor' },
        { status: 400 }
      );
    }

    // Get sponsor info for matrix placement
    const { data: sponsor } = await serviceClient
      .from('distributors')
      .select('matrix_depth')
      .eq('id', sponsorId)
      .single();

    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    // Determine matrix parent (use sponsor if not specified)
    const finalMatrixParentId = matrixParentId || sponsorId;

    // Get matrix parent info
    const { data: matrixParent } = await serviceClient
      .from('distributors')
      .select('matrix_depth')
      .eq('id', finalMatrixParentId)
      .single();

    if (!matrixParent) {
      return NextResponse.json(
        { success: false, error: 'Matrix parent not found' },
        { status: 404 }
      );
    }

    // Count children of matrix parent to get position
    const { count } = await serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true })
      .eq('matrix_parent_id', finalMatrixParentId)
      .neq('status', 'deleted');

    if (count && count >= 5) {
      return NextResponse.json(
        { success: false, error: 'Matrix parent position is full (max 5 children)' },
        { status: 400 }
      );
    }

    const matrixDepth = (matrixParent.matrix_depth || 0) + 1;
    const matrixPosition = (count || 0) + 1;

    // Create the distributor
    const { data: newDistributor, error: createError } = await serviceClient
      .from('distributors')
      .insert({
        first_name: prospect.first_name,
        last_name: prospect.last_name,
        email: prospect.email,
        slug: username,
        phone: prospect.phone,
        address: prospect.address,
        city: prospect.city,
        state: prospect.state,
        zip: prospect.zip_code,
        country: prospect.country || 'United States',
        sponsor_id: sponsorId,
        matrix_parent_id: finalMatrixParentId,
        matrix_depth: matrixDepth,
        matrix_position: matrixPosition,
        status: 'active',
        // Note: They will need to set their own password via "forgot password" flow
      })
      .select()
      .single();

    if (createError || !newDistributor) {
      console.error('Error creating distributor:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create distributor' },
        { status: 500 }
      );
    }

    // Update prospect to mark as converted
    const { error: updateError } = await serviceClient
      .from('prospects')
      .update({
        status: 'converted',
        converted_to_distributor_id: newDistributor.id,
        converted_at: new Date().toISOString(),
        converted_by: admin.admin.id,
      })
      .eq('id', prospectId);

    if (updateError) {
      console.error('Error updating prospect:', updateError);
      // Note: Distributor was created, so this is not a critical error
    }

    // TODO: Send welcome email if requested
    // if (sendWelcomeEmail) {
    //   await sendWelcomeEmail(newDistributor);
    // }

    return NextResponse.json({
      success: true,
      message: 'Prospect successfully converted to distributor',
      distributor: {
        id: newDistributor.id,
        name: `${newDistributor.first_name} ${newDistributor.last_name}`,
        username: newDistributor.slug,
        email: newDistributor.email,
      },
    });
  } catch (error) {
    console.error('Error in POST convert prospect API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

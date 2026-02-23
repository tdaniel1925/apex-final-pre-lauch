// =============================================
// Profile Photo Upload API
// Stores photo as base64 data URL in database
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ApiResponse, Distributor } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' } as ApiResponse,
        { status: 400 }
      );
    }

    // Convert photo to base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update distributor record with data URL
    const serviceClient = createServiceClient();
    const { data: distributor, error: updateError } = await serviceClient
      .from('distributors')
      .update({ profile_photo_url: dataUrl })
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update profile: ' + updateError.message } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: distributor as Distributor,
      message: 'Photo uploaded successfully',
    } as ApiResponse);
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' } as ApiResponse,
      { status: 500 }
    );
  }
}

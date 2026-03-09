import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('w9') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/w9-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tax-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[API] Error uploading W-9:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tax-documents')
      .getPublicUrl(fileName);

    // Update tax info with W-9 URL
    const { error: updateError } = await supabase
      .from('user_tax_info')
      .upsert({
        user_id: user.id,
        w9_form_url: publicUrl,
        w9_uploaded_at: new Date().toISOString(),
        w9_status: 'pending',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (updateError) {
      console.error('[API] Error updating tax info with W-9:', updateError);
      return NextResponse.json(
        { error: 'Failed to save W-9 info' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[API] Error uploading W-9:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

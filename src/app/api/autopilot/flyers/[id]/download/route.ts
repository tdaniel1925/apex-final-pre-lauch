import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/flyers/[id]/download
 * Download flyer as image file
 * Updates download_count and last_downloaded_at
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to download flyers',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Get flyer
    const { data: flyer, error: flyerError } = await supabase
      .from('event_flyers')
      .select('*')
      .eq('id', id)
      .eq('distributor_id', distributor.id) // Verify ownership
      .single();

    if (flyerError || !flyer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Flyer not found',
        },
        { status: 404 }
      );
    }

    // Check if flyer is ready
    if (flyer.status !== 'ready') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Ready',
          message: `Flyer is not ready for download. Status: ${flyer.status}`,
        },
        { status: 400 }
      );
    }

    if (!flyer.generated_image_url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Flyer image not found',
        },
        { status: 404 }
      );
    }

    // Update download stats
    await supabase
      .from('event_flyers')
      .update({
        download_count: (flyer.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // For data URLs (SVG), we can send them directly
    // For external URLs, we would fetch and proxy the image
    if (flyer.generated_image_url.startsWith('data:')) {
      // Extract base64 data from data URL
      const matches = flyer.generated_image_url.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid Image',
            message: 'Invalid image data',
          },
          { status: 500 }
        );
      }

      const [, mimeType, base64Data] = matches;
      const buffer = Buffer.from(base64Data, 'base64');

      // Determine file extension based on mime type
      let extension = 'png';
      if (mimeType.includes('svg')) {
        extension = 'svg';
      } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        extension = 'jpg';
      }

      const filename = `${flyer.flyer_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } else {
      // For external URLs, redirect to the image
      // In production, you might want to proxy the image for better control
      return NextResponse.redirect(flyer.generated_image_url);
    }
  } catch (error: any) {
    console.error('[Flyers Download API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to download flyer',
      },
      { status: 500 }
    );
  }
}

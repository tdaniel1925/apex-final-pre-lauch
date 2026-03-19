import { NextRequest, NextResponse } from 'next/server';
import { FLYER_TEMPLATES, getFlyerCategories } from '@/lib/autopilot/flyer-templates';

// This endpoint is public (no auth required) to allow users to preview templates
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/autopilot/flyers/templates
 * List available flyer templates
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let templates = FLYER_TEMPLATES;

    // Filter by category if provided
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    // Return template previews (without internal details)
    const templatePreviews = templates.map(template => ({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      previewImageUrl: template.previewImageUrl,
      colors: template.colors,
      supportsCustomLogo: template.supportsCustomLogo,
      supportsCustomColors: template.supportsCustomColors,
      supportsMultipleImages: template.supportsMultipleImages,
    }));

    const categories = getFlyerCategories();

    return NextResponse.json({
      success: true,
      templates: templatePreviews,
      categories,
      total: templatePreviews.length,
    });
  } catch (error: any) {
    console.error('[Flyer Templates API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch flyer templates',
      },
      { status: 500 }
    );
  }
}

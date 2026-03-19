import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { hasReachedLimit } from '@/lib/stripe/autopilot-helpers';
import { generateFlyerImage, validateFlyerData } from '@/lib/autopilot/flyer-generator';
import { getFlyerTemplateById } from '@/lib/autopilot/flyer-templates';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for generating flyer
const generateFlyerSchema = z.object({
  flyer_template_id: z.string().min(1, 'Template ID is required'),
  flyer_title: z.string().min(3, 'Flyer title must be at least 3 characters'),
  event_date: z.string().datetime('Invalid date/time format').optional(),
  event_time: z.string().optional(),
  event_location: z.string().optional(),
  event_address: z.string().optional(),
  event_description: z.string().optional(),
  custom_text: z.string().optional(),
  custom_colors: z.object({
    primary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    secondary: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    accent: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  }).optional(),
  custom_logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

/**
 * POST /api/autopilot/flyers
 * Generate custom flyer from template
 */
export async function POST(request: NextRequest) {
  try {
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
          message: 'You must be logged in to generate flyers',
        },
        { status: 401 }
      );
    }

    // Get distributor info
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, phone')
      .eq('auth_user_id', user.id)
      .single();

    if (distError || !distributor) {
      console.error('[Flyers API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = generateFlyerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid flyer data',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if template exists
    const template = getFlyerTemplateById(data.flyer_template_id);
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Flyer template not found',
        },
        { status: 404 }
      );
    }

    // Check if distributor can generate more flyers
    const hasReached = await hasReachedLimit(distributor.id, 'flyers');
    if (hasReached) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit Reached',
          message: 'You have reached your monthly flyer limit. Please upgrade your plan to generate more flyers.',
        },
        { status: 403 }
      );
    }

    // Additional validation
    const customValidation = validateFlyerData(data);
    if (!customValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid flyer data',
          errors: customValidation.errors.map((e) => ({
            field: 'general',
            message: e,
          })),
        },
        { status: 400 }
      );
    }

    // Create flyer record with status 'generating'
    const { data: flyer, error: createError } = await supabase
      .from('event_flyers')
      .insert({
        distributor_id: distributor.id,
        flyer_template_id: data.flyer_template_id,
        flyer_template_name: template.name,
        flyer_title: data.flyer_title,
        event_date: data.event_date || null,
        event_time: data.event_time || null,
        event_location: data.event_location || null,
        event_address: data.event_address || null,
        event_description: data.event_description || null,
        custom_text: data.custom_text || null,
        custom_colors: data.custom_colors || null,
        custom_logo_url: data.custom_logo_url || null,
        contact_name: data.contact_name || `${distributor.first_name} ${distributor.last_name}`,
        contact_phone: data.contact_phone || distributor.phone || null,
        contact_email: data.contact_email || distributor.email,
        contact_website: data.contact_website || null,
        status: 'generating',
      })
      .select()
      .single();

    if (createError || !flyer) {
      console.error('[Flyers API] Error creating flyer:', createError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to create flyer',
        },
        { status: 500 }
      );
    }

    try {
      // Generate flyer image
      const generatedFlyer = await generateFlyerImage(data.flyer_template_id, data);

      // Update flyer with generated URLs
      const { data: updatedFlyer, error: updateError } = await supabase
        .from('event_flyers')
        .update({
          generated_image_url: generatedFlyer.imageUrl,
          generated_pdf_url: generatedFlyer.pdfUrl || null,
          status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', flyer.id)
        .select()
        .single();

      if (updateError) {
        console.error('[Flyers API] Error updating flyer:', updateError);
        return NextResponse.json(
          {
            success: false,
            error: 'Database Error',
            message: 'Flyer generated but failed to save',
          },
          { status: 500 }
        );
      }

      // Increment usage counter
      const { error: usageError } = await supabase.rpc('increment_autopilot_usage', {
        p_distributor_id: distributor.id,
        p_limit_type: 'flyers',
        p_increment: 1,
      });

      if (usageError) {
        console.error('[Flyers API] Warning: Failed to increment usage counter:', usageError);
      }

      return NextResponse.json({
        success: true,
        message: 'Flyer generated successfully',
        flyer: {
          id: updatedFlyer.id,
          flyer_title: updatedFlyer.flyer_title,
          flyer_template_name: updatedFlyer.flyer_template_name,
          generated_image_url: updatedFlyer.generated_image_url,
          generated_pdf_url: updatedFlyer.generated_pdf_url,
          status: updatedFlyer.status,
          created_at: updatedFlyer.created_at,
        },
      });
    } catch (generationError: any) {
      console.error('[Flyers API] Error generating flyer:', generationError);

      // Update status to failed
      await supabase
        .from('event_flyers')
        .update({
          status: 'failed',
          generation_error: generationError.message || 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', flyer.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Generation Failed',
          message: generationError.message || 'Failed to generate flyer',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Flyers API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to generate flyer',
      },
      { status: 500 }
    );
  }
}

// Validation schema for listing flyers
const listFlyersSchema = z.object({
  status: z.enum(['all', 'draft', 'generating', 'ready', 'failed']).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/autopilot/flyers
 * List all flyers for current user
 */
export async function GET(request: NextRequest) {
  try {
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
          message: 'You must be logged in to view flyers',
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
      console.error('[Flyers API] Error fetching distributor:', distError);
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Distributor profile not found',
        },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      status: searchParams.get('status') || 'all',
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // Validate parameters
    const validation = listFlyersSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid query parameters',
          errors: validation.error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { status, limit, offset, startDate, endDate } = validation.data;

    // Build query
    let query = supabase
      .from('event_flyers')
      .select('*', { count: 'exact' })
      .eq('distributor_id', distributor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: flyers, error: listError, count } = await query;

    if (listError) {
      console.error('[Flyers API] Error listing flyers:', listError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database Error',
          message: 'Failed to fetch flyers',
        },
        { status: 500 }
      );
    }

    // Get usage stats
    const { data: usageLimits } = await supabase
      .from('autopilot_usage_limits')
      .select('flyers_generated_this_month, flyers_limit')
      .eq('distributor_id', distributor.id)
      .single();

    return NextResponse.json({
      success: true,
      flyers: flyers || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
      usage: usageLimits ? {
        used: usageLimits.flyers_generated_this_month,
        limit: usageLimits.flyers_limit,
        remaining: usageLimits.flyers_limit === -1
          ? 999999
          : Math.max(0, usageLimits.flyers_limit - usageLimits.flyers_generated_this_month),
      } : undefined,
    });
  } catch (error: any) {
    console.error('[Flyers API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error.message || 'Failed to fetch flyers',
      },
      { status: 500 }
    );
  }
}

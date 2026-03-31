// =============================================
// AI Genealogy Analysis Cron Job
// Runs daily at 6:00 AM CST (11:00 UTC)
// Generates AI-powered team recommendations for all distributors
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeTeamWithAI, saveRecommendations } from '@/lib/ai/genealogy-analyzer';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get all distributors with Business Center subscriptions (feature gated)
    // Only generate recommendations for paid subscribers
    const { data: eligibleDistributors, error: fetchError } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        service_access!service_access_distributor_id_fkey (
          feature,
          is_active
        )
      `)
      .eq('service_access.feature', '/dashboard/genealogy')
      .eq('service_access.is_active', true);

    if (fetchError) {
      console.error('Error fetching eligible distributors:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch distributors' },
        { status: 500 }
      );
    }

    if (!eligibleDistributors || eligibleDistributors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible distributors found (Business Center subscribers only)',
        processed: 0,
      });
    }

    // Process each distributor
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as { distributorId: string; error: string }[],
    };

    for (const dist of eligibleDistributors) {
      try {
        results.processed++;

        // Delete old recommendations (keep last 7 days only)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        await supabase
          .from('ai_genealogy_recommendations')
          .delete()
          .eq('distributor_id', dist.id)
          .lt('created_at', sevenDaysAgo.toISOString());

        // Generate new recommendations
        const recommendations = await analyzeTeamWithAI(dist.id);

        // Save to database
        await saveRecommendations(dist.id, recommendations);

        results.succeeded++;

        console.log(
          `✅ Generated ${recommendations.length} recommendations for ${dist.first_name} ${dist.last_name}`
        );
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          distributorId: dist.id,
          error: error?.message || 'Unknown error',
        });

        console.error(`❌ Failed for distributor ${dist.id}:`, error);
      }

      // Rate limiting: Small delay between API calls to avoid hitting Anthropic rate limits
      // Claude API has 50 requests/minute limit on standard tier
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5 second delay = ~40 requests/min
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        total_eligible: eligibleDistributors.length,
        processed: results.processed,
        succeeded: results.succeeded,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('Error in AI genealogy analysis cron:', error);
    return NextResponse.json(
      {
        error: 'Failed to run AI genealogy analysis',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

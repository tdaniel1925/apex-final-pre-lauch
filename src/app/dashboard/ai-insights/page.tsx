// =============================================
// AI Insights Page
// Full page view of AI-generated team recommendations
// Feature-gated for Business Center subscribers only
// =============================================

import { Metadata } from 'next';
import { Sparkles, TrendingUp, Users, AlertCircle, Target, Lightbulb, GraduationCap, CheckCircle2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentDistributor } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';

export const metadata: Metadata = {
  title: 'AI Team Insights | Apex Affinity Group',
  description: 'AI-powered team analysis and strategic recommendations',
};

// Fetch recommendations server-side
async function getRecommendations(distributorId: string) {
  const supabase = await createClient();

  // Get active recommendations from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recommendations, error } = await supabase
    .from('ai_genealogy_recommendations')
    .select('*')
    .eq('distributor_id', distributorId)
    .gte('generated_at', sevenDaysAgo.toISOString())
    .order('dismissed', { ascending: true }) // Active first
    .order('completed', { ascending: true }) // Incomplete first
    .order('priority', { ascending: false }) // urgent > high > medium > low
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }

  return recommendations || [];
}

export default async function AIInsightsPage() {
  const currentDist = await getCurrentDistributor();
  if (!currentDist) {
    redirect('/login');
  }

  // Check Business Center access
  const supabase = await createClient();
  const { data: access } = await supabase
    .from('service_access')
    .select('is_active')
    .eq('distributor_id', currentDist.id)
    .eq('feature', '/dashboard/genealogy')
    .single();

  const hasAccess = access?.is_active || false;

  // Calculate days without Business Center
  const signupDate = new Date(currentDist.created_at);
  const daysWithout = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

  const recommendations = await getRecommendations(currentDist.id);

  // Separate active vs dismissed/completed
  const activeRecs = recommendations.filter((r) => !r.dismissed && !r.completed);
  const archivedRecs = recommendations.filter((r) => r.dismissed || r.completed);

  return (
    <FeatureGate
      featurePath="/dashboard/ai-insights"
      hasAccess={hasAccess}
      daysWithout={daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">AI Team Insights</h1>
                <p className="text-slate-600 mt-1">
                  Strategic recommendations powered by AI, generated daily at 6:00 AM CST
                </p>
              </div>
            </div>
          </div>

          {/* Active Recommendations */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Active Recommendations</h2>

            {activeRecs.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recommendations Yet</h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  AI insights are generated daily at 6:00 AM CST. Check back tomorrow for strategic recommendations to grow your team.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {activeRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            )}
          </div>

          {/* Archived Recommendations */}
          {archivedRecs.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Archived ({archivedRecs.length})
              </h2>
              <div className="grid gap-4">
                {archivedRecs.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} archived />
                ))}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              How AI Insights Work
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  AI analyzes your team data daily, including ranks, QV, team growth, and activity levels
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Recommendations focus on rank advancement, team activation, and commission optimization
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Use these as strategic guidance - they are not financial advice or guarantees
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>
                  Mark recommendations as completed when done, or dismiss if not relevant
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

// Client Component for Interactive Card
function RecommendationCard({
  recommendation,
  archived = false,
}: {
  recommendation: any;
  archived?: boolean;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rank_progress':
        return <TrendingUp className="w-5 h-5" />;
      case 'team_growth':
        return <Users className="w-5 h-5" />;
      case 'inactive_reps':
        return <AlertCircle className="w-5 h-5" />;
      case 'sales_opportunity':
        return <Target className="w-5 h-5" />;
      case 'training_needed':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return archived
          ? 'bg-slate-50 text-slate-600 border-slate-200'
          : 'bg-red-50 text-red-900 border-red-300';
      case 'high':
        return archived
          ? 'bg-slate-50 text-slate-600 border-slate-200'
          : 'bg-orange-50 text-orange-900 border-orange-300';
      case 'medium':
        return archived
          ? 'bg-slate-50 text-slate-600 border-slate-200'
          : 'bg-yellow-50 text-yellow-900 border-yellow-300';
      case 'low':
        return archived
          ? 'bg-slate-50 text-slate-600 border-slate-200'
          : 'bg-green-50 text-green-900 border-green-300';
      default:
        return 'bg-slate-50 text-slate-900 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`border rounded-lg p-6 ${getPriorityColor(recommendation.priority)} ${
        archived ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1">{getTypeIcon(recommendation.recommendation_type)}</div>

          <div className="flex-1">
            {/* Priority Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded">
                {recommendation.priority}
              </span>
              <span className="text-xs text-slate-500">
                {formatDate(recommendation.generated_at)}
              </span>
              {archived && (
                <span className="text-xs text-slate-500">
                  {recommendation.completed && '• Completed'}
                  {recommendation.dismissed && '• Dismissed'}
                </span>
              )}
            </div>

            {/* Recommendation Text */}
            <p className="text-base font-medium leading-relaxed mb-4">
              {recommendation.recommendation_text}
            </p>

            {/* Action Items */}
            {recommendation.action_items && recommendation.action_items.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Action Steps:</h4>
                <ul className="space-y-2">
                  {recommendation.action_items.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-slate-400 mt-0.5">#{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (only show for active recommendations) */}
        {!archived && (
          <div className="flex items-start gap-2">
            <form action={`/api/dashboard/ai-recommendations/${recommendation.id}/complete`} method="POST">
              <button
                type="submit"
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Mark as completed"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </form>
            <form action={`/api/dashboard/ai-recommendations/${recommendation.id}/dismiss`} method="POST">
              <button
                type="submit"
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

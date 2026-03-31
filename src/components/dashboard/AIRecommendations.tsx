'use client';

// =============================================
// AI Recommendations Widget
// Displays today's AI-generated team insights
// Shows on main dashboard for Business Center subscribers
// =============================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, TrendingUp, Users, AlertCircle, CheckCircle2, X } from 'lucide-react';

type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

interface Recommendation {
  id: string;
  recommendation_text: string;
  recommendation_type: string;
  priority: PriorityLevel;
  action_items: string[];
  dismissed: boolean;
  completed: boolean;
  generated_at: string;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/ai-recommendations');

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      console.error('Error fetching AI recommendations:', err);
      setError(err?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/ai-recommendations/${id}/dismiss`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss recommendation');
      }

      // Remove from UI
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      console.error('Error dismissing recommendation:', err);
    }
  };

  const completeRecommendation = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/ai-recommendations/${id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete recommendation');
      }

      // Remove from UI
      setRecommendations((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      console.error('Error completing recommendation:', err);
    }
  };

  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rank_progress':
        return <TrendingUp className="w-5 h-5" />;
      case 'team_growth':
        return <Users className="w-5 h-5" />;
      case 'inactive_reps':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">AI Team Insights</h3>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 rounded animate-pulse" />
          <div className="h-20 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">AI Team Insights</h3>
        </div>
        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded">
          <p>Unable to load recommendations. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">AI Team Insights</h3>
        </div>
        <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded text-center">
          <p>No recommendations available yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            AI insights are generated daily at 6:00 AM CST.
          </p>
        </div>
      </div>
    );
  }

  // Show recommendations
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">AI Team Insights</h3>
        </div>
        <Link
          href="/dashboard/ai-insights"
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((rec) => (
          <div
            key={rec.id}
            className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">{getTypeIcon(rec.recommendation_type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">{rec.recommendation_text}</p>

                  {/* Action Items */}
                  {rec.action_items && rec.action_items.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {rec.action_items.slice(0, 2).map((item, index) => (
                        <li key={index} className="text-xs flex items-start gap-2">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-start gap-1">
                <button
                  onClick={() => completeRecommendation(rec.id)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Mark as completed"
                  aria-label="Mark as completed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dismissRecommendation(rec.id)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Dismiss"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          Recommendations generated by AI daily at 6:00 AM CST. Use as guidance, not financial advice.
        </p>
      </div>
    </div>
  );
}

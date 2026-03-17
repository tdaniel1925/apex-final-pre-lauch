'use client';

// =============================================
// Activity Feed Component
// Real-time organization-wide activity stream
// =============================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ActivityFeedItem } from '@/app/api/activity-feed/route';

interface ActivityFeedProps {
  distributorId: string;
  initialActivities?: ActivityFeedItem[];
}

export default function ActivityFeed({ distributorId, initialActivities = [] }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(initialActivities);
  const [loading, setLoading] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('week');
  const [maxDepthFilter, setMaxDepthFilter] = useState<number>(7);

  // CLIENT-SIDE FILTERING (no API calls - pure display component)
  // Filter the server-rendered initialActivities based on client-side filters
  useEffect(() => {
    let filtered = [...initialActivities];

    // Apply event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(a => a.event_type === eventTypeFilter);
    }

    // Apply depth filter
    if (maxDepthFilter < 7) {
      filtered = filtered.filter(a => a.depth_from_root <= maxDepthFilter);
    }

    // Apply period filter
    if (periodFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (periodFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(a => new Date(a.created_at) >= startDate);
    }

    setActivities(filtered);
  }, [eventTypeFilter, periodFilter, maxDepthFilter, initialActivities]);

  // Get icon for event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'signup':
        return '✅';
      case 'rank_advancement':
        return '🎉';
      case 'matrix_filled':
        return '🏆';
      case 'first_sale':
        return '💰';
      case 'fast_start_complete':
        return '🌟';
      case 'team_milestone':
        return '📈';
      case 'volume_goal':
        return '🎯';
      default:
        return '📣';
    }
  };

  // Get color for event type
  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'signup':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'rank_advancement':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'matrix_filled':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'first_sale':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'fast_start_complete':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'team_milestone':
        return 'bg-pink-100 border-pink-300 text-pink-800';
      case 'volume_goal':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
          <p className="text-xs text-gray-500">Auto-refreshes on page reload</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Event Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              <option value="signup">New Signups</option>
              <option value="rank_advancement">Rank Advances</option>
              <option value="matrix_filled">Matrix Filled</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Depth Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Depth (Level {maxDepthFilter})
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={maxDepthFilter}
              onChange={(e) => setMaxDepthFilter(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {loading && activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg mb-2">📭</p>
            <p className="font-medium">No activities yet</p>
            <p className="text-sm">Activities from your organization will appear here</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getEventColor(activity.event_type)}`}
            >
              <div className="flex items-start gap-3">
                {/* Icon/Avatar */}
                <div className="flex-shrink-0">
                  {activity.actor_photo_url ? (
                    <img
                      src={activity.actor_photo_url}
                      alt={activity.actor_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                      {activity.actor_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        <span className="mr-2">{getEventIcon(activity.event_type)}</span>
                        {activity.event_title}
                      </p>
                      {activity.event_description && (
                        <p className="text-xs text-gray-600 mb-1">{activity.event_description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <Link
                          href={`/dashboard/matrix/${activity.actor_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          @{activity.actor_slug}
                        </Link>
                        <span>•</span>
                        <span>Level {activity.depth_from_root}</span>
                        <span>•</span>
                        <span>{formatTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {activities.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-600">
            Showing {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
            {periodFilter !== 'all' && ` from ${periodFilter === 'today' ? 'today' : periodFilter === 'week' ? 'this week' : 'this month'}`}
          </p>
        </div>
      )}
    </div>
  );
}

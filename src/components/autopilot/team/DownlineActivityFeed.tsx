'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, DollarSign, TrendingUp, GraduationCap, Filter } from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  distributor_name: string;
  distributor_level: number;
  description: string;
  metadata: any;
  created_at: string;
}

export function DownlineActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchActivities();
  }, [filter, days]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        activity_type: filter,
        days: days.toString(),
      });

      const response = await fetch(`/api/autopilot/team/downline/activity?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'sale':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'rank_advancement':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'training_completed':
        return <GraduationCap className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'bg-blue-50 border-blue-200';
      case 'sale':
        return 'bg-green-50 border-green-200';
      case 'rank_advancement':
        return 'bg-purple-50 border-purple-200';
      case 'training_completed':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Activities</option>
            <option value="signup">New Signups</option>
            <option value="sale">Sales</option>
            <option value="rank_advancement">Rank Advancements</option>
            <option value="training_completed">Training Completed</option>
          </select>

          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </Card>

      {/* Activity Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No activity found</p>
          <p className="text-sm mt-2">Activities from your downline will appear here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id} className={`p-4 border ${getActivityColor(activity.activity_type)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{activity.description}</span>
                    <Badge variant="outline" className="text-xs">
                      Level {activity.distributor_level}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

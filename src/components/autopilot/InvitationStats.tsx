'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Send, Eye, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getInvitationStats } from '@/lib/autopilot/invitation-helpers';

interface Stats {
  totalSent: number;
  totalOpened: number;
  totalResponded: number;
  respondedYes: number;
  respondedNo: number;
  respondedMaybe: number;
  openRate: number;
  responseRate: number;
}

export function InvitationStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // This would normally call an API endpoint that uses getInvitationStats
      // For now, we'll fetch invitations and calculate locally
      const response = await fetch('/api/autopilot/invitations');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.invitations) {
          const invitations = data.invitations;

          // Calculate stats
          const totalSent = invitations.length;
          const totalOpened = invitations.filter((i: any) => i.opened_at !== null).length;
          const totalResponded = invitations.filter((i: any) => i.response_type !== null).length;
          const respondedYes = invitations.filter((i: any) => i.response_type === 'yes').length;
          const respondedNo = invitations.filter((i: any) => i.response_type === 'no').length;
          const respondedMaybe = invitations.filter((i: any) => i.response_type === 'maybe').length;

          const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
          const responseRate = totalSent > 0 ? (totalResponded / totalSent) * 100 : 0;

          setStats({
            totalSent,
            totalOpened,
            totalResponded,
            respondedYes,
            respondedNo,
            respondedMaybe,
            openRate: Math.round(openRate * 10) / 10,
            responseRate: Math.round(responseRate * 10) / 10,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Sent',
      value: stats.totalSent,
      icon: <Send className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Opened',
      value: `${stats.totalOpened} (${stats.openRate}%)`,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Responded',
      value: `${stats.totalResponded} (${stats.responseRate}%)`,
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-navy-900">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Response Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Response Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Yes</div>
              <div className="text-xl font-bold text-navy-900">{stats.respondedYes}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-50">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Maybe</div>
              <div className="text-xl font-bold text-navy-900">{stats.respondedMaybe}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">No</div>
              <div className="text-xl font-bold text-navy-900">{stats.respondedNo}</div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        {stats.totalResponded > 0 && (
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Acceptance Rate</span>
                <span className="font-medium text-navy-900">
                  {Math.round((stats.respondedYes / stats.totalResponded) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(stats.respondedYes / stats.totalResponded) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Phone, Mail, Calendar, Plus, MessageSquare } from 'lucide-react';

const activityIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
};

const activityColors: Record<string, string> = {
  call: 'bg-blue-100 text-blue-700',
  email: 'bg-green-100 text-green-700',
  meeting: 'bg-purple-100 text-purple-700',
  note: 'bg-yellow-100 text-yellow-700',
};

interface ActivitiesContentProps {
  activities: any[];
}

export default function ActivitiesContent({ activities }: ActivitiesContentProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Activities</h2>
          <p className="text-slate-600">Track all customer interactions and activities</p>
        </div>
        <Link
          href="/dashboard/crm/activities/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Log Activity
        </Link>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No activities yet</h3>
          <p className="text-slate-600 mb-6">Start tracking your customer interactions</p>
          <Link
            href="/dashboard/crm/activities/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Log Activity
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="divide-y divide-slate-200">
            {activities.map((activity: any) => {
              const Icon = activityIcons[activity.activity_type] || MessageSquare;
              const colorClass = activityColors[activity.activity_type] || 'bg-slate-100 text-slate-700';

              return (
                <div
                  key={activity.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-medium text-slate-900 mb-1">
                            {activity.subject || activity.activity_type}
                          </h3>
                          {activity.description && (
                            <p className="text-sm text-slate-600 mb-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 ml-4">
                          {new Date(activity.activity_date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className={`px-2 py-1 rounded ${colorClass}`}>
                          {activity.activity_type}
                        </span>
                        {activity.duration && (
                          <span>Duration: {activity.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

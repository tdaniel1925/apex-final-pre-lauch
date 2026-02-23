'use client';

// =============================================
// Admin Activity Log Panel
// Display admin activity history for a distributor
// =============================================

import { useState, useEffect } from 'react';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_name: string;
  distributor_id: string | null;
  distributor_name: string | null;
  action_type: string;
  action_description: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
    fields: string[];
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ActivityLogPanelProps {
  distributorId: string;
}

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'note_added', label: 'Note Added' },
  { value: 'note_updated', label: 'Note Updated' },
  { value: 'note_deleted', label: 'Note Deleted' },
  { value: 'status_changed', label: 'Status Changed' },
  { value: 'profile_updated', label: 'Profile Updated' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'activated', label: 'Activated' },
  { value: 'deleted', label: 'Deleted' },
];

export default function ActivityLogPanel({ distributorId }: ActivityLogPanelProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterActionType, setFilterActionType] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [distributorId, page, filterActionType]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filterActionType) {
        params.append('actionType', filterActionType);
      }

      const response = await fetch(
        `/api/admin/distributors/${distributorId}/activity?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activity log');
      }

      const data = await response.json();
      setActivities(data.activities || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'password_reset':
        return '🔑';
      case 'note_added':
        return '📝';
      case 'note_updated':
        return '✏️';
      case 'note_deleted':
        return '🗑️';
      case 'status_changed':
        return '🔄';
      case 'suspended':
        return '⚠️';
      case 'activated':
        return '✅';
      case 'deleted':
        return '❌';
      case 'profile_updated':
        return '👤';
      default:
        return '📋';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'password_reset':
        return 'blue';
      case 'note_added':
      case 'note_updated':
        return 'green';
      case 'note_deleted':
      case 'deleted':
        return 'red';
      case 'status_changed':
      case 'profile_updated':
        return 'purple';
      case 'suspended':
        return 'orange';
      case 'activated':
        return 'green';
      default:
        return 'gray';
    }
  };

  const toggleExpand = (activityId: string) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          Activity Log
          {total > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">{total}</span>
          )}
        </h2>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Filter:</label>
          <select
            value={filterActionType}
            onChange={(e) => {
              setFilterActionType(e.target.value);
              setPage(1);
            }}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md"
          >
            {ACTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Activity Timeline */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No activity found</p>
          <p className="text-xs mt-1">Admin actions will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < activities.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full bg-${getActionColor(
                      activity.action_type
                    )}-100 flex items-center justify-center text-lg relative z-10`}
                  >
                    {getActionIcon(activity.action_type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action_description}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            by {activity.admin_name} ({activity.admin_email})
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatDateTime(activity.created_at)}
                        </span>
                      </div>

                      {/* Changes Details (if available) */}
                      {activity.changes && activity.changes.fields.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleExpand(activity.id)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            {expandedActivity === activity.id ? (
                              <>
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 15l7-7 7 7"
                                  />
                                </svg>
                                Hide changes
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                                View changes ({activity.changes.fields.length} fields)
                              </>
                            )}
                          </button>

                          {expandedActivity === activity.id && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-xs">
                              <p className="font-semibold text-gray-700 mb-2">Changed fields:</p>
                              {activity.changes.fields.map((field) => (
                                <div key={field} className="mb-2 pb-2 border-b border-gray-100 last:border-0">
                                  <p className="font-medium text-gray-900 mb-1">{field}</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-gray-600 mb-0.5">Before:</p>
                                      <p className="text-red-700 bg-red-50 px-2 py-1 rounded">
                                        {JSON.stringify(activity.changes.before[field]) || 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 mb-0.5">After:</p>
                                      <p className="text-green-700 bg-green-50 px-2 py-1 rounded">
                                        {JSON.stringify(activity.changes.after[field]) || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
                activities
              </p>

              <div className="flex gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-xs text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages || isLoading}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

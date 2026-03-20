'use client';

// =============================================
// Activity Log Client Component
// Real-time admin activity tracking and audit trail
// =============================================

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_name: string;
  distributor_id: string | null;
  distributor_name: string | null;
  action_type: string;
  action_description: string | null;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  } | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ActivityLogClientProps {
  activities: ActivityLog[];
}

export default function ActivityLogClient({ activities }: ActivityLogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDistributor, setFilterDistributor] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Extract unique action types and target types
  const actionTypes = useMemo(() => {
    const types = new Set(activities.map(a => a.action_type));
    return ['all', ...Array.from(types).sort()];
  }, [activities]);

  const distributorNames = useMemo(() => {
    const names = new Set(activities.map(a => a.distributor_name).filter(Boolean));
    return ['all', ...Array.from(names).sort()];
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        activity.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.distributor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.admin_name.toLowerCase().includes(searchQuery.toLowerCase());

      // Action filter
      const matchesAction = filterAction === 'all' || activity.action_type === filterAction;

      // Distributor filter
      const matchesDistributor = filterDistributor === 'all' || activity.distributor_name === filterDistributor;

      return matchesSearch && matchesAction && matchesDistributor;
    });
  }, [activities, searchQuery, filterAction, filterDistributor]);

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAction, filterDistributor]);

  // Get action color based on action_type
  const getActionColor = (actionType: string) => {
    const type = actionType.toLowerCase();
    if (type.includes('activate') || type.includes('unsuspend')) return 'text-green-700 bg-green-50';
    if (type.includes('update') || type.includes('edit') || type.includes('change')) return 'text-blue-700 bg-blue-50';
    if (type.includes('delete') || type.includes('suspend')) return 'text-red-700 bg-red-50';
    if (type.includes('password') || type.includes('email')) return 'text-purple-700 bg-purple-50';
    if (type.includes('note') || type.includes('placement')) return 'text-yellow-700 bg-yellow-50';
    return 'text-gray-700 bg-gray-50';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete audit trail of all admin actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Total Activities</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{activities.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Filtered Results</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{filteredActivities.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Action Types</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{actionTypes.length - 1}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-500">Distributors</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{distributorNames.length - 1}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, targets, admins..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {actionTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Actions' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Distributor Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distributor
            </label>
            <select
              value={filterDistributor}
              onChange={(e) => setFilterDistributor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {distributorNames.map((name, index) => (
                <option key={name ? `distributor-${name}` : `no-distributor-${index}`} value={name || ''}>
                  {name === 'all' ? 'All Distributors' : name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distributor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Changes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No activity logs found matching your filters
                  </td>
                </tr>
              ) : (
                paginatedActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(activity.action_type)}`}>
                        {activity.action_type}
                      </span>
                      {activity.action_description && (
                        <div className="text-xs text-gray-500 mt-1">{activity.action_description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.distributor_name ? (
                        <div>
                          <div className="font-medium">{activity.distributor_name}</div>
                          {activity.distributor_id && (
                            <div className="text-xs text-gray-500 truncate max-w-xs" title={activity.distributor_id}>
                              ID: {activity.distributor_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{activity.admin_name}</div>
                        <div className="text-xs text-gray-500">{activity.admin_email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activity.changes ? (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            View Changes
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs max-w-md">
                            {activity.changes.fields && (
                              <div className="mb-2 text-gray-600 font-medium">
                                Changed fields: {activity.changes.fields.join(', ')}
                              </div>
                            )}
                            <pre className="overflow-x-auto">
                              {JSON.stringify(activity.changes, null, 2)}
                            </pre>
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredActivities.length)}
              </span>{' '}
              of <span className="font-medium">{filteredActivities.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

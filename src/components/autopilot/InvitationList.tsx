'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Send,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { formatMeetingDateTime } from '@/lib/autopilot/invitation-helpers';
import type { MeetingInvitation } from '@/lib/autopilot/invitation-helpers';

interface InvitationListProps {
  onRefresh?: () => void;
}

type FilterStatus = 'all' | 'sent' | 'opened' | 'responded_yes' | 'responded_no' | 'responded_maybe' | 'expired';

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  opened: { label: 'Opened', color: 'bg-purple-100 text-purple-700' },
  responded_yes: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  responded_no: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  responded_maybe: { label: 'Maybe', color: 'bg-yellow-100 text-yellow-700' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-500' },
  canceled: { label: 'Canceled', color: 'bg-gray-100 text-gray-500' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

// Fallback for unknown statuses
const getStatusDisplay = (status: string) => {
  return statusConfig[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-500' };
};

export function InvitationList({ onRefresh }: InvitationListProps) {
  const [invitations, setInvitations] = useState<MeetingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchInvitations();
  }, [filter, page]);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      const response = await fetch(`/api/autopilot/invitations?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInvitations(data.invitations || []);
          setTotalCount(data.pagination?.total || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/autopilot/invitations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        setTotalCount((prev) => prev - 1);
        if (onRefresh) onRefresh();
      } else {
        alert('Failed to delete invitation');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      alert('An error occurred while deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const response = await fetch(`/api/autopilot/invitations/${id}/resend`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Invitation resent successfully!');
        fetchInvitations();
        if (onRefresh) onRefresh();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to resend invitation');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('An error occurred while resending');
    } finally {
      setResendingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as FilterStatus);
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="all">All Invitations</option>
            <option value="sent">Sent</option>
            <option value="opened">Opened</option>
            <option value="responded_yes">Accepted</option>
            <option value="responded_no">Declined</option>
            <option value="responded_maybe">Maybe</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvitations}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && invitations.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center">
          <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Invitations Found</h3>
          <p className="text-gray-500">
            {filter === 'all'
              ? "You haven't sent any invitations yet."
              : `No invitations with status: ${filter}`}
          </p>
        </Card>
      ) : (
        /* Invitation Cards */
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-navy-900">
                      {invitation.meeting_title}
                    </h3>
                    <Badge className={getStatusDisplay(invitation.status).color}>
                      {getStatusDisplay(invitation.status).label}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>To:</strong> {invitation.recipient_name} ({invitation.recipient_email})
                    </p>
                    <p>
                      <strong>When:</strong> {formatMeetingDateTime(invitation.meeting_date_time)}
                    </p>
                    {invitation.meeting_link && (
                      <p>
                        <strong>Link:</strong>{' '}
                        <a
                          href={invitation.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline"
                        >
                          {invitation.meeting_link}
                        </a>
                      </p>
                    )}
                    {invitation.meeting_location && (
                      <p>
                        <strong>Location:</strong> {invitation.meeting_location}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    {invitation.sent_at && (
                      <span>
                        Sent: {new Date(invitation.sent_at).toLocaleDateString()}
                      </span>
                    )}
                    {invitation.open_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Opened {invitation.open_count} time{invitation.open_count !== 1 ? 's' : ''}
                      </span>
                    )}
                    {invitation.responded_at && (
                      <span>
                        Responded: {new Date(invitation.responded_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!invitation.response_type && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(invitation.id)}
                      disabled={resendingId === invitation.id}
                    >
                      {resendingId === invitation.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(invitation.id)}
                    disabled={deletingId === invitation.id}
                  >
                    {deletingId === invitation.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Showing {page * limit + 1}-{Math.min((page + 1) * limit, totalCount)} of {totalCount}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

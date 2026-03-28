// =============================================
// Support Tickets List Page
// View all submitted support tickets
// =============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  ticket_type: 'bug' | 'question' | 'feedback' | 'other';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  last_response_at: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_response: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_response: 'Waiting for Response',
  resolved: 'Resolved',
  closed: 'Closed',
};

const TYPE_ICONS = {
  bug: '🐛',
  question: '❓',
  feedback: '💬',
  other: '📝',
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, pagination.page]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/support/tickets?${params}`);
      const data = await response.json();

      setTickets(data.tickets || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
              <p className="text-slate-600 mt-1">View and manage your support requests</p>
            </div>
            <Link
              href="/dashboard/support"
              className="px-4 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
            >
              New Ticket
            </Link>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700">Filter by status:</span>
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-[#2B4C7E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[#2B4C7E] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#2B4C7E] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tickets found</h3>
            <p className="text-slate-600 mb-6">
              {statusFilter
                ? `You don't have any ${STATUS_LABELS[statusFilter as keyof typeof STATUS_LABELS]} tickets.`
                : "You haven't submitted any support tickets yet."}
            </p>
            <Link
              href="/dashboard/support"
              className="inline-block px-6 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
            >
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/support/tickets/${ticket.id}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{TYPE_ICONS[ticket.ticket_type]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-slate-600">
                              {ticket.ticket_number}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                STATUS_COLORS[ticket.status]
                              }`}
                            >
                              {STATUS_LABELS[ticket.status]}
                            </span>
                            {ticket.priority !== 'normal' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {ticket.priority.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mt-1 truncate">
                            {ticket.subject}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {getTimeAgo(ticket.created_at)}</span>
                        </div>
                        {ticket.last_response_at && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>Last response {getTimeAgo(ticket.last_response_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div>
                      {ticket.status === 'resolved' || ticket.status === 'closed' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : ticket.status === 'waiting_response' ? (
                        <AlertCircle className="w-6 h-6 text-purple-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

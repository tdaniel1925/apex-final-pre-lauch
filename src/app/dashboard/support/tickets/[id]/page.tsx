// =============================================
// Support Ticket Detail Page
// View ticket details and add responses
// =============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, MessageSquare, Paperclip, Send } from 'lucide-react';

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  ticket_type: 'bug' | 'question' | 'feedback' | 'other';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  last_response_at: string | null;
  browser_info: any;
  device_info: any;
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  message: string;
  is_internal: boolean;
  is_staff: boolean;
  author_name: string;
  author_email: string;
  created_at: string;
}

interface Attachment {
  id: string;
  ticket_id: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
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

const TYPE_LABELS = {
  bug: 'Bug Report',
  question: 'Question',
  feedback: 'Feedback',
  other: 'Other',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setTicketId(p.id);
      fetchTicketDetails(p.id);
    });
  }, []);

  const fetchTicketDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/support/tickets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      setTicket(data.ticket);
      setResponses(data.responses || []);
      setAttachments(data.attachments || []);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      alert('Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !ticketId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add response');
      }

      const newResponse = await response.json();
      setResponses([...responses, newResponse]);
      setNewMessage('');

      // Refresh ticket details to update status
      if (ticketId) {
        fetchTicketDetails(ticketId);
      }
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Failed to add response. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#2B4C7E] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ticket not found</h2>
            <p className="text-slate-600 mb-6">The ticket you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              href="/dashboard/support/tickets"
              className="inline-block px-6 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
            >
              Back to Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/support/tickets"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Tickets
        </Link>

        {/* Ticket Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-slate-600">{ticket.ticket_number}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                  {STATUS_LABELS[ticket.status]}
                </span>
                {ticket.priority !== 'normal' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {ticket.priority.toUpperCase()}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{ticket.subject}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(ticket.created_at)}</span>
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                  {TYPE_LABELS[ticket.ticket_type]}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Description */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Description:</h3>
            <p className="text-slate-900 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border-t border-slate-200 pt-4 mt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments ({attachments.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg hover:border-[#2B4C7E] transition-colors group"
                  >
                    {attachment.mime_type?.startsWith('image/') ? (
                      <img
                        src={attachment.file_url}
                        alt={attachment.file_name}
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-32 bg-slate-100 rounded flex items-center justify-center">
                        <Paperclip className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div className="text-xs">
                      <p className="font-medium text-slate-900 truncate group-hover:text-[#2B4C7E]">
                        {attachment.file_name}
                      </p>
                      <p className="text-slate-500">{formatFileSize(attachment.file_size_bytes)}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Browser/Device Info (collapsed) */}
          {(ticket.browser_info || ticket.device_info) && (
            <details className="border-t border-slate-200 pt-4 mt-4">
              <summary className="text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">
                Technical Information
              </summary>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                {ticket.browser_info && (
                  <div>
                    <span className="font-medium">Browser:</span> {ticket.browser_info.userAgent}
                  </div>
                )}
                {ticket.device_info && (
                  <div>
                    <span className="font-medium">Screen:</span> {ticket.device_info.screenWidth}x
                    {ticket.device_info.screenHeight}
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Responses ({responses.length})
          </h2>

          {responses.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No responses yet. Be the first to respond!</p>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.is_staff ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          response.is_staff ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{response.author_name}</span>
                        {response.is_staff && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            Staff
                          </span>
                        )}
                        <span className="text-xs text-slate-500">{formatDate(response.created_at)}</span>
                      </div>
                      <p className="text-slate-900 whitespace-pre-wrap">{response.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Response (only if ticket not closed) */}
        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Response</h3>
            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:border-transparent resize-none"
                required
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !newMessage.trim()}
                  className="px-6 py-2 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

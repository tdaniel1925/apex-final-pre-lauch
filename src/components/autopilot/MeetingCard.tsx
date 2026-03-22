/**
 * Meeting Card - Individual meeting display with actions
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Users, ExternalLink, Copy, Trash2, CheckCircle } from 'lucide-react';
import type { MeetingEvent } from '@/types/meeting';

interface MeetingCardProps {
  meeting: MeetingEvent;
  onDeleted: () => void;
}

export default function MeetingCard({ meeting, onDeleted }: MeetingCardProps) {
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format date
  const eventDate = new Date(meeting.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Format time
  const formattedTime = meeting.event_time.substring(0, 5);

  // Build registration URL
  const registrationPath = meeting.distributor_slug
    ? `/${meeting.distributor_slug}/register/${meeting.registration_slug}`
    : `/register/${meeting.registration_slug}`; // Fallback for backwards compatibility

  // Capacity info
  const spotsRemaining = meeting.max_attendees
    ? meeting.max_attendees - meeting.total_registered
    : null;

  const isAtCapacity = meeting.max_attendees
    ? meeting.total_registered >= meeting.max_attendees
    : false;

  // Status badge
  const getStatusBadge = () => {
    if (meeting.status === 'draft') {
      return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">Draft</span>;
    }
    if (meeting.status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>;
    }
    if (meeting.status === 'completed') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Completed</span>;
    }
    if (meeting.status === 'canceled') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">Canceled</span>;
    }
    return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">{meeting.status}</span>;
  };

  const handleCopyLink = async () => {
    const fullUrl = `${window.location.origin}${registrationPath}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${meeting.title}"? This will also delete ${meeting.total_registered} registration(s).`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rep/meetings/${meeting.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete meeting');
      }

      onDeleted();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete meeting');
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-slate-900 mb-1">{meeting.title}</h4>
          {getStatusBadge()}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
          title="Delete meeting"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{meeting.description}</p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-[#2c5aa0]" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-[#2c5aa0]" />
          <span>
            {formattedTime} {meeting.event_timezone} ({meeting.duration_minutes} min)
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          {meeting.location_type === 'virtual' ? (
            <>
              <Video className="w-4 h-4 text-[#2c5aa0]" />
              <span>Virtual Meeting</span>
            </>
          ) : meeting.location_type === 'physical' ? (
            <>
              <MapPin className="w-4 h-4 text-[#2c5aa0]" />
              <span className="truncate">{meeting.physical_address}</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-[#2c5aa0]" />
              <span>Hybrid (Virtual + In-Person)</span>
            </>
          )}
        </div>
      </div>

      {/* Registration Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded">
        <div>
          <div className="text-2xl font-bold text-slate-900">{meeting.total_registered}</div>
          <div className="text-xs text-slate-500">Total Registered</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{meeting.total_confirmed}</div>
          <div className="text-xs text-slate-500">Confirmed</div>
        </div>
        {meeting.total_needs_followup > 0 && (
          <div>
            <div className="text-2xl font-bold text-amber-600">{meeting.total_needs_followup}</div>
            <div className="text-xs text-slate-500">Needs Follow-up</div>
          </div>
        )}
        {meeting.total_with_questions > 0 && (
          <div>
            <div className="text-2xl font-bold text-blue-600">{meeting.total_with_questions}</div>
            <div className="text-xs text-slate-500">With Questions</div>
          </div>
        )}
      </div>

      {/* Capacity Warning */}
      {isAtCapacity && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>At capacity ({meeting.max_attendees} max)</span>
        </div>
      )}

      {spotsRemaining !== null && spotsRemaining > 0 && spotsRemaining <= 5 && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Only {spotsRemaining} spots remaining</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>

        <a
          href={registrationPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2c5aa0] text-white rounded-lg hover:bg-[#234780] transition text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View Page
        </a>
      </div>

      {/* View Registrations Button */}
      {meeting.total_registered > 0 && (
        <button
          onClick={() => setShowRegistrations(!showRegistrations)}
          className="w-full mt-3 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm"
        >
          {showRegistrations ? 'Hide' : 'View'} Registrations ({meeting.total_registered})
        </button>
      )}

      {/* Registrations List (if expanded) */}
      {showRegistrations && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <RegistrationsList meetingId={meeting.id} />
        </div>
      )}
    </div>
  );
}

/**
 * Registrations List - Fetches and displays registrations for a meeting
 */
function RegistrationsList({ meetingId }: { meetingId: string }) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useState(() => {
    fetch(`/api/rep/meetings/${meetingId}/registrations`)
      .then((res) => res.json())
      .then((result) => {
        setRegistrations(result.data?.registrations || []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading...</div>;
  }

  if (registrations.length === 0) {
    return <div className="text-sm text-slate-500">No registrations yet</div>;
  }

  return (
    <div className="space-y-2">
      {registrations.map((reg) => (
        <div key={reg.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
          <div>
            <div className="font-medium text-slate-900">
              {reg.first_name} {reg.last_name}
            </div>
            <div className="text-xs text-slate-500">{reg.email}</div>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs ${
              reg.status === 'confirmed'
                ? 'bg-green-100 text-green-700'
                : reg.status === 'not_going'
                ? 'bg-red-100 text-red-700'
                : reg.status === 'needs_followup'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {reg.status.replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}

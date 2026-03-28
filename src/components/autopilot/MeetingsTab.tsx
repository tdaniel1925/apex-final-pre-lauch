/**
 * Meetings Tab - Main component for meeting reservations management
 * Shows create meeting form + list of meetings with registrations
 */

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import CreateMeetingModal from './CreateMeetingModal';
import MeetingsList from './MeetingsList';
import type { MeetingEvent } from '@/types/meeting';

export default function MeetingsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<MeetingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/rep/meetings');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch meetings');
      }

      setMeetings(result.data.meetings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleMeetingCreated = () => {
    setIsCreateModalOpen(false);
    fetchMeetings(); // Refresh list
  };

  const handleMeetingDeleted = () => {
    fetchMeetings(); // Refresh list
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Meeting Reservations</h2>
          <p className="text-slate-600">
            Create event registration pages for your prospects to sign up for meetings and events.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#2c5aa0] text-white px-4 py-2 rounded-lg hover:bg-[#234780] transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Meeting
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c5aa0]"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && meetings.length === 0 && (
        <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Meetings Yet
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Create your first meeting event to generate a registration link you can share with prospects.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#2c5aa0] text-white px-6 py-3 rounded-lg hover:bg-[#234780] transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Your First Meeting
          </button>
        </div>
      )}

      {/* Meetings List */}
      {!isLoading && !error && meetings.length > 0 && (
        <MeetingsList meetings={meetings} onMeetingDeleted={handleMeetingDeleted} />
      )}

      {/* Create Meeting Modal */}
      {isCreateModalOpen && (
        <CreateMeetingModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleMeetingCreated}
        />
      )}
    </div>
  );
}

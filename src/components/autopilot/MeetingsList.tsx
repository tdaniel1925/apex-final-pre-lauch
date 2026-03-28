/**
 * Meetings List - Grid of meeting cards
 */

'use client';

import type { MeetingEvent } from '@/types/meeting';
import MeetingCard from './MeetingCard';

interface MeetingsListProps {
  meetings: MeetingEvent[];
  onMeetingDeleted: () => void;
}

export default function MeetingsList({ meetings, onMeetingDeleted }: MeetingsListProps) {
  // Separate active and past meetings
  const now = new Date();
  const activeMeetings = meetings.filter(m => {
    const eventDate = new Date(m.event_date);
    return m.status === 'active' && eventDate >= now;
  });

  const pastMeetings = meetings.filter(m => {
    const eventDate = new Date(m.event_date);
    return m.status !== 'active' || eventDate < now;
  });

  return (
    <div className="space-y-8">
      {/* Active Meetings */}
      {activeMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Active Meetings ({activeMeetings.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {activeMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onDeleted={onMeetingDeleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past/Inactive Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-600 mb-4">
            Past & Inactive Meetings ({pastMeetings.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {pastMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onDeleted={onMeetingDeleted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

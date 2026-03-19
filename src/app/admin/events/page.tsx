'use client';

// =============================================
// Admin Company Events Management Page
// Manage company-wide events that reps can invite prospects to
// =============================================

import { useState, useEffect } from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';

interface CompanyEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date_time: string;
  location_type: string;
  venue_name: string | null;
  status: string;
  is_featured: boolean;
  total_invitations_sent: number;
  total_rsvps_yes: number;
  total_attendees_confirmed: number;
  max_attendees: number | null;
  created_at: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  async function fetchEvents() {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? '/api/admin/events'
        : `/api/admin/events?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.data) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Company Events</h1>
          <p className="text-gray-600">
            Manage events that distributors can invite prospects to
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Events
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          onClick={() => setFilter('draft')}
        >
          Draft
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-12">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            Create your first company event to get started
          </p>
          <Link href="/admin/events/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{event.event_name}</h3>
                    {event.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Featured
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        event.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : event.status === 'full'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.event_date_time)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location_type === 'virtual'
                        ? 'Virtual'
                        : event.location_type === 'hybrid'
                        ? 'Hybrid'
                        : event.venue_name || 'In-person'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.total_rsvps_yes} RSVPs
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </div>
                  </div>

                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      <strong>{event.total_invitations_sent}</strong> invitations sent
                    </span>
                    <span className="text-gray-600">
                      <strong>{event.total_attendees_confirmed}</strong> confirmed
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

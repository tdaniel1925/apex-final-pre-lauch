'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, Repeat, ToggleLeft, ToggleRight } from 'lucide-react';

interface RecurringEvent {
  id: string;
  series_name: string;
  description: string | null;
  recurrence_rule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: string;
    maxOccurrences?: number;
  };
  start_date: string;
  end_date: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
  total_instances_created: number;
  is_active: boolean;
  created_at: string;
}

export function RecurringEventsList() {
  const [series, setSeries] = useState<RecurringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/admin/recurring-events');
      const result = await response.json();
      if (result.data) {
        setSeries(result.data);
      }
    } catch (error) {
      console.error('Error fetching recurring events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRecurrenceRule = (rule: RecurringEvent['recurrence_rule']): string => {
    const parts = [];

    // Frequency with interval
    if (rule.interval === 1) {
      parts.push(rule.frequency);
    } else {
      parts.push(`Every ${rule.interval} ${rule.frequency === 'daily' ? 'days' : rule.frequency === 'weekly' ? 'weeks' : 'months'}`);
    }

    // Days of week for weekly
    if (rule.frequency === 'weekly' && rule.daysOfWeek) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayNames = rule.daysOfWeek.map(d => days[d]).join(', ');
      parts.push(`on ${dayNames}`);
    }

    // Day of month for monthly
    if (rule.frequency === 'monthly' && rule.dayOfMonth) {
      parts.push(`on day ${rule.dayOfMonth}`);
    }

    // End date or max occurrences
    if (rule.endDate) {
      parts.push(`until ${new Date(rule.endDate).toLocaleDateString()}`);
    } else if (rule.maxOccurrences) {
      parts.push(`for ${rule.maxOccurrences} occurrences`);
    }

    return parts.join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading recurring events...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-slate-600">
          {series.length} series total, {series.filter(s => s.is_active).length} active
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Recurring Series
        </Button>
      </div>

      {series.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="text-slate-400 mb-4">
            <Repeat className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No recurring events yet
          </h3>
          <p className="text-slate-600 mb-6">
            Create your first recurring event series to automatically generate future events
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Series
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {series.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Repeat className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.series_name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-slate-600 mb-4">{item.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-500">Recurrence:</span>
                      <div className="font-medium text-slate-900">
                        {formatRecurrenceRule(item.recurrence_rule)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Started:</span>
                      <div className="font-medium text-slate-900">
                        {new Date(item.start_date).toLocaleDateString()}
                      </div>
                    </div>
                    {item.end_date && (
                      <div>
                        <span className="text-slate-500">Ends:</span>
                        <div className="font-medium text-slate-900">
                          {new Date(item.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Instances Created:</span>
                      <div className="font-medium text-slate-900">
                        {item.total_instances_created}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {item.last_generated_date && (
                      <div>
                        Last generated: {new Date(item.last_generated_date).toLocaleDateString()}
                      </div>
                    )}
                    {item.next_generation_date && (
                      <div>
                        Next generation: {new Date(item.next_generation_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    {item.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal - simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Create Recurring Event Series</h2>
            <p className="text-slate-600 mb-4">
              Recurring event creation form coming soon. For now, use the API directly at{' '}
              <code className="bg-slate-100 px-2 py-1 rounded">
                POST /api/admin/recurring-events
              </code>
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-slate-700 mb-2">Example request:</p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    series_name: 'Weekly Team Meeting',
                    recurrence_rule: {
                      frequency: 'weekly',
                      interval: 1,
                      daysOfWeek: [1, 3, 5],
                    },
                    start_date: '2026-03-20',
                    event_template: {
                      event_name: 'Team Standup',
                      event_type: 'training',
                      event_duration_minutes: 30,
                      location_type: 'virtual',
                      status: 'active',
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <Button onClick={() => setShowCreateModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

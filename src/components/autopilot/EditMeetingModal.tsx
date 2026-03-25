/**
 * Edit Meeting Modal - Form to edit existing meeting event
 */

'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Video, Calendar, Save } from 'lucide-react';
import type { MeetingEvent } from '@/types/meeting';

interface EditMeetingModalProps {
  meeting: MeetingEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: meeting.title,
    description: meeting.description || '',
    customMessage: meeting.custom_message || '',
    eventDate: meeting.event_date,
    eventTime: meeting.event_time.substring(0, 5), // Strip seconds for time input
    eventTimezone: meeting.event_timezone,
    durationMinutes: meeting.duration_minutes,
    locationType: meeting.location_type as 'virtual' | 'physical' | 'hybrid',
    virtualLink: meeting.virtual_link || '',
    physicalAddress: meeting.physical_address || '',
    maxAttendees: meeting.max_attendees ? meeting.max_attendees.toString() : '',
    registrationDeadline: meeting.registration_deadline
      ? new Date(meeting.registration_deadline).toISOString().slice(0, 16) // Format for datetime-local
      : '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Build request body
      const requestBody = {
        title: formData.title,
        description: formData.description || undefined,
        customMessage: formData.customMessage || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventTimezone: formData.eventTimezone,
        durationMinutes: formData.durationMinutes,
        locationType: formData.locationType,
        virtualLink: formData.virtualLink.trim() || undefined,
        physicalAddress: formData.physicalAddress.trim() || undefined,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        registrationDeadline: formData.registrationDeadline || undefined,
      };

      const response = await fetch(`/api/rep/meetings/${meeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update meeting');
      }

      // Success!
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Edit Meeting Event</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meeting Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Business Opportunity Webinar"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe what this meeting is about..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Message (shown on registration page)
              </label>
              <textarea
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                rows={2}
                placeholder="Optional message to display on the registration page..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.eventTimezone}
                  onChange={(e) => setFormData({ ...formData, eventTimezone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                  min="15"
                  max="480"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Meeting Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="virtual"
                    checked={formData.locationType === 'virtual'}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                    className="w-4 h-4 text-[#2c5aa0]"
                  />
                  <Video className="w-4 h-4" />
                  <span className="text-sm">Virtual</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="physical"
                    checked={formData.locationType === 'physical'}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                    className="w-4 h-4 text-[#2c5aa0]"
                  />
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">In-Person</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="hybrid"
                    checked={formData.locationType === 'hybrid'}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value as any })}
                    className="w-4 h-4 text-[#2c5aa0]"
                  />
                  <span className="text-sm">Hybrid (Both)</span>
                </label>
              </div>
            </div>

            {(formData.locationType === 'virtual' || formData.locationType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Virtual Meeting Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.virtualLink}
                  onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            )}

            {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Physical Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.physicalAddress}
                  onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Registration Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Registration Settings</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Registration URL Slug
              </label>
              <input
                type="text"
                disabled
                value={meeting.registration_slug}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Slug cannot be changed after creation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Max Attendees (optional)
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  min="1"
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registration Deadline (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Info about existing registrations */}
          {meeting.total_registered > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> This meeting has {meeting.total_registered} existing registration(s).
                Changes to date, time, or location will affect all registrants.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#2c5aa0] text-white rounded-lg hover:bg-[#234780] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

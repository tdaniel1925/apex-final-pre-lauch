/**
 * Create Meeting Modal - Form to create new meeting event
 */

'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Video, Calendar, Eye } from 'lucide-react';
import { slugify } from '@/lib/utils/meeting-slug-generator';
import RegistrationPagePreviewModal from './RegistrationPagePreviewModal';

interface CreateMeetingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetingModal({ onClose, onSuccess }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customMessage: '',
    eventDate: '',
    eventTime: '',
    eventTimezone: 'America/Chicago',
    durationMinutes: 60,
    locationType: 'virtual' as 'virtual' | 'physical' | 'hybrid',
    virtualLink: '',
    physicalAddress: '',
    registrationSlug: '',
    maxAttendees: '',
    registrationDeadline: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    slug: string;
  } | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/rep/profile');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser({
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone || null,
          slug: data.slug,
        });
      }
    } catch (error) {
      console.error('[CreateMeetingModal] Error fetching user:', error);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      registrationSlug: slugify(title) || formData.registrationSlug,
    });
  };

  // Handle preview registration page
  const handlePreview = () => {
    // Validate required fields
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Meeting title is required (minimum 3 characters)');
      return;
    }
    if (!formData.eventDate || !formData.eventTime) {
      setError('Event date and time are required');
      return;
    }
    if (!formData.registrationSlug) {
      setError('Registration slug is required');
      return;
    }
    if (formData.locationType === 'virtual' && !formData.virtualLink.trim()) {
      setError('Virtual meeting link is required for virtual meetings');
      return;
    }
    if (formData.locationType === 'physical' && !formData.physicalAddress.trim()) {
      setError('Physical address is required for in-person meetings');
      return;
    }
    if (!currentUser) {
      setError('Unable to load user data for preview');
      return;
    }

    setError(null);
    setShowPreviewModal(true);
  };

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
        registrationSlug: formData.registrationSlug,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        registrationDeadline: formData.registrationDeadline || undefined,
      };

      const response = await fetch('/api/rep/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create meeting');
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
          <h2 className="text-2xl font-bold text-slate-900">Create Meeting Event</h2>
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
                onChange={(e) => handleTitleChange(e.target.value)}
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
                Registration URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.registrationSlug}
                onChange={(e) => setFormData({ ...formData, registrationSlug: slugify(e.target.value) })}
                placeholder="business-webinar-2026"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                Lowercase letters, numbers, and hyphens only
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
              type="button"
              onClick={handlePreview}
              disabled={isSubmitting || !currentUser}
              className="px-6 py-2 border-2 border-[#2c5aa0] text-[#2c5aa0] rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Page
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#2c5aa0] text-white rounded-lg hover:bg-[#234780] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>

        {/* Preview Modal */}
        {currentUser && (
          <RegistrationPagePreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            formData={formData}
            distributorData={currentUser}
            onCreateMeeting={() => {
              setShowPreviewModal(false);
              // Trigger form submission
              const form = document.querySelector('form') as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

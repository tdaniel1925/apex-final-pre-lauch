'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Check, AlertCircle, Plus, X, Calendar, Users as UsersIcon } from 'lucide-react';
import {
  UNLIMITED_INVITES,
  MAX_BULK_RECIPIENTS,
  MIN_MEETING_SCHEDULE_BUFFER_MS,
  MAX_MEETING_SCHEDULE_FUTURE_MS,
  SUCCESS_MESSAGE_DURATION_MS,
  INVITATION_TYPES,
} from '@/lib/autopilot/constants';

// Recipient validation schema
const recipientSchema = z.object({
  recipient_email: z.string().email('Invalid email address'),
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  recipient_phone: z.string().optional(),
});

// Main invitation validation schema
const invitationSchema = z.object({
  recipients: z
    .array(recipientSchema)
    .min(1, 'At least one recipient is required')
    .max(MAX_BULK_RECIPIENTS, `Maximum ${MAX_BULK_RECIPIENTS} recipients allowed`),
  meeting_title: z.string().min(3, 'Title must be at least 3 characters'),
  meeting_description: z.string().optional(),
  meeting_date_time: z.string().min(1, 'Date and time are required'),
  meeting_location: z.string().optional(),
  meeting_link: z.string().url('Invalid URL').optional().or(z.literal('')),
  invitation_type: z.enum(['personal', 'company_event']).optional(),
  company_event_id: z.string().uuid().optional().nullable(),
});

type Recipient = {
  recipient_email: string;
  recipient_name: string;
  recipient_phone?: string;
};

type InvitationFormData = z.infer<typeof invitationSchema>;

interface CompanyEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date_time: string;
  event_description: string | null;
  location_type: string;
  venue_name: string | null;
  virtual_meeting_link: string | null;
  invitation_subject: string | null;
  invitation_template: string | null;
}

interface MeetingInvitationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MeetingInvitationForm({ onSuccess, onCancel }: MeetingInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remainingInvites, setRemainingInvites] = useState<number | null>(null);
  const [isVirtual, setIsVirtual] = useState(true);
  const [invitationType, setInvitationType] = useState<'personal' | 'company_event'>('personal');
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [formData, setFormData] = useState<InvitationFormData>({
    recipients: [{ recipient_email: '', recipient_name: '', recipient_phone: '' }],
    meeting_title: '',
    meeting_description: '',
    meeting_date_time: '',
    meeting_location: '',
    meeting_link: '',
    invitation_type: 'personal',
    company_event_id: null,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch remaining invites and company events on mount
  useEffect(() => {
    fetchRemainingInvites();
    fetchCompanyEvents();
  }, []);

  /**
   * Fetch the user's remaining invitation quota
   * Sets UNLIMITED_INVITES (-1) if user has unlimited plan
   */
  const fetchRemainingInvites = async () => {
    try {
      const response = await fetch('/api/autopilot/subscription');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.usage?.emailInvites) {
          const { used, limit, isUnlimited } = data.usage.emailInvites;
          if (isUnlimited) {
            setRemainingInvites(UNLIMITED_INVITES);
          } else {
            setRemainingInvites(Math.max(0, limit - used));
          }
        }
      }
    } catch (error) {
      console.error('[MeetingInvitationForm] Error fetching remaining invites:', error);
    }
  };

  /**
   * Fetch available company events for pre-configured invitations
   * Only fetches upcoming, active events that the distributor has access to
   */
  const fetchCompanyEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await fetch('/api/autopilot/events?upcoming_only=true');
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setCompanyEvents(data.data);
          console.log('[MeetingInvitationForm] Loaded company events:', data.data.length);
        }
      }
    } catch (error) {
      console.error('[MeetingInvitationForm] Error fetching company events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleEventSelection = (eventId: string) => {
    const selectedEvent = companyEvents.find((e) => e.id === eventId);
    if (!selectedEvent) return;

    // Pre-fill form with event details
    setFormData((prev) => ({
      ...prev,
      company_event_id: eventId,
      meeting_title: selectedEvent.event_name,
      meeting_description: selectedEvent.event_description || '',
      meeting_date_time: new Date(selectedEvent.event_date_time).toISOString().slice(0, 16),
      meeting_location:
        selectedEvent.location_type === 'in_person' ? selectedEvent.venue_name || '' : '',
      meeting_link:
        selectedEvent.location_type === 'virtual' ? selectedEvent.virtual_meeting_link || '' : '',
    }));

    // Set virtual/in-person based on event
    setIsVirtual(selectedEvent.location_type === 'virtual');
  };

  const handleInvitationTypeChange = (type: 'personal' | 'company_event') => {
    setInvitationType(type);
    setFormData((prev) => ({
      ...prev,
      invitation_type: type,
      company_event_id: type === 'personal' ? null : prev.company_event_id,
    }));

    // Clear form if switching to personal
    if (type === 'personal') {
      setFormData((prev) => ({
        ...prev,
        meeting_title: '',
        meeting_description: '',
        meeting_date_time: '',
        meeting_location: '',
        meeting_link: '',
      }));
    }
  };

  /**
   * Add a new recipient to the list
   * Maximum of MAX_BULK_RECIPIENTS (10) recipients allowed
   */
  const addRecipient = () => {
    if (formData.recipients.length < MAX_BULK_RECIPIENTS) {
      setFormData((prev) => ({
        ...prev,
        recipients: [
          ...prev.recipients,
          { recipient_email: '', recipient_name: '', recipient_phone: '' },
        ],
      }));
    }
  };

  // Remove a recipient
  const removeRecipient = (index: number) => {
    if (formData.recipients.length > 1) {
      setFormData((prev) => ({
        ...prev,
        recipients: prev.recipients.filter((_, i) => i !== index),
      }));
      // Clear errors for this recipient
      const newErrors = { ...validationErrors };
      delete newErrors[`recipients.${index}.recipient_email`];
      delete newErrors[`recipients.${index}.recipient_name`];
      delete newErrors[`recipients.${index}.recipient_phone`];
      setValidationErrors(newErrors);
    }
  };

  // Update a specific recipient field
  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    setFormData((prev) => {
      const newRecipients = [...prev.recipients];
      newRecipients[index] = { ...newRecipients[index], [field]: value };
      return { ...prev, recipients: newRecipients };
    });
    // Clear validation error for this field
    const errorKey = `recipients.${index}.${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleChange = (field: keyof Omit<InvitationFormData, 'recipients'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Validate form data
    const validation = invitationSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Validate meeting date/time
    const meetingDate = new Date(formData.meeting_date_time);
    const now = new Date();
    const minMeetingTime = new Date(now.getTime() + MIN_MEETING_SCHEDULE_BUFFER_MS);
    const maxMeetingTime = new Date(now.getTime() + MAX_MEETING_SCHEDULE_FUTURE_MS);

    if (meetingDate < minMeetingTime) {
      setValidationErrors({
        meeting_date_time: 'Meeting must be scheduled at least 1 hour in the future',
      });
      return;
    }

    if (meetingDate > maxMeetingTime) {
      setValidationErrors({
        meeting_date_time: 'Meeting cannot be scheduled more than 1 year in the future',
      });
      return;
    }

    // Check if user has enough invites for ALL recipients in bulk
    if (
      remainingInvites !== null &&
      remainingInvites !== UNLIMITED_INVITES &&
      remainingInvites < formData.recipients.length
    ) {
      setError(
        `You only have ${remainingInvites} invitation${remainingInvites !== 1 ? 's' : ''} remaining, but you're trying to send ${formData.recipients.length}. ${
          remainingInvites > 0
            ? `Please remove ${formData.recipients.length - remainingInvites} recipient${formData.recipients.length - remainingInvites !== 1 ? 's' : ''} or upgrade your plan.`
            : 'Please upgrade your plan to send more invitations.'
        }`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/autopilot/invitations/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Handle validation errors
          const errors: Record<string, string> = {};
          data.errors.forEach((err: any) => {
            errors[err.field] = err.message;
          });
          setValidationErrors(errors);
        } else {
          setError(data.message || 'Failed to send invitations');
        }
        return;
      }

      // Success!
      setShowSuccess(true);
      setSuccessCount(data.successCount || formData.recipients.length);

      // Update remaining invites (only if not unlimited)
      if (remainingInvites !== null && remainingInvites !== UNLIMITED_INVITES) {
        setRemainingInvites(
          Math.max(0, remainingInvites - (data.successCount || formData.recipients.length))
        );
      }

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          recipients: [{ recipient_email: '', recipient_name: '', recipient_phone: '' }],
          meeting_title: '',
          meeting_description: '',
          meeting_date_time: '',
          meeting_location: '',
          meeting_link: '',
          invitation_type: 'personal',
          company_event_id: null,
        });
        setInvitationType('personal');
        setShowSuccess(false);
        setSuccessCount(0);
        if (onSuccess) onSuccess();
      }, SUCCESS_MESSAGE_DURATION_MS);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLimitReached = remainingInvites !== null && remainingInvites <= 0;
  const canAddMore = formData.recipients.length < MAX_BULK_RECIPIENTS && !isLimitReached;
  const isUnlimited = remainingInvites === UNLIMITED_INVITES;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Send Meeting Invitations</h2>
            <p className="text-sm text-gray-500 mt-1">
              {remainingInvites !== null && (
                <>
                  {isUnlimited ? (
                    <span className="text-green-600 font-medium">∞ Unlimited invitations</span>
                  ) : (
                    <span className={remainingInvites > 0 ? 'text-gray-600' : 'text-red-600'}>
                      {remainingInvites} invitation{remainingInvites !== 1 ? 's' : ''} remaining this
                      month
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              {successCount} invitation{successCount !== 1 ? 's' : ''} sent successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Limit Reached Warning */}
        {isLimitReached && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              You've reached your monthly invitation limit. Upgrade your plan to send more invitations.
            </p>
          </div>
        )}

        {/* Invitation Type Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-navy-900 mb-1">Invitation Type</h3>
            <p className="text-sm text-gray-500">
              Choose custom meeting for 1-on-1s or select a company event to invite prospects
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Custom Meeting Button */}
            <button
              type="button"
              onClick={() => handleInvitationTypeChange('personal')}
              className={`relative p-4 rounded-lg border-2 font-medium transition-all ${
                invitationType === 'personal'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isSubmitting || isLimitReached}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-base">Custom Meeting</span>
              </div>
              <p className="text-xs text-gray-600">
                Create your own meeting details
              </p>
              {invitationType === 'personal' && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>

            {/* Company Event Button */}
            <button
              type="button"
              onClick={() => handleInvitationTypeChange('company_event')}
              className={`relative p-4 rounded-lg border-2 font-medium transition-all ${
                invitationType === 'company_event'
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
              disabled={isSubmitting || isLimitReached}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <UsersIcon className="w-5 h-5" />
                <span className="text-base">Company Event</span>
              </div>
              <p className="text-xs text-gray-600">
                Use pre-configured event templates
              </p>
              {invitationType === 'company_event' && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          </div>

          {/* Company Event Dropdown */}
          {invitationType === 'company_event' && (
            <div>
              <label htmlFor="company_event" className="block text-sm font-medium text-gray-700 mb-1">
                Select Event *
              </label>
              {loadingEvents ? (
                <div className="text-sm text-gray-500">Loading events...</div>
              ) : companyEvents.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  No upcoming company events available at this time.
                </div>
              ) : (
                <select
                  id="company_event"
                  value={formData.company_event_id || ''}
                  onChange={(e) => handleEventSelection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  disabled={isSubmitting || isLimitReached}
                  required={invitationType === 'company_event'}
                >
                  <option value="">-- Select an event --</option>
                  {companyEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.event_name} - {new Date(event.event_date_time).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select a company event to pre-fill meeting details and templates
              </p>
            </div>
          )}
        </div>

        {/* Recipients Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy-900">
              Recipients ({formData.recipients.length}/{MAX_BULK_RECIPIENTS})
            </h3>
            {canAddMore && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={isSubmitting || isLimitReached}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Recipient
              </Button>
            )}
          </div>

          {validationErrors.recipients && (
            <p className="text-red-500 text-sm">{validationErrors.recipients}</p>
          )}

          {/* Recipient Cards */}
          <div className="space-y-4">
            {formData.recipients.map((recipient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                {/* Remove button */}
                {formData.recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRecipient(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-1"
                    disabled={isSubmitting || isLimitReached}
                    title="Remove recipient"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="space-y-3">
                  <div className="font-medium text-sm text-gray-700 mb-2">
                    Recipient {index + 1}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor={`recipient_name_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id={`recipient_name_${index}`}
                      value={recipient.recipient_name}
                      onChange={(e) => updateRecipient(index, 'recipient_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                        validationErrors[`recipients.${index}.recipient_name`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Prospect"
                      disabled={isSubmitting || isLimitReached}
                    />
                    {validationErrors[`recipients.${index}.recipient_name`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors[`recipients.${index}.recipient_name`]}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor={`recipient_email_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id={`recipient_email_${index}`}
                      value={recipient.recipient_email}
                      onChange={(e) => updateRecipient(index, 'recipient_email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                        validationErrors[`recipients.${index}.recipient_email`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                      disabled={isSubmitting || isLimitReached}
                    />
                    {validationErrors[`recipients.${index}.recipient_email`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors[`recipients.${index}.recipient_email`]}
                      </p>
                    )}
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label htmlFor={`recipient_phone_${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id={`recipient_phone_${index}`}
                      value={recipient.recipient_phone || ''}
                      onChange={(e) => updateRecipient(index, 'recipient_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="(555) 123-4567"
                      disabled={isSubmitting || isLimitReached}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-navy-900">
            Meeting Information
            {invitationType === 'company_event' && formData.company_event_id && (
              <span className="ml-2 text-sm font-normal text-gray-500">(Pre-filled from event)</span>
            )}
          </h3>

          <div>
            <label htmlFor="meeting_title" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Title *
            </label>
            <input
              type="text"
              id="meeting_title"
              value={formData.meeting_title}
              onChange={(e) => handleChange('meeting_title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                validationErrors.meeting_title ? 'border-red-500' : 'border-gray-300'
              } ${invitationType === 'company_event' && formData.company_event_id ? 'bg-gray-50' : ''}`}
              placeholder="Business Overview Meeting"
              disabled={isSubmitting || isLimitReached || (invitationType === 'company_event' && !!formData.company_event_id)}
              readOnly={invitationType === 'company_event' && !!formData.company_event_id}
            />
            {validationErrors.meeting_title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.meeting_title}</p>
            )}
          </div>

          <div>
            <label htmlFor="meeting_description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="meeting_description"
              value={formData.meeting_description}
              onChange={(e) => handleChange('meeting_description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              placeholder="Brief overview of what we'll discuss..."
              rows={3}
              disabled={isSubmitting || isLimitReached}
            />
          </div>

          <div>
            <label htmlFor="meeting_date_time" className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              id="meeting_date_time"
              value={formData.meeting_date_time}
              onChange={(e) => handleChange('meeting_date_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                validationErrors.meeting_date_time ? 'border-red-500' : 'border-gray-300'
              } ${invitationType === 'company_event' && formData.company_event_id ? 'bg-gray-50' : ''}`}
              disabled={isSubmitting || isLimitReached || (invitationType === 'company_event' && !!formData.company_event_id)}
              readOnly={invitationType === 'company_event' && !!formData.company_event_id}
            />
            {validationErrors.meeting_date_time && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.meeting_date_time}</p>
            )}
          </div>

          {/* Virtual vs Physical Toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsVirtual(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isVirtual
                  ? 'bg-gold text-navy-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={isSubmitting || isLimitReached}
            >
              Virtual Meeting
            </button>
            <button
              type="button"
              onClick={() => setIsVirtual(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isVirtual
                  ? 'bg-gold text-navy-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={isSubmitting || isLimitReached}
            >
              In-Person Meeting
            </button>
          </div>

          {isVirtual ? (
            <div>
              <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link (Zoom, Teams, etc.)
              </label>
              <input
                type="url"
                id="meeting_link"
                value={formData.meeting_link}
                onChange={(e) => handleChange('meeting_link', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  validationErrors.meeting_link ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://zoom.us/j/123456789"
                disabled={isSubmitting || isLimitReached}
              />
              {validationErrors.meeting_link && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.meeting_link}</p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="meeting_location" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Location
              </label>
              <input
                type="text"
                id="meeting_location"
                value={formData.meeting_location}
                onChange={(e) => handleChange('meeting_location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                placeholder="123 Main St, Coffee Shop"
                disabled={isSubmitting || isLimitReached}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || isLimitReached}
            className="flex-1 bg-gold hover:bg-gold/90 text-navy-900"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending to {formData.recipients.length} recipient{formData.recipients.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {formData.recipients.length} Recipient{formData.recipients.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

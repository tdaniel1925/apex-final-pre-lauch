'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Check, AlertCircle } from 'lucide-react';

// Validation schema
const invitationSchema = z.object({
  recipient_email: z.string().email('Invalid email address'),
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  meeting_title: z.string().min(3, 'Title must be at least 3 characters'),
  meeting_description: z.string().optional(),
  meeting_date_time: z.string().min(1, 'Date and time are required'),
  meeting_location: z.string().optional(),
  meeting_link: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface MeetingInvitationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MeetingInvitationForm({ onSuccess, onCancel }: MeetingInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingInvites, setRemainingInvites] = useState<number | null>(null);
  const [isVirtual, setIsVirtual] = useState(true);

  const [formData, setFormData] = useState<InvitationFormData>({
    recipient_email: '',
    recipient_name: '',
    meeting_title: '',
    meeting_description: '',
    meeting_date_time: '',
    meeting_location: '',
    meeting_link: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch remaining invites on mount
  useEffect(() => {
    fetchRemainingInvites();
  }, []);

  const fetchRemainingInvites = async () => {
    try {
      const response = await fetch('/api/autopilot/subscription');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.usage?.emailInvites) {
          const { used, limit, isUnlimited } = data.usage.emailInvites;
          if (isUnlimited) {
            setRemainingInvites(999999);
          } else {
            setRemainingInvites(Math.max(0, limit - used));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching remaining invites:', error);
    }
  };

  const handleChange = (field: keyof InvitationFormData, value: string) => {
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
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    // Check if meeting date is in the future
    const meetingDate = new Date(formData.meeting_date_time);
    const now = new Date();
    if (meetingDate <= now) {
      setValidationErrors({ meeting_date_time: 'Meeting must be scheduled in the future' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/autopilot/invitations', {
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
          setError(data.message || 'Failed to send invitation');
        }
        return;
      }

      // Success!
      setShowSuccess(true);

      // Update remaining invites
      if (remainingInvites !== null && remainingInvites !== 999999) {
        setRemainingInvites(remainingInvites - 1);
      }

      // Reset form after delay
      setTimeout(() => {
        setFormData({
          recipient_email: '',
          recipient_name: '',
          meeting_title: '',
          meeting_description: '',
          meeting_date_time: '',
          meeting_location: '',
          meeting_link: '',
        });
        setShowSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLimitReached = remainingInvites !== null && remainingInvites <= 0;

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Send Meeting Invitation</h2>
            <p className="text-sm text-gray-500 mt-1">
              {remainingInvites !== null && (
                <>
                  {remainingInvites === 999999 ? (
                    <span className="text-green-600 font-medium">Unlimited invitations</span>
                  ) : (
                    <span className={remainingInvites > 0 ? 'text-gray-600' : 'text-red-600'}>
                      {remainingInvites} invitation{remainingInvites !== 1 ? 's' : ''} remaining this month
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
            <p className="text-green-800 font-medium">Invitation sent successfully!</p>
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

        {/* Recipient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-navy-900">Recipient Information</h3>

          <div>
            <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              id="recipient_name"
              value={formData.recipient_name}
              onChange={(e) => handleChange('recipient_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                validationErrors.recipient_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Prospect"
              disabled={isSubmitting || isLimitReached}
            />
            {validationErrors.recipient_name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.recipient_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="recipient_email" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipient_email"
              value={formData.recipient_email}
              onChange={(e) => handleChange('recipient_email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                validationErrors.recipient_email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
              disabled={isSubmitting || isLimitReached}
            />
            {validationErrors.recipient_email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.recipient_email}</p>
            )}
          </div>
        </div>

        {/* Meeting Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-navy-900">Meeting Information</h3>

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
              }`}
              placeholder="Business Overview Meeting"
              disabled={isSubmitting || isLimitReached}
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
              }`}
              disabled={isSubmitting || isLimitReached}
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
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
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

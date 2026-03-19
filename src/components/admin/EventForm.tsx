// =============================================
// Event Form Component
// Create/Edit company events
// =============================================

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// =============================================
// VALIDATION SCHEMA (matches API)
// =============================================

const eventFormSchema = z.object({
  // Event details
  event_name: z.string().min(1, 'Event name is required').max(200),
  event_type: z.enum([
    'product_launch',
    'training',
    'webinar',
    'conference',
    'social',
    'business_opportunity',
    'other',
  ]),
  event_description: z.string().max(2000).optional().nullable(),

  // Date/Time
  event_date_time: z.string().min(1, 'Event date and time is required'),
  event_duration_minutes: z.number().int().min(15).max(480),
  event_timezone: z.string(),

  // Location
  location_type: z.enum(['in_person', 'virtual', 'hybrid']),
  venue_name: z.string().max(200).optional().nullable(),
  venue_address: z.string().max(300).optional().nullable(),
  venue_city: z.string().max(100).optional().nullable(),
  venue_state: z.string().max(50).optional().nullable(),
  venue_zip: z.string().max(20).optional().nullable(),
  venue_country: z.string().max(100),
  virtual_meeting_link: z.string().url().optional().nullable().or(z.literal('')),
  virtual_meeting_platform: z.string().max(50).optional().nullable(),
  virtual_meeting_id: z.string().max(100).optional().nullable(),
  virtual_meeting_passcode: z.string().max(100).optional().nullable(),

  // Registration
  requires_registration: z.boolean(),
  max_attendees: z.number().int().positive().optional().nullable(),
  rsvp_deadline: z.string().optional().nullable().or(z.literal('')),

  // Pre-set messaging templates
  invitation_subject: z.string().max(200).optional().nullable(),
  invitation_template: z.string().max(5000).optional().nullable(),
  reminder_template: z.string().max(5000).optional().nullable(),
  confirmation_template: z.string().max(5000).optional().nullable(),

  // Branding
  flyer_template_id: z.string().max(100).optional().nullable(),
  event_banner_url: z.string().url().optional().nullable().or(z.literal('')),
  event_logo_url: z.string().url().optional().nullable().or(z.literal('')),
  event_image_url: z.string().url().optional().nullable().or(z.literal('')),

  // Status
  status: z.enum(['draft', 'active', 'full', 'canceled', 'completed', 'archived']),
  is_featured: z.boolean(),
  is_public: z.boolean(),
  display_order: z.number().int(),

  // Visibility control
  visible_to_ranks: z.array(z.string()).optional().nullable(),
  visible_from_date: z.string().optional().nullable().or(z.literal('')),

  // Notes and internal tracking
  internal_notes: z.string().max(5000).optional().nullable(),
  tags: z.string().optional().nullable(), // Will be converted to array on submit
});

type EventFormData = z.infer<typeof eventFormSchema>;

// =============================================
// COMPONENT
// =============================================

interface EventFormProps {
  event?: any; // For editing existing events
}

export default function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      event_name: event?.event_name || '',
      event_type: event?.event_type || 'training',
      event_description: event?.event_description || '',
      event_date_time: event?.event_date_time
        ? new Date(event.event_date_time).toISOString().slice(0, 16)
        : '',
      event_duration_minutes: event?.event_duration_minutes || 120,
      event_timezone: event?.event_timezone || 'America/Chicago',
      location_type: event?.location_type || 'in_person',
      venue_name: event?.venue_name || '',
      venue_address: event?.venue_address || '',
      venue_city: event?.venue_city || '',
      venue_state: event?.venue_state || '',
      venue_zip: event?.venue_zip || '',
      venue_country: event?.venue_country || 'United States',
      virtual_meeting_link: event?.virtual_meeting_link || '',
      virtual_meeting_platform: event?.virtual_meeting_platform || '',
      virtual_meeting_id: event?.virtual_meeting_id || '',
      virtual_meeting_passcode: event?.virtual_meeting_passcode || '',
      requires_registration: event?.requires_registration ?? true,
      max_attendees: event?.max_attendees || null,
      rsvp_deadline: event?.rsvp_deadline
        ? new Date(event.rsvp_deadline).toISOString().slice(0, 16)
        : '',
      invitation_subject: event?.invitation_subject || '',
      invitation_template: event?.invitation_template || '',
      reminder_template: event?.reminder_template || '',
      confirmation_template: event?.confirmation_template || '',
      flyer_template_id: event?.flyer_template_id || '',
      event_banner_url: event?.event_banner_url || '',
      event_logo_url: event?.event_logo_url || '',
      event_image_url: event?.event_image_url || '',
      status: event?.status || 'draft',
      is_featured: event?.is_featured ?? false,
      is_public: event?.is_public ?? true,
      display_order: event?.display_order || 0,
      visible_to_ranks: event?.visible_to_ranks || null,
      visible_from_date: event?.visible_from_date
        ? new Date(event.visible_from_date).toISOString().slice(0, 16)
        : '',
      internal_notes: event?.internal_notes || '',
      tags: event?.tags?.join(', ') || '',
    },
  });

  const locationType = watch('location_type');

  const onSubmit = async (data: EventFormData) => {
    console.log('[EventForm] onSubmit called with data:', { event_name: data.event_name });
    setLoading(true);
    setError(null);

    try {
      // Convert tags from comma-separated string to array
      const tags = data.tags
        ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : null;

      // Convert datetime-local format to ISO string
      const eventDateTime = new Date(data.event_date_time).toISOString();
      const rsvpDeadline = data.rsvp_deadline
        ? new Date(data.rsvp_deadline).toISOString()
        : null;
      const visibleFromDate = data.visible_from_date
        ? new Date(data.visible_from_date).toISOString()
        : null;

      // Prepare data
      const eventData = {
        ...data,
        event_date_time: eventDateTime,
        rsvp_deadline: rsvpDeadline,
        visible_from_date: visibleFromDate,
        tags,
        // Convert empty strings to null for optional fields
        event_description: data.event_description || null,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        venue_city: data.venue_city || null,
        venue_state: data.venue_state || null,
        venue_zip: data.venue_zip || null,
        virtual_meeting_link: data.virtual_meeting_link || null,
        virtual_meeting_platform: data.virtual_meeting_platform || null,
        virtual_meeting_id: data.virtual_meeting_id || null,
        virtual_meeting_passcode: data.virtual_meeting_passcode || null,
        max_attendees: data.max_attendees || null,
        invitation_subject: data.invitation_subject || null,
        invitation_template: data.invitation_template || null,
        reminder_template: data.reminder_template || null,
        confirmation_template: data.confirmation_template || null,
        flyer_template_id: data.flyer_template_id || null,
        event_banner_url: data.event_banner_url || null,
        event_logo_url: data.event_logo_url || null,
        event_image_url: data.event_image_url || null,
        internal_notes: data.internal_notes || null,
      };

      // Call API
      const url = event ? `/api/admin/events/${event.id}` : '/api/admin/events';
      const method = event ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save event');
      }

      // Success - redirect to events list
      router.push('/admin/events');
      router.refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to save event');
      setLoading(false);
    }
  };

  const handleButtonClick = async () => {
    console.log('[EventForm] Submit button clicked');
    await handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('event_name')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Annual Product Launch 2026"
              />
              {errors.event_name && (
                <p className="mt-1 text-sm text-red-600">{errors.event_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('event_type')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="product_launch">Product Launch</option>
                <option value="training">Training</option>
                <option value="webinar">Webinar</option>
                <option value="conference">Conference</option>
                <option value="social">Social Event</option>
                <option value="business_opportunity">Business Opportunity</option>
                <option value="other">Other</option>
              </select>
              {errors.event_type && (
                <p className="mt-1 text-sm text-red-600">{errors.event_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="full">Full</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                {...register('event_description')}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Describe the event and what attendees can expect..."
              />
              {errors.event_description && (
                <p className="mt-1 text-sm text-red-600">{errors.event_description.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Date & Time */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Date & Time</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register('event_date_time')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {errors.event_date_time && (
                <p className="mt-1 text-sm text-red-600">{errors.event_date_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('event_duration_minutes', { valueAsNumber: true })}
                min="15"
                max="480"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {errors.event_duration_minutes && (
                <p className="mt-1 text-sm text-red-600">{errors.event_duration_minutes.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
              <select
                {...register('event_timezone')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Location</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('location_type')}
                    value="in_person"
                    className="mr-2"
                  />
                  In-Person
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('location_type')}
                    value="virtual"
                    className="mr-2"
                  />
                  Virtual
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('location_type')}
                    value="hybrid"
                    className="mr-2"
                  />
                  Hybrid
                </label>
              </div>
            </div>

            {/* In-Person Fields */}
            {(locationType === 'in_person' || locationType === 'hybrid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    {...register('venue_name')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Apex Convention Center"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    {...register('venue_address')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    {...register('venue_city')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                  <input
                    type="text"
                    {...register('venue_state')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    {...register('venue_zip')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                  <input
                    type="text"
                    {...register('venue_country')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Virtual Fields */}
            {(locationType === 'virtual' || locationType === 'hybrid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    {...register('virtual_meeting_link')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.virtual_meeting_link && (
                    <p className="mt-1 text-sm text-red-600">{errors.virtual_meeting_link.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                  <input
                    type="text"
                    {...register('virtual_meeting_platform')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Zoom, Teams, Google Meet, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    {...register('virtual_meeting_id')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Passcode</label>
                  <input
                    type="text"
                    {...register('virtual_meeting_passcode')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Registration */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Registration Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('requires_registration')}
                className="mr-2 h-4 w-4"
              />
              <label className="text-sm font-medium text-slate-700">Requires Registration</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Attendees (optional)
              </label>
              <input
                type="number"
                {...register('max_attendees', { valueAsNumber: true })}
                min="1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                RSVP Deadline (optional)
              </label>
              <input
                type="datetime-local"
                {...register('rsvp_deadline')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Invitation Templates */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Invitation Templates</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invitation Subject
              </label>
              <input
                type="text"
                {...register('invitation_subject')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="You're Invited: {{event_name}}"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Invitation Body
              </label>
              <textarea
                {...register('invitation_template')}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Dear {{prospect_name}},&#10;&#10;You're invited to our {{event_name}}...&#10;&#10;Use {{event_date}}, {{event_time}}, {{location}} as placeholders."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reminder Template
              </label>
              <textarea
                {...register('reminder_template')}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Reminder: {{event_name}} is coming up on {{event_date}}..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmation Template
              </label>
              <textarea
                {...register('confirmation_template')}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Thank you for confirming your attendance to {{event_name}}..."
              />
            </div>
          </div>
        </section>

        {/* Branding */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Branding (Optional)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Banner URL</label>
              <input
                type="url"
                {...register('event_banner_url')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL</label>
              <input
                type="url"
                {...register('event_logo_url')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Image URL
              </label>
              <input
                type="url"
                {...register('event_image_url')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://example.com/event-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Flyer Template ID
              </label>
              <input
                type="text"
                {...register('flyer_template_id')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="template_123"
              />
            </div>
          </div>
        </section>

        {/* Visibility & Settings */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Visibility & Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input type="checkbox" {...register('is_featured')} className="mr-2 h-4 w-4" />
              <label className="text-sm font-medium text-slate-700">Featured Event</label>
            </div>

            <div className="flex items-center">
              <input type="checkbox" {...register('is_public')} className="mr-2 h-4 w-4" />
              <label className="text-sm font-medium text-slate-700">Public (visible to all)</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
              <input
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visible From Date (optional)
              </label>
              <input
                type="datetime-local"
                {...register('visible_from_date')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Internal Notes */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Internal Notes</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Internal Notes (not visible to distributors)
              </label>
              <textarea
                {...register('internal_notes')}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Admin notes, special instructions, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="product-launch, 2026, vip"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Submit Button */}
      <div className="border-t border-slate-200 p-6 bg-slate-50 rounded-b-lg">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/events')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleButtonClick} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {event ? 'Update Event' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

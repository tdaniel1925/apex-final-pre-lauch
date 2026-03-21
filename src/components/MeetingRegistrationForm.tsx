/**
 * Public Meeting Registration Form Component
 * Used on /[slug]/register/[meetingSlug] pages
 */

'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Users, CheckCircle, Download } from 'lucide-react';

interface MeetingData {
  id: string;
  title: string;
  description: string | null;
  customMessage: string | null;
  eventDate: string;
  eventTime: string;
  eventTimezone: string;
  durationMinutes: number;
  locationType: 'virtual' | 'physical' | 'hybrid';
  virtualLink: string | null;
  physicalAddress: string | null;
  maxAttendees: number | null;
  totalRegistered: number;
}

interface DistributorData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface MeetingRegistrationFormProps {
  meeting: MeetingData;
  distributor: DistributorData;
}

export default function MeetingRegistrationForm({
  meeting,
  distributor,
}: MeetingRegistrationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    hasQuestions: false,
    questionsText: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  // Format date for display
  const eventDate = new Date(meeting.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format time (remove seconds if present)
  const formattedTime = meeting.eventTime.substring(0, 5);

  // Calculate spots remaining
  const spotsRemaining = meeting.maxAttendees
    ? meeting.maxAttendees - meeting.total_registered
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/public/meetings/${meeting.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success!
      setIsSuccess(true);
      setCalendarUrl(result.data.calendarDownloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Registration Confirmed!
              </h1>
              <p className="text-lg text-slate-600">
                You're all set for {meeting.title}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                What's Next?
              </h2>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-[#2c5aa0] mr-2">•</span>
                  <span>Check your email for confirmation and event details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#2c5aa0] mr-2">•</span>
                  <span>
                    Add the event to your calendar using the button below
                  </span>
                </li>
                {meeting.locationType === 'virtual' && meeting.virtualLink && (
                  <li className="flex items-start">
                    <span className="text-[#2c5aa0] mr-2">•</span>
                    <span>
                      The meeting link will be included in your confirmation email
                    </span>
                  </li>
                )}
                <li className="flex items-start">
                  <span className="text-[#2c5aa0] mr-2">•</span>
                  <span>
                    If you have questions, contact {distributor.firstName}{' '}
                    {distributor.lastName} at{' '}
                    <a
                      href={`mailto:${distributor.email}`}
                      className="text-[#2c5aa0] hover:underline"
                    >
                      {distributor.email}
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            {calendarUrl && (
              <div className="flex justify-center">
                <a
                  href={calendarUrl}
                  download
                  className="inline-flex items-center gap-2 bg-[#2c5aa0] text-white px-6 py-3 rounded-lg hover:bg-[#234780] transition font-medium"
                >
                  <Download className="w-5 h-5" />
                  Add to Calendar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Event Header */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {meeting.title}
          </h1>

          {meeting.description && (
            <p className="text-slate-600 mb-6 text-lg">{meeting.description}</p>
          )}

          {meeting.customMessage && (
            <div className="bg-blue-50 border-l-4 border-[#2c5aa0] p-4 mb-6">
              <p className="text-slate-700">{meeting.customMessage}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#2c5aa0] mt-0.5" />
              <div>
                <div className="text-sm text-slate-500">Date</div>
                <div className="text-slate-900 font-medium">{formattedDate}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#2c5aa0] mt-0.5" />
              <div>
                <div className="text-sm text-slate-500">Time</div>
                <div className="text-slate-900 font-medium">
                  {formattedTime} {meeting.eventTimezone} ({meeting.durationMinutes}{' '}
                  min)
                </div>
              </div>
            </div>

            {meeting.locationType !== 'virtual' && meeting.physicalAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2c5aa0] mt-0.5" />
                <div>
                  <div className="text-sm text-slate-500">Location</div>
                  <div className="text-slate-900 font-medium">
                    {meeting.physicalAddress}
                  </div>
                </div>
              </div>
            )}

            {(meeting.locationType === 'virtual' || meeting.locationType === 'hybrid') && (
              <div className="flex items-start gap-3">
                <Video className="w-5 h-5 text-[#2c5aa0] mt-0.5" />
                <div>
                  <div className="text-sm text-slate-500">Format</div>
                  <div className="text-slate-900 font-medium">
                    Virtual Meeting
                    {meeting.locationType === 'hybrid' && ' (also in-person)'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spots Remaining */}
          {spotsRemaining !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-[#2c5aa0]" />
              <span className="text-slate-600">
                {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining
              </span>
            </div>
          )}

          {/* Host Info */}
          <div className="border-t border-slate-200 mt-6 pt-6">
            <div className="text-sm text-slate-500 mb-1">Hosted by</div>
            <div className="text-slate-900 font-medium">
              {distributor.firstName} {distributor.lastName}
            </div>
            <a
              href={`mailto:${distributor.email}`}
              className="text-[#2c5aa0] hover:underline text-sm"
            >
              {distributor.email}
            </a>
            {distributor.phone && (
              <div className="text-slate-600 text-sm">{distributor.phone}</div>
            )}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Register for This Event
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Phone (optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasQuestions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasQuestions: e.target.checked,
                      questionsText: e.target.checked ? formData.questionsText : '',
                    })
                  }
                  className="w-4 h-4 text-[#2c5aa0] border-slate-300 rounded focus:ring-[#2c5aa0]"
                />
                <span className="text-sm text-slate-700">
                  I have questions about this event
                </span>
              </label>
            </div>

            {formData.hasQuestions && (
              <div>
                <label
                  htmlFor="questionsText"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Your Questions <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="questionsText"
                  required={formData.hasQuestions}
                  value={formData.questionsText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionsText: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2c5aa0] focus:border-transparent resize-none"
                  placeholder="Please describe your questions..."
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2c5aa0] text-white py-3 px-6 rounded-lg hover:bg-[#234780] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

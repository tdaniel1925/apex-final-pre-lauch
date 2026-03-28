/**
 * Public Meeting Registration Page
 * URL: /[slug]/register/[meetingSlug]
 * Example: /john-smith/register/business-webinar
 */

import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import MeetingRegistrationForm from '@/components/MeetingRegistrationForm';

interface PageProps {
  params: Promise<{
    slug: string;
    meetingSlug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug, meetingSlug } = await params;
  const supabase = createServiceClient();

  // Look up distributor
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('slug', slug)
    .single();

  if (!distributor) {
    return {
      title: 'Meeting Not Found - Apex Affinity Group',
    };
  }

  // Look up meeting
  const { data: meeting } = await supabase
    .from('meeting_events')
    .select('title, description')
    .eq('registration_slug', meetingSlug)
    .eq('distributor_id', distributor.id)
    .single();

  if (meeting) {
    return {
      title: `Register: ${meeting.title} - ${distributor.first_name} ${distributor.last_name}`,
      description: meeting.description || `Register for ${meeting.title} with ${distributor.first_name} ${distributor.last_name}`,
    };
  }

  return {
    title: 'Meeting Registration - Apex Affinity Group',
  };
}

export default async function MeetingRegistrationPage({ params }: PageProps) {
  const { slug, meetingSlug } = await params;
  const supabase = createServiceClient();

  // Look up distributor
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, phone, slug, status')
    .eq('slug', slug)
    .single();

  // If distributor not found, show 404
  if (distError || !distributor) {
    notFound();
  }

  // If distributor is suspended or deleted, show message
  if (distributor.status === 'suspended' || distributor.status === 'deleted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Page Unavailable
          </h1>
          <p className="text-slate-600 mb-6">
            This page is no longer available.
          </p>
          <a
            href="https://reachtheapex.net"
            className="inline-block bg-[#2c5aa0] text-white px-6 py-3 rounded-lg hover:bg-[#234780] transition"
          >
            Visit Apex Affinity Group
          </a>
        </div>
      </div>
    );
  }

  // Look up meeting (ensure it belongs to this distributor)
  const { data: meeting, error: meetingError } = await supabase
    .from('meeting_events')
    .select('*')
    .eq('registration_slug', meetingSlug)
    .eq('distributor_id', distributor.id)
    .single();

  // If meeting not found, show 404
  if (meetingError || !meeting) {
    notFound();
  }

  // Check if meeting is available for registration
  if (meeting.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Registration Closed
          </h1>
          <p className="text-slate-600 mb-6">
            {meeting.status === 'completed'
              ? 'This meeting has already taken place.'
              : meeting.status === 'canceled'
              ? 'This meeting has been canceled.'
              : 'This meeting is no longer accepting registrations.'}
          </p>
          <p className="text-slate-600">
            For more information, please contact{' '}
            <a
              href={`mailto:${distributor.email}`}
              className="text-[#2c5aa0] hover:underline"
            >
              {distributor.first_name} {distributor.last_name}
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // Check capacity
  const isAtCapacity =
    meeting.max_attendees !== null &&
    meeting.total_registered >= meeting.max_attendees;

  if (isAtCapacity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Event Full
          </h1>
          <p className="text-slate-600 mb-6">
            This event has reached maximum capacity ({meeting.max_attendees}{' '}
            attendees).
          </p>
          <p className="text-slate-600">
            For more information or to be added to the waitlist, please contact{' '}
            <a
              href={`mailto:${distributor.email}`}
              className="text-[#2c5aa0] hover:underline"
            >
              {distributor.first_name} {distributor.last_name}
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // Check deadline
  const isDeadlinePassed =
    meeting.registration_deadline &&
    new Date() > new Date(meeting.registration_deadline);

  if (isDeadlinePassed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Registration Deadline Passed
          </h1>
          <p className="text-slate-600 mb-6">
            The registration deadline for this event has passed.
          </p>
          <p className="text-slate-600">
            For questions, please contact{' '}
            <a
              href={`mailto:${distributor.email}`}
              className="text-[#2c5aa0] hover:underline"
            >
              {distributor.first_name} {distributor.last_name}
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // Meeting is available - show registration form
  return (
    <MeetingRegistrationForm
      meeting={{
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        customMessage: meeting.custom_message,
        eventDate: meeting.event_date,
        eventTime: meeting.event_time,
        eventTimezone: meeting.event_timezone,
        durationMinutes: meeting.duration_minutes,
        locationType: meeting.location_type,
        virtualLink: meeting.virtual_link,
        physicalAddress: meeting.physical_address,
        maxAttendees: meeting.max_attendees,
        totalRegistered: meeting.total_registered,
      }}
      distributor={{
        firstName: distributor.first_name,
        lastName: distributor.last_name,
        email: distributor.email,
        phone: distributor.phone,
      }}
    />
  );
}

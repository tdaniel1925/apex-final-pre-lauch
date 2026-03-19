// =============================================
// Meeting Invitation Entrance Page
// Individual entrance page for meeting invitations
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, Video, ExternalLink } from 'lucide-react';

interface PageProps {
  params: Promise<{
    invitationId: string;
  }>;
}

export default async function MeetingInvitationEntrancePage({ params }: PageProps) {
  const { invitationId } = await params;
  const supabase = await createClient();

  // Fetch invitation details
  const { data: invitation, error } = await supabase
    .from('meeting_invitations')
    .select(
      `
      id,
      recipient_name,
      recipient_email,
      meeting_title,
      meeting_description,
      meeting_date_time,
      meeting_location,
      meeting_link,
      status,
      attended,
      attended_at,
      entrance_page_viewed,
      distributor_id,
      distributors!inner(first_name, last_name, phone)
    `
    )
    .eq('id', invitationId)
    .single();

  if (error || !invitation) {
    console.error('[Meeting Entrance Page] Error fetching invitation:', error);
    notFound();
  }

  // Mark entrance page as viewed (only if not already viewed)
  if (!invitation.entrance_page_viewed) {
    await supabase
      .from('meeting_invitations')
      .update({
        entrance_page_viewed: true,
        entrance_page_viewed_at: new Date().toISOString(),
      })
      .eq('id', invitationId);
  }

  // Check if invitation is expired or canceled
  if (invitation.status === 'expired' || invitation.status === 'canceled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invitation {invitation.status === 'expired' ? 'Expired' : 'Canceled'}
          </h1>
          <p className="text-gray-600">
            {invitation.status === 'expired'
              ? 'This meeting invitation has expired.'
              : 'This meeting invitation has been canceled.'}
          </p>
        </div>
      </div>
    );
  }

  // Parse meeting details
  const meetingDate = new Date(invitation.meeting_date_time);
  const now = new Date();
  const isUpcoming = meetingDate > now;
  const timeDiff = meetingDate.getTime() - now.getTime();
  const hoursUntilMeeting = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesUntilMeeting = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  // Format date/time
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Distributor name
  // Note: distributors is returned as an array even with .single() due to !inner join
  const distributor = Array.isArray(invitation.distributors)
    ? invitation.distributors[0]
    : invitation.distributors;
  const distributorName = `${distributor.first_name} ${distributor.last_name}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-100">You're invited by {distributorName}</p>
              <h1 className="text-2xl font-bold">{invitation.meeting_title}</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Greeting */}
          <p className="text-lg text-gray-700 mb-6">
            Hi <span className="font-semibold">{invitation.recipient_name}</span>,
          </p>

          {/* Meeting Description */}
          {invitation.meeting_description && (
            <div className="mb-6">
              <p className="text-gray-600">{invitation.meeting_description}</p>
            </div>
          )}

          {/* Meeting Details */}
          <div className="space-y-4 mb-8">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{formattedDate}</p>
                <p className="text-gray-600">{formattedTime}</p>
                {isUpcoming && hoursUntilMeeting >= 0 && (
                  <p className="text-sm text-blue-600 mt-1">
                    {hoursUntilMeeting > 0
                      ? `In ${hoursUntilMeeting} hour${hoursUntilMeeting !== 1 ? 's' : ''} ${minutesUntilMeeting} minute${minutesUntilMeeting !== 1 ? 's' : ''}`
                      : `In ${minutesUntilMeeting} minute${minutesUntilMeeting !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {invitation.meeting_location && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{invitation.meeting_location}</p>
                </div>
              </div>
            )}

            {/* Virtual Meeting Link */}
            {invitation.meeting_link && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Virtual Meeting</p>
                  <p className="text-sm text-gray-500">Click "Enter Room" below to join</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Status */}
          {invitation.attended && invitation.attended_at && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ You marked your attendance on{' '}
                {new Date(invitation.attended_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          {/* Enter Room Button */}
          {invitation.meeting_link && (
            <form action={`/api/autopilot/attend/${invitationId}`} method="POST">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Enter Room
              </button>
            </form>
          )}

          {/* No Link Warning */}
          {!invitation.meeting_link && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-sm text-yellow-800">
                Meeting details will be provided by {distributorName}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-sm text-gray-500 text-center">
            Powered by <span className="font-semibold text-gray-700">Apex Affinity Group</span>
          </p>
        </div>
      </div>
    </div>
  );
}

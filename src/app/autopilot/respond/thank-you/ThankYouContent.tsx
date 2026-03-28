'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { generateCalendarFile, formatMeetingDateTime } from '@/lib/autopilot/invitation-helpers';

export default function ThankYouContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const response = searchParams.get('response') as 'yes' | 'no' | 'maybe' | null;
  const error = searchParams.get('error');
  const alreadyResponded = searchParams.get('already_responded') === 'true';
  const meetingTitle = searchParams.get('meeting_title');
  const meetingDate = searchParams.get('meeting_date');
  const meetingLink = searchParams.get('meeting_link');
  const distributorName = searchParams.get('distributor_name');
  const distributorPhone = searchParams.get('distributor_phone');
  const distributorEmail = searchParams.get('distributor_email');
  const invitationId = searchParams.get('invitation_id');

  // Handle error states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            {error === 'not_found' && 'This invitation could not be found.'}
            {error === 'invalid_response' && 'Invalid response type.'}
            {error === 'update_failed' && 'Failed to record your response. Please try again.'}
            {error === 'server_error' && 'A server error occurred. Please try again later.'}
            {!['not_found', 'invalid_response', 'update_failed', 'server_error'].includes(error) &&
              'An unknown error occurred.'}
          </p>
          <Button
            onClick={() => window.location.href = 'https://theapexway.net'}
            className="bg-gold hover:bg-gold/90"
          >
            Go to Apex Website
          </Button>
        </Card>
      </div>
    );
  }

  // Response configurations
  const responseConfig = {
    yes: {
      icon: <CheckCircle2 className="w-20 h-20 text-green-500" />,
      title: "Great! You're Coming!",
      message: alreadyResponded
        ? "You've already confirmed your attendance for this meeting."
        : "Thank you for confirming! We're looking forward to seeing you.",
      color: 'green',
    },
    no: {
      icon: <XCircle className="w-20 h-20 text-red-500" />,
      title: "We'll Miss You",
      message: alreadyResponded
        ? "You've already declined this invitation."
        : "Thanks for letting us know. We hope to connect with you another time!",
      color: 'red',
    },
    maybe: {
      icon: <Clock className="w-20 h-20 text-yellow-500" />,
      title: "Thanks for Your Response",
      message: alreadyResponded
        ? "You've already indicated you might attend."
        : "We understand you're not sure yet. We'll reach out closer to the meeting date.",
      color: 'yellow',
    },
  };

  const config = response ? responseConfig[response] : null;

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Invalid Response</h1>
          <p className="text-gray-600">Please use the link from your invitation email.</p>
        </Card>
      </div>
    );
  }

  // Download calendar file
  const downloadCalendar = () => {
    if (!meetingTitle || !meetingDate || !invitationId) return;

    const icsContent = generateCalendarFile({
      id: invitationId,
      meeting_title: meetingTitle,
      meeting_description: null,
      meeting_date_time: meetingDate,
      meeting_location: null,
      meeting_link: meetingLink,
      recipient_name: 'Guest',
      recipient_email: 'guest@example.com',
      distributor_id: '',
      status: 'sent',
      sent_at: null,
      opened_at: null,
      open_count: 0,
      responded_at: null,
      response_type: null,
      reminder_count: 0,
      created_at: '',
      updated_at: '',
    });

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meetingTitle.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        {/* Apex Logo */}
        <div className="text-center mb-8">
          <Image
            src="https://reachtheapex.net/apex-logo.png"
            alt="Apex Affinity Group"
            width={200}
            height={80}
            className="mx-auto mb-6"
          />
        </div>

        {/* Response Icon & Message */}
        <div className="text-center mb-8">
          <div className="mb-4">{config.icon}</div>
          <h1 className="text-3xl font-bold text-navy-900 mb-3">{config.title}</h1>
          <p className="text-lg text-gray-600">{config.message}</p>
        </div>

        {/* Meeting Details */}
        {meetingTitle && meetingDate && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Meeting Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Meeting:</span>
                <p className="text-base text-gray-900">{meetingTitle}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">When:</span>
                <p className="text-base text-gray-900">
                  {formatMeetingDateTime(meetingDate)}
                </p>
              </div>
              {meetingLink && response === 'yes' && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Join Link:</span>
                  <p className="text-base">
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      {meetingLink}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Add to Calendar Button (only for Yes responses) */}
            {response === 'yes' && (
              <div className="mt-6">
                <Button
                  onClick={downloadCalendar}
                  className="w-full bg-gold hover:bg-gold/90 text-navy-900"
                >
                  📅 Add to Calendar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Distributor Contact Info */}
        {distributorName && (
          <div className="bg-navy-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-3">
              Contact {distributorName}
            </h3>
            <div className="space-y-2 text-sm">
              {distributorEmail && (
                <div>
                  <span className="text-gray-500">Email: </span>
                  <a
                    href={`mailto:${distributorEmail}`}
                    className="text-gold hover:underline"
                  >
                    {distributorEmail}
                  </a>
                </div>
              )}
              {distributorPhone && (
                <div>
                  <span className="text-gray-500">Phone: </span>
                  <a
                    href={`tel:${distributorPhone}`}
                    className="text-gold hover:underline"
                  >
                    {distributorPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>This invitation was sent through Apex Affinity Group</p>
          <p className="mt-2">
            <a
              href="https://theapexway.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Learn more about Apex
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

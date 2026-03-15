'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MEETING_LINK = 'https://teams.microsoft.com/meet/26528832746280?p=Zh81sDMA5eWoCOYWTz';
const MEETING_ID = '265 288 327 462 80';
const PASSCODE = 'Y4hf7CG7';

interface EventSchedule {
  day: 'Tuesday' | 'Thursday';
  time: string;
  title: string;
  description: string;
}

const SCHEDULE: EventSchedule[] = [
  {
    day: 'Tuesday',
    time: '6:30 PM',
    title: 'Opportunity Meetings',
    description: 'Learn about the business opportunity, compensation plan, and how to build your team.'
  },
  {
    day: 'Thursday',
    time: '6:30 PM',
    title: 'Training Sessions',
    description: 'Product training, sales skills, and personal development to grow your business.'
  }
];

export default function LiveEventsPage() {
  const [isLive, setIsLive] = useState(false);
  const [nextEvent, setNextEvent] = useState<EventSchedule | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if we're currently live or upcoming (30 min before)
  useEffect(() => {
    function checkLiveStatus() {
      const now = new Date();

      // Convert to Central Time
      const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      const dayOfWeek = centralTime.getDay(); // 0 = Sunday, 2 = Tuesday, 4 = Thursday
      const hours = centralTime.getHours();
      const minutes = centralTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      // Event time: 6:30 PM = 18:30 = 1110 minutes
      const eventStart = 18 * 60 + 30; // 1110 minutes
      const eventEnd = 20 * 60; // 8:00 PM = 1200 minutes (assume 1.5 hour events)
      const preEventWindow = eventStart - 30; // 30 minutes before

      // Check if today is Tuesday (2) or Thursday (4)
      const isTuesday = dayOfWeek === 2;
      const isThursday = dayOfWeek === 4;

      if ((isTuesday || isThursday) && currentMinutes >= preEventWindow && currentMinutes <= eventEnd) {
        setIsLive(true);
        setNextEvent(isTuesday ? SCHEDULE[0] : SCHEDULE[1]);
      } else {
        setIsLive(false);
        // Calculate next event
        const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;

        if (daysUntilTuesday < daysUntilThursday) {
          setNextEvent(SCHEDULE[0]);
        } else {
          setNextEvent(SCHEDULE[1]);
        }
      }
    }

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const generateInviteEmail = () => {
    return `Subject: You're Invited: Live ${nextEvent?.title || 'Event'} - No Registration Required!

Hi there!

I'd like to invite you to join our upcoming live event:

🎯 Event: ${nextEvent?.title || 'Live Event'}
📅 When: Every ${nextEvent?.day || 'Tuesday/Thursday'} at ${nextEvent?.time || '6:30 PM'} Central Time
🔗 Join Link: ${MEETING_LINK}
🎫 Meeting ID: ${MEETING_ID}
🔐 Passcode: ${PASSCODE}

${nextEvent?.description || ''}

✨ No registration required - just click the link and join!
✨ Feel free to invite anyone who might be interested

Looking forward to seeing you there!

Best regards`;
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(generateInviteEmail());
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(MEETING_LINK);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0F2045 0%, #1B3A7D 50%, #274693 100%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            Apex Financial
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Login
            </Link>
            <Link href="/signup" className="bg-[#C7181F] hover:bg-[#991316] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Join Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-8">
          {isLive && (
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full mb-6 animate-pulse">
              <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
              <span className="font-bold">LIVE NOW</span>
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Live Events
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Join our weekly live events to learn, grow, and connect with our community.
            <strong className="text-white block mt-2">No registration required</strong> —
            just click and join!
          </p>
        </div>

        {/* Live Join Button */}
        <div className="mb-12">
          {isLive ? (
            <a
              href={MEETING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #C7181F 0%, #E04F55 100%)',
                boxShadow: '0 0 40px rgba(199, 24, 31, 0.6), 0 0 80px rgba(199, 24, 31, 0.4)'
              }}
            >
              <span className="absolute inset-0 w-full h-full">
                <span className="absolute inset-0 animate-pulse bg-white/20"></span>
              </span>
              <svg className="w-6 h-6 mr-3 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="relative z-10">Join Live Event Now</span>
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white/50 rounded-2xl bg-white/10 cursor-not-allowed"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Not Currently Live
            </button>
          )}
        </div>

        {/* Quick Copy Link */}
        <div className="mb-16 max-w-xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1 text-left">
              <p className="text-white/60 text-xs mb-1">Meeting Link</p>
              <p className="text-white text-sm font-mono truncate">{MEETING_LINK}</p>
            </div>
            <button
              onClick={copyLink}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {copiedLink ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Weekly Schedule</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {SCHEDULE.map((event, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                  <p className="text-white/60 text-sm">Every {event.day}</p>
                </div>
                <div className="bg-[#C7181F] text-white px-3 py-1 rounded-lg font-bold text-sm">
                  {event.time} CT
                </div>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">{event.description}</p>
            </div>
          ))}
        </div>

        {/* Meeting Details */}
        <div className="mt-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Meeting Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-white/60 w-28">Meeting ID:</span>
              <span className="text-white font-mono">{MEETING_ID}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 w-28">Passcode:</span>
              <span className="text-white font-mono">{PASSCODE}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 w-28">Time Zone:</span>
              <span className="text-white">Central Time (CT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Section */}
      <div className="bg-white/5 border-t border-white/10 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Invite Your Network</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Share the opportunity! Copy the email template below and send it to anyone who might benefit from joining our live events.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Email Template</h3>
              <button
                onClick={copyInvite}
                className="bg-[#C7181F] hover:bg-[#991316] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {copiedInvite ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy Invite Email
                  </>
                )}
              </button>
            </div>
            <pre className="bg-black/30 text-white/90 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap font-mono border border-white/10">
{generateInviteEmail()}
            </pre>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              💡 <strong className="text-white">Pro Tip:</strong> Personalize the message before sending to make it more engaging!
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Our Team?</h2>
        <p className="text-white/80 mb-8 max-w-2xl mx-auto">
          Don't just attend events — become part of the movement. Join Apex Financial and build your future.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center bg-[#C7181F] hover:bg-[#991316] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          Get Started Today
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

    </div>
  );
}

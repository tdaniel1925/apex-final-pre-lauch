'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MEETING_LINK = 'https://teams.microsoft.com/meet/26528832746280?p=Zh81sDMA5eWoCOYWTz';

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

  useEffect(() => {
    function checkLiveStatus() {
      const now = new Date();
      const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      const dayOfWeek = centralTime.getDay(); // 0 = Sunday, 2 = Tuesday, 4 = Thursday
      const hours = centralTime.getHours();
      const minutes = centralTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      // Button goes live at 6:00 PM (18:00 = 1080 minutes)
      const liveStart = 18 * 60; // 6:00 PM
      const eventEnd = 19 * 60 + 30; // 7:30 PM - event ends and shows next event

      const isTuesday = dayOfWeek === 2;
      const isThursday = dayOfWeek === 4;

      if ((isTuesday || isThursday) && currentMinutes >= liveStart && currentMinutes < eventEnd) {
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

  const copyInvite = () => {
    const inviteText = `Join me for live ${nextEvent?.title || 'events'} every ${nextEvent?.day || 'week'}!

📅 When: ${nextEvent?.day || 'Weekly'} at ${nextEvent?.time || '6:30 PM'} Central Time
🔗 Link: ${MEETING_LINK}

${nextEvent?.description || ''}

No registration required - just click and join! See you there!`;

    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0F2045 0%, #1B3A7D 50%, #274693 100%)' }}>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-white text-xl font-bold">
            Apex Affinity Group
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/live" className="text-white hover:text-white transition-colors text-sm font-medium border-b-2 border-[#C7181F] pb-1">
              Live
            </Link>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {isLive && (
          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full mb-6 animate-pulse">
            <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
            <span className="font-bold">LIVE NOW</span>
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Live Events
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-4">
          Join our weekly training and opportunity events
        </p>

        <p className="text-lg text-white/70 mb-12">
          No registration required — just click and join when we're live!
        </p>

        {/* Join Button */}
        <div className="mb-16">
          {isLive ? (
            <a
              href={MEETING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #C7181F 0%, #E04F55 100%)',
                boxShadow: '0 0 60px rgba(199, 24, 31, 0.8), 0 0 100px rgba(199, 24, 31, 0.5)'
              }}
            >
              <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Join Live Event Now
            </a>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center px-10 py-5 text-2xl font-bold text-white/40 rounded-2xl bg-white/10 cursor-not-allowed mb-4">
                <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Not Live
              </div>
              <p className="text-white/70 text-lg">
                Next event: <strong className="text-white">{nextEvent?.title}</strong> — {nextEvent?.day} at {nextEvent?.time} CT
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Weekly Schedule</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {SCHEDULE.map((event, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all"
            >
              <div className="text-center mb-4">
                <div className="inline-block bg-[#C7181F] text-white px-4 py-2 rounded-lg font-bold mb-3">
                  {event.day}s at {event.time} CT
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
              </div>
              <p className="text-white/80 text-center leading-relaxed">{event.description}</p>
            </div>
          ))}
        </div>

        {/* Invite Section */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Invite Your Network</h3>
            <p className="text-white/70">Share this opportunity with others</p>
          </div>

          <button
            onClick={copyInvite}
            className="w-full bg-[#C7181F] hover:bg-[#991316] text-white px-6 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            {copiedInvite ? (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied to Clipboard!
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
                Copy Invite Message
              </>
            )}
          </button>

          <p className="text-white/60 text-sm text-center mt-4">
            Click to copy a pre-written invite you can send via text or email
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Our Team?</h2>
          <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
            Don't just attend events — become part of the movement and build your future with Apex.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center bg-[#C7181F] hover:bg-[#991316] text-white px-10 py-4 rounded-xl text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Get Started Today
            <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  );
}

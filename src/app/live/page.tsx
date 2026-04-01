'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MEETING_LINK = 'https://teams.microsoft.com/meet/26528832746280?p=Zh81sDMA5eWoCOYWTz';

// SPECIAL EVENT OVERRIDE - Set to null when no special event
const SPECIAL_EVENT = {
  date: '2026-03-31', // YYYY-MM-DD format (TONIGHT)
  time: '18:30', // 24-hour format (6:30 PM = 18:30)
  title: 'Opportunity Presentation',
  description: 'Learn about the business opportunity, compensation plan, and how to build your team with Apex Affinity Group.'
};

interface EventSchedule {
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
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
  const [isEventStarted, setIsEventStarted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [nextEvent, setNextEvent] = useState<EventSchedule | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editableInvite, setEditableInvite] = useState('');

  useEffect(() => {
    function checkLiveStatus() {
      const now = new Date();

      // Get Central Time components properly
      const centralTimeString = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
      const centralDate = new Date(centralTimeString);
      const dayOfWeek = centralDate.getDay();
      const hours = centralDate.getHours();
      const minutes = centralDate.getMinutes();
      const seconds = centralDate.getSeconds();
      const currentMinutes = hours * 60 + minutes;

      // Check for special event first
      if (SPECIAL_EVENT) {
        // Parse the special event date string (YYYY-MM-DD)
        const [year, month, day] = SPECIAL_EVENT.date.split('-').map(Number);

        // Create date for today in Central timezone using the converted date components
        const todayYear = centralDate.getFullYear();
        const todayMonth = centralDate.getMonth();
        const todayDay = centralDate.getDate();

        // Compare year, month, day directly
        const isSpecialEventToday = (year === todayYear && month - 1 === todayMonth && day === todayDay);

        const [eventHour, eventMinute] = SPECIAL_EVENT.time.split(':').map(Number);

        if (isSpecialEventToday) {
          const roomOpen = (eventHour * 60) - 30; // 30 minutes before event
          const eventStart = eventHour * 60 + eventMinute;
          const eventEnd = eventStart + 60; // 1 hour event

          // Format special event details
          const specialEventDetails = {
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek] as any,
            time: SPECIAL_EVENT.time.replace(/(\d+):(\d+)/, (_, h, m) => {
              const hour = parseInt(h);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              return `${displayHour}:${m} ${ampm}`;
            }),
            title: SPECIAL_EVENT.title,
            description: SPECIAL_EVENT.description
          };

          // If room is open (live)
          if (currentMinutes >= roomOpen && currentMinutes < eventEnd) {
            setIsLive(true);
            setNextEvent(specialEventDetails);

            if (currentMinutes >= eventStart) {
              setIsEventStarted(true);
              setCountdown('');
            } else {
              setIsEventStarted(false);
              const totalSecondsUntilStart = (eventStart - currentMinutes) * 60 - seconds;
              const minutesLeft = Math.floor(totalSecondsUntilStart / 60);
              const secondsLeft = totalSecondsUntilStart % 60;
              setCountdown(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
            }
            return;
          }

          // If event is later today (not live yet, but show it as upcoming)
          if (currentMinutes < roomOpen) {
            setIsLive(false);
            setIsEventStarted(false);
            setNextEvent(specialEventDetails);

            // Calculate exact time until event starts
            const nextEventDate = new Date(centralDate);
            nextEventDate.setHours(eventHour, eventMinute, 0, 0);

            const msUntilEvent = nextEventDate.getTime() - centralDate.getTime();
            const totalHours = Math.floor(msUntilEvent / (1000 * 60 * 60));
            const totalMinutes = Math.floor((msUntilEvent % (1000 * 60 * 60)) / (1000 * 60));

            // Format countdown based on time remaining
            if (totalHours >= 1) {
              setCountdown(`${totalHours} hour${totalHours !== 1 ? 's' : ''}, ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`);
            } else {
              setCountdown(`${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`);
            }
            return;
          }
        }
      }

      const roomOpen = 18 * 60; // 6:00 PM - Room opens
      const eventStart = 18 * 60 + 30; // 6:30 PM - Event starts
      const eventEnd = 19 * 60 + 30; // 7:30 PM - Event ends

      const isTuesday = dayOfWeek === 2;
      const isThursday = dayOfWeek === 4;

      if ((isTuesday || isThursday) && currentMinutes >= roomOpen && currentMinutes < eventEnd) {
        setIsLive(true);
        setNextEvent(isTuesday ? SCHEDULE[0] : SCHEDULE[1]);

        // Check if event has started (6:30 PM)
        if (currentMinutes >= eventStart) {
          setIsEventStarted(true);
          setCountdown('');
        } else {
          setIsEventStarted(false);
          // Calculate countdown to 6:30 PM
          const totalSecondsUntilStart = (eventStart - currentMinutes) * 60 - seconds;
          const minutesLeft = Math.floor(totalSecondsUntilStart / 60);
          const secondsLeft = totalSecondsUntilStart % 60;
          setCountdown(`${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`);
        }
      } else {
        setIsLive(false);
        setIsEventStarted(false);

        // Calculate days until next event
        const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;

        let nextEventDay: number;
        let nextEventSchedule: EventSchedule;

        if (daysUntilTuesday < daysUntilThursday) {
          nextEventDay = daysUntilTuesday;
          nextEventSchedule = SCHEDULE[0];
        } else {
          nextEventDay = daysUntilThursday;
          nextEventSchedule = SCHEDULE[1];
        }

        setNextEvent(nextEventSchedule);

        // Calculate exact time until next event
        const nextEventDate = new Date(centralDate);
        nextEventDate.setDate(nextEventDate.getDate() + nextEventDay);
        nextEventDate.setHours(18, 30, 0, 0); // 6:30 PM

        const msUntilEvent = nextEventDate.getTime() - centralDate.getTime();
        const totalHours = Math.floor(msUntilEvent / (1000 * 60 * 60));
        const totalMinutes = Math.floor((msUntilEvent % (1000 * 60 * 60)) / (1000 * 60));

        // Format countdown based on time remaining
        if (totalHours >= 24) {
          const days = Math.floor(totalHours / 24);
          const hours = totalHours % 24;
          setCountdown(`${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`);
        } else if (totalHours > 0) {
          setCountdown(`${totalHours} hour${totalHours !== 1 ? 's' : ''}, ${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`);
        } else {
          setCountdown(`${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`);
        }
      }
    }

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 1000); // Update every second for countdown

    return () => clearInterval(interval);
  }, []);

  const getDefaultInviteMessage = () => {
    return `Join me for live ${nextEvent?.title || 'Opportunity Meetings'} every ${nextEvent?.day || 'Tuesday'}!

💰 Two ladders. Two income streams. One opportunity.

Apex Affinity Group isn't just another insurance organization — it's insurance AND AI technology working together. Our reps hold two ranks, earn on two sides, and build one business that pays them from both.

🔹 Sell insurance — earn 40%–90% carrier commissions + generational overrides up to 6 levels deep
🔹 Sell AI-powered tools — earn commissions on every sale + ranked team overrides that unlock as you advance
🔹 Do both — and watch your ranks climb faster on BOTH sides through our cross-credit system

Trips. Car allowances. Rank bonuses up to $30,000. Fast start bonuses in your first 90 days. This isn't a pitch — it's a plan.

📅 ${nextEvent?.day || 'Tuesday'} at ${nextEvent?.time || '6:30 PM'} Central
📍 https://theapexway.net/live
🔗 ${MEETING_LINK}

No registration. Just show up. This could be the meeting that changes your trajectory.

See you there!`;
  };

  const openInviteModal = () => {
    setEditableInvite(getDefaultInviteMessage());
    setShowInviteModal(true);
  };

  const copyFromModal = () => {
    navigator.clipboard.writeText(editableInvite);
    setCopiedInvite(true);
    setTimeout(() => {
      setCopiedInvite(false);
      setShowInviteModal(false);
    }, 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(MEETING_LINK);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Join our live events every Tuesday and Thursday!`, '_blank');
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=Join Our Live Events&body=${encodeURIComponent(`Check out our live events:\n\n${window.location.href}\n\nTuesdays: Opportunity Meetings\nThursdays: Training Sessions\n\nBoth at 6:30 PM CT`)}`;
  };

  return (
    <>
      {/* Load Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* HEADER / NAVIGATION - Same as main site */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <nav style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px'
        }}>
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ height: '48px' }} />
          </a>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px'
          }}>
            <a href="/#opportunity" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>Opportunity</a>
            <a href="/#insurance" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>Insurance</a>
            <a href="/#products" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>AI Technology</a>
            <a href="/#faq" style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>FAQs</a>
            <a href="/live" style={{
              color: '#2B4C7E',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}>Events</a>
          </div>
        </nav>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #0F2045 0%, #1B3A7D 50%, #274693 100%)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            {isLive && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#DC2626',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '50px',
                marginBottom: '20px',
                animation: 'pulse 2s infinite'
              }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'ping 1s infinite'
                }}></span>
                <span style={{ fontWeight: 'bold' }}>ROOM OPEN NOW</span>
              </div>
            )}

            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              lineHeight: '1.1'
            }}>
              Live Events
            </h1>

            <p style={{
              fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '10px',
              maxWidth: '800px',
              margin: '0 auto 10px'
            }}>
              Join our weekly training and opportunity events
            </p>

            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '40px'
            }}>
              No registration required — just click and join when we're live!
            </p>

            {/* Join Button */}
            {isLive ? (
              isEventStarted ? (
                <a
                  href={MEETING_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 50px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'linear-gradient(135deg, #C7181F 0%, #E04F55 100%)',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 0 60px rgba(199, 24, 31, 0.8), 0 0 100px rgba(199, 24, 31, 0.5)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg style={{ width: '32px', height: '32px', marginRight: '12px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Join Live Event Now!
                </a>
              ) : (
                <a
                  href={MEETING_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px 50px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'linear-gradient(135deg, #C7181F 0%, #E04F55 100%)',
                    borderRadius: '16px',
                    textDecoration: 'none',
                    boxShadow: '0 0 60px rgba(199, 24, 31, 0.8), 0 0 100px rgba(199, 24, 31, 0.5)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg style={{ width: '32px', height: '32px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>Join Room Now</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.95 }}>
                    Event starts in: <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{countdown}</span>
                  </div>
                </a>
              )
            ) : (
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 50px',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'rgba(255, 255, 255, 0.4)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  cursor: 'not-allowed',
                  marginBottom: '15px'
                }}>
                  <svg style={{ width: '32px', height: '32px', marginRight: '12px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Not Live
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem' }}>
                  <p style={{ marginBottom: '8px' }}>
                    Next event: <strong style={{ color: 'white' }}>{nextEvent?.title}</strong> — {nextEvent?.day} at {nextEvent?.time} CT
                  </p>
                  {countdown && (
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#FCD34D' }}>
                      {countdown}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="row" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

            {/* Schedule Cards - 2/3 Width */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '30px' }}>
                Weekly Schedule
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                {SCHEDULE.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '20px',
                      padding: '30px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                          {event.title}
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.95rem' }}>
                          Every {event.day}
                        </p>
                      </div>
                      <div style={{
                        background: '#C7181F',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap'
                      }}>
                        {event.time} CT
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6' }}>
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Share & Invite Sidebar - 1/3 Width */}
            <div style={{ flex: '1', minWidth: '280px' }}>

              {/* Share Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '25px',
                marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>
                  Share This Page
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={shareOnFacebook}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      background: '#1877F2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#166FE5'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1877F2'}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  <button
                    onClick={shareOnTwitter}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      background: '#1DA1F2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1A94DA'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1DA1F2'}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Twitter
                  </button>

                  <button
                    onClick={shareViaEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      background: '#EA4335',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#D93025'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#EA4335'}
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </button>

                  <button
                    onClick={copyLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 18px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.95rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    {copiedLink ? (
                      <>
                        <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Invite Section */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '25px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>
                  Invite Your Network
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Copy a pre-written message to share via text or email
                </p>

                <button
                  onClick={openInviteModal}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '14px',
                    background: '#C7181F',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '1rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#991316';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#C7181F';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  </svg>
                  Create Invite Message
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1B3A7D', margin: 0 }}>
                Customize Your Invite
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#6B7280',
                  cursor: 'pointer',
                  padding: '5px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px', flex: 1, overflow: 'auto' }}>
              <p style={{ color: '#6B7280', marginBottom: '15px', fontSize: '0.95rem' }}>
                Edit the message below to personalize it, then click Copy to clipboard
              </p>
              <textarea
                value={editableInvite}
                onChange={(e) => setEditableInvite(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '400px',
                  padding: '15px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#1B3A7D'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '20px 30px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              gap: '15px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: '12px 24px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseOut={(e) => e.currentTarget.style.background = '#F3F4F6'}
              >
                Cancel
              </button>
              <button
                onClick={copyFromModal}
                style={{
                  padding: '12px 24px',
                  background: copiedInvite ? '#10B981' : '#C7181F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!copiedInvite) e.currentTarget.style.background = '#991316';
                }}
                onMouseOut={(e) => {
                  if (!copiedInvite) e.currentTarget.style.background = '#C7181F';
                }}
              >
                {copiedInvite ? (
                  <>
                    <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

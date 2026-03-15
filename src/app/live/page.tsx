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
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    function checkLiveStatus() {
      const now = new Date();
      const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      const dayOfWeek = centralTime.getDay();
      const hours = centralTime.getHours();
      const minutes = centralTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      const liveStart = 18 * 60; // 6:00 PM
      const eventEnd = 19 * 60 + 30; // 7:30 PM

      const isTuesday = dayOfWeek === 2;
      const isThursday = dayOfWeek === 4;

      if ((isTuesday || isThursday) && currentMinutes >= liveStart && currentMinutes < eventEnd) {
        setIsLive(true);
        setNextEvent(isTuesday ? SCHEDULE[0] : SCHEDULE[1]);
      } else {
        setIsLive(false);
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
    const interval = setInterval(checkLiveStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const copyInvite = () => {
    const inviteText = `Join me for live ${nextEvent?.title || 'events'} every ${nextEvent?.day || 'week'}!

🤖 Discover how AI is revolutionizing the insurance industry and creating unprecedented opportunities for financial growth. Learn about our AI-powered platform that's helping people build successful insurance businesses.

📅 When: ${nextEvent?.day || 'Weekly'} at ${nextEvent?.time || '6:30 PM'} Central Time
📍 Where: https://reachtheapex.net/live
🔗 Direct Join Link: ${MEETING_LINK}

${nextEvent?.description || ''}

No registration required - just click and join! This could be the opportunity you've been looking for.

See you there!`;

    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
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
      {/* Load Optive CSS for Header */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/custom.css" rel="stylesheet" media="screen" />

      {/* Header Start - Same as marketing site */}
      <header className="main-header">
        <div className="header-sticky">
          <nav className="navbar navbar-expand-lg">
            <div className="container">
              <a className="navbar-brand" href="/">
                <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{height: '80px'}} />
              </a>

              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="navbar-collapse main-menu" id="navbarNav">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav mr-auto" id="menu">
                    <li className="nav-item"><a className="nav-link" href="/#home">Home</a></li>
                    <li className="nav-item"><a className="nav-link" href="/#journey">Your Journey</a></li>
                    <li className="nav-item"><a className="nav-link" href="/#products">Products</a></li>
                    <li className="nav-item"><a className="nav-link" href="/#services">Services</a></li>
                    <li className="nav-item"><a className="nav-link" href="/#faq">FAQs</a></li>
                    <li className="nav-item"><a className="nav-link" href="/#contact">Contact</a></li>
                    <li className="nav-item"><a className="nav-link active" href="/live">Live</a></li>
                  </ul>
                </div>
              </div>
              <div className="navbar-toggle"></div>
            </div>
          </nav>
          <div className="responsive-menu"></div>
        </div>
      </header>
      {/* Header End */}

      <div style={{ background: 'linear-gradient(135deg, #0F2045 0%, #1B3A7D 50%, #274693 100%)', minHeight: '100vh', paddingTop: '180px', paddingBottom: '80px' }}>

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
                <span style={{ fontWeight: 'bold' }}>LIVE NOW</span>
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
                Join Live Event Now
              </a>
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
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.125rem' }}>
                  Next event: <strong style={{ color: 'white' }}>{nextEvent?.title}</strong> — {nextEvent?.day} at {nextEvent?.time} CT
                </p>
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
                  onClick={copyInvite}
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
                  {copiedInvite ? (
                    <>
                      <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                      </svg>
                      Copy Invite Message
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

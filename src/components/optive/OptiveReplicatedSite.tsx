'use client';

// =============================================
// Optive Template - COMPLETE Replication
// Business Consulting HTML Template
// with Distributor Personalization
// All 12+ sections from index.html (2141 lines)
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';
import Script from 'next/script';
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';

interface OptiveReplicatedSiteProps {
  distributor: Distributor;
  isMainSite?: boolean; // If true, hide all signup/join buttons
}

export default function OptiveReplicatedSite({ distributor, isMainSite = false }: OptiveReplicatedSiteProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pricingToggle, setPricingToggle] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  // For generic homepage (slug='apex'), don't add ref parameter
  const signupUrl = distributor.slug === 'apex' ? '/signup' : `/signup?ref=${distributor.slug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown Timer for Next Live Event (Tuesday/Thursday at 6:30 PM Central)
  useEffect(() => {
    const getNextEventDate = () => {
      // Get current time in Central timezone
      const now = new Date();
      const centralTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      const dayOfWeek = centralTime.getDay(); // 0 = Sunday, 2 = Tuesday, 4 = Thursday
      const hours = centralTime.getHours();
      const minutes = centralTime.getMinutes();
      const currentMinutes = hours * 60 + minutes;

      const eventTime = 18 * 60 + 30; // 6:30 PM in minutes

      let nextEventDay: number;

      // If we're on Tuesday before event time, event is today
      if (dayOfWeek === 2 && currentMinutes < eventTime) {
        nextEventDay = 0;
      }
      // If we're on Tuesday after event time, next event is Thursday
      else if (dayOfWeek === 2 && currentMinutes >= eventTime) {
        nextEventDay = 2;
      }
      // If we're on Thursday before event time, event is today
      else if (dayOfWeek === 4 && currentMinutes < eventTime) {
        nextEventDay = 0;
      }
      // If we're on Thursday after event time, next event is next Tuesday
      else if (dayOfWeek === 4 && currentMinutes >= eventTime) {
        nextEventDay = 5;
      }
      // Otherwise, calculate days until next Tuesday or Thursday
      else {
        const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
        nextEventDay = daysUntilTuesday < daysUntilThursday ? daysUntilTuesday : daysUntilThursday;
      }

      // Create the next event date
      const nextEvent = new Date(centralTime);
      nextEvent.setDate(centralTime.getDate() + nextEventDay);
      nextEvent.setHours(18, 30, 0, 0); // 6:30 PM Central

      return nextEvent;
    };

    const calculateTimeLeft = () => {
      const eventDate = getNextEventDate();
      const now = new Date();
      const centralNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      const difference = eventDate.getTime() - centralNow.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(distributor.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <>
      {/* Load Optive CSS Files - Exactly as in template */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/slicknav.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="/optive/css/swiper-bundle.min.css" />
      <link href="/optive/css/all.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/animate.css" rel="stylesheet" />
      <link rel="stylesheet" href="/optive/css/magnific-popup.css" />
      <link rel="stylesheet" href="/optive/css/mousecursor.css" />
      <link href="/optive/css/custom.css" rel="stylesheet" media="screen" />

      {/* Force FAQ Text Visibility */}
      <style dangerouslySetInnerHTML={{__html: `
        .faq-accordion .accordion-collapse > div {
          background-color: white !important;
          color: black !important;
          padding: 20px !important;
        }
        .faq-accordion .accordion-collapse > div > div {
          color: black !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .faq-accordion .accordion-collapse.show > div {
          background-color: white !important;
        }
        .faq-accordion .accordion-collapse.show > div > div {
          color: #000000 !important;
        }
      `}} />

      <div className="optive-template-wrapper">
        {/* Preloader Start */}
        <div className="preloader" style={{ display: mounted ? 'none' : 'flex' }}>
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon"><img src="/optive/images/loader.svg" alt="" /></div>
          </div>
        </div>
        {/* Preloader End */}

        {/* Live Event Countdown Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          width: '100%',
          padding: '5px 16px',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '600'
        }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{fontSize: '13px', letterSpacing: '0.3px'}}>Next Live Event:</span>
              </div>
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
              }}>
                {/* Days */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  minWidth: '42px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '800', lineHeight: '1'}}>{String(timeLeft.days).padStart(2, '0')}</div>
                  <div style={{fontSize: '8px', marginTop: '1px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.3px'}}>Days</div>
                </div>
                <span style={{fontSize: '14px', fontWeight: '700', opacity: 0.7}}>:</span>
                {/* Hours */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  minWidth: '42px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '800', lineHeight: '1'}}>{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div style={{fontSize: '8px', marginTop: '1px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.3px'}}>Hours</div>
                </div>
                <span style={{fontSize: '14px', fontWeight: '700', opacity: 0.7}}>:</span>
                {/* Minutes */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  minWidth: '42px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '800', lineHeight: '1'}}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div style={{fontSize: '8px', marginTop: '1px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.3px'}}>Min</div>
                </div>
                <span style={{fontSize: '14px', fontWeight: '700', opacity: 0.7}}>:</span>
                {/* Seconds */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  minWidth: '42px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{fontSize: '14px', fontWeight: '800', lineHeight: '1'}}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div style={{fontSize: '8px', marginTop: '1px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.3px'}}>Sec</div>
                </div>
              </div>
              <a href="/live" style={{
                background: '#ffffff',
                color: '#dc2626',
                padding: '5px 14px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
              }}>
                Join →
              </a>
        </div>
        {/* Live Event Countdown Banner End */}

        {/* Header Start */}
        <header className="main-header" style={{marginTop: '40px'}}>
          <div className="header-sticky">
            <nav className="navbar navbar-expand-lg">
              <div className="container">
                {/* Logo Start */}
                <a className="navbar-brand" href="/">
                  <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{height: '80px'}} />
                </a>
                {/* Logo End */}

                {/* Navbar Toggler for Mobile */}
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

                {/* Main Menu Start */}
                <div className="navbar-collapse main-menu" id="navbarNav">
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto" id="menu">
                      <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
                      <li className="nav-item"><a className="nav-link" href="#opportunity">Opportunity</a></li>
                      <li className="nav-item"><a className="nav-link" href="#how-it-works">How It Works</a></li>
                      <li className="nav-item"><a className="nav-link" href="#products">AI Technology</a></li>
                      <li className="nav-item"><a className="nav-link" href="#insurance">Insurance</a></li>
                      <li className="nav-item"><a className="nav-link" href="#faq">FAQs</a></li>
                      <li className="nav-item"><a className="nav-link" href="/live">Events</a></li>
                    </ul>
                  </div>

                  {/* Header Btn Start */}
                  <div className="header-btn" style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                    <a href="/login" style={{
                      padding: '10px 24px',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2B4C7E',
                      textDecoration: 'none',
                      border: '2px solid #2B4C7E',
                      borderRadius: '6px',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'transparent'
                    }}>
                      Login
                    </a>
                    {!isMainSite && (
                      <a href={signupUrl} className="btn-default" style={{background: '#2B4C7E', backgroundColor: '#2B4C7E', backgroundImage: 'none', borderColor: '#2B4C7E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <i className="fa-solid fa-arrow-right"></i> {distributor.slug === 'apex' ? 'Get Started' : 'Join My Team'}
                      </a>
                    )}
                  </div>
                  {/* Header Btn End */}
                </div>
                {/* Main Menu End */}
                <div className="navbar-toggle"></div>
              </div>
            </nav>
            <div className="responsive-menu"></div>
          </div>
        </header>
        {/* Header End */}

        {/* Hero Section Start */}
        <div className="hero hero-video dark-section">
          {/* Video Start - USING FLAG VIDEO */}
          <div className="hero-bg-video">
            <video autoPlay muted loop id="herovideo">
              <source src="/videos/flag-waving.mp4" type="video/mp4" />
            </video>
            {/* Dark Blue Overlay for Text Contrast */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(4, 33, 77, 0.7)',
              zIndex: 1
            }}></div>
          </div>
          {/* Video End */}

          <div className="container" style={{position: 'relative', zIndex: 2}}>
            <div className="row align-items-center">
              {/* Left Column - Hero Text */}
              <div className="col-lg-7">
                {/* Hero Content Start */}
                <div className="hero-content">
                  {/* Section Title Start */}
                  <div className="section-title" style={{textAlign: 'left'}}>
                    <span className="section-sub-title wow fadeInUp">
                      {distributor.slug === 'apex'
                        ? 'AI-Powered Technology for Real People'
                        : `Building with ${distributor.first_name} ${distributor.last_name}`
                      }
                    </span>
                    <h1 className="text-anime-style-3" data-cursor="-opaque">
                      Two Paths to Financial Freedom.<br />One Platform That Works.
                    </h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s" style={{color: '#fff', fontSize: '18px', marginTop: '20px', maxWidth: '600px', lineHeight: '1.6'}}>
                      Whether you're helping businesses grow with AI-powered marketing or protecting families with insurance — you're building recurring income doing work that matters.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.15s" style={{color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px', marginTop: '12px', maxWidth: '600px', lineHeight: '1.6'}}>
                      No quotas. No pressure. Just real&nbsp;value for real&nbsp;people.
                    </p>

                    {/* Trust Bar */}
                    <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                      display: 'flex',
                      gap: '20px',
                      marginTop: '30px',
                      flexWrap: 'wrap',
                      maxWidth: '600px'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '15px'}}>
                        <svg style={{width: '20px', height: '20px'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Build Recurring Income
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '15px'}}>
                        <svg style={{width: '20px', height: '20px'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Technology Does the Heavy Lifting
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '15px'}}>
                        <svg style={{width: '20px', height: '20px'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Training & Support Included
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '15px'}}>
                        <svg style={{width: '20px', height: '20px'}} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Work From Anywhere
                      </div>
                    </div>

                  </div>
                  {/* Section Title End */}
                </div>
                {/* Hero Content End */}
              </div>

              {/* Right Column - Two Paths Cards */}
              <div className="col-lg-5">
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                  marginTop: '20px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    color: '#fbbf24',
                    fontSize: '14px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    marginBottom: '20px',
                    textTransform: 'uppercase'
                  }}>
                    Two Paths. One Platform.
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {/* AI Technology Path */}
                    <a href="#products" style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '16px',
                      padding: '24px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.borderColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{fontSize: '48px', flexShrink: 0}}>💻</div>
                        <div style={{flex: 1}}>
                          <h3 style={{
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: '700',
                            marginBottom: '6px'
                          }}>
                            AI Technology Advocate
                          </h3>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '14px',
                            marginBottom: '8px',
                            lineHeight: '1.5'
                          }}>
                            Help businesses compete with Fortune 500 marketing — powered by AI, delivered by you.
                          </p>
                          <div style={{
                            color: '#fbbf24',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            No tech skills needed →
                          </div>
                        </div>
                      </div>
                    </a>

                    {/* Insurance Path */}
                    <a href="#insurance" style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(251, 191, 36, 0.5)',
                      borderRadius: '16px',
                      padding: '24px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.3)';
                      e.currentTarget.style.borderColor = '#fbbf24';
                      e.currentTarget.style.transform = 'translateX(8px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        <div style={{fontSize: '48px', flexShrink: 0, color: '#fbbf24'}}><i className="fa-solid fa-shield-halved"></i></div>
                        <div style={{flex: 1}}>
                          <h3 style={{
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: '700',
                            marginBottom: '6px'
                          }}>
                            Insurance Professional
                          </h3>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '14px',
                            marginBottom: '8px',
                            lineHeight: '1.5'
                          }}>
                            Protect what matters most — families, futures, and legacies with top-tier contracts and real support.
                          </p>
                          <div style={{
                            color: '#fbbf24',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}>
                            We'll help you get licensed →
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Dual CTAs - Moved from left column */}
                  <div className="wow fadeInUp" data-wow-delay="0.4s" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '24px'
                  }}>
                    <a href="#how-it-works" className="btn-default" style={{
                      background: '#ffffff',
                      color: '#2B4C7E',
                      borderColor: '#ffffff',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      textAlign: 'center',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-play-circle"></i> Watch How It Works
                    </a>
                    {!isMainSite && (
                    <a href={signupUrl} className="btn-default" style={{
                      background: 'transparent',
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      border: '2px solid #ffffff',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      textAlign: 'center',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-arrow-right"></i> Join the Movement
                    </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Hero Section End */}

        {/* The Vision Section Start */}
        <div style={{background: '#ffffff', padding: '80px 0'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" style={{color: '#2B4C7E'}}>The Old Model Is Broken</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" style={{color: '#1a2f50', marginBottom: '20px'}}>
                    The American Dream.<br />Ownership.
                  </h2>
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="wow fadeInUp" data-wow-delay="0.2s">
                  <p style={{fontSize: '20px', lineHeight: '1.8', color: '#1f2937', textAlign: 'center', marginBottom: '24px', fontWeight: '500'}}>
                    The traditional 9-5 gave us stability. But it took our time, capped our income, and left us with nothing to show when we stopped working.
                  </p>

                  <p style={{fontSize: '18px', lineHeight: '1.8', color: '#4b5563', textAlign: 'center', marginBottom: '40px'}}>
                    What if you could build something different?
                  </p>

                  <div style={{background: '#f8f9fa', borderRadius: '16px', padding: '48px 40px', marginBottom: '48px'}}>
                    <h3 style={{color: '#2B4C7E', fontSize: '22px', fontWeight: '700', marginBottom: '32px', textAlign: 'center'}}>
                      What if you could:
                    </h3>
                    <div className="row">
                      <div className="col-md-6" style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                          <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                            <svg style={{width: '20px', height: '20px', color: '#ffffff'}} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span style={{fontSize: '17px', color: '#1f2937', lineHeight: '1.6', paddingTop: '6px'}}>Help people solve real problems</span>
                        </div>
                      </div>
                      <div className="col-md-6" style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                          <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                            <svg style={{width: '20px', height: '20px', color: '#ffffff'}} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span style={{fontSize: '17px', color: '#1f2937', lineHeight: '1.6', paddingTop: '6px'}}>Use technology to amplify your impact</span>
                        </div>
                      </div>
                      <div className="col-md-6" style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                          <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                            <svg style={{width: '20px', height: '20px', color: '#ffffff'}} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span style={{fontSize: '17px', color: '#1f2937', lineHeight: '1.6', paddingTop: '6px'}}>Build income that compounds over time</span>
                        </div>
                      </div>
                      <div className="col-md-6" style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                          <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                            <svg style={{width: '20px', height: '20px', color: '#ffffff'}} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span style={{fontSize: '17px', color: '#1f2937', lineHeight: '1.6', paddingTop: '6px'}}>Own your schedule and your future</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Comparison Table */}
                  <div className="row" style={{marginBottom: '40px'}}>
                    <div className="col-md-4" style={{marginBottom: '20px'}}>
                      <div style={{background: '#f8f9fa', borderRadius: '12px', padding: '32px 24px', height: '100%', border: '2px solid #e5e7eb'}}>
                        <h4 style={{fontSize: '18px', fontWeight: '700', color: '#6b7280', marginBottom: '24px', textAlign: 'center'}}>Traditional Job</h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-clock"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Trade time for money</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-chart-line"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Income capped by hours</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-briefcase"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Someone else's business</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px'}}>🔒</span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>No equity, no upside</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4" style={{marginBottom: '20px'}}>
                      <div style={{background: '#f8f9fa', borderRadius: '12px', padding: '32px 24px', height: '100%', border: '2px solid #e5e7eb'}}>
                        <h4 style={{fontSize: '18px', fontWeight: '700', color: '#6b7280', marginBottom: '24px', textAlign: 'center'}}>Gig Economy</h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-clock"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Trade time for money</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-chart-line"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Income capped by hours</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#dc2626'}}><i className="fa-solid fa-car"></i></span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>Work for the platform</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px'}}>🔒</span>
                            <span style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.5'}}>No benefits, no security</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4" style={{marginBottom: '20px'}}>
                      <div style={{background: 'linear-gradient(135deg, #2B4C7E 0%, #1a2c4e 100%)', borderRadius: '12px', padding: '32px 24px', height: '100%', border: '3px solid #2B4C7E', boxShadow: '0 8px 24px rgba(43, 76, 126, 0.25)'}}>
                        <h4 style={{fontSize: '18px', fontWeight: '700', color: '#fbbf24', marginBottom: '24px', textAlign: 'center'}}>Apex Model</h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px'}}>🎯</span>
                            <span style={{fontSize: '15px', color: '#ffffff', lineHeight: '1.5', fontWeight: '600'}}>Build recurring value</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px'}}>📈</span>
                            <span style={{fontSize: '15px', color: '#ffffff', lineHeight: '1.5', fontWeight: '600'}}>Income compounds</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#10b981'}}><i className="fa-solid fa-building"></i></span>
                            <span style={{fontSize: '15px', color: '#ffffff', lineHeight: '1.5', fontWeight: '600'}}>You own your business</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{fontSize: '20px', color: '#fbbf24'}}><i className="fa-solid fa-sparkles"></i></span>
                            <span style={{fontSize: '15px', color: '#ffffff', lineHeight: '1.5', fontWeight: '600'}}>Residual income that lasts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{textAlign: 'center', marginTop: '48px'}}>
                    <p style={{fontSize: '22px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>
                      That's not a dream. That's Apex.
                    </p>
                    <a href="#opportunity" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '16px', padding: '12px 32px', background: '#2B4C7E', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '16px', transition: 'all 0.3s ease'}}>
                      <i className="fa-solid fa-play-circle"></i> See How It Works
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* The Vision Section End */}

        {/* Product Showcase Section Start */}
        <div className="our-pricing" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}} id="products">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">The Apex Product Suite</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Five AI-Powered Platforms.<br />One Marketing Department.<br />Unlimited Growth.</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Choose the tier that fits your business — from entry-level presence to elite omnichannel dominance. All products include AI-generated content, landing pages, and analytics. Pricing available after signup.</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="our-pricing-box wow fadeInUp" data-wow-delay="0.4s">
                  <div className="pricing-tab-item" style={{ display: 'block' }}>
                    <div className="row justify-content-center">

                      {/* PULSEGUARD/PULSEMARKET CARD */}
                      <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                        <div className="pricing-item" style={{border: '3px solid #2B4C7E', height: '100%', borderRadius: '12px'}}>
                          <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px 10px 0 0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>💡 PULSEGUARD</div>
                            <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2f50', marginBottom: '4px'}}>Entry Tier</h3>
                            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>Your digital foundation</p>
                          </div>
                          <div className="pricing-item-content" style={{padding: '24px'}}>
                            <p style={{fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px'}}>
                              Get online without spending hours building it yourself. Perfect for new businesses and part-time entrepreneurs.
                            </p>
                          </div>
                          <div className="pricing-item-list" style={{padding: '0 24px 24px'}}>
                            <ul style={{listStyle: 'none', padding: 0}}>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>3 AI-Generated Landing Pages</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>30 Social Media Posts/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Lead Capture Forms</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Click-to-Call Buttons</span>
                              </li>
                              <li style={{marginBottom: '0', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Analytics Dashboard</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn" style={{padding: '0 24px 24px'}}>
                            {!isMainSite && (
                            <a href={signupUrl} className="btn-default" style={{width: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><i className="fa-solid fa-arrow-right"></i> Learn More</a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PULSEFLOW CARD */}
                      <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                        <div className="pricing-item" style={{border: '3px solid #2B4C7E', height: '100%', borderRadius: '12px'}}>
                          <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px 10px 0 0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>📈 PULSEFLOW</div>
                            <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2f50', marginBottom: '4px'}}>Growth Tier</h3>
                            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>Scale your content engine</p>
                          </div>
                          <div className="pricing-item-content" style={{padding: '24px'}}>
                            <p style={{fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px'}}>
                              Unified marketing automation that replaces multiple disconnected tools. Perfect for growing businesses ready to systemize.
                            </p>
                          </div>
                          <div className="pricing-item-list" style={{padding: '0 24px 24px'}}>
                            <ul style={{listStyle: 'none', padding: 0}}>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>5 AI Landing Pages</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>60 Social Posts/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>4 Email Campaigns/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>2 AI Blog Articles/Month</span>
                              </li>
                              <li style={{marginBottom: '0', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Conversion Tracking</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn" style={{padding: '0 24px 24px'}}>
                            {!isMainSite && (
                            <a href={signupUrl} className="btn-default" style={{width: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><i className="fa-solid fa-arrow-right"></i> Learn More</a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PULSEDRIVE CARD - POPULAR */}
                      <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                        <div className="pricing-item pricing-item-popular" style={{border: '3px solid #2B4C7E', height: '100%', borderRadius: '12px', position: 'relative'}}>
                          <div style={{
                            position: 'absolute', top: '-15px', right: '20px',
                            background: '#2B4C7E', color: '#fff',
                            padding: '5px 20px', borderRadius: '20px',
                            fontWeight: 'bold', fontSize: '12px'
                          }}>MOST POPULAR</div>
                          <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px 10px 0 0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}><i className="fa-solid fa-microphone" style={{marginRight: '8px'}}></i>PULSEDRIVE</div>
                            <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2f50', marginBottom: '4px'}}>Professional Tier</h3>
                            <p style={{fontSize: '14px', color: '#6b7280', marginBottom: '16px'}}>Your podcast. Your voice. Autopilot.</p>
                          </div>
                          <div className="pricing-item-content" style={{padding: '24px'}}>
                            <p style={{fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px'}}>
                              Become the most prolific content creator in your market without recording anything yourself.
                            </p>
                          </div>
                          <div className="pricing-item-list" style={{padding: '0 24px 24px'}}>
                            <ul style={{listStyle: 'none', padding: 0}}>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>10 Landing Pages</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>100 Social Posts/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>8 Email Campaigns/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>4 Podcast Episodes/Month (AI Voice)</span>
                              </li>
                              <li style={{marginBottom: '0', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#2B4C7E', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Video Production + Short-Form Clips</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn" style={{padding: '0 24px 24px'}}>
                            {!isMainSite && (
                            <a href={signupUrl} className="btn-default" style={{width: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><i className="fa-solid fa-arrow-right"></i> Learn More</a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PULSECOMMAND CARD */}
                      <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                        <div className="pricing-item" style={{border: '3px solid #8B5CF6', height: '100%', borderRadius: '12px'}}>
                          <div style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', padding: '20px', borderRadius: '10px 10px 0 0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '8px'}}>👑 PULSECOMMAND</div>
                            <h3 style={{fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '4px'}}>Elite Tier</h3>
                            <p style={{fontSize: '14px', color: '#e0e0e0', marginBottom: '16px'}}>Unlimited. Omnichannel. Elite.</p>
                          </div>
                          <div className="pricing-item-content" style={{padding: '24px'}}>
                            <p style={{fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px'}}>
                              Fortune 500-level marketing operation. Agency builders and top producers run this tier.
                            </p>
                          </div>
                          <div className="pricing-item-list" style={{padding: '0 24px 24px'}}>
                            <ul style={{listStyle: 'none', padding: 0}}>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>UNLIMITED Landing Pages</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>150+ Social Posts/Month</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>AI Avatar Videos (HeyGen)</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Podcast on All Major Platforms</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Custom Domain + YouTube Management</span>
                              </li>
                              <li style={{marginBottom: '0', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#8B5CF6', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>White-Glove Onboarding</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn" style={{padding: '0 24px 24px'}}>
                            {!isMainSite && (
                            <a href={signupUrl} className="btn-default" style={{width: '100%', textAlign: 'center', background: '#8B5CF6', borderColor: '#8B5CF6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><i className="fa-solid fa-arrow-right"></i> Learn More</a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SMARTLOOK XL CARD */}
                      <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                        <div className="pricing-item" style={{border: '3px solid #059669', height: '100%', borderRadius: '12px'}}>
                          <div style={{background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '20px', borderRadius: '10px 10px 0 0'}}>
                            <div style={{fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '8px'}}><i className="fa-solid fa-chart-line" style={{marginRight: '8px'}}></i>SMARTLOOK XL</div>
                            <h3 style={{fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '4px'}}>Smart Office</h3>
                            <p style={{fontSize: '14px', color: '#e0e0e0', marginBottom: '16px'}}>Business intelligence dashboard</p>
                          </div>
                          <div className="pricing-item-content" style={{padding: '24px'}}>
                            <p style={{fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '20px'}}>
                              See every dollar in your business. Real-time KPIs across all carriers and team members.
                            </p>
                          </div>
                          <div className="pricing-item-list" style={{padding: '0 24px 24px'}}>
                            <ul style={{listStyle: 'none', padding: 0}}>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Real-Time KPI Dashboards</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Commission Tracker (All Carriers)</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Revenue Forecasting (90-Day)</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Office Leaderboard + Activity Feed</span>
                              </li>
                              <li style={{marginBottom: '16px', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Role-Based Views</span>
                              </li>
                              <li style={{marginBottom: '0', display: 'flex', alignItems: 'start', gap: '10px', lineHeight: '1.6'}}>
                                <i className="fa-solid fa-check" style={{color: '#059669', marginTop: '4px'}}></i>
                                <span style={{fontSize: '15px'}}>Mobile-Responsive UI</span>
                              </li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn" style={{padding: '0 24px 24px'}}>
                            {!isMainSite && (
                            <a href={signupUrl} className="btn-default" style={{width: '100%', textAlign: 'center', background: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><i className="fa-solid fa-arrow-right"></i> Learn More</a>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* How It Works - Sale Process */}
                  <div className="wow fadeInUp" data-wow-delay="0.2s" style={{marginTop: '60px', background: '#ffffff', borderRadius: '12px', padding: '40px', border: '2px solid #e5e7eb'}} id="how-it-works">
                    <h3 style={{textAlign: 'center', marginBottom: '16px', color: '#2B4C7E', fontSize: '24px', fontWeight: '700'}}>How Does a Sale Work?</h3>
                    <p style={{textAlign: 'center', marginBottom: '40px', color: '#6b7280', fontSize: '16px'}}>Simple. Fast. Done for You.</p>
                    <div className="row">
                      <div className="col-md-3" style={{marginBottom: '20px', textAlign: 'center'}}>
                        <div style={{width: '60px', height: '60px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: '24px', fontWeight: '700'}}>1</div>
                        <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>Client Purchases</h4>
                        <p style={{fontSize: '14px', color: '#6b7280'}}>From your custom website</p>
                      </div>
                      <div className="col-md-3" style={{marginBottom: '20px', textAlign: 'center'}}>
                        <div style={{width: '60px', height: '60px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: '24px', fontWeight: '700'}}>2</div>
                        <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>Schedule Onboarding</h4>
                        <p style={{fontSize: '14px', color: '#6b7280'}}>30-minute needs assessment</p>
                      </div>
                      <div className="col-md-3" style={{marginBottom: '20px', textAlign: 'center'}}>
                        <div style={{width: '60px', height: '60px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: '24px', fontWeight: '700'}}>3</div>
                        <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>We Set Up Channels</h4>
                        <p style={{fontSize: '14px', color: '#6b7280'}}>Social media, content calendar</p>
                      </div>
                      <div className="col-md-3" style={{marginBottom: '20px', textAlign: 'center'}}>
                        <div style={{width: '60px', height: '60px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: '24px', fontWeight: '700'}}>4</div>
                        <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '8px'}}>Delivery Begins</h4>
                        <p style={{fontSize: '14px', color: '#6b7280'}}>Within 10 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Your Journey — 3 Pillars Section End */}

        {/* Business Opportunity Section Start */}
        <div style={{background: 'linear-gradient(135deg, #1a2c4e 0%, #2B4C7E 100%)', padding: '80px 0', color: '#fff'}} id="opportunity">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" style={{color: '#93c5fd'}}>The Apex Opportunity</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" style={{color: '#ffffff'}}>
                    Love the Products?<br />Build a Business With Them.
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s" style={{color: '#e0e7ff', maxWidth: '800px', margin: '0 auto', fontSize: '18px'}}>
                    Apex isn't just software — it's a business model. If you believe in our products, you can earn recurring income sharing them with other business owners.
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works Overview */}
            <div className="row" style={{marginTop: '40px'}}>
              <div className="col-lg-10 mx-auto">
                <div className="wow fadeInUp" style={{background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '48px', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.2)'}}>
                  <h3 style={{color: '#fbbf24', fontSize: '28px', fontWeight: '700', marginBottom: '24px', textAlign: 'center'}}>
                    The Model is Simple
                  </h3>
                  <p style={{color: '#e0e7ff', fontSize: '18px', lineHeight: '1.8', textAlign: 'center', marginBottom: '40px'}}>
                    Help people solve real problems. Build relationships. Earn recurring income as long as they succeed.
                  </p>

                  <div className="row">
                    <div className="col-md-6" style={{marginBottom: '24px'}}>
                      <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '32px', height: '100%'}}>
                        <div style={{fontSize: '48px', marginBottom: '16px', textAlign: 'center'}}>💻</div>
                        <h4 style={{color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '16px', textAlign: 'center'}}>
                          AI Technology Path
                        </h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>1.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Connect with business owners</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>2.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Show them AI-powered solutions</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>3.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>They see results and stay subscribed</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>4.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>You earn recurring income</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6" style={{marginBottom: '24px'}}>
                      <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '32px', height: '100%'}}>
                        <div style={{fontSize: '48px', marginBottom: '16px', textAlign: 'center', color: '#2B4C7E'}}><i className="fa-solid fa-shield-halved"></i></div>
                        <h4 style={{color: '#ffffff', fontSize: '20px', fontWeight: '700', marginBottom: '16px', textAlign: 'center'}}>
                          Insurance Path
                        </h4>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>1.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Get licensed (we'll help)</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>2.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Help families make smart decisions</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>3.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Build trust as their advisor</span>
                          </div>
                          <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                            <span style={{color: '#fbbf24', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>4.</span>
                            <span style={{color: '#e0e7ff', fontSize: '15px', lineHeight: '1.6'}}>Earn residual income for years</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{background: 'rgba(251, 191, 36, 0.2)', border: '2px solid #fbbf24', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '32px'}}>
                    <p style={{fontSize: '18px', color: '#ffffff', lineHeight: '1.6', marginBottom: '8px'}}>
                      <strong style={{color: '#fbbf24'}}>Can you do both?</strong> Yes. Many Apex members combine AI technology and insurance to serve the same clients with multiple solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>


            {/* CTA */}
            <div className="row" style={{marginTop: '50px'}}>
              <div className="col-lg-12 text-center">
                <div className="wow fadeInUp" data-wow-delay="0.4s">
                  {!isMainSite && (
                  <a href={signupUrl} className="btn-default" style={{
                    background: '#fbbf24',
                    color: '#1a2c4e',
                    borderColor: '#fbbf24',
                    padding: '16px 48px',
                    fontSize: '18px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <i className="fa-solid fa-arrow-right"></i> Join the Movement
                  </a>
                  )}
                  <p style={{marginTop: '16px', color: '#e0e7ff', fontSize: '15px'}}>
                    Choose your path. Get&nbsp;trained. Start&nbsp;building.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Business Opportunity Section End */}

        {/* How It Works Section Start */}
        <div style={{background: '#ffffff', padding: '80px 0'}} id="how-it-works">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" style={{color: '#2B4C7E'}}>The System Behind the Success</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" style={{color: '#1a2f50'}}>
                    You Focus on People.<br />Technology Handles the Rest.
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s" style={{color: '#475569', maxWidth: '800px', margin: '0 auto', fontSize: '18px', lineHeight: '1.7'}}>
                    Whether you choose AI Technology or Insurance (or both), the model is the same: help people, build relationships, and let the system create recurring income.
                  </p>
                </div>
              </div>
            </div>

            <div className="row" style={{marginTop: '60px'}}>
              {/* AI Technology Path */}
              <div className="col-lg-6" style={{marginBottom: '40px'}}>
                <div className="wow fadeInUp" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '16px',
                  padding: '48px',
                  height: '100%'
                }}>
                  <div style={{fontSize: '56px', marginBottom: '24px', textAlign: 'center'}}>💻</div>
                  <h3 style={{fontSize: '28px', fontWeight: '700', color: '#1a2c4e', marginBottom: '32px', textAlign: 'center'}}>
                    For AI Technology Advocates
                  </h3>

                  {/* Step 1 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>1</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Connect</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>🤝 Talk to Business Owners</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Find local businesses (coffee shops, salons, gyms, contractors)</li>
                        <li>Ask: "How do you handle your marketing right now?"</li>
                        <li>Most will say: "I post when I have time" or "I don't really do marketing"</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>2</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Show</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>📱 Demo What's Possible</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Show examples of AI-generated content</li>
                        <li>Walk through a sample campaign</li>
                        <li>Let them see what automation looks like</li>
                        <li>"What if all of this ran on autopilot?"</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>3</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Setup</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}><i className="fa-solid fa-gear"></i> We Handle the Tech</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Customer signs up through your link</li>
                        <li>Our team handles onboarding and setup</li>
                        <li>AI starts generating content within 10 days</li>
                        <li>Customer gets trained on the dashboard</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>4</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Succeed Together</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#2B4C7E', marginBottom: '8px'}}>📈 They Grow. You Earn.</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Customer sees more leads, more visibility</li>
                        <li>They stay subscribed because it works</li>
                        <li>You earn monthly recurring income</li>
                        <li>You stay in touch and support their growth</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Path */}
              <div className="col-lg-6" style={{marginBottom: '40px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '3px solid #fbbf24',
                  borderRadius: '16px',
                  padding: '48px',
                  height: '100%'
                }}>
                  <div style={{fontSize: '56px', marginBottom: '24px', textAlign: 'center', color: '#92400e'}}><i className="fa-solid fa-shield-halved"></i></div>
                  <h3 style={{fontSize: '28px', fontWeight: '700', color: '#1a2c4e', marginBottom: '32px', textAlign: 'center'}}>
                    For Insurance Professionals
                  </h3>

                  {/* Step 1 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2c4e', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>1</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Get Licensed</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px'}}>📚 Complete Licensing (If Needed)</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Take pre-licensing course (online, self-paced)</li>
                        <li>Pass state exam (we provide study materials)</li>
                        <li>Get appointed with top carriers</li>
                        <li>Timeline: 2–4 weeks</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2c4e', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>2</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Learn the Products</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px'}}><i className="fa-solid fa-graduation-cap" style={{marginRight: '8px'}}></i>Product Training</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Life insurance (term, whole, final expense)</li>
                        <li>Annuities and retirement planning</li>
                        <li>Ancillary products (hospital, accident, critical illness)</li>
                        <li>Ongoing training and certification</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{marginBottom: '32px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2c4e', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>3</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Build Relationships</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px'}}>👨‍👩‍👧‍👦 Help Families Make Decisions</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Meet with families (in-person, phone, or Zoom)</li>
                        <li>Listen to their concerns and goals</li>
                        <li>Present options without pressure</li>
                        <li>Help them choose the right coverage</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                      <div style={{width: '40px', height: '40px', background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2c4e', fontSize: '18px', fontWeight: '700', flexShrink: 0}}>4</div>
                      <h4 style={{fontSize: '20px', fontWeight: '700', color: '#1a2c4e', margin: 0}}>Earn Residually</h4>
                    </div>
                    <div style={{marginLeft: '52px'}}>
                      <p style={{fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px'}}><i className="fa-solid fa-dollar-sign" style={{marginRight: '8px'}}></i>Build Long-Term Income</p>
                      <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '20px', marginBottom: 0}}>
                        <li>Earn on new policies</li>
                        <li>Earn renewals as policies stay in force</li>
                        <li>Get referrals from happy clients</li>
                        <li>Build a book of business that pays for years</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Can You Do Both? */}
            <div className="row" style={{marginTop: '40px'}}>
              <div className="col-lg-10 mx-auto">
                <div className="wow fadeInUp" data-wow-delay="0.3s" style={{
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  border: '3px solid #8B5CF6',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center'
                }}>
                  <h3 style={{fontSize: '28px', fontWeight: '700', color: '#1a2c4e', marginBottom: '20px'}}>
                    Can You Do Both?
                  </h3>
                  <div style={{fontSize: '20px', fontWeight: '600', color: '#8B5CF6', marginBottom: '16px'}}>
                    <i className="fa-solid fa-circle-check" style={{color: '#10b981', marginRight: '8px'}}></i> Yes. Many Apex members do both&nbsp;paths.
                  </div>
                  <p style={{fontSize: '17px', color: '#475569', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto'}}>
                    <strong>Example:</strong> You help a business owner with AI marketing. They trust you. Later, you help them with life insurance and retirement planning.
                  </p>
                  <p style={{fontSize: '18px', color: '#1a2c4e', fontWeight: '600', marginTop: '16px', marginBottom: 0}}>
                    Two income streams. One relationship.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* How It Works Section End */}

        {/* The Apex Difference Section Start */}
        <div style={{background: 'linear-gradient(135deg, #1a2c4e 0%, #2B4C7E 100%)', padding: '80px 0', color: '#fff'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" style={{color: '#93c5fd'}}>Why Apex Works</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque" style={{color: '#ffffff'}}>
                    This Isn't Another "Side Hustle."<br />It's a Real Business Model.
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s" style={{color: '#e0e7ff', maxWidth: '900px', margin: '0 auto 60px auto', fontSize: '18px', lineHeight: '1.7'}}>
                    We're not here to hype you up with income claims and fake promises. We're here to give you the tools, training, and support to build something that lasts. Here's what makes Apex different:
                  </p>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Card 1: Recurring Income */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#059669'}}><i className="fa-solid fa-dollar-sign"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    Recurring Income
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    Your Work Compounds
                  </p>
                  <p style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0}}>
                    Traditional sales: You sell once, earn once, start over. Apex model: You help once, earn monthly as long as they succeed. One customer can pay you for years.
                  </p>
                </div>
              </div>

              {/* Card 2: Real Value */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.1s" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#fbbf24'}}><i className="fa-solid fa-sparkles"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    Real Value
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    You're Solving Actual Problems
                  </p>
                  <p style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0}}>
                    You're not selling hype. You're bringing solutions that work: Businesses get marketing that drives real results. Families get financial protection and peace of mind. When you deliver value, customers stay. And you earn.
                  </p>
                </div>
              </div>

              {/* Card 3: Technology Advantage */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#059669'}}><i className="fa-solid fa-robot"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    Technology Advantage
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    AI Does the Heavy Lifting
                  </p>
                  <p style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0}}>
                    You don't need to be a marketer, a designer, or a tech expert. AI generates the content. AI builds the campaigns. AI handles the automation. Your job: Be the human connection.
                  </p>
                </div>
              </div>

              {/* Card 4: Dual Opportunity */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.3s" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#059669'}}><i className="fa-solid fa-road"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    Dual Opportunity
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    Two Paths, One Platform
                  </p>
                  <p style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0}}>
                    Choose one path. Or do both. Start with AI. Add insurance later. The flexibility is yours. Most platforms lock you into one income stream. Apex gives you options.
                  </p>
                </div>
              </div>

              {/* Card 5: Training & Support */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.4s" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#059669'}}><i className="fa-solid fa-graduation-cap"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    Training & Support
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    You're Not Alone
                  </p>
                  <ul style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0, paddingLeft: '20px'}}>
                    <li>Live training events every week</li>
                    <li>Online courses and product certifications</li>
                    <li>Mentorship from experienced leaders</li>
                    <li>Back-office tools and marketing materials</li>
                    <li>Community of people building together</li>
                  </ul>
                </div>
              </div>

              {/* Card 6: No Inventory */}
              <div className="col-lg-4 col-md-6" style={{marginBottom: '30px'}}>
                <div className="wow fadeInUp" data-wow-delay="0.5s" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '40px',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '20px', textAlign: 'center', color: '#059669'}}><i className="fa-solid fa-box"></i></div>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#fbbf24', marginBottom: '16px', textAlign: 'center'}}>
                    No Inventory. No Overhead.
                  </h3>
                  <p style={{fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px'}}>
                    Low Risk, High Upside
                  </p>
                  <ul style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginBottom: 0, paddingLeft: '20px'}}>
                    <li>No products to stock</li>
                    <li>No office to rent</li>
                    <li>No employees to manage</li>
                    <li>Work from home, coffee shop, anywhere</li>
                  </ul>
                  <p style={{fontSize: '15px', color: '#e0e7ff', lineHeight: '1.7', marginTop: '12px', marginBottom: 0, fontWeight: '600'}}>
                    This is a business you can run from your phone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* The Apex Difference Section End */}

        {/* Who This Is For Section Start */}
        <div style={{background: '#ffffff', padding: '80px 0'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <h2 className="text-anime-style-3" data-cursor="-opaque" style={{color: '#1a2f50', marginBottom: '24px'}}>
                    Is Apex Right for You?
                  </h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s" style={{color: '#475569', maxWidth: '700px', margin: '0 auto 60px auto', fontSize: '18px', lineHeight: '1.7'}}>
                    Apex isn't for everyone. And that's okay. Here's who tends to thrive in our community:
                  </p>
                </div>
              </div>
            </div>

            {/* Ideal Member Profiles */}
            <div className="row" style={{marginBottom: '60px'}}>
              <div className="col-lg-10 mx-auto">

                {/* Profile 1 */}
                <div className="wow fadeInUp" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                    <div style={{fontSize: '36px', flexShrink: 0, color: '#10b981'}}><i className="fa-solid fa-circle-check"></i></div>
                    <div>
                      <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                        Parents Who Want Flexibility
                      </h3>
                      <p style={{fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: 0}}>
                        You want to be present for your kids — but also earn real income. Apex lets you work around your life, not the other way around.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile 2 */}
                <div className="wow fadeInUp" data-wow-delay="0.1s" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                    <div style={{fontSize: '36px', flexShrink: 0, color: '#10b981'}}><i className="fa-solid fa-circle-check"></i></div>
                    <div>
                      <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                        Entrepreneurs Who See the AI Revolution
                      </h3>
                      <p style={{fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: 0}}>
                        You know AI is changing everything. You want to ride the wave, not get left behind. Apex puts you on the cutting edge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile 3 */}
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                    <div style={{fontSize: '36px', flexShrink: 0, color: '#10b981'}}><i className="fa-solid fa-circle-check"></i></div>
                    <div>
                      <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                        Insurance Agents Looking for Better Contracts
                      </h3>
                      <p style={{fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: 0}}>
                        Tired of captive contracts and low commissions? Apex offers top-tier contracts, better support, and dual income paths.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile 4 */}
                <div className="wow fadeInUp" data-wow-delay="0.3s" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                    <div style={{fontSize: '36px', flexShrink: 0, color: '#10b981'}}><i className="fa-solid fa-circle-check"></i></div>
                    <div>
                      <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                        People Tired of Trading Time for Money
                      </h3>
                      <p style={{fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: 0}}>
                        You're done with hourly wages and salary caps. You want income that compounds — where your work today pays you for years.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile 5 */}
                <div className="wow fadeInUp" data-wow-delay="0.4s" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '3px solid #2B4C7E',
                  borderRadius: '12px',
                  padding: '32px',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'start', gap: '16px'}}>
                    <div style={{fontSize: '36px', flexShrink: 0, color: '#10b981'}}><i className="fa-solid fa-circle-check"></i></div>
                    <div>
                      <h3 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                        Anyone Who Wants to Build Something That Lasts
                      </h3>
                      <p style={{fontSize: '16px', color: '#475569', lineHeight: '1.7', marginBottom: 0}}>
                        You're not looking for quick cash or a "side hustle." You want to build a real business with residual income.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Not Right For */}
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="wow fadeInUp" data-wow-delay="0.5s" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                  border: '3px solid #dc2626',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center'
                }}>
                  <h3 style={{fontSize: '24px', fontWeight: '700', color: '#1a2c4e', marginBottom: '24px'}}>
                    Not Right For:
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', maxWidth: '600px', margin: '0 auto 20px auto'}}>
                    <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                      <span style={{fontSize: '20px', flexShrink: 0, color: '#dc2626'}}><i className="fa-solid fa-circle-xmark"></i></span>
                      <span style={{fontSize: '16px', color: '#475569', lineHeight: '1.7'}}>People looking to "get rich quick"</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                      <span style={{fontSize: '20px', flexShrink: 0, color: '#dc2626'}}><i className="fa-solid fa-circle-xmark"></i></span>
                      <span style={{fontSize: '16px', color: '#475569', lineHeight: '1.7'}}>People who won't help others succeed</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                      <span style={{fontSize: '20px', flexShrink: 0, color: '#dc2626'}}><i className="fa-solid fa-circle-xmark"></i></span>
                      <span style={{fontSize: '16px', color: '#475569', lineHeight: '1.7'}}>People who expect passive income without any work</span>
                    </div>
                    <div style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                      <span style={{fontSize: '20px', flexShrink: 0, color: '#dc2626'}}><i className="fa-solid fa-circle-xmark"></i></span>
                      <span style={{fontSize: '16px', color: '#475569', lineHeight: '1.7'}}>People who don't believe in the value we deliver</span>
                    </div>
                  </div>
                  <p style={{fontSize: '17px', color: '#1a2c4e', fontWeight: '600', marginBottom: 0}}>
                    This takes effort. But it's effort that compounds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Who This Is For Section End */}

        {/* Insurance Section Start */}
        <div style={{background: '#ffffff', padding: '80px 0'}} id="insurance">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="wow fadeInUp">
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #2B4C7E 0%, #4a6fa5 100%)',
                    color: '#fff',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    🏆 FOR LICENSED INSURANCE AGENTS
                  </span>
                  <h2 style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    color: '#1a2c4e',
                    marginBottom: '16px',
                    lineHeight: '1.2'
                  }}>
                    Apex Offers a Dual Career Path
                  </h2>
                  <p style={{
                    fontSize: '18px',
                    color: '#475569',
                    maxWidth: '800px',
                    margin: '0 auto 50px auto',
                    lineHeight: '1.7'
                  }}>
                    Already licensed? Want to get licensed? Apex gives you the best of both worlds — sell cutting-edge technology products AND build an insurance career with top-tier contracts and carrier appointments.
                  </p>
                </div>
              </div>
            </div>

            {/* Two Column Layout - Benefits & Products */}
            <div className="row" style={{marginBottom: '60px'}}>
              {/* Left Column - Benefits */}
              <div className="col-lg-6">
                <div className="wow fadeInUp" style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '2px solid #2B4C7E',
                  borderRadius: '16px',
                  padding: '40px',
                  height: '100%'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a2c4e',
                    marginBottom: '30px'
                  }}>
                    What You Get as a Licensed Agent
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    {[
                      'Top-Tier Commission Contracts',
                      'Multiple Carrier Appointments',
                      'Team Building & Residual Income',
                      'Advanced CRM & Automation Tools',
                      'Weekly Training & Mentorship',
                      '100% Book of Business Ownership'
                    ].map((benefit, index) => (
                      <div key={index} style={{display: 'flex', alignItems: 'start', gap: '12px'}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{flexShrink: 0, marginTop: '2px'}}>
                          <circle cx="12" cy="12" r="10" fill="#059669" />
                          <path d="M8 12.5l2.5 2.5L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{fontSize: '16px', color: '#1e293b', fontWeight: '500'}}>
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Products */}
              <div className="col-lg-6">
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '2px solid #fbbf24',
                  borderRadius: '16px',
                  padding: '40px',
                  height: '100%'
                }}>
                  <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a2c4e',
                    marginBottom: '30px'
                  }}>
                    Insurance Products You Can Offer
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {[
                      {
                        category: 'Life Insurance',
                        products: 'Term, Whole, IUL, Final Expense'
                      },
                      {
                        category: 'Annuities',
                        products: 'Fixed, Indexed, Retirement Income'
                      },
                      {
                        category: 'Ancillary Protection',
                        products: 'Telemedicine, ID Theft, Legal Plans, Roadside Assistance'
                      }
                    ].map((item, index) => (
                      <div key={index}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1a2c4e',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            width: '32px',
                            height: '32px',
                            background: '#2B4C7E',
                            color: '#fff',
                            borderRadius: '50%',
                            fontSize: '16px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {index + 1}
                          </span>
                          {item.category}
                        </div>
                        <div style={{
                          fontSize: '15px',
                          color: '#475569',
                          marginLeft: '40px',
                          lineHeight: '1.6'
                        }}>
                          {item.products}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Ladder Explanation */}
            <div className="row">
              <div className="col-lg-12">
                <div className="wow fadeInUp" data-wow-delay="0.3s" style={{
                  background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                  border: '2px solid #8B5CF6',
                  borderRadius: '16px',
                  padding: '50px',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#1a2c4e',
                    marginBottom: '24px'
                  }}>
                    The Dual-Ladder Advantage
                  </h3>
                  <p style={{
                    fontSize: '18px',
                    color: '#475569',
                    maxWidth: '900px',
                    margin: '0 auto 40px auto',
                    lineHeight: '1.7'
                  }}>
                    Apex is unique. You can climb our <strong>Technology Ladder</strong> by selling AI-powered marketing products to any business owner — <em>no license required</em>. If you're licensed (or become licensed), you also climb the <strong>Insurance Ladder</strong>, unlocking greater earning potential, carrier relationships, and advanced training.
                  </p>

                  <div className="row" style={{maxWidth: '900px', margin: '0 auto'}}>
                    <div className="col-md-6" style={{marginBottom: '20px'}}>
                      <div style={{
                        background: 'rgba(43, 76, 126, 0.1)',
                        borderRadius: '12px',
                        padding: '30px',
                        height: '100%'
                      }}>
                        <div style={{fontSize: '40px', marginBottom: '12px'}}>💻</div>
                        <h4 style={{fontSize: '22px', fontWeight: '700', color: '#2B4C7E', marginBottom: '12px'}}>
                          Technology Ladder
                        </h4>
                        <p style={{fontSize: '15px', color: '#475569', margin: 0}}>
                          Starter → Builder → Leader → Director → Elite
                        </p>
                        <p style={{fontSize: '14px', color: '#64748b', marginTop: '8px', marginBottom: 0}}>
                          No license needed. Sell software, build teams, earn overrides.
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6" style={{marginBottom: '20px'}}>
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.15)',
                        borderRadius: '12px',
                        padding: '30px',
                        height: '100%'
                      }}>
                        <div style={{fontSize: '40px', marginBottom: '12px', color: '#8B5CF6'}}><i className="fa-solid fa-shield-halved"></i></div>
                        <h4 style={{fontSize: '22px', fontWeight: '700', color: '#1a2c4e', marginBottom: '12px'}}>
                          Insurance Ladder
                        </h4>
                        <p style={{fontSize: '15px', color: '#475569', margin: 0}}>
                          Associate → Senior → Regional → National Director
                        </p>
                        <p style={{fontSize: '14px', color: '#64748b', marginTop: '8px', marginBottom: 0}}>
                          License required. Advanced contracts, carrier relationships, leadership opportunities.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{marginTop: '40px'}}>
                    {!isMainSite && (
                    <a href={signupUrl} className="btn-default" style={{
                      background: '#8B5CF6',
                      color: '#fff',
                      borderColor: '#8B5CF6',
                      padding: '16px 48px',
                      fontSize: '18px',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                      marginRight: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-user-tie"></i> {distributor.slug === 'apex' ? 'Join as Licensed Agent' : `Join ${distributor.first_name}'s Agency`}
                    </a>
                    )}
                    <a href="#products" className="btn-default" style={{
                      background: 'transparent',
                      color: '#2B4C7E',
                      borderColor: '#2B4C7E',
                      padding: '16px 48px',
                      fontSize: '18px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-box"></i> View All Products
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Insurance Section End */}

        {/* Our Services Section Start */}
        <div className="our-process">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="services">What We Offer</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">The Tools That Help You Serve Better</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">At Apex, we believe a well-equipped agent is a better agent — and a better agent means better-protected clients and stronger communities. Everything we provide is designed to help you serve at a higher level.</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="process-steps-item-list">

                  <div className="process-step-item box-1 wow fadeInUp">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>01.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-1.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>AI-Powered Tools & CRM</h3>
                      <p>Technology that works as hard as you do — automating follow-ups, managing your pipeline, and keeping you focused on what matters most: your clients.</p>
                      <ul>
                        <li>Smart lead management and automated nurturing</li>
                        <li>Your own replicated website from day one</li>
                      </ul>
                    </div>
                  </div>

                  <div className="process-step-item box-2 wow fadeInUp" data-wow-delay="0.2s">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>02.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-2.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>Training, Mentorship & Community</h3>
                      <p>You're never figuring it out alone. From our AI-powered sales training podcast to live calls and 1-on-1 mentorship, Apex keeps you sharp and supported.</p>
                      <ul>
                        <li>Weekly live training calls and sales coaching</li>
                        <li>A peer community that lifts every member up</li>
                      </ul>
                    </div>
                  </div>

                  <div className="process-step-item box-3 wow fadeInUp" data-wow-delay="0.4s">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>03.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-3.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>Carrier Access & Top-Tier Contracts</h3>
                      <p>Sell the industry's best life insurance, annuity, and ancillary products through appointments with top-rated carriers — and keep 100% ownership of every client you serve.</p>
                      <ul>
                        <li>Multiple carrier appointments across all major product lines</li>
                        <li>100% book of business ownership — always yours, always</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Our Services Section End */}


        {/* Product Portfolio Section Start */}
        <div style={{background: '#f0f5ff', padding: '80px 0'}} id="products">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">What You Can Offer Your Clients</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">World-Class Products. Real Client Solutions.</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Every Apex agent is appointed to offer life insurance, annuity, and ancillary protection products — so you always have the right solution for every client at every stage of life.</p>
                </div>
              </div>
            </div>
            <div className="row justify-content-center wow fadeInUp" data-wow-delay="0.3s">
              {[
                {
                  icon: 'fa-heart-pulse',
                  title: 'Life Insurance',
                  desc: 'Protect what matters most.',
                  items: ['Term Life Insurance', 'Whole Life Insurance', 'Indexed Universal Life (IUL)', 'Final Expense Coverage'],
                },
                {
                  icon: 'fa-piggy-bank',
                  title: 'Annuities',
                  desc: 'Secure retirement income strategies.',
                  items: ['Fixed Annuities', 'Indexed Annuities', 'Retirement Income Planning', 'Wealth Accumulation'],
                },
                {
                  icon: 'fa-briefcase-medical',
                  title: 'Ancillary Protection',
                  desc: 'Essential everyday protection products.',
                  items: ['Telemedicine Access', 'ID Theft Protection', 'Legal Services Plan', 'Roadside Assistance'],
                },
              ].map((cat, i) => (
                <div key={i} className="col-lg-3 col-md-6" style={{marginBottom: '24px'}}>
                  <div style={{background: '#fff', border: '2px solid #dbeafe', borderRadius: '14px', padding: '28px 22px', height: '100%', textAlign: 'center'}}>
                    <div style={{width: '56px', height: '56px', background: '#2B4C7E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', margin: '0 auto 16px'}}>
                      <i className={`fa-solid ${cat.icon}`} style={{fontSize: '24px', color: '#fff'}}></i>
                    </div>
                    <h4 style={{fontSize: '18px', fontWeight: 800, color: '#1a2f50', marginBottom: '4px'}}>{cat.title}</h4>
                    <p style={{fontSize: '13px', color: '#2B4C7E', fontWeight: 600, marginBottom: '14px'}}>{cat.desc}</p>
                    <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                      {cat.items.map((item, j) => (
                        <li key={j} style={{fontSize: '14px', color: '#4b5563', lineHeight: '1.8'}}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="row">
              <div className="col-12 text-center wow fadeInUp" style={{marginTop: '16px'}}>
                <p style={{fontSize: '15px', color: '#4b5563', fontStyle: 'italic'}}>
                  Multiple carrier appointments mean you always have a competitive option — never stuck with one solution.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Product Portfolio Section End */}

        {/* Mission / Community Impact Section Start */}
        <div className="our-expert-solution">
          <div className="our-expert-solution-box dark-section" style={{padding: '80px 0'}}>
            <div className="container">
              <div className="row section-row" style={{marginBottom: 0}}>
                <div className="col-lg-12">
                  <div className="section-title section-title-center" style={{marginBottom: 0}}>
                    <span className="section-sub-title wow fadeInUp">Why It Matters</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">Better Agents. Better Service. Stronger Communities.</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s" style={{maxWidth: '800px', margin: '0 auto'}}>
                      When agents are properly equipped, trained, and supported — they show up differently for their clients. They close coverage gaps that could devastate families. They build trust that lasts decades. They become pillars in their communities. That's the real mission behind everything Apex Affinity Group does. We invest in you so you can invest in the people who need you most.
                    </p>
                    <div className="wow fadeInUp" data-wow-delay="0.4s" style={{marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
                      {!isMainSite && (
                      <a href={signupUrl} className="btn-default" style={{background: '#ffffff', color: '#2B4C7E', borderColor: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                        <i className="fa-solid fa-arrow-right"></i> {distributor.slug === 'apex' ? 'Get Started' : 'Join the Mission'}
                      </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mission / Community Impact Section End */}

        {/* Our Faqs Section Start */}
        <div className="our-faqs">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="faq">Frequently Asked Questions</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Real Answers. No Runaround.</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We believe transparency builds trust. Here are honest answers to the questions we hear most from people exploring the Apex opportunity.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-xl-12">
                {/* FAQ Accordion Start */}
                <div className="faq-accordion" id="accordion">
                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp">
                    <h2 className="accordion-header" id="heading1">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                        Q1. What exactly is Apex Affinity Group?
                      </button>
                    </h2>
                    <div id="collapse1" className="accordion-collapse collapse" role="region" aria-labelledby="heading1" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Apex Affinity Group is a technology company that provides AI-powered marketing and business intelligence software for business owners across all industries — with specialized tools for insurance professionals. Our products (PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook XL) deliver AI-generated content, landing pages, social media automation, podcast production, and business analytics. We sell through a direct sales distribution model, meaning you can either buy our software as a customer OR join as a distributor to earn recurring commissions sharing it with others.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.2s">
                    <h2 className="accordion-header" id="heading2">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                        Q2. Who are your products for?
                      </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse" role="region" aria-labelledby="heading2" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Any business owner who needs marketing automation — insurance agents, financial advisors, real estate professionals, coaches, consultants, small business owners, and entrepreneurs. If you need a website, social media presence, lead generation, or content marketing, Apex replaces multiple disconnected tools with one AI-powered platform. Our products deliver actual marketing results that help businesses grow.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.4s">
                    <h2 className="accordion-header" id="heading3">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                        Q3. Can I just buy the products, or do I have to join as a distributor?
                      </button>
                    </h2>
                    <div id="collapse3" className="accordion-collapse collapse show" role="region" aria-labelledby="heading3" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>You can absolutely purchase any Apex product as a retail customer without joining the business opportunity. However, joining as a distributor gives you two major benefits: (1) Access to member pricing on all products, and (2) The ability to earn recurring income by sharing these products with other business owners. There's $0 cost to join, no monthly fees, and no obligations. Many people join for the member pricing and later decide to build it as a business.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.6s">
                    <h2 className="accordion-header" id="heading4">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                        Q4. How does the Apex business model work?
                      </button>
                    </h2>
                    <div id="collapse4" className="accordion-collapse collapse" role="region" aria-labelledby="heading4" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>The Apex model is simple: help people solve real problems, and earn recurring income as long as they succeed. You can choose one or both paths: (1) AI Technology - help businesses get enterprise-level marketing automation, or (2) Insurance - help families protect their financial future. When your customers see value and stay subscribed, you earn monthly recurring income. You can also build a team and earn on their success. No license required to sell our technology products. Full compensation details are available in your back office after signup.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.8s">
                    <h2 className="accordion-header" id="heading5">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                        Q5. What about insurance? Do I need a license?
                      </button>
                    </h2>
                    <div id="collapse5" className="accordion-collapse collapse" role="region" aria-labelledby="heading5" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>No license required to join Apex or sell our technology products (PulseGuard, PulseFlow, PulseDrive, PulseCommand, SmartLook XL). That said, Apex offers a dual-ladder compensation plan. The Tech Ladder is for everyone (licensed or not) selling our software products. The Insurance Ladder is optional for licensed agents who also want to sell life insurance, annuities, and ancillary products through Apex's carrier partnerships. You can do technology only, technology + insurance, or start with technology and add insurance later when/if you choose to get licensed. Apex provides guidance and support for licensing if you decide to pursue it.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="1s">
                    <h2 className="accordion-header" id="heading6">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6" aria-expanded="false" aria-controls="collapse6">
                        Q6. Is there a cost to join as a distributor?
                      </button>
                    </h2>
                    <div id="collapse6" className="accordion-collapse collapse" role="region" aria-labelledby="heading6" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>$0 to join. No monthly fees. No minimum production requirements. An optional Business Center gives you advanced back-office tools, but it's not required to join or earn. Many distributors start with just the products they use personally (at member pricing), then build from there. You control your schedule, your growth, and your business. Start part-time, full-time, or anywhere in between.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}
                </div>
                {/* FAQ Accordion End */}
              </div>

            </div>
          </div>
        </div>
        {/* Our Faqs Section End */}

        {/* Your Agent Contact Section Start */}
        {distributor.slug !== 'apex' && (
          <div className="contact-agent-section" style={{background: '#f8f9fa', padding: '60px 0'}}>
            <div className="container">
              <div className="row section-row">
                <div className="col-lg-12">
                  <div className="section-title section-title-center">
                    <span className="section-sub-title wow fadeInUp">Your Agent</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">
                      {distributor.first_name} {distributor.last_name}
                    </h2>
                    {distributor.company_name && (
                      <p className="wow fadeInUp" data-wow-delay="0.1s" style={{fontSize: '18px', fontWeight: 600, color: '#2B4C7E'}}>
                        {distributor.company_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-lg-8 col-xl-6">
                  <div className="wow fadeInUp" data-wow-delay="0.2s">
                    {distributor.profile_photo_url ? (
                      /* Show photo if available */
                      <div style={{textAlign: 'center', marginBottom: '30px'}}>
                        <img
                          src={distributor.profile_photo_url}
                          alt={`${distributor.first_name} ${distributor.last_name}`}
                          style={{
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '4px solid #2B4C7E',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                      </div>
                    ) : null}

                    {/* Contact Box */}
                    <div style={{
                      background: '#ffffff',
                      border: '2px solid #dbeafe',
                      borderRadius: '12px',
                      padding: '32px',
                      textAlign: 'center'
                    }}>
                      {distributor.bio && (
                        <p style={{fontSize: '16px', color: '#4b5563', lineHeight: '1.8', marginBottom: '24px'}}>
                          {distributor.bio}
                        </p>
                      )}

                      <div style={{display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center'}}>
                        {/* Email */}
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#2B4C7E',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="fa-solid fa-envelope" style={{color: '#fff', fontSize: '18px'}}></i>
                          </div>
                          <a
                            href={`mailto:${distributor.email}`}
                            style={{fontSize: '16px', color: '#2B4C7E', fontWeight: 600, textDecoration: 'none'}}
                          >
                            {distributor.email}
                          </a>
                        </div>

                        {/* Phone */}
                        {distributor.phone && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: '#2B4C7E',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="fa-solid fa-phone" style={{color: '#fff', fontSize: '18px'}}></i>
                            </div>
                            <a
                              href={`tel:${distributor.phone}`}
                              style={{fontSize: '16px', color: '#2B4C7E', fontWeight: 600, textDecoration: 'none'}}
                            >
                              {formatPhoneForDisplay(distributor.phone)}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div style={{marginTop: '32px'}}>
                        {!isMainSite && (
                        <a href={signupUrl} className="btn-default" style={{background: '#2B4C7E', borderColor: '#2B4C7E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                          <i className="fa-solid fa-user-plus"></i> Join {distributor.first_name}'s Team
                        </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Your Agent Contact Section End */}

        {/* Commission Disclosure Section */}
        <div style={{background: '#f8f9fa', padding: '40px 0', borderTop: '1px solid #e5e7eb'}}>
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div style={{maxWidth: '900px', margin: '0 auto', fontSize: '13px', color: '#6b7280', lineHeight: '1.8'}}>
                  <p style={{fontWeight: '600', color: '#1a2c4e', marginBottom: '12px'}}>* Commission Disclosure:</p>
                  <p style={{marginBottom: '8px'}}>
                    Commission amounts shown are based on Business Volume (BV) and represent estimated earnings for illustrative purposes only. Actual commissions are calculated using a BV-based compensation structure and may vary based on product mix, member vs. retail pricing, rank qualifications, and individual performance.
                  </p>
                  <p style={{marginBottom: 0}}>
                    The commission structure includes multiple components: direct commissions, override commissions, fast start bonuses, volume kickers, and other performance-based incentives. Total earnings depend on personal sales volume, team performance, rank advancement, and eligibility for various bonus programs. See the full Compensation Plan for complete details. Past performance and income examples do not guarantee future results. Individual results will vary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Commission Disclosure Section End */}

        {/* Final CTA Section Start */}
        <div style={{background: 'linear-gradient(135deg, #1a2c4e 0%, #2B4C7E 100%)', padding: '100px 0', color: '#fff'}}>
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto text-center">
                <div className="wow fadeInUp">
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 24px',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fbbf24',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '24px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Ready to Build Something Real?
                  </span>
                  <h2 style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '24px',
                    lineHeight: '1.2'
                  }}>
                    Join the Apex Movement.<br />Start Building Today.
                  </h2>
                  <p style={{
                    fontSize: '20px',
                    color: '#e0e7ff',
                    maxWidth: '700px',
                    margin: '0 auto 48px auto',
                    lineHeight: '1.7'
                  }}>
                    No income claims. No hype. Just a proven model for building recurring income by&nbsp;helping people solve real&nbsp;problems.
                  </p>
                  <p style={{
                    fontSize: '18px',
                    color: '#93c5fd',
                    marginBottom: '40px',
                    fontWeight: '600'
                  }}>
                    Choose your path. Get&nbsp;trained. Start&nbsp;building.
                  </p>

                  {/* Two CTA Buttons */}
                  <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px'}}>
                    {!isMainSite && (
                    <a href={signupUrl} className="btn-default" style={{
                      background: '#fbbf24',
                      color: '#1a2c4e',
                      borderColor: '#fbbf24',
                      padding: '18px 48px',
                      fontSize: '18px',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                      minWidth: '280px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-arrow-right"></i> Join the Movement
                    </a>
                    )}
                    <a href="#how-it-works" className="btn-default" style={{
                      background: 'transparent',
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      padding: '18px 48px',
                      fontSize: '18px',
                      fontWeight: '700',
                      minWidth: '280px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}>
                      <i className="fa-solid fa-play-circle"></i> See How It Works
                    </a>
                  </div>

                  {/* Bottom Trust Line */}
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '32px',
                    fontSize: '16px',
                    color: '#e0e7ff'
                  }}>
                    <p style={{marginBottom: '8px'}}>
                      Questions? <a href="/live" style={{color: '#fbbf24', textDecoration: 'underline'}}>Watch our live event first</a>
                    </p>
                    <p style={{marginBottom: 0}}>
                      Or email us: <a href="mailto:support@reachtheapex.net" style={{color: '#fbbf24', textDecoration: 'underline'}}>support@reachtheapex.net</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Final CTA Section End */}

        {/* Main Footer End */}
        <footer className="main-footer dark-section" id="contact" style={{paddingTop: '50px'}}>
          <div className="container">
            <div className="row align-items-start" style={{paddingTop: '0px', paddingBottom: '40px'}}>

              {/* Column 1: Corporate Address */}
              <div className="col-md-4 text-center">
                <div style={{color: '#ffffff', fontSize: '14px', lineHeight: '1.8'}}>
                  <p style={{margin: 0, fontWeight: 'bold'}}>Apex Affinity Group</p>
                  <p style={{margin: 0}}>1600 Highway 6 Ste 400</p>
                  <p style={{margin: 0}}>Sugar Land, TX 77478</p>
                </div>
              </div>

              {/* Column 2: Logo */}
              <div className="col-md-4 text-center">
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{maxHeight: '100px', width: 'auto', objectFit: 'contain', display: 'block', margin: '-30px auto 0 auto'}} />
              </div>

              {/* Column 3: Legal Links */}
              <div className="col-md-4 text-center">
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  <li style={{marginBottom: '15px'}}>
                    <a href="#" style={{color: '#ffffff', textDecoration: 'none', fontSize: '16px'}}>Terms & Conditions</a>
                  </li>
                  <li>
                    <a href="#" style={{color: '#ffffff', textDecoration: 'none', fontSize: '16px'}}>Privacy Policy</a>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </footer>
        {/* Main Footer End */}

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#2B4C7E',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            zIndex: 999,
            opacity: 0,
            visibility: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1a2c4e';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2B4C7E';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </div>

      {/* Load Optive JS Files - Exactly as in template */}
      <Script src="/optive/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/jquery.slicknav.js" strategy="afterInteractive" />
      <Script src="/optive/js/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/jquery.waypoints.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/jquery.counterup.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/jquery.magnific-popup.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/SmoothScroll.js" strategy="afterInteractive" />
      <Script src="/optive/js/parallaxie.js" strategy="afterInteractive" />
      <Script src="/optive/js/gsap.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/SplitText.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/wow.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/validator.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/magiccursor.js" strategy="afterInteractive" />
      <Script src="/optive/js/function.js" strategy="afterInteractive" />

      {/* Back to Top Button Script */}
      <Script id="back-to-top-script" strategy="afterInteractive">
        {`
          window.addEventListener('scroll', function() {
            const backToTopBtn = document.querySelector('.back-to-top');
            if (backToTopBtn) {
              if (window.scrollY > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
              } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
              }
            }
          });
        `}
      </Script>
    </>
  );
}

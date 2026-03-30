'use client';

// =============================================
// APEX AFFINITY GROUP - PREMIUM HOMEPAGE
// High-End Agency Quality Design
// Tech-Forward Insurance Platform
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';
import Script from 'next/script';
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';

interface ApexHomepageV2Props {
  distributor: Distributor;
  isMainSite?: boolean;
}

export default function ApexHomepageV2({ distributor, isMainSite = false }: ApexHomepageV2Props) {
  const [mounted, setMounted] = useState(false);
  const [activeProduct, setActiveProduct] = useState<'tech' | 'insurance'>('tech');

  const signupUrl = distributor.slug === 'apex' ? '/signup' : `/signup?ref=${distributor.slug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Base CSS */}
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/all.min.css" rel="stylesheet" media="screen" />

      <style dangerouslySetInnerHTML={{__html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          color: #0f172a;
          background: #ffffff;
        }

        html {
          scroll-behavior: smooth;
        }

        .apex-v2 {
          background: #ffffff;
        }
      `}} />

      <div className="apex-v2" style={{ display: mounted ? 'block' : 'none' }}>

        {/* HEADER */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          zIndex: 1000,
          transition: 'all 0.3s ease'
        }}>
          <nav style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '80px'
          }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ height: '52px' }} />
            </a>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '48px'
            }}>
              <a href="#platform" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}>Platform</a>
              <a href="#solutions" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}>Solutions</a>
              <a href="#opportunity" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}>Opportunity</a>
              <a href="#about" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                letterSpacing: '-0.01em',
                transition: 'color 0.2s'
              }}>About</a>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <a href="/login" style={{
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: '500',
                color: '#64748b',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Sign in
              </a>
              {!isMainSite && (
                <a href={signupUrl} style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textDecoration: 'none',
                  background: '#2B4C7E',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.01em'
                }}>
                  Get started
                </a>
              )}
            </div>
          </nav>
        </header>

        {/* HERO SECTION */}
        <section style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          marginTop: '80px',
          padding: '120px 0'
        }}>
          {/* Video Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}>
            <video autoPlay muted loop playsInline style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}>
              <source src="/videos/flag-waving.mp4" type="video/mp4" />
            </video>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(43, 76, 126, 0.92) 100%)',
              zIndex: 1
            }}></div>
          </div>

          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 32px',
            width: '100%'
          }}>
            <div style={{
              maxWidth: '920px'
            }}>
              {/* Eyebrow */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: '100px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.02em',
                marginBottom: '32px',
                backdropFilter: 'blur(12px)'
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Powered by AI Technology & Insurance Expertise
              </div>

              {/* Main Headline */}
              <h1 style={{
                fontSize: '72px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Build a Business<br />
                Serving Businesses<br />
                and Families
              </h1>

              {/* Subheadline */}
              <p style={{
                fontSize: '22px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.6',
                marginBottom: '20px',
                fontWeight: '400',
                maxWidth: '720px'
              }}>
                Apex provides everything you need to build a professional service business:
                AI-powered automation for businesses, insurance protection for families,
                and a compensation plan that rewards growth.
              </p>

              <p style={{
                fontSize: '17px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.6',
                marginBottom: '48px',
                fontWeight: '400',
                maxWidth: '680px'
              }}>
                No license required to start. Full training included. Build your business your way.
              </p>

              {/* CTAs */}
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <a href={signupUrl} style={{
                  padding: '18px 36px',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#0f172a',
                  textDecoration: 'none',
                  background: '#ffffff',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)'
                }}>
                  Start building today
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href="#platform" style={{
                  padding: '18px 36px',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#ffffff',
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.24)',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(12px)',
                  letterSpacing: '-0.01em'
                }}>
                  See how it works
                </a>
              </div>

              {/* Trust Indicators */}
              <div style={{
                marginTop: '64px',
                paddingTop: '32px',
                borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                display: 'flex',
                gap: '40px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.16)'
                  }}>
                    <svg width="24" height="24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>No cost to join</div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>Start risk-free</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.16)'
                  }}>
                    <svg width="24" height="24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>Recurring income</div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>Monthly residuals</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.16)'
                  }}>
                    <svg width="24" height="24" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>Team income</div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>Build & earn overrides</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM OVERVIEW */}
        <section id="platform" style={{
          padding: '140px 32px',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 96px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#2B4C7E',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                The Complete Platform
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Everything you need to serve clients and build income
              </h2>
              <p style={{
                fontSize: '20px',
                color: '#64748b',
                lineHeight: '1.7',
                fontWeight: '400'
              }}>
                Apex combines modern technology with proven insurance products,
                backed by comprehensive training and a transparent compensation plan.
              </p>
            </div>

            {/* Three Core Pillars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '32px'
            }}>
              {/* Pillar 1: Technology */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '48px 40px',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#2B4C7E',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <svg width="32" height="32" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px',
                  letterSpacing: '-0.02em'
                }}>
                  AI-Powered Business Tools
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.8',
                  marginBottom: '24px'
                }}>
                  Help local businesses automate marketing, manage leads, and track growth
                  with our AgentPulse platform. No license required.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Marketing automation & CRM</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>AI-powered lead nurturing</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Analytics & reporting dashboard</span>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Insurance */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '48px 40px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#2B4C7E',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <svg width="32" height="32" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px',
                  letterSpacing: '-0.02em'
                }}>
                  Insurance & Protection
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.8',
                  marginBottom: '24px'
                }}>
                  Licensed professionals can offer comprehensive insurance solutions
                  from top-rated carriers. Higher commissions, residual income.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Life insurance (term, whole, IUL)</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Annuities & retirement planning</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Ancillary & supplemental coverage</span>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Platform */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '48px 40px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: '#2B4C7E',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  <svg width="32" height="32" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px',
                  letterSpacing: '-0.02em'
                }}>
                  Complete Infrastructure
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.8',
                  marginBottom: '24px'
                }}>
                  Training, support, marketing tools, and a compensation plan
                  that rewards both personal sales and team building.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Comprehensive training & certification</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Replicated website & marketing materials</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#dbeafe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <svg width="12" height="12" fill="none" stroke="#2B4C7E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span style={{
                      fontSize: '15px',
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>Dual-ladder compensation (tech + insurance)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTIONS SHOWCASE */}
        <section id="solutions" style={{
          padding: '140px 32px',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
        }}>
          <div style={{
            maxWidth: '1300px',
            margin: '0 auto'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#93c5fd',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                What You Offer
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Real solutions for real needs
              </h2>
              <p style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.7'
              }}>
                Whether you start with technology or insurance, you're helping
                clients solve important problems.
              </p>
            </div>

            {/* Product Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '64px'
            }}>
              <button
                onClick={() => setActiveProduct('tech')}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeProduct === 'tech' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
                  background: activeProduct === 'tech' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${activeProduct === 'tech' ? '#ffffff' : 'rgba(255, 255, 255, 0.16)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.01em'
                }}
              >
                Business Technology
              </button>
              <button
                onClick={() => setActiveProduct('insurance')}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: activeProduct === 'insurance' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
                  background: activeProduct === 'insurance' ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                  border: `1px solid ${activeProduct === 'insurance' ? '#ffffff' : 'rgba(255, 255, 255, 0.16)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.01em'
                }}
              >
                Insurance & Protection
              </button>
            </div>

            {/* Content Area */}
            {activeProduct === 'tech' ? (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '72px 64px',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{
                  maxWidth: '900px',
                  margin: '0 auto'
                }}>
                  <h3 style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '24px',
                    letterSpacing: '-0.02em'
                  }}>
                    AgentPulse: AI-Powered Business Automation
                  </h3>
                  <p style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.8',
                    marginBottom: '48px'
                  }}>
                    A complete suite of tools that help small businesses streamline operations,
                    nurture leads, and grow revenue. No technical expertise required.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                  }}>
                    {[
                      {
                        iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
                        title: 'Smart CRM',
                        desc: 'Manage leads and clients with AI-powered insights'
                      },
                      {
                        iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
                        title: 'Automation',
                        desc: 'Automated follow-up and nurture campaigns'
                      },
                      {
                        iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6l4 2',
                        title: 'Analytics',
                        desc: 'Real-time business intelligence and reporting'
                      },
                      {
                        iconPath: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                        title: 'Marketing',
                        desc: 'Email and SMS marketing automation'
                      },
                      {
                        iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                        title: 'Pipeline',
                        desc: 'Visual sales pipeline and deal tracking'
                      },
                      {
                        iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
                        title: 'Notifications',
                        desc: 'Policy renewals and client milestones'
                      }
                    ].map((feature, i) => (
                      <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: 'rgba(147, 197, 253, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '20px'
                        }}>
                          <svg width="24" height="24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d={feature.iconPath} />
                          </svg>
                        </div>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#ffffff',
                          marginBottom: '8px'
                        }}>{feature.title}</h4>
                        <p style={{
                          fontSize: '15px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          lineHeight: '1.6',
                          margin: 0
                        }}>{feature.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    background: 'rgba(147, 197, 253, 0.1)',
                    border: '1px solid rgba(147, 197, 253, 0.2)',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.7',
                      margin: 0
                    }}>
                      <strong style={{ color: '#93c5fd' }}>No license required.</strong> Start
                      selling business automation tools immediately. Earn recurring monthly
                      commissions on every active subscription.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '72px 64px',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{
                  maxWidth: '900px',
                  margin: '0 auto'
                }}>
                  <h3 style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '24px',
                    letterSpacing: '-0.02em'
                  }}>
                    Comprehensive Insurance Portfolio
                  </h3>
                  <p style={{
                    fontSize: '18px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.8',
                    marginBottom: '48px'
                  }}>
                    Licensed agents have access to a full suite of insurance and financial
                    protection products from A-rated carriers.
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                  }}>
                    {[
                      {
                        iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
                        title: 'Life Insurance',
                        desc: 'Term, whole life, universal, and indexed products'
                      },
                      {
                        iconPath: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
                        title: 'Annuities',
                        desc: 'Fixed and indexed annuities for retirement planning'
                      },
                      {
                        iconPath: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
                        title: 'Final Expense',
                        desc: 'Simplified issue and guaranteed acceptance coverage'
                      },
                      {
                        iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
                        title: 'Health & Wellness',
                        desc: 'Telemedicine and supplemental health benefits'
                      },
                      {
                        iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
                        title: 'Legal Services',
                        desc: 'Identity theft and legal protection plans'
                      },
                      {
                        iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
                        title: 'Ancillary',
                        desc: 'Roadside assistance and additional benefits'
                      }
                    ].map((product, i) => (
                      <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '24px',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          background: 'rgba(147, 197, 253, 0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '20px'
                        }}>
                          <svg width="24" height="24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d={product.iconPath} />
                          </svg>
                        </div>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#ffffff',
                          marginBottom: '8px'
                        }}>{product.title}</h4>
                        <p style={{
                          fontSize: '15px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          lineHeight: '1.6',
                          margin: 0
                        }}>{product.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '48px',
                    padding: '24px',
                    background: 'rgba(147, 197, 253, 0.1)',
                    border: '1px solid rgba(147, 197, 253, 0.2)',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      fontSize: '15px',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: '1.7',
                      margin: 0
                    }}>
                      <strong style={{ color: '#93c5fd' }}>For licensed agents.</strong> Higher
                      commission levels (30-90%), residual income, and rank bonuses. We'll guide
                      you through licensing if you're not licensed yet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{
          padding: '140px 32px',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 96px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#2B4C7E',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                Getting Started
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Start building in<br />four simple steps
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '48px'
            }}>
              {[
                { num: '01', title: 'Create account', desc: 'Sign up free in 60 seconds. No cost, no credit card, no commitment.' },
                { num: '02', title: 'Complete training', desc: 'Watch onboarding videos, learn the AI Business Solutions, get your marketing tools.' },
                { num: '03', title: 'Choose your path', desc: 'Start with business tools, get licensed for insurance, or do both.' },
                { num: '04', title: 'Start earning', desc: 'Make your first sale, earn commissions, build your team, scale income.' }
              ].map((step, i) => (
                <div key={i} style={{
                  position: 'relative'
                }}>
                  <div style={{
                    fontSize: '64px',
                    fontWeight: '800',
                    color: '#f1f5f9',
                    lineHeight: '1',
                    marginBottom: '24px',
                    letterSpacing: '-0.03em'
                  }}>{step.num}</div>
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#0f172a',
                    marginBottom: '12px',
                    letterSpacing: '-0.01em'
                  }}>{step.title}</h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#64748b',
                    lineHeight: '1.7',
                    margin: 0
                  }}>{step.desc}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '80px',
              textAlign: 'center'
            }}>
              <a href={signupUrl} style={{
                padding: '18px 40px',
                fontSize: '17px',
                fontWeight: '600',
                color: '#ffffff',
                textDecoration: 'none',
                background: '#2B4C7E',
                borderRadius: '10px',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '-0.01em'
              }}>
                Get started today
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* BUSINESS OPPORTUNITY */}
        <section id="opportunity" style={{
          padding: '70px 32px',
          background: 'linear-gradient(135deg, #1a2c4e 0%, #2B4C7E 100%)',
          color: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Hero Section */}
            <div style={{
              textAlign: 'center',
              maxWidth: '900px',
              margin: '0 auto 80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#93c5fd',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                THE APEX OPPORTUNITY
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Build Recurring Income<br />Helping People Succeed
              </h2>
              <p style={{
                fontSize: '20px',
                color: '#e0e7ff',
                lineHeight: '1.7',
                marginBottom: '48px'
              }}>
                Apex isn't just software — it's a proven business model. Share AI Business Solutions you believe in, help people solve real problems, and earn recurring income as long as they succeed.
              </p>

              {/* Three Key Benefits */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px',
                marginTop: '48px'
              }}>
                <div style={{
                  background: 'rgba(147, 197, 253, 0.2)',
                  border: '2px solid #93c5fd',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>No Experience Required</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#cbd5e1'
                  }}>Full training & support provided</div>
                </div>
                <div style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '2px solid #fbbf24',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>Work From Anywhere</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#cbd5e1'
                  }}>Build on your schedule</div>
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '2px solid #10b981',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#ffffff',
                    marginBottom: '8px'
                  }}>Multiple Income Streams</div>
                  <div style={{
                    fontSize: '14px',
                    color: '#cbd5e1'
                  }}>AI Tech + Insurance opportunities</div>
                </div>
              </div>
            </div>

            {/* Choose Your Path */}
            <div style={{
              marginBottom: '80px'
            }}>
              <h3 style={{
                color: '#fbbf24',
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                Choose Your Path (Or Do Both)
              </h3>
              <p style={{
                color: '#cbd5e1',
                fontSize: '18px',
                textAlign: 'center',
                marginBottom: '48px',
                maxWidth: '800px',
                margin: '0 auto 48px'
              }}>
                Most platforms lock you into one income stream. Apex gives you options. Start with AI technology, add insurance later, or do both from day one.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                {/* AI Technology Path */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '40px',
                  border: '2px solid rgba(147, 197, 253, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    marginBottom: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <svg width="56" height="56" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21h8M12 17v4"/>
                    </svg>
                  </div>
                  <h4 style={{
                    color: '#93c5fd',
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    AI Technology
                  </h4>
                  <p style={{
                    color: '#e0e7ff',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    Help business owners automate marketing with AI-powered tools
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[
                      'No licensing required',
                      'Start earning immediately',
                      'Recurring monthly revenue',
                      'Easy to demonstrate value'
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <svg width="18" height="18" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span style={{
                          color: '#e0e7ff',
                          fontSize: '15px'
                        }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dual Income Path */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '40px',
                  border: '2px solid rgba(251, 191, 36, 0.5)',
                  backdropFilter: 'blur(10px)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fbbf24',
                    color: '#1a2c4e',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    MOST POPULAR
                  </div>
                  <div style={{
                    marginBottom: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <svg width="56" height="56" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <h4 style={{
                    color: '#fbbf24',
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    Dual Income (Both)
                  </h4>
                  <p style={{
                    color: '#e0e7ff',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    Serve the same clients with multiple solutions and maximize your income
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[
                      'Highest commission tier',
                      'Cross-sell to existing clients',
                      'Diversified income streams',
                      'Accelerated rank advancement'
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <svg width="18" height="18" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span style={{
                          color: '#e0e7ff',
                          fontSize: '15px'
                        }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance Only Path */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '40px',
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{
                    marginBottom: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <svg width="56" height="56" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h4 style={{
                    color: '#818cf8',
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    Insurance Only
                  </h4>
                  <p style={{
                    color: '#e0e7ff',
                    fontSize: '15px',
                    lineHeight: '1.7',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    Licensed agents: leverage our platform for insurance distribution
                  </p>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[
                      'Requires insurance license',
                      'Higher per-sale commissions',
                      'Lifetime renewals',
                      'Build agency under you'
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'start',
                        gap: '12px'
                      }}>
                        <svg width="18" height="18" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span style={{
                          color: '#e0e7ff',
                          fontSize: '15px'
                        }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* What You Get */}
            <div style={{
              marginBottom: '80px'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '48px',
                textAlign: 'center'
              }}>
                What You Get As an Apex Member
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {[
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, title: 'Complete Training', desc: 'Step-by-step videos, live coaching, and certification programs' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>, title: 'Marketing Tools', desc: 'Pre-built campaigns, landing pages, and social media content' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, title: 'Team Support', desc: '24/7 community, weekly calls, and dedicated success managers' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, title: 'Recurring Income', desc: 'Earn monthly as long as your clients stay subscribed' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, title: 'Team Building Bonuses', desc: 'Overrides from 5 levels deep + rank achievement bonuses' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>, title: 'Recognition & Rewards', desc: 'Trips, prizes, and public recognition for top performers' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>, title: 'Personal Mentor', desc: 'Direct access to your sponsor for guidance and strategy' },
                  { icon: <svg width="40" height="40" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast Start Program', desc: 'Earn extra bonuses your first 90 days to jumpstart income' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div style={{
                      marginBottom: '16px'
                    }}>{item.icon}</div>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '8px'
                    }}>{item.title}</h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#cbd5e1',
                      lineHeight: '1.6',
                      margin: 0
                    }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reality Check */}
            <div style={{
              marginBottom: '80px'
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '900px',
                margin: '0 auto'
              }}>
                <h4 style={{
                  color: '#fca5a5',
                  fontSize: '24px',
                  fontWeight: '700',
                  marginBottom: '20px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <svg width="28" height="28" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  The Reality: This Isn't For Everyone
                </h4>
                <p style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  lineHeight: '1.8',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  We're not here to hype you up with false promises. Building a business takes real work. Here's what you need to know:
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {[
                    'This is NOT passive income - you need to actively share and support clients',
                    'Results vary widely - some make nothing, some build 6-figure incomes',
                    'Success requires consistent effort over months, not days',
                    'You\'ll face rejection - not everyone will buy or join'
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'start',
                      gap: '12px'
                    }}>
                      <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <span style={{
                        color: '#fecaca',
                        fontSize: '15px',
                        lineHeight: '1.6'
                      }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* How to Get Started */}
            <div style={{
              marginBottom: '60px'
            }}>
              <h3 style={{
                color: '#ffffff',
                fontSize: '36px',
                fontWeight: '800',
                marginBottom: '48px',
                textAlign: 'center'
              }}>
                How to Get Started
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '24px'
              }}>
                {[
                  { num: '1', title: 'Join Apex', desc: 'Sign up through a current member or directly on our website' },
                  { num: '2', title: 'Complete Training', desc: 'Watch onboarding videos and attend your first team call' },
                  { num: '3', title: 'Get Your Tools', desc: 'Access your replicated site, marketing materials, and dashboard' },
                  { num: '4', title: 'Start Sharing', desc: 'Introduce Apex to your network and earn on every sale' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '32px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#2B4C7E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#ffffff',
                      margin: '0 auto 20px'
                    }}>{item.num}</div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#ffffff',
                      marginBottom: '12px'
                    }}>{item.title}</h4>
                    <p style={{
                      fontSize: '15px',
                      color: '#cbd5e1',
                      lineHeight: '1.6',
                      margin: 0
                    }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div style={{
              textAlign: 'center'
            }}>
              {!isMainSite && (
                <a href={signupUrl} style={{
                  background: '#fbbf24',
                  color: '#1a2c4e',
                  padding: '20px 56px',
                  fontSize: '20px',
                  fontWeight: '700',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 22.5l-.394-1.933a2.25 2.25 0 00-1.423-1.423L13.5 19.5l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 16.5l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 19.5l-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                  </svg>
                  Start Building Your Business
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ABOUT / WHO WE ARE */}
        <section id="about" style={{
          padding: '140px 32px',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#2B4C7E',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                About Apex
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.1',
                marginBottom: '28px',
                letterSpacing: '-0.03em'
              }}>
                Who we are and how we work
              </h2>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '56px 48px'
            }}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '24px',
                  letterSpacing: '-0.02em'
                }}>
                  We're a network marketing insurance company
                </h3>
                <p style={{
                  fontSize: '18px',
                  color: '#475569',
                  lineHeight: '1.8',
                  marginBottom: '24px'
                }}>
                  Apex Affinity Group combines AI Business Solutions with insurance services
                  through a team-building business model. We're transparent about our structure:
                  reps earn commissions on personal sales and can build teams to earn override income.
                </p>
                <p style={{
                  fontSize: '18px',
                  color: '#475569',
                  lineHeight: '1.8',
                  marginBottom: '24px'
                }}>
                  We provide real AI Business Solutions that solve real problems. Our AgentPulse technology
                  helps businesses grow. Our insurance products protect families and secure
                  retirements. Everything we offer has genuine value for end customers.
                </p>
                <p style={{
                  fontSize: '18px',
                  color: '#475569',
                  lineHeight: '1.8',
                  margin: 0
                }}>
                  <strong style={{ color: '#0f172a' }}>No purchase requirements.</strong> You
                  don't need to buy anything to join or maintain your business. You earn from
                  actual sales to actual clients. Team building accelerates income but is never
                  required.
                </p>
              </div>
            </div>

            <div style={{
              marginTop: '64px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '12px'
                }}>2024</div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0
                }}>Founded to serve insurance professionals</p>
              </div>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '12px'
                }}>A+</div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0
                }}>Carrier ratings and financial strength</p>
              </div>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '12px'
                }}>100%</div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0
                }}>Transparent and FTC-compliant</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{
          padding: '140px 32px',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#2B4C7E',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}>
                FAQ
              </div>
              <h2 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.1',
                letterSpacing: '-0.03em'
              }}>
                Common questions
              </h2>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {[
                {
                  q: 'Do I need to be licensed to start?',
                  a: 'No. You can start immediately by offering business technology solutions. If you want to sell insurance products, we\'ll guide you through the licensing process.'
                },
                {
                  q: 'Is there a cost to join?',
                  a: 'No upfront cost. No monthly fees. No purchase requirements. You can start building your business without any financial obligation.'
                },
                {
                  q: 'Is this network marketing / MLM?',
                  a: 'Yes. Apex uses a network marketing business model with team-building compensation. We\'re transparent about this. You earn commissions on personal sales from day one, and team-building income is optional.'
                },
                {
                  q: 'Do I have to recruit people?',
                  a: 'No. You can earn substantial income from personal sales alone. Building a team unlocks additional override income and leadership bonuses, but it\'s not required.'
                },
                {
                  q: 'What training do you provide?',
                  a: 'Full onboarding, product training, sales training, and licensing support (if pursuing insurance). Video courses, live sessions, mentorship, and ongoing education.'
                },
                {
                  q: 'Can I do this part-time?',
                  a: 'Yes. Most agents start part-time while keeping their current job. You work at your own pace and build on your own schedule.'
                }
              ].map((faq, i) => (
                <details key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '28px 32px'
                }}>
                  <summary style={{
                    fontSize: '19px',
                    fontWeight: '600',
                    color: '#0f172a',
                    cursor: 'pointer',
                    listStyle: 'none',
                    letterSpacing: '-0.01em'
                  }}>
                    {faq.q}
                  </summary>
                  <p style={{
                    fontSize: '16px',
                    color: '#64748b',
                    lineHeight: '1.8',
                    marginTop: '20px',
                    margin: 0,
                    paddingTop: '20px'
                  }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{
          padding: '140px 32px',
          background: 'linear-gradient(135deg, #0f172a 0%, #2B4C7E 100%)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.1',
              marginBottom: '28px',
              letterSpacing: '-0.03em'
            }}>
              Ready to build your business?
            </h2>
            <p style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: '1.6',
              marginBottom: '56px'
            }}>
              Join professionals who are serving real clients, solving real problems,
              and building real income. No cost to join. No pressure. Just opportunity.
            </p>

            <a href={signupUrl} style={{
              padding: '20px 48px',
              fontSize: '19px',
              fontWeight: '700',
              color: '#0f172a',
              textDecoration: 'none',
              background: '#ffffff',
              borderRadius: '12px',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              letterSpacing: '-0.01em',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}>
              Get started free
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>

            <div style={{
              marginTop: '48px',
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No cost to join
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full training included
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Start today
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          padding: '96px 32px 48px',
          background: '#0f172a',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div style={{
            maxWidth: '1440px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '56px',
              marginBottom: '64px'
            }}>
              <div>
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ height: '44px', marginBottom: '24px' }} />
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  Apex Affinity Group<br />
                  1600 Highway 6 Ste 400<br />
                  Sugar Land, TX 77478
                </p>
              </div>

              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Company</h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <li><a href="/about" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>About</a></li>
                  <li><a href="#opportunity" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Opportunity</a></li>
                  <li><a href="#platform" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Platform</a></li>
                  <li><a href="/training" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Training</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Support</h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <li><a href="/contact" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Contact</a></li>
                  <li><a href="/faq" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>FAQ</a></li>
                  <li><a href="/terms" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Terms</a></li>
                  <li><a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px', transition: 'color 0.2s' }}>Privacy</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Connect</h4>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  margin: 0
                }}>
                  <a href="mailto:info@theapexway.net" style={{ color: '#93c5fd', textDecoration: 'none' }}>info@theapexway.net</a><br />
                  {formatPhoneForDisplay('2816004000')}
                </p>
              </div>
            </div>

            <div style={{
              paddingTop: '40px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
              © {new Date().getFullYear()} Apex Affinity Group. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <Script src="/optive/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/bootstrap.min.js" strategy="afterInteractive" />
    </>
  );
}

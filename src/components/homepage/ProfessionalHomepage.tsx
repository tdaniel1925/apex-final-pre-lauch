'use client';

// =============================================
// APEX PROFESSIONAL HOMEPAGE
// High-end insurance company design
// Network marketing + Insurance products
// Clean, minimal, corporate aesthetic
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';
import Script from 'next/script';
import { formatPhoneForDisplay } from '@/lib/utils/format-phone';

interface ProfessionalHomepageProps {
  distributor: Distributor;
  isMainSite?: boolean;
}

export default function ProfessionalHomepage({ distributor, isMainSite = false }: ProfessionalHomepageProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'insurance'>('ai');

  const signupUrl = distributor.slug === 'apex' ? '/signup' : `/signup?ref=${distributor.slug}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Load Fonts and Optive CSS */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&family=Public+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/custom.css" rel="stylesheet" media="screen" />

      {/* Global Styles */}
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
          color: #1e293b;
          line-height: 1.6;
        }

        .professional-homepage {
          background: #ffffff;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}} />

      <div className="professional-homepage" style={{ display: mounted ? 'block' : 'none' }}>

        {/* HEADER / NAVIGATION - Tall Bootstrap Header */}
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
                      <li className="nav-item"><a className="nav-link" href="/#opportunity">Opportunity</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#how-it-works">How It Works</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#products">AI Technology</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#insurance">Insurance</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#faq">FAQs</a></li>
                      <li className="nav-item"><a className="nav-link" href="/live">Events</a></li>
                    </ul>
                  </div>
                </div>
                <div className="navbar-toggle"></div>
              </div>
            </nav>
            <div className="responsive-menu"></div>
          </div>
        </header>

        {/* HERO SECTION with Flag Video */}
        <section id="home" style={{
          position: 'relative',
          height: '100vh',
          minHeight: '700px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          marginTop: '-120px',
          paddingTop: '240px'
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
            {/* Dark overlay for readability */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(27, 47, 78, 0.92) 0%, rgba(43, 76, 126, 0.88) 100%)',
              zIndex: 1
            }}></div>
          </div>

          {/* Hero Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '120px 24px 0',
            width: '100%'
          }}>
            <div style={{
              maxWidth: '800px'
            }}>
              {/* Eyebrow */}
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginBottom: '24px'
              }}>
                {distributor.slug === 'apex' || isMainSite
                  ? 'Insurance Products • AI Technology • Career Path'
                  : `Building with ${distributor.first_name} ${distributor.last_name}`
                }
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: '64px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                Build a Career in Insurance with AI-Powered Business Tools
              </h1>

              {/* Subheadline */}
              <p style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.7',
                marginBottom: '40px',
                fontWeight: '400'
              }}>
                Apex Affinity Group provides insurance professionals with world-class products,
                modern technology, and a transparent compensation plan. Whether you're starting
                your insurance career or scaling an established agency, we give you the tools to succeed.
              </p>

              {/* Trust Indicators */}
              <div style={{
                display: 'flex',
                gap: '32px',
                marginBottom: '40px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No Cost to Join
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Full Training Included
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Licensed or Unlicensed Welcome
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WHAT IS APEX - Clarity Section */}
        <section id="opportunity" style={{
          padding: '60px 24px',
          paddingTop: '180px',
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
              margin: '0 auto 80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2B4C7E',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Who We Are
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.2',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                Insurance Company.<br />Professional Platform.<br />Career Opportunity.
              </h2>
              <p style={{
                fontSize: '19px',
                color: '#64748b',
                lineHeight: '1.7'
              }}>
                Apex Affinity Group is a network marketing insurance company that gives agents
                real insurance products, AI-powered business tools, and a team-building compensation
                plan. We're transparent about what we are and how our business model works.
              </p>
            </div>

            {/* Three Pillars */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}>
              {/* Pillar 1: Insurance Products */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2B4C7E',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <svg width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Real Insurance Products
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginBottom: '16px'
                }}>
                  Life insurance, annuities, and ancillary protection from top-rated carriers.
                  Your clients get real coverage. You earn real commissions.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Term & Whole Life Insurance
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Fixed & Indexed Annuities
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Final Expense & Ancillary
                  </li>
                </ul>
              </div>

              {/* Pillar 2: AI Technology */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2B4C7E',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <svg width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  AI-Powered Agent Tools
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginBottom: '16px'
                }}>
                  AgentPulse Suite - CRM, automation, lead management, and analytics.
                  Built for insurance professionals who want to work smarter.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Smart CRM & Pipeline
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Automated Follow-Up
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Policy Tracking & Alerts
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Team Income */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: '#2B4C7E',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}>
                  <svg width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Team-Building Income
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginBottom: '16px'
                }}>
                  Dual compensation ladder (tech + insurance). Build a team, earn overrides,
                  and create residual income that compounds over time.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Personal Sales Commissions
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Team Override Income
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: '#64748b',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#2B4C7E',
                      fontWeight: '600'
                    }}>•</span>
                    Rank Achievement Bonuses
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Statement */}
            <div style={{
              marginTop: '64px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '18px',
                color: '#64748b',
                fontWeight: '500',
                lineHeight: '1.7'
              }}>
                Other companies give you products <strong>OR</strong> tools <strong>OR</strong> team income.<br />
                <span style={{ color: '#2B4C7E', fontWeight: '700' }}>We give you all three.</span>
              </p>
            </div>
          </div>
        </section>

        {/* THREE STAGES Section */}
        <section style={{
          padding: '60px 24px',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '1200px',
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
                fontWeight: '600',
                color: '#2B4C7E',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Every Stage. One Home.
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.2',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                A Professional Home for Every Chapter
              </h2>
              <p style={{
                fontSize: '19px',
                color: '#64748b',
                lineHeight: '1.7'
              }}>
                Whether you're just starting or you've been in insurance for 20 years,
                Apex has a place for you and a path to take you further.
              </p>
            </div>

            {/* Three Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px'
            }}>
              {/* Stage 1: Aspiring */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>🌱</div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Aspiring
                </h3>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '20px'
                }}>
                  Just Getting Started
                </div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  textAlign: 'left'
                }}>
                  You don't need a license to join. We walk you through everything - from your
                  first product to your license exam to your first client. Full training, mentorship,
                  and community.
                </p>
              </div>

              {/* Stage 2: Growing */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>📈</div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Growing
                </h3>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '20px'
                }}>
                  Licensed & Building Momentum
                </div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  textAlign: 'left'
                }}>
                  You've got the license and the drive. Now you need infrastructure. Apex gives you
                  better carrier contracts, smarter technology, and a professional community that
                  accelerates your growth.
                </p>
              </div>

              {/* Stage 3: Established */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '40px 32px',
                textAlign: 'center',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>🏆</div>
                <h3 style={{
                  fontSize: '26px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>
                  Established
                </h3>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '20px'
                }}>
                  Seasoned & Ready to Scale
                </div>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  textAlign: 'left'
                }}>
                  You've built something real. Apex helps you protect it, scale it, and leverage it -
                  with top-tier contracts, team-building income, and tools that let you serve your
                  clients at the level they deserve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Process */}
        <section style={{
          padding: '60px 24px',
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
              margin: '0 auto 80px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2B4C7E',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Getting Started
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                Four Simple Steps to Launch Your Career
              </h2>
            </div>

            {/* Steps Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '40px'
            }}>
              {/* Step 1 */}
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: '#2B4C7E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Join Free
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.7'
                }}>
                  Sign up in 60 seconds. No cost, no credit card, no pressure.
                  Just create your account.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: '#2B4C7E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Complete Training
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.7'
                }}>
                  Watch onboarding videos, learn the products, and get access
                  to your tools and replicated website.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: '#2B4C7E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Get Licensed (Optional)
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.7'
                }}>
                  Already licensed? Great. Not licensed yet? We'll guide you
                  through the process step by step.
                </p>
              </div>

              {/* Step 4 */}
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: '#2B4C7E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '32px',
                  fontWeight: '800',
                  color: '#ffffff'
                }}>
                  4
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '12px'
                }}>
                  Start Earning
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: '#64748b',
                  lineHeight: '1.7'
                }}>
                  Make your first sale, earn your first commission, build your
                  team, and scale your income.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div style={{
              marginTop: '64px',
              textAlign: 'center'
            }}>
            </div>
          </div>
        </section>

        {/* PRODUCTS & INSURANCE Section */}
        <section id="products" style={{
          padding: '60px 24px',
          background: '#0f172a'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 64px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#93c5fd',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                What You Offer Clients
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: '1.2',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                Real Insurance Products from Top-Rated Carriers
              </h2>
              <p style={{
                fontSize: '19px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.7'
              }}>
                Your clients need protection. We give you a comprehensive portfolio
                to cover them at every stage of life.
              </p>
            </div>

            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
            }}>
              {/* Life Insurance */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '20px'
                }}>🛡️</div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Life Insurance
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.7',
                  marginBottom: '20px'
                }}>
                  Term, whole life, IUL, and final expense. Protection for every family,
                  every budget, every stage.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Term Life Insurance
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Whole & Universal Life
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Indexed Universal Life
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Final Expense
                  </li>
                </ul>
              </div>

              {/* Annuities */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '20px'
                }}>🏦</div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Annuities
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.7',
                  marginBottom: '20px'
                }}>
                  Fixed and indexed annuities for clients building toward retirement
                  or securing guaranteed income.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Fixed Annuities
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Indexed Annuities
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Income Planning
                  </li>
                </ul>
              </div>

              {/* Ancillary Protection */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '20px'
                }}>🔒</div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '12px'
                }}>
                  Ancillary Protection
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.7',
                  marginBottom: '20px'
                }}>
                  Telemedicine, ID theft protection, legal services, and roadside assistance.
                  Protection for everyday life.
                </p>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Telemedicine Services
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    ID Theft Protection
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Legal Services
                  </li>
                  <li style={{
                    fontSize: '15px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    paddingLeft: '24px',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '2px',
                      color: '#93c5fd',
                      fontWeight: '600'
                    }}>•</span>
                    Roadside Assistance
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Note */}
            <div style={{
              marginTop: '64px',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.7'
              }}>
                Products backed by A+ rated carriers with decades of financial strength.
              </p>
            </div>
          </div>
        </section>

        {/* COMPENSATION Preview */}
        <section id="compensation" style={{
          padding: '60px 24px',
          background: '#ffffff'
        }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto 64px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2B4C7E',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                How You Earn
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.2',
                marginBottom: '24px',
                letterSpacing: '-0.02em'
              }}>
                Built to Reward Growth.<br />Built to Compound.
              </h2>
              <p style={{
                fontSize: '19px',
                color: '#64748b',
                lineHeight: '1.7'
              }}>
                Apex runs a dual-compensation ladder system. Earn from personal sales,
                team overrides, rank bonuses, and leadership pools.
              </p>
            </div>

            {/* Compensation Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {/* Personal Sales */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '8px'
                }}>30-90%</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>Personal Sales</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>Commission on your own sales</p>
              </div>

              {/* Team Overrides */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '8px'
                }}>L1-L5</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>Team Overrides</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>5 levels of team income</p>
              </div>

              {/* Rank Bonuses */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '8px'
                }}>$250-30K</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>Rank Bonuses</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>One-time achievement bonuses</p>
              </div>

              {/* Bonus Pools */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '32px 24px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  color: '#2B4C7E',
                  marginBottom: '8px'
                }}>5%</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '8px'
                }}>Bonus Pools</h3>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>Share of company-wide pools</p>
              </div>
            </div>

            {/* FTC Compliance Note */}
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '24px 28px',
              marginBottom: '48px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}>
                <svg width="24" height="24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#0c4a6e',
                    marginBottom: '8px'
                  }}>FTC-Compliant & Transparent</h4>
                  <p style={{
                    fontSize: '15px',
                    color: '#0c4a6e',
                    lineHeight: '1.7',
                    margin: 0
                  }}>
                    No purchase requirements. No inventory. No frontloading. Personal sales are
                    rewarded from day one. Team-building is optional, not required.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{
          padding: '60px 24px',
          background: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '64px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#2B4C7E',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px'
              }}>
                Frequently Asked Questions
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#0f172a',
                lineHeight: '1.2',
                letterSpacing: '-0.02em'
              }}>
                Your Questions Answered
              </h2>
            </div>

            {/* FAQ Items */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* FAQ 1 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  Do I need to be licensed to join?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  No. Unlicensed reps can start immediately by offering AI-powered business
                  tools to small businesses. If you want to sell insurance products, we'll
                  guide you through the licensing process.
                </p>
              </details>

              {/* FAQ 2 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  Is there a cost to join?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  No upfront cost. No monthly minimums. No purchase requirements. You can
                  start earning from your first sale without any financial obligation.
                </p>
              </details>

              {/* FAQ 3 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  Is this network marketing / MLM?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  Yes. Apex uses a network marketing business model with team-building
                  compensation. We're transparent about this. Personal sales are rewarded
                  from day one, and team-building is optional.
                </p>
              </details>

              {/* FAQ 4 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  Do I have to recruit people?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  No. You can earn commissions on personal sales alone. Building a team
                  unlocks additional override income, but it's not required to succeed.
                </p>
              </details>

              {/* FAQ 5 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  What training do you provide?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  Full onboarding, product training, sales training, and licensing support.
                  We provide video courses, live training sessions, and one-on-one mentorship.
                </p>
              </details>

              {/* FAQ 6 */}
              <details style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px'
              }}>
                <summary style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#0f172a',
                  cursor: 'pointer',
                  listStyle: 'none'
                }}>
                  Can I keep my current job?
                </summary>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.7',
                  marginTop: '16px',
                  margin: 0
                }}>
                  Yes. Many of our agents start part-time while keeping their full-time job.
                  You work at your own pace and build your business on your schedule.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* FINAL CTA Section */}
        <section style={{
          padding: '60px 24px',
          background: 'linear-gradient(135deg, #1a2f50 0%, #2B4C7E 100%)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: '1.2',
              marginBottom: '24px',
              letterSpacing: '-0.02em'
            }}>
              Your Place at Apex Is Waiting.
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.7',
              marginBottom: '40px'
            }}>
              Join the professionals who've stopped figuring it out alone and started
              building something that lasts. No cost to join. No pressure. Just a genuine
              home for your career.
            </p>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '40px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No upfront costs
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
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
                gap: '8px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '15px',
                fontWeight: '500'
              }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Licensed or unlicensed welcome
              </div>
            </div>

            {/* CTA Button */}
            <a href={signupUrl} style={{
              padding: '20px 48px',
              fontSize: '19px',
              fontWeight: '700',
              color: '#2B4C7E',
              textDecoration: 'none',
              background: '#ffffff',
              borderRadius: '8px',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              Join Free - No Cost to Start
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          padding: '80px 24px 40px',
          background: '#0f172a',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {/* Footer Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '48px',
              marginBottom: '48px'
            }}>
              {/* Column 1: Logo & Address */}
              <div>
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ height: '40px', marginBottom: '24px' }} />
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  margin: 0
                }}>
                  Apex Affinity Group<br />
                  1600 Highway 6 Ste 400<br />
                  Sugar Land, TX 77478
                </p>
              </div>

              {/* Column 2: Company */}
              <div>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Company</h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <li><a href="/about" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>About</a></li>
                  <li><a href="#compensation" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Compensation</a></li>
                  <li><a href="#products" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Products</a></li>
                  <li><a href="/training" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Training</a></li>
                </ul>
              </div>

              {/* Column 3: Support */}
              <div>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Support</h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <li><a href="/contact" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Contact Us</a></li>
                  <li><a href="#faq" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>FAQ</a></li>
                  <li><a href="/terms" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Terms & Conditions</a></li>
                  <li><a href="/privacy" style={{ color: 'inherit', textDecoration: 'none', fontSize: '15px' }}>Privacy Policy</a></li>
                </ul>
              </div>

              {/* Column 4: Connect */}
              <div>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Connect</h4>
                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  marginBottom: '12px'
                }}>
                  Email: <a href="mailto:info@theapexway.net" style={{ color: '#93c5fd', textDecoration: 'none' }}>info@theapexway.net</a><br />
                  Phone: {formatPhoneForDisplay('2816004000')}
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
              paddingTop: '32px',
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

      {/* Load Scripts */}
      <Script src="/optive/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/bootstrap.min.js" strategy="afterInteractive" />
    </>
  );
}

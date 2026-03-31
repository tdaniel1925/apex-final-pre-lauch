'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function PulseMarketPage() {
  const [roiMonthlyClients, setRoiMonthlyClients] = useState(5);
  const [roiAvgProjectValue, setRoiAvgProjectValue] = useState(500);

  const monthlyRevenue = roiMonthlyClients * roiAvgProjectValue;
  const annualRevenue = monthlyRevenue * 12;
  const pulseMarketCost = 59;
  const competitorCost = 299; // Avg competitor cost
  const annualSavings = (competitorCost - pulseMarketCost) * 12;
  const roi = ((annualRevenue - pulseMarketCost * 12) / (pulseMarketCost * 12)) * 100;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Script src="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />

      <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#ffffff' }}>
        {/* Fixed Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #e2e8f0',
            height: '80px',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 24px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ height: '60px' }} />
            </Link>
            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px', fontWeight: 500 }}>
                Home
              </Link>
              <Link href="/products" style={{ color: '#2B4C7E', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>
                Products
              </Link>
              <Link
                href="/get-started"
                style={{
                  background: '#2B4C7E',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section
          style={{
            marginTop: '80px',
            padding: '100px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a2f50 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(147, 197, 253, 0.15)',
                  border: '1px solid rgba(147, 197, 253, 0.3)',
                  borderRadius: '20px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  color: '#93c5fd',
                  marginBottom: '24px',
                }}
              >
                ENTRY-LEVEL TIER
              </div>
              <h1
                style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  marginBottom: '20px',
                }}
              >
                PulseMarket
              </h1>
              <p
                style={{
                  fontSize: '22px',
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  marginBottom: '32px',
                }}
              >
                Launch Your Digital Presence with AI-Powered Marketing Tools
              </p>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }}>$59</span>
                  <span style={{ fontSize: '20px', color: '#cbd5e1' }}>/month</span>
                </div>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Compare to $150+/month</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/get-started?product=pulsemarket"
                  style={{
                    background: '#ffffff',
                    color: '#2B4C7E',
                    padding: '18px 36px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '17px',
                    fontWeight: 700,
                    display: 'inline-block',
                  }}
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#features"
                  style={{
                    background: 'transparent',
                    color: '#93c5fd',
                    padding: '18px 36px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '17px',
                    fontWeight: 600,
                    border: '2px solid rgba(147, 197, 253, 0.3)',
                    display: 'inline-block',
                  }}
                >
                  See Features
                </Link>
              </div>
            </div>
            <div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '32px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#ffffff' }}>
                  Perfect For:
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {[
                    'Solo entrepreneurs launching their first business',
                    'Freelancers needing professional web presence',
                    'Small businesses on a budget',
                    'Anyone new to digital marketing',
                  ].map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <svg width="20" height="20" fill="none" stroke="#93c5fd" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span style={{ fontSize: '15px', lineHeight: 1.6, color: '#cbd5e1' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                marginBottom: '24px',
              }}
            >
              The Problem Every New Business Faces
            </h2>
            <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px' }}>
              You need a professional online presence, but hiring agencies costs thousands and DIY tools are time-consuming
              and complicated. You're stuck between expensive and ineffective.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                textAlign: 'left',
              }}
            >
              {[
                { title: 'Agencies: $3,000+/month', desc: 'Professional but unaffordable for most startups' },
                { title: 'DIY Tools: 20+ hours/week', desc: 'Cheap but requires expertise and constant work' },
                { title: 'Freelancers: Hit or miss', desc: 'Quality varies wildly, delays are common' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution Overview */}
        <section style={{ padding: '120px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                PulseMarket: The Smart Middle Ground
              </h2>
              <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto' }}>
                Professional marketing automation at a fraction of the cost. AI does the heavy lifting, you focus on your
                business.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px',
              }}
            >
              {[
                {
                  icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
                  title: 'Professional Landing Pages',
                  desc: 'Get 3 conversion-optimized pages designed by AI, customized for your brand',
                },
                {
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                  title: '30 AI-Generated Posts',
                  desc: 'Fresh social media content every month, written in your voice',
                },
                {
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  title: 'Lead Capture System',
                  desc: 'Automated forms and email integration to capture and nurture leads',
                },
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  title: 'Analytics Dashboard',
                  desc: 'Track visitors, leads, and conversions in real-time',
                },
                {
                  icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
                  title: 'Mobile-Responsive',
                  desc: 'Perfect experience on desktop, tablet, and mobile automatically',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Fast Setup',
                  desc: 'Live in 48 hours with zero technical knowledge required',
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    padding: '32px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'rgba(43, 76, 126, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                    }}
                  >
                    <svg width="28" height="28" fill="none" stroke="#2B4C7E" strokeWidth="2">
                      <path d={feature.icon} />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Price Comparison */}
        <section id="comparison" style={{ padding: '120px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                How PulseMarket Compares
              </h2>
              <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7 }}>
                See how much you save vs traditional solutions
              </p>
            </div>
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th
                      style={{
                        padding: '20px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      Feature
                    </th>
                    <th
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#2B4C7E',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      PulseMarket
                    </th>
                    <th
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#64748b',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      Marketing Agency
                    </th>
                    <th
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                        color: '#64748b',
                        borderBottom: '2px solid #e2e8f0',
                      }}
                    >
                      DIY (HubSpot + Wix)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Monthly Cost
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#2B4C7E',
                      }}
                    >
                      $59
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      $3,000+
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      $299+
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Landing Pages
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2B4C7E',
                      }}
                    >
                      3
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      3-5
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Unlimited (DIY)
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Content Creation
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2B4C7E',
                      }}
                    >
                      AI-Automated
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Manual ($$$)
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Manual (Your Time)
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Setup Time
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2B4C7E',
                      }}
                    >
                      48 hours
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      4-8 weeks
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      2-4 weeks
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>Technical Knowledge</td>
                    <td
                      style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2B4C7E',
                      }}
                    >
                      None Required
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b' }}>None Required</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b' }}>High</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              style={{
                marginTop: '32px',
                padding: '24px',
                background: 'rgba(43, 76, 126, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(43, 76, 126, 0.1)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#2B4C7E', margin: 0 }}>
                Save $2,880/year vs agencies • Save $240/year vs DIY tools
              </p>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section style={{ padding: '120px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                Calculate Your ROI
              </h2>
              <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7 }}>
                See how quickly PulseMarket pays for itself
              </p>
            </div>
            <div
              style={{
                background: '#f8fafc',
                padding: '48px',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
              }}
            >
              <div style={{ marginBottom: '32px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '12px',
                  }}
                >
                  New clients per month from landing pages:
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={roiMonthlyClients}
                  onChange={(e) => setRoiMonthlyClients(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#e2e8f0',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#2B4C7E', marginTop: '8px' }}>
                  {roiMonthlyClients} clients
                </div>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#0f172a',
                    marginBottom: '12px',
                  }}
                >
                  Average value per client:
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={roiAvgProjectValue}
                  onChange={(e) => setRoiAvgProjectValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: '#e2e8f0',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#2B4C7E', marginTop: '8px' }}>
                  ${roiAvgProjectValue.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '32px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Monthly Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#2B4C7E' }}>
                    ${monthlyRevenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Annual Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#2B4C7E' }}>
                    ${annualRevenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>ROI</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>
                    {roi.toLocaleString(undefined, { maximumFractionDigits: 0 })}%
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: '32px',
                  padding: '20px',
                  background: 'rgba(43, 76, 126, 0.08)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>
                  With just <strong>{roiMonthlyClients} clients</strong>, PulseMarket pays for itself{' '}
                  <strong>{Math.round(monthlyRevenue / pulseMarketCost)}x over</strong> every month!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Info for Reps */}
        <section style={{ padding: '120px 24px', background: '#0f172a', color: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(147, 197, 253, 0.15)',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                borderRadius: '20px',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                color: '#93c5fd',
                marginBottom: '24px',
              }}
            >
              FOR APEX REPRESENTATIVES
            </div>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              Earn Recurring Commissions
            </h2>
            <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '48px' }}>
              Every PulseMarket sale generates monthly recurring income for you
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '48px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px', fontWeight: 600 }}>
                  Your Commission
                </div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$16.48</div>
                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>per month, recurring</div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px', fontWeight: 600 }}>
                  Potential Maximum
                </div>
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$22.06</div>
                <div style={{ fontSize: '14px', color: '#cbd5e1' }}>per month, recurring</div>
              </div>
            </div>
            <div
              style={{
                padding: '24px',
                background: 'rgba(147, 197, 253, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(147, 197, 253, 0.2)',
              }}
            >
              <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                <strong style={{ color: '#93c5fd' }}>Example:</strong> Sell 20 PulseMarket subscriptions ={' '}
                <strong style={{ color: '#ffffff' }}>$329/month</strong> in recurring income. Plus team overrides on your
                downline sales!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '120px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                Frequently Asked Questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  q: 'How long does it take to get my landing pages live?',
                  a: 'Typically 24-48 hours after signup. Our AI generates your pages based on your business info, then our team reviews and publishes them.',
                },
                {
                  q: 'Can I customize the landing pages?',
                  a: 'Yes! You can customize colors, images, copy, and layout through our simple editor. No coding required.',
                },
                {
                  q: 'Do I own the content AI creates?',
                  a: 'Absolutely. All content generated for your account is yours to use however you like.',
                },
                {
                  q: 'What if I need more than 3 landing pages?',
                  a: 'You can upgrade to PulseFlow (5 pages) or PulseDrive (10 pages) anytime. Or purchase additional pages à la carte for $19/month each.',
                },
                {
                  q: 'Is there a setup fee?',
                  a: 'No setup fees. Just the monthly subscription. Cancel anytime with no penalties.',
                },
                {
                  q: 'Can I connect my own domain?',
                  a: 'Yes! You can use your existing domain or purchase one through us. Domain connection is included at no extra cost.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#ffffff',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '24px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{faq.q}</span>
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{
                        transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                        flexShrink: 0,
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 24px', fontSize: '15px', color: '#64748b', lineHeight: 1.7 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          style={{
            padding: '120px 24px',
            background: 'linear-gradient(135deg, #2B4C7E 0%, #1a2f50 100%)',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              Start Growing Your Business Today
            </h2>
            <p
              style={{
                fontSize: '20px',
                lineHeight: 1.7,
                color: '#cbd5e1',
                marginBottom: '32px',
              }}
            >
              Join hundreds of entrepreneurs using PulseMarket to launch their digital presence
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/get-started?product=pulsemarket"
                style={{
                  background: '#ffffff',
                  color: '#2B4C7E',
                  padding: '18px 48px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 700,
                  display: 'inline-block',
                }}
              >
                Start Your Free Trial
              </Link>
              <Link
                href="/products"
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  padding: '18px 48px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: 600,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-block',
                }}
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '60px 24px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '48px',
                marginBottom: '48px',
              }}
            >
              <div>
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ height: '50px', marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                  AI-powered marketing tools for modern businesses.
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>AI Business Solutions</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {['PulseMarket', 'PulseFlow', 'PulseDrive', 'PulseCommand', 'SmartLook XL'].map((item) => (
                    <li key={item} style={{ marginBottom: '12px' }}>
                      <Link
                        href={`/products/${item.toLowerCase().replace(/\s/g, '')}`}
                        style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Company</h4>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {['About', 'Contact', 'Support', 'Privacy'].map((item) => (
                    <li key={item} style={{ marginBottom: '12px' }}>
                      <Link href={`/${item.toLowerCase()}`} style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '14px' }}>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '32px',
                textAlign: 'center',
                fontSize: '14px',
              }}
            >
              © {new Date().getFullYear()} Apex Affinity Group. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

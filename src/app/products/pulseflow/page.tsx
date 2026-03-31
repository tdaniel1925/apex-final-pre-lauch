'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function PulseFlowPage() {
  const [roiMonthlyClients, setRoiMonthlyClients] = useState(10);
  const [roiAvgProjectValue, setRoiAvgProjectValue] = useState(1000);

  const monthlyRevenue = roiMonthlyClients * roiAvgProjectValue;
  const annualRevenue = monthlyRevenue * 12;
  const pulseFlowCost = 129;
  const annualSavings = (499 - pulseFlowCost) * 12; // vs ActiveCampaign + HubSpot
  const roi = ((annualRevenue - pulseFlowCost * 12) / (pulseFlowCost * 12)) * 100;

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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
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
                <span
                  style={{
                    background: '#2B4C7E',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  MOST POPULAR
                </span>
                GROWTH TIER
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
                PulseFlow
              </h1>
              <p
                style={{
                  fontSize: '22px',
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  marginBottom: '32px',
                }}
              >
                Automate Your Marketing Growth with CRM & Email Campaigns
              </p>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }}>$129</span>
                  <span style={{ fontSize: '20px', color: '#cbd5e1' }}>/month</span>
                </div>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Compare to $350+/month • Save $2,652/year vs competitors</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/get-started?product=pulseflow"
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
                    'Growing businesses ready to scale',
                    'Service providers with repeat clients',
                    'B2B companies building pipelines',
                    'Coaches & consultants nurturing leads',
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
              The Scaling Challenge
            </h2>
            <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px' }}>
              Your business is growing, but your marketing can't keep up. Manual email campaigns, spreadsheet CRMs, and
              disconnected tools are slowing you down. You need automation without complexity.
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
                { title: 'Scattered Tools: $499+/month', desc: 'ActiveCampaign + HubSpot + Calendly adds up fast' },
                { title: 'Manual Work: 30+ hours/week', desc: 'Creating emails, updating leads, following up by hand' },
                { title: 'Lost Opportunities', desc: 'Leads fall through cracks without proper nurture sequences' },
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
        <section id="features" style={{ padding: '120px 24px', background: '#ffffff' }}>
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
                Everything You Need to Scale
              </h2>
              <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto' }}>
                PulseFlow combines landing pages, CRM, email campaigns, and lead scoring in one seamless platform
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
                  title: '5 Professional Landing Pages',
                  desc: 'More pages for different campaigns, products, or target audiences',
                },
                {
                  icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
                  title: '60 AI Social Posts/Month',
                  desc: 'Double the content to maintain consistent presence across all channels',
                },
                {
                  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
                  title: '4 Email Campaigns/Month',
                  desc: 'Automated drip sequences, newsletters, and promotional campaigns',
                },
                {
                  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                  title: 'CRM Integration',
                  desc: 'Track every lead, client interaction, and deal stage in one place',
                },
                {
                  icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                  title: 'Advanced Lead Scoring',
                  desc: 'AI automatically ranks leads by likelihood to buy so you prioritize right',
                },
                {
                  icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
                  title: 'A/B Testing Tools',
                  desc: 'Test headlines, CTAs, and designs to optimize conversion rates',
                },
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  title: 'Advanced Analytics',
                  desc: 'Campaign performance, attribution tracking, and ROI reporting',
                },
                {
                  icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z',
                  title: 'Priority Support',
                  desc: 'Dedicated account rep and faster response times',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Workflow Automation',
                  desc: 'Trigger emails, tasks, and notifications based on lead behavior',
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

        {/* Use Cases */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
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
                Real-World Use Cases
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px',
              }}
            >
              {[
                {
                  persona: 'Marketing Agency',
                  scenario: 'Manage 20+ client campaigns with automated reporting and lead tracking',
                  result: 'Saved 40 hours/month, increased client retention 35%',
                },
                {
                  persona: 'Insurance Agent',
                  scenario: 'Nurture warm leads with drip campaigns while focusing on hot prospects',
                  result: 'Closed 18% more deals by staying top-of-mind automatically',
                },
                {
                  persona: 'SaaS Founder',
                  scenario: 'Run A/B tests on landing pages and email sequences to optimize funnel',
                  result: 'Doubled trial signups in 3 months with data-driven optimizations',
                },
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    padding: '32px',
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#2B4C7E',
                      marginBottom: '16px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {useCase.persona}
                  </div>
                  <p style={{ fontSize: '17px', color: '#0f172a', lineHeight: 1.7, marginBottom: '16px', fontWeight: 600 }}>
                    {useCase.scenario}
                  </p>
                  <div
                    style={{
                      padding: '16px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '8px',
                      borderLeft: '4px solid #10b981',
                    }}
                  >
                    <p style={{ fontSize: '15px', color: '#065f46', margin: 0, fontWeight: 600 }}>
                      ✓ {useCase.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Price Comparison */}
        <section id="comparison" style={{ padding: '120px 24px', background: '#ffffff' }}>
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
                PulseFlow vs The Competition
              </h2>
              <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7 }}>
                Get all-in-one marketing automation at a fraction of the cost
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
                      PulseFlow
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
                      ActiveCampaign
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
                      HubSpot
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
                      $129
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      $290+
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      $800+
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
                      5
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Add-on ($299)
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Included
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Email Campaigns
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
                      4/month
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Unlimited
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Unlimited
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      AI Content Generation
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
                      ✓
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Limited
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      —
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      Lead Scoring
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
                      AI-Powered
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Manual Setup
                    </td>
                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                      Manual Setup
                    </td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>Setup Complexity</td>
                    <td
                      style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontWeight: 600,
                        color: '#2B4C7E',
                      }}
                    >
                      Simple
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b' }}>Complex</td>
                    <td style={{ padding: '16px 20px', textAlign: 'center', color: '#64748b' }}>Very Complex</td>
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
                Save up to $8,052/year vs ActiveCampaign + landing pages • All-in-one simplicity
              </p>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
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
                See the impact of automated lead nurturing
              </p>
            </div>
            <div
              style={{
                background: '#ffffff',
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
                  Qualified leads generated per month:
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
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
                  {roiMonthlyClients} leads
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
                  Average customer lifetime value:
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
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
            </div>
          </div>
        </section>

        {/* Commission Info */}
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
              Higher Commissions on PulseFlow
            </h2>
            <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '48px' }}>
              Earn more with our most popular tier
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
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$36.03</div>
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
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$41.62</div>
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
                <strong style={{ color: '#93c5fd' }}>Example:</strong> Sell 15 PulseFlow subscriptions ={' '}
                <strong style={{ color: '#ffffff' }}>$540/month</strong> in recurring income. Add team overrides for even more!
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
                Common Questions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  q: 'Can I upgrade from PulseMarket to PulseFlow?',
                  a: 'Absolutely! You can upgrade anytime. Your existing pages and content transfer automatically.',
                },
                {
                  q: 'How many contacts can I store in the CRM?',
                  a: 'Unlimited! Store as many contacts as you need with no extra fees.',
                },
                {
                  q: 'Do email campaigns require technical setup?',
                  a: 'No. Our templates are pre-built. Just customize the copy and hit send. Automation sequences are drag-and-drop.',
                },
                {
                  q: 'What if I need more than 4 email campaigns per month?',
                  a: 'You can purchase additional campaign credits at $15 each, or upgrade to PulseDrive for unlimited campaigns.',
                },
                {
                  q: 'Does PulseFlow integrate with my existing tools?',
                  a: 'Yes! We integrate with Zapier (5,000+ apps), Google Workspace, Microsoft 365, Calendly, Zoom, and most major platforms.',
                },
                {
                  q: 'How does AI lead scoring work?',
                  a: 'Our AI analyzes visitor behavior (page views, time on site, downloads, email opens) and assigns a score predicting likelihood to buy.',
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
              Ready to Scale Your Marketing?
            </h2>
            <p
              style={{
                fontSize: '20px',
                lineHeight: 1.7,
                color: '#cbd5e1',
                marginBottom: '32px',
              }}
            >
              Join growing businesses automating their success with PulseFlow
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/get-started?product=pulseflow"
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
                Compare All Tiers
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

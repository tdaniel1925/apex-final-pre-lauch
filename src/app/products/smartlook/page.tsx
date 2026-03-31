'use client';

import Link from 'next/link';
import Script from 'next/script';

export default function SmartLookPage() {
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

        {/* Hero */}
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
                BUSINESS INTELLIGENCE
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
                SmartLook XL
              </h1>
              <p
                style={{
                  fontSize: '22px',
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  marginBottom: '32px',
                }}
              >
                Transform Your Office into a Smart Command Center with AI-Powered Business Intelligence
              </p>
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff' }}>$99</span>
                  <span style={{ fontSize: '20px', color: '#cbd5e1' }}>/month</span>
                </div>
                <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Compare to $250+/month • All features included</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link
                  href="/get-started?product=smartlook"
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
                  See Demo
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
                    'Team leaders tracking performance metrics',
                    'Agencies monitoring client campaigns',
                    'Entrepreneurs optimizing operations',
                    'Sales teams visualizing pipelines',
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

        {/* Problem/Solution */}
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
              Stop Switching Between 20 Tabs
            </h2>
            <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px' }}>
              Your team is drowning in dashboards. Google Analytics. CRM reports. Social media insights. Sales spreadsheets.
              SmartLook brings it all together in one beautiful display.
            </p>
            <div
              style={{
                background: '#ffffff',
                padding: '48px',
                borderRadius: '16px',
                border: '2px solid #2B4C7E',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#2B4C7E', marginBottom: '24px' }}>
                One Dashboard. All Your Data.
              </h3>
              <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                SmartLook aggregates data from all your tools into a single real-time dashboard. Mount it on your office wall,
                display it on a TV, or view it on your phone. Your entire business at a glance.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
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
                Powerful Business Intelligence
              </h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
              }}
            >
              {[
                {
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                  title: 'Real-Time Metrics',
                  desc: 'Live data updates every 60 seconds - see changes as they happen',
                },
                {
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                  title: 'Team Performance',
                  desc: 'Individual and team leaderboards with gamification',
                },
                {
                  icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                  title: 'Sales Pipeline',
                  desc: 'Visual funnel showing leads, opportunities, and closed deals',
                },
                {
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                  title: 'Calendar Integration',
                  desc: "See today's meetings, appointments, and deadlines",
                },
                {
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  title: 'Revenue Tracking',
                  desc: 'Daily, weekly, and monthly revenue goals vs actuals',
                },
                {
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                  title: 'Custom KPI Widgets',
                  desc: 'Track any metric important to your business',
                },
                {
                  icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
                  title: 'Mobile App',
                  desc: 'iOS and Android apps for monitoring on the go',
                },
                {
                  icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
                  title: 'Voice Commands',
                  desc: '"Hey SmartLook, show me today\'s sales" - hands-free control',
                },
                {
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  title: 'Automated Reporting',
                  desc: 'Daily/weekly email summaries sent automatically',
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    padding: '32px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
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

        {/* Integrations */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                marginBottom: '24px',
              }}
            >
              Integrates With Everything
            </h2>
            <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px' }}>
              SmartLook connects to all your favorite tools
            </p>
            <div
              style={{
                background: '#ffffff',
                padding: '40px',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '24px',
                  fontSize: '15px',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                {[
                  'Google Analytics',
                  'HubSpot CRM',
                  'Salesforce',
                  'Stripe',
                  'QuickBooks',
                  'Shopify',
                  'Slack',
                  'Microsoft Teams',
                  'Google Calendar',
                  'Mailchimp',
                  'Facebook Ads',
                  'LinkedIn',
                ].map((tool) => (
                  <div key={tool} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    {tool}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '32px', margin: '32px 0 0 0' }}>
                + Connect any custom API via Zapier
              </p>
            </div>
          </div>
        </section>

        {/* Commission */}
        <section style={{ padding: '120px 24px', background: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              Easy Add-On Commission
            </h2>
            <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '48px' }}>
              SmartLook is an easy upsell to any business using our marketing tools
            </p>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'inline-block',
              }}
            >
              <div style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '12px', fontWeight: 600 }}>
                Commission Per Sale
              </div>
              <div style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$27.65</div>
              <div style={{ fontSize: '16px', color: '#cbd5e1' }}>per month, recurring</div>
            </div>
            <div
              style={{
                marginTop: '48px',
                padding: '24px',
                background: 'rgba(147, 197, 253, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(147, 197, 253, 0.2)',
              }}
            >
              <p style={{ fontSize: '17px', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                <strong style={{ color: '#93c5fd' }}>Pro Tip:</strong> Bundle SmartLook with any Pulse product for an
                easy additional $27.65/month per client
              </p>
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
              See Your Business at a Glance
            </h2>
            <p
              style={{
                fontSize: '20px',
                lineHeight: 1.7,
                color: '#cbd5e1',
                marginBottom: '32px',
              }}
            >
              Join hundreds of teams using SmartLook to visualize success
            </p>
            <Link
              href="/get-started?product=smartlook"
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
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '60px 24px 32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ height: '60px', marginBottom: '32px' }} />
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '32px',
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

'use client';

import Link from 'next/link';
import Script from 'next/script';

export default function PulseCommandPage() {
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
            padding: '120px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a2f50 100%)',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                BEST VALUE
              </span>
              ENTERPRISE TIER
            </div>
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              PulseCommand
            </h1>
            <p style={{ fontSize: '26px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '32px' }}>
              Enterprise-Grade Marketing Automation with AI Avatar Videos & White-Glove Service
            </p>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '72px', fontWeight: 800, color: '#ffffff' }}>$399</span>
                <span style={{ fontSize: '24px', color: '#cbd5e1' }}>/month</span>
              </div>
              <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Compare to $1,000+/month • Unlimited everything</p>
            </div>
            <Link
              href="/get-started?product=pulsecommand"
              style={{
                background: '#ffffff',
                color: '#2B4C7E',
                padding: '20px 56px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '20px',
                fontWeight: 700,
                display: 'inline-block',
              }}
            >
              Schedule Consultation
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '120px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2
                style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  marginBottom: '16px',
                }}
              >
                Unlimited Power, Zero Limits
              </h2>
              <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.7 }}>
                Everything unlimited, plus exclusive enterprise features
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
                { title: 'Unlimited Landing Pages', desc: 'As many as you need, no caps' },
                { title: 'Unlimited AI Content', desc: 'Social posts, emails, blogs - generate without limits' },
                { title: 'AI Avatar Video Creation', desc: 'Turn text into professional video with AI avatars' },
                { title: 'Full Podcast Production', desc: 'Unlimited podcast episodes with professional production' },
                { title: 'Dedicated Account Manager', desc: 'Your personal success partner' },
                { title: 'White-Glove Service', desc: 'We build campaigns for you' },
                { title: 'Priority Development', desc: 'Custom features built for your needs' },
                { title: 'Custom Integrations', desc: 'Connect to any system' },
                { title: 'Team Collaboration', desc: 'Unlimited team members and workspaces' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, rgba(43, 76, 126, 0.05) 0%, rgba(43, 76, 126, 0.02) 100%)',
                    padding: '36px',
                    borderRadius: '16px',
                    border: '2px solid #2B4C7E',
                  }}
                >
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Avatar Video */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
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
              AI Avatar Video Creation
            </h2>
            <p style={{ fontSize: '20px', color: '#64748b', lineHeight: 1.7, marginBottom: '48px' }}>
              Create professional videos in minutes with AI-powered avatars that look and sound like real people
            </p>
            <div
              style={{
                background: '#ffffff',
                padding: '48px',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
                textAlign: 'left',
              }}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[
                  '150+ photorealistic AI avatars (or clone yourself)',
                  '120+ languages and accents',
                  'Script-to-video in under 5 minutes',
                  'No cameras, studios, or editing required',
                  'Perfect for ads, tutorials, testimonials, and more',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <svg width="24" height="24" fill="none" stroke="#2B4C7E" strokeWidth="3" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span style={{ fontSize: '17px', color: '#0f172a', lineHeight: 1.6, fontWeight: 500 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Commission */}
        <section style={{ padding: '120px 24px', background: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '52px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              Highest Commission Tier
            </h2>
            <p style={{ fontSize: '22px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '48px' }}>
              Premium product = premium recurring income
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  padding: '40px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '12px', fontWeight: 600 }}>Your Commission</div>
                <div style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$97.48</div>
                <div style={{ fontSize: '16px', color: '#cbd5e1' }}>per month, recurring</div>
              </div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  padding: '40px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '12px', fontWeight: 600 }}>Potential Maximum</div>
                <div style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$139.37</div>
                <div style={{ fontSize: '16px', color: '#cbd5e1' }}>per month, recurring</div>
              </div>
            </div>
            <div
              style={{
                marginTop: '48px',
                padding: '32px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <p style={{ fontSize: '20px', lineHeight: 1.7, color: '#ffffff', margin: 0, fontWeight: 600 }}>
                Just 5 PulseCommand sales = <strong style={{ color: '#10b981' }}>$487-$697/month</strong> in passive recurring revenue
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
                fontSize: '52px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
              }}
            >
              Ready for Enterprise Power?
            </h2>
            <p style={{ fontSize: '22px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '32px' }}>
              Schedule a consultation to see PulseCommand in action
            </p>
            <Link
              href="/get-started?product=pulsecommand"
              style={{
                background: '#ffffff',
                color: '#2B4C7E',
                padding: '20px 56px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '20px',
                fontWeight: 700,
                display: 'inline-block',
              }}
            >
              Schedule Consultation
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

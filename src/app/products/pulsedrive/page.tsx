'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function PulseDrivePage() {
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

        {/* Hero */}
        <section
          style={{
            marginTop: '80px',
            padding: '100px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a2f50 100%)',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
              PROFESSIONAL TIER
            </div>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              PulseDrive
            </h1>
            <p style={{ fontSize: '24px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '32px' }}>
              Professional Marketing Power with AI Podcast Production
            </p>
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '64px', fontWeight: 800, color: '#ffffff' }}>$249</span>
                <span style={{ fontSize: '20px', color: '#cbd5e1' }}>/month</span>
              </div>
              <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0 }}>Compare to $600+/month</p>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/get-started?product=pulsedrive"
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
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
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
                Everything Professionals Need
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
                { title: '10 Landing Pages', desc: 'Multiple campaigns, products, and audience segments' },
                { title: '100 Social Posts/Month', desc: 'Consistent multi-platform presence' },
                { title: 'Unlimited Email Campaigns', desc: 'No limits on nurture sequences or newsletters' },
                { title: '4 AI Podcast Episodes/Month', desc: 'Professional audio content automatically generated' },
                { title: 'Advanced Analytics', desc: 'Multi-touch attribution and conversion tracking' },
                { title: 'Multi-Channel Management', desc: 'Coordinate across email, social, web seamlessly' },
                { title: 'Custom Branding', desc: 'Your logo, colors, fonts across all materials' },
                { title: 'White-Label Options', desc: 'Rebrand for agency clients' },
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
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Podcast Feature Highlight */}
        <section style={{ padding: '120px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                AI-Powered Podcast Production
              </h2>
              <p style={{ fontSize: '19px', color: '#64748b', lineHeight: 1.7 }}>
                Turn your expertise into professional podcast content automatically
              </p>
            </div>
            <div
              style={{
                background: '#ffffff',
                padding: '48px',
                borderRadius: '16px',
                border: '2px solid #2B4C7E',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '32px',
                }}
              >
                {[
                  {
                    step: '1',
                    title: 'You Provide Topics',
                    desc: 'Submit topics or industry keywords',
                  },
                  {
                    step: '2',
                    title: 'AI Researches & Scripts',
                    desc: 'AI generates engaging scripts with your tone',
                  },
                  {
                    step: '3',
                    title: 'Voice Cloning',
                    desc: 'Sounds like you (or choose professional voices)',
                  },
                  {
                    step: '4',
                    title: 'Auto-Publish',
                    desc: 'Distributed to Spotify, Apple, Google automatically',
                  },
                ].map((item) => (
                  <div key={item.step}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#2B4C7E',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 800,
                        marginBottom: '16px',
                      }}
                    >
                      {item.step}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Commission Info */}
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
              Earn Premium Commissions
            </h2>
            <p style={{ fontSize: '20px', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '48px' }}>
              Higher price point = higher recurring income
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
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$61.17</div>
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
                <div style={{ fontSize: '48px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>$83.51</div>
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
                <strong style={{ color: '#93c5fd' }}>Example:</strong> Just 10 PulseDrive sales ={' '}
                <strong style={{ color: '#ffffff' }}>$611/month</strong> in recurring revenue!
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '120px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                marginBottom: '48px',
                textAlign: 'center',
              }}
            >
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  q: 'Do I need podcast equipment?',
                  a: 'No! Our AI generates the entire podcast - script, voice, music, and editing. You just provide topics.',
                },
                {
                  q: 'Can I use my own voice?',
                  a: 'Yes! Submit 5 minutes of recording and our AI clones your voice for podcasts. Or choose from 50+ professional voices.',
                },
                {
                  q: 'Where are podcasts published?',
                  a: 'We automatically distribute to Spotify, Apple Podcasts, Google Podcasts, and 20+ other platforms.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
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
              Ready for Professional-Grade Marketing?
            </h2>
            <p style={{ fontSize: '20px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '32px' }}>
              Join marketing professionals using PulseDrive to dominate their industry
            </p>
            <Link
              href="/get-started?product=pulsedrive"
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

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import PulseProductCheckoutButton from '@/components/PulseProductCheckoutButton';

type ContentType = 'landing' | 'social' | 'email' | 'video' | 'podcast';

interface Example {
  id: string;
  title: string;
  industry: string;
  thumbnail: string;
  liveUrl?: string; // For landing pages - link to live HTML
  audioUrl?: string; // For podcasts - link to audio file
  videoUrl?: string; // For videos - link to video file
  isSpanish?: boolean; // Flag for Spanish translation videos
  description: string;
  facebookUrl?: string; // For Facebook posts - link to Facebook post
}

// Fisher-Yates shuffle algorithm to randomize array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const contentTabs = [
  { id: 'landing' as ContentType, label: '📄 Landing Pages', icon: '📄' },
  { id: 'social' as ContentType, label: '📱 Social Media', icon: '📱' },
  { id: 'email' as ContentType, label: '✉️ Email', icon: '✉️' },
  { id: 'video' as ContentType, label: '🎥 AI Video', icon: '🎥' },
  { id: 'podcast' as ContentType, label: '🎙️ AI Podcast', icon: '🎙️' },
];

// Real landing pages from extracted designs
const examples: Record<ContentType, Example[]> = {
  landing: [
    {
      id: '1',
      title: 'Luxury Real Estate Agency',
      industry: 'Real Estate',
      thumbnail: '/examples/screenshots/Luxury Real Estate Agency.jpg',
      liveUrl: '/examples/Luxury Real Estate Agency/index.html',
      description: 'Premium property showcase with elegant design',
    },
    {
      id: '2',
      title: 'Modern Medical Clinic',
      industry: 'Healthcare',
      thumbnail: '/examples/screenshots/Modern Medical Clinic.jpg',
      liveUrl: '/examples/Modern Medical Clinic/index.html',
      description: 'Clean healthcare provider landing page',
    },
    {
      id: '3',
      title: 'Neon Fintech Platform',
      industry: 'Financial Services',
      thumbnail: '/examples/screenshots/Neon Fintech Platform.jpg',
      liveUrl: '/examples/Neon Fintech Platform/index.html',
      description: 'Bold modern financial technology platform',
    },
    {
      id: '4',
      title: 'SaaS Productivity Tool',
      industry: 'Technology',
      thumbnail: '/examples/screenshots/Minimal SaaS Productivity Tool.jpg',
      liveUrl: '/examples/Minimal SaaS Productivity Tool/index.html',
      description: 'Minimal design for productivity software',
    },
    {
      id: '5',
      title: 'Organic Food Brand',
      industry: 'Food & Beverage',
      thumbnail: '/examples/screenshots/Organic Food Brand.jpg',
      liveUrl: '/examples/Organic Food Brand/index.html',
      description: 'Natural and eco-friendly food company',
    },
    {
      id: '6',
      title: 'Travel & Adventure',
      industry: 'Travel',
      thumbnail: '/examples/screenshots/Travel & Adventure Landing Page.jpg',
      liveUrl: '/examples/Travel & Adventure Landing Page/index.html',
      description: 'Exciting travel experiences and tours',
    },
    {
      id: '7',
      title: 'Fitness & Wellness',
      industry: 'Health & Fitness',
      thumbnail: '/examples/screenshots/Fitness & Wellness Landing Page.jpg',
      liveUrl: '/examples/Fitness & Wellness Landing Page/index.html',
      description: 'Gym and wellness center landing page',
    },
    {
      id: '8',
      title: 'Kids Education App',
      industry: 'Education',
      thumbnail: '/examples/screenshots/Kids Education App.jpg',
      liveUrl: '/examples/Kids Education App/index.html',
      description: 'Fun and engaging learning platform',
    },
    {
      id: '9',
      title: 'Legal Services',
      industry: 'Legal',
      thumbnail: '/examples/screenshots/Legal Services Landing Page.jpg',
      liveUrl: '/examples/Legal Services Landing Page/index.html',
      description: 'Professional law firm presentation',
    },
    {
      id: '10',
      title: 'Automotive Dealership',
      industry: 'Automotive',
      thumbnail: '/examples/screenshots/Automotive Landing Page.jpg',
      liveUrl: '/examples/Automotive Landing Page/index.html',
      description: 'Car sales and leasing platform',
    },
    {
      id: '11',
      title: 'Brutalist Architecture Firm',
      industry: 'Architecture',
      thumbnail: '/examples/screenshots/Brutalist Architecture Firm.jpg',
      liveUrl: '/examples/Brutalist Architecture Firm/index.html',
      description: 'Bold architectural design showcase',
    },
    {
      id: '12',
      title: 'Retro Music Streaming',
      industry: 'Entertainment',
      thumbnail: '/examples/screenshots/Retro Music Streaming.jpg',
      liveUrl: '/examples/Retro Music Streaming/index.html',
      description: 'Vintage-inspired music platform',
    },
  ],
  social: [
    {
      id: 'fb1',
      title: 'Apex Facebook Post 1',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/649495926_122185202720779588_7715371351485288963_n.jpg',
      description: 'Engaging social media post from Apex Affinity Group',
      facebookUrl: 'https://www.facebook.com/share/r/1L4DJbN4tw/',
    },
    {
      id: 'fb2',
      title: 'Apex Facebook Post 2',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/649972946_122185443908779588_2200617253231723518_n.jpg',
      description: 'Community engagement and team highlights',
      facebookUrl: 'https://www.facebook.com/share/r/1FtrGzKds5/',
    },
    {
      id: 'fb3',
      title: 'Apex Facebook Post 3',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/652081085_122118942897187889_5521415253285923450_n.jpg',
      description: 'Latest updates from the Apex community',
      facebookUrl: 'https://www.facebook.com/share/r/1Hm4PdULjE/',
    },
    {
      id: 'fb4',
      title: 'Apex Facebook Post 4',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/653701701_122120269731187889_8133003492452843743_n.jpg',
      description: 'Success stories and team achievements',
      facebookUrl: 'https://www.facebook.com/share/r/1FaWq9i8Qn/',
    },
    {
      id: 'fb5',
      title: 'Apex Facebook Post 5',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/649495926_122185202720779588_7715371351485288963_n.jpg',
      description: 'Building momentum and community growth',
      facebookUrl: 'https://www.facebook.com/share/r/1AeJYovcUU/',
    },
    {
      id: 'fb6',
      title: 'Apex Facebook Post 6',
      industry: 'Apex Social Media',
      thumbnail: '/pics-for-scial/649972946_122185443908779588_2200617253231723518_n.jpg',
      description: 'Celebrating milestones and shared success',
      facebookUrl: 'https://www.facebook.com/share/r/1Dh7t6kFfG/',
    },
  ],
  email: [
    {
      id: '1',
      title: 'Welcome to Pulse - Get Started',
      industry: 'Onboarding',
      thumbnail: '/examples/email-screenshots/welcome-onboarding.png',
      liveUrl: '/examples/emails/welcome-onboarding.html',
      description: 'New user onboarding email with 3-step setup guide and helpful resources',
    },
    {
      id: '2',
      title: 'PulseCommand Product Launch',
      industry: 'Product Launch',
      thumbnail: '/examples/email-screenshots/product-launch.png',
      liveUrl: '/examples/emails/product-launch.html',
      description: 'Announcing new product with features, pricing, and early-bird special offer',
    },
    {
      id: '3',
      title: 'Flash Sale: 40% Off All Plans',
      industry: 'Promotional',
      thumbnail: '/examples/email-screenshots/promotional-sale.png',
      liveUrl: '/examples/emails/promotional-sale.html',
      description: '48-hour flash sale with urgency-driven design and tiered pricing display',
    },
    {
      id: '4',
      title: 'The Growth Edge Newsletter',
      industry: 'Newsletter',
      thumbnail: '/examples/email-screenshots/newsletter-insights.png',
      liveUrl: '/examples/emails/newsletter-insights.html',
      description: 'Monthly newsletter with AI marketing trends, stats, and actionable tips',
    },
    {
      id: '5',
      title: 'AI Marketing Summit Invitation',
      industry: 'Event',
      thumbnail: '/examples/email-screenshots/event-invitation.png',
      liveUrl: '/examples/emails/event-invitation.html',
      description: 'VIP event invitation with agenda, speakers, and early-bird ticket pricing',
    },
    {
      id: '6',
      title: 'We Miss You - Come Back',
      industry: 'Follow-Up',
      thumbnail: '/examples/email-screenshots/follow-up-engagement.png',
      liveUrl: '/examples/emails/follow-up-engagement.html',
      description: 'Re-engagement email highlighting new features and offering 30% discount',
    },
    {
      id: '7',
      title: 'Last Chance - Account Cancellation',
      industry: 'Re-engagement',
      thumbnail: '/examples/email-screenshots/re-engagement-winback.png',
      liveUrl: '/examples/emails/re-engagement-winback.html',
      description: 'Win-back email with final 50% off offer before account cancellation',
    },
    {
      id: '8',
      title: 'Black Friday 2026 - 60% Off',
      industry: 'Seasonal/Holiday',
      thumbnail: '/examples/email-screenshots/seasonal-holiday.png',
      liveUrl: '/examples/emails/seasonal-holiday.html',
      description: 'Black Friday sale email with lifetime deals and limited-time bonuses',
    },
  ],
  video: [
    {
      id: '1',
      title: 'Apex Group Hype Video Final 2 Spanish',
      industry: 'Spanish Translation',
      thumbnail: '',
      videoUrl: '/videos-ai/apex_group_hype_video_final_2_(1080p)-spanish_(1)_v1 (720p).mp4',
      isSpanish: true,
      description: 'AI-generated promotional video (Spanish translation)',
    },
    {
      id: '2',
      title: 'Bill Propper - Apex CEO Message',
      industry: 'CEO Message',
      thumbnail: '',
      videoUrl: '/videos-ai/bill_web_message_v1 (720p).mp4',
      description: 'AI-generated CEO message from Bill Propper',
    },
    {
      id: '3',
      title: 'Johnathon Bunch Apex Training',
      industry: 'Training',
      thumbnail: '',
      videoUrl: '/videos-ai/jb_-_sharing_the_opp_3_1080p_v1 (720p).mp4',
      description: 'AI-generated training presentation from Johnathon Bunch',
    },
    {
      id: '4',
      title: 'Trent Daniel - Insurance Value',
      industry: 'Insurance',
      thumbnail: '',
      videoUrl: '/videos-ai/Trent_Studio (1).mp4',
      description: 'AI-generated insurance value presentation from Trent Daniel',
    },
  ],
  podcast: [
    {
      id: '1',
      title: 'Botmakers AI: Revolutionizing Business Efficiency',
      industry: 'AI & Technology',
      thumbnail: '',
      description: 'How AI is transforming business operations',
      audioUrl: '/audios/Botmakers AI_ Revolutionizing Business Efficiency.mp3',
    },
    {
      id: '2',
      title: 'Mastering Prospect Follow-Up in Sales',
      industry: 'Sales Strategy',
      thumbnail: '',
      description: 'Effective follow-up techniques that close deals',
      audioUrl: '/audios/Mastering Prospect Follow-Up in Sales.mp3',
    },
    {
      id: '3',
      title: 'Mastering the Conversation: The Apex Way Podcast Episode',
      industry: 'Communication',
      thumbnail: '',
      description: 'The art of meaningful business conversations',
      audioUrl: '/audios/Mastering the Conversation_ The Apex Way Podcast Episode (3).mp3',
    },
    {
      id: '4',
      title: 'Trading Table Talk: Finance Meets Innovation',
      industry: 'Finance',
      thumbnail: '',
      description: 'Where financial expertise meets cutting-edge innovation',
      audioUrl: '/audios/Trading Table Talk_ Finance Meets Innovation.mp3',
    },
  ],
};

const comparisonData: Record<
  ContentType,
  {
    features: Array<{ name: string; pulseMarket: string; pulseFlow: string; pulseDrive: string; pulseCommand: string }>;
  }
> = {
  landing: {
    features: [
      { name: 'Landing Pages per Month', pulseMarket: '3', pulseFlow: '5', pulseDrive: '10', pulseCommand: 'Unlimited' },
      { name: 'Templates Available', pulseMarket: '10 templates', pulseFlow: '15 templates', pulseDrive: '25 templates', pulseCommand: 'All (50+)' },
      { name: 'Custom Domain', pulseMarket: '✓', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'A/B Testing', pulseMarket: '✗', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Lead Capture Forms', pulseMarket: '✓', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Analytics Dashboard', pulseMarket: 'Basic', pulseFlow: 'Advanced', pulseDrive: 'Advanced', pulseCommand: 'Enterprise' },
    ],
  },
  social: {
    features: [
      { name: 'Social Posts per Month', pulseMarket: '30', pulseFlow: '60', pulseDrive: '100', pulseCommand: 'Unlimited' },
      { name: 'Platforms', pulseMarket: '3 platforms', pulseFlow: '5 platforms', pulseDrive: 'All platforms', pulseCommand: 'All platforms' },
      { name: 'Scheduling', pulseMarket: '✓', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Hashtag Generator', pulseMarket: '✓', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Image Variations', pulseMarket: '1 per post', pulseFlow: '3 per post', pulseDrive: '5 per post', pulseCommand: 'Unlimited' },
      { name: 'Video Posts', pulseMarket: '✗', pulseFlow: '5/month', pulseDrive: '15/month', pulseCommand: 'Unlimited' },
    ],
  },
  email: {
    features: [
      { name: 'Email Campaigns per Month', pulseMarket: '2', pulseFlow: '4', pulseDrive: 'Unlimited', pulseCommand: 'Unlimited' },
      { name: 'Templates', pulseMarket: '10', pulseFlow: '25', pulseDrive: '50', pulseCommand: 'All (100+)' },
      { name: 'Automation Sequences', pulseMarket: '✗', pulseFlow: '3', pulseDrive: 'Unlimited', pulseCommand: 'Unlimited' },
      { name: 'CRM Integration', pulseMarket: '✗', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'A/B Testing', pulseMarket: '✗', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Analytics', pulseMarket: 'Basic', pulseFlow: 'Advanced', pulseDrive: 'Advanced', pulseCommand: 'Enterprise' },
    ],
  },
  video: {
    features: [
      { name: 'AI Videos per Month', pulseMarket: '5', pulseFlow: '10', pulseDrive: '20', pulseCommand: 'Unlimited' },
      { name: 'Avatar Options', pulseMarket: '20 avatars', pulseFlow: '50 avatars', pulseDrive: '100 avatars', pulseCommand: '150+ avatars' },
      { name: 'Video Length', pulseMarket: 'Up to 2 min', pulseFlow: 'Up to 5 min', pulseDrive: 'Up to 10 min', pulseCommand: 'Unlimited' },
      { name: 'Languages', pulseMarket: '20', pulseFlow: '50', pulseDrive: '80', pulseCommand: '120+' },
      { name: 'Custom Avatar Clone', pulseMarket: '✗', pulseFlow: '✗', pulseDrive: '✗', pulseCommand: '✓' },
      { name: 'Background Music', pulseMarket: '✓', pulseFlow: '✓', pulseDrive: '✓', pulseCommand: '✓' },
    ],
  },
  podcast: {
    features: [
      { name: 'Podcast Episodes per Month', pulseMarket: '✗', pulseFlow: '✗', pulseDrive: '4', pulseCommand: 'Unlimited' },
      { name: 'Episode Length', pulseMarket: 'N/A', pulseFlow: 'N/A', pulseDrive: 'Up to 30 min', pulseCommand: 'Unlimited' },
      { name: 'Voice Options', pulseMarket: 'N/A', pulseFlow: 'N/A', pulseDrive: '15 voices', pulseCommand: '50+ voices' },
      { name: 'Script Generation', pulseMarket: 'N/A', pulseFlow: 'N/A', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Background Music', pulseMarket: 'N/A', pulseFlow: 'N/A', pulseDrive: '✓', pulseCommand: '✓' },
      { name: 'Distribution', pulseMarket: 'N/A', pulseFlow: 'N/A', pulseDrive: 'Auto-Publish', pulseCommand: 'Full Distribution' },
    ],
  },
};

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('landing');
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);

  // Memoize randomized social posts so they don't re-shuffle on every render
  const randomizedSocialPosts = useMemo(() => {
    return shuffleArray(examples.social);
  }, []);

  // Get the examples for the current tab (randomized for social)
  const currentExamples = activeTab === 'social' ? randomizedSocialPosts : examples[activeTab];

  return (
    <>
      <Script src="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />

      <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#ffffff', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* HEADER / NAVIGATION */}
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
              <a href="/" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}>Home</a>
              <a href="/#opportunity" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}>Opportunity</a>
              <a href="/products" style={{
                color: '#2B4C7E',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}>Products</a>
              <a href="/#insurance" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}>Insurance</a>
              <a href="/#compensation" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}>Compensation</a>
              <a href="/#faq" style={{
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}>FAQ</a>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <a href="/login" style={{
                padding: '10px 20px',
                fontSize: '15px',
                fontWeight: '500',
                color: '#2B4C7E',
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                transition: 'all 0.2s',
                background: 'transparent'
              }}>
                Login
              </a>
              <a href="/get-started" style={{
                padding: '10px 24px',
                fontSize: '15px',
                fontWeight: '600',
                color: '#ffffff',
                textDecoration: 'none',
                background: '#2B4C7E',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}>
                Get Started
              </a>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section
          style={{
            marginTop: '72px',
            padding: '80px 24px 40px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
              }}
            >
              Compare AI Business Solutions & See Examples
            </h1>
            <p style={{ fontSize: '22px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '0' }}>
              Choose the right tier for your business. View real examples of what you'll create.
            </p>
          </div>
        </section>


        {/* Video Explainer Section */}
        <section style={{ padding: '80px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: '#0f172a',
                  marginBottom: '16px',
                  lineHeight: 1.2,
                }}
              >
                Why You Need Pulse Products
              </h2>
              <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto' }}>
                Watch Trent Daniel explain how Pulse products revolutionize your business marketing and automation
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                maxWidth: '900px',
                margin: '0 auto',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                background: '#000000',
              }}
            >
              <video
                controls
                playsInline
                preload="metadata"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: '20px',
                }}
              >
                <source src="/videos/trent-pulse.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div
              style={{
                textAlign: 'center',
                marginTop: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                border: '2px solid #cbd5e1',
              }}
            >
              <p style={{ fontSize: '16px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: '#0f172a' }}>Key Takeaways:</strong> Automate your marketing, scale your reach,
                and close more deals with AI-powered content creation tools designed for modern businesses.
              </p>
            </div>
          </div>
        </section>
        {/* Tabs */}
        <section style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: '80px', zIndex: 999 }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {contentTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '20px 32px',
                    background: activeTab === tab.id ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #2B4C7E' : '3px solid transparent',
                    color: activeTab === tab.id ? '#2B4C7E' : '#64748b',
                    fontSize: '16px',
                    fontWeight: activeTab === tab.id ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '60px 24px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Table */}
            <div style={{ overflowX: 'auto', marginBottom: '60px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#ffffff',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th
                      style={{
                        padding: '20px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                        minWidth: '180px',
                      }}
                    >
                      Feature
                    </th>
                    <th
                      style={{
                        padding: '20px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                        minWidth: '140px',
                      }}
                    >
                      PulseMarket
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>$79/mo</div>
                    </th>
                    <th
                      style={{
                        padding: '20px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                        background: 'rgba(43, 76, 126, 0.05)',
                        minWidth: '140px',
                      }}
                    >
                      PulseFlow
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>$149/mo</div>
                      <div
                        style={{
                          display: 'inline-block',
                          background: '#10b981',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: 700,
                          marginTop: '6px',
                        }}
                      >
                        MOST POPULAR
                      </div>
                    </th>
                    <th
                      style={{
                        padding: '20px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                        minWidth: '140px',
                      }}
                    >
                      PulseDrive
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>$299/mo</div>
                    </th>
                    <th
                      style={{
                        padding: '20px 12px',
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#0f172a',
                        borderBottom: '2px solid #e2e8f0',
                        minWidth: '140px',
                      }}
                    >
                      PulseCommand
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>$499/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData[activeTab].features.map((feature, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td
                        style={{
                          padding: '16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0f172a',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {feature.name}
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#64748b',
                          textAlign: 'center',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {feature.pulseMarket}
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#0f172a',
                          textAlign: 'center',
                          borderBottom: '1px solid #e2e8f0',
                          background: idx % 2 === 0 ? 'rgba(43, 76, 126, 0.02)' : 'rgba(43, 76, 126, 0.05)',
                        }}
                      >
                        {feature.pulseFlow}
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#64748b',
                          textAlign: 'center',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {feature.pulseDrive}
                      </td>
                      <td
                        style={{
                          padding: '16px 12px',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#64748b',
                          textAlign: 'center',
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        {feature.pulseCommand}
                      </td>
                    </tr>
                  ))}
                  {/* CTA Row */}
                  <tr>
                    <td style={{ padding: '20px 16px', background: '#f8fafc' }}></td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', background: '#f8fafc' }}>
                      <PulseProductCheckoutButton
                        productSlug="pulsemarket"
                        productName="PulseMarket"
                        price={79}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', background: 'rgba(43, 76, 126, 0.05)' }}>
                      <PulseProductCheckoutButton
                        productSlug="pulseflow"
                        productName="PulseFlow"
                        price={149}
                        className="inline-block px-6 py-3 bg-[#2B4C7E] text-white rounded-lg text-sm font-bold shadow-lg hover:bg-[#1e3a5f] transition-all"
                      />
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', background: '#f8fafc' }}>
                      <PulseProductCheckoutButton
                        productSlug="pulsedrive"
                        productName="PulseDrive"
                        price={299}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />
                    </td>
                    <td style={{ padding: '20px 12px', textAlign: 'center', background: '#f8fafc' }}>
                      <PulseProductCheckoutButton
                        productSlug="pulsecommand"
                        productName="PulseCommand"
                        price={499}
                        className="inline-block px-5 py-2.5 bg-[#2B4C7E] text-white rounded-lg text-sm font-semibold hover:bg-[#1e3a5f] transition-all"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Examples Section */}
            <div>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}
              >
                Real Examples
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', textAlign: 'center', marginBottom: '8px' }}>
                {activeTab === 'podcast' ? 'Listen to AI-generated podcasts' : activeTab === 'video' ? 'Watch AI-generated videos (click to play)' : 'Click any example to view full size'}
              </p>
              {activeTab === 'video' && (
                <p style={{ fontSize: '14px', color: '#10b981', textAlign: 'center', marginBottom: '40px', fontWeight: 600 }}>
                  ✨ All videos are AI-generated
                </p>
              )}
              {activeTab !== 'video' && <div style={{ marginBottom: '40px' }} />}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
                  gap: '24px',
                  width: '100%',
                }}
              >
                {currentExamples.map((example) => (
                  <div
                    key={example.id}
                    onClick={activeTab === 'podcast' ? undefined : () => setSelectedExample(example)}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid #e2e8f0',
                      cursor: activeTab === 'podcast' ? 'default' : 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'podcast') {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        e.currentTarget.style.borderColor = '#2B4C7E';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'podcast') {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
                    }}
                  >
                    {/* Thumbnail Preview / Audio Player */}
                    {activeTab === 'podcast' && example.audioUrl ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '24px',
                          background: 'linear-gradient(135deg, #2B4C7E 0%, #1a2f50 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '160px',
                        }}
                      >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎙️</div>
                        <audio
                          controls
                          style={{
                            width: '100%',
                            borderRadius: '8px',
                            outline: 'none',
                          }}
                        >
                          <source src={example.audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '200px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {example.thumbnail ? (
                          <img
                            src={example.thumbnail}
                            alt={example.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '24px',
                              textAlign: 'center',
                            }}
                          >
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{contentTabs.find((t) => t.id === activeTab)?.icon}</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', opacity: 0.9 }}>
                              {example.industry}
                            </div>
                          </div>
                        )}
                        {activeTab === 'landing' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(43, 76, 126, 0.95)',
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          >
                            🔍 CLICK TO VIEW
                          </div>
                        )}
                        {activeTab === 'video' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(16, 185, 129, 0.95)',
                              color: '#ffffff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          >
                            ✨ AI GENERATED
                          </div>
                        )}
                        {activeTab === 'social' && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'rgba(24, 119, 242, 0.95)',
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            FACEBOOK POST
                          </div>
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ padding: '20px' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#64748b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '8px',
                        }}
                      >
                        {example.industry}
                        {example.isSpanish && (
                          <span style={{ marginLeft: '8px', color: '#f59e0b', fontWeight: 700 }}>
                            🌐 Spanish Translation
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        {example.title}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{example.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '60px 24px 32px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
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

        {/* Example Modal */}
        {selectedExample && (
          <div
            onClick={() => setSelectedExample(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                maxWidth: activeTab === 'video' ? '1200px' : '1000px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedExample(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '2px solid #e2e8f0',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                ×
              </button>

              {/* Modal Content */}
              <div style={{ padding: '40px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '12px',
                  }}
                >
                  {selectedExample.industry}
                  {selectedExample.isSpanish && (
                    <span style={{ marginLeft: '12px', color: '#f59e0b', fontSize: '13px' }}>
                      🌐 Spanish Translation
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a', marginBottom: '12px' }}>
                  {selectedExample.title}
                </h2>
                <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px' }}>{selectedExample.description}</p>

                {/* Content Preview */}
                <div>
                  {activeTab === 'social' && selectedExample.thumbnail ? (
                    <div
                      style={{
                        border: '3px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '24px',
                      }}
                    >
                      <img
                        src={selectedExample.thumbnail}
                        alt={selectedExample.title}
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: '8px',
                        }}
                      />
                    </div>
                  ) : activeTab === 'video' && selectedExample.videoUrl ? (
                    <div
                      style={{
                        border: '3px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        background: '#000000',
                      }}
                    >
                      <video
                        controls
                        style={{
                          width: '100%',
                          maxHeight: 'calc(90vh - 280px)',
                          display: 'block',
                        }}
                      >
                        <source src={selectedExample.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <>
                      {/* Full Screenshot - Scrollable */}
                      <div
                        style={{
                          border: '3px solid #e2e8f0',
                          borderRadius: '16px',
                          overflow: 'auto',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          marginBottom: '24px',
                          maxHeight: 'calc(90vh - 200px)',
                          background: '#ffffff',
                        }}
                      >
                        <img
                          src={selectedExample.thumbnail}
                          alt={selectedExample.title}
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      </div>
                      {/* Action Button - Only for landing pages with live URLs */}
                      {activeTab === 'landing' && selectedExample.liveUrl && (
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                          <a
                            href={selectedExample.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '16px 32px',
                              background: '#2B4C7E',
                              color: '#ffffff',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              fontSize: '16px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 12px rgba(43, 76, 126, 0.3)',
                            }}
                          >
                            🌐 Open Live Interactive Page
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Facebook Post Action Button */}
                  {activeTab === 'social' && selectedExample.facebookUrl && (
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                      <a
                        href={selectedExample.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '16px 32px',
                          background: '#1877f2',
                          color: '#ffffff',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          fontSize: '16px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        View on Facebook
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

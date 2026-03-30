'use client';

import { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';

interface SocialPost {
  platform: string;
  variant: string;
  content: string;
  imageDescription: string;
  dimensions: string;
  hashtags?: string;
}

interface Campaign {
  id: string;
  title: string;
  industry: string;
  tier: string;
  description: string;
  strategy: string;
  thumbnail: string;
  liveUrl?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  landingPage: {
    headline: string;
    subheadline: string;
    cta: string;
    benefits: string[];
    imageDescription: string;
    abVariants?: {
      headline: string;
      subheadline: string;
      cta: string;
      performance: string;
    }[];
  };
  socialPosts: SocialPost[];
  email: {
    subject: string;
    preview: string;
    body: string;
    cta: string;
    imageDescription: string;
  };
  results?: string;
}

const campaigns: Campaign[] = [
  {
    id: 'real-estate-listing',
    title: 'Luxury Home Listing Launch',
    industry: 'Real Estate',
    tier: 'PulseMarket',
    description: 'Complete campaign to promote a new luxury listing with cohesive branding across all channels',
    strategy: 'Target affluent buyers aged 45-65 with lifestyle imagery. Emphasize exclusivity and mountain views. Use warm, luxury-focused color palette.',
    thumbnail: 'real-estate',
    brandColors: {
      primary: '#1a2238',
      secondary: '#d4af37',
      accent: '#f4f1de',
    },
    landingPage: {
      headline: '5-Bedroom Estate with Panoramic Mountain Views',
      subheadline: 'Architectural masterpiece in exclusive Ridgemont community. $2.4M',
      cta: 'Schedule Private Showing',
      benefits: [
        'Chef\'s kitchen with premium appliances',
        'Infinity pool overlooking valley',
        'Smart home technology throughout',
        'Private guest house',
      ],
      imageDescription: 'Hero: Stunning exterior shot at sunset with mountain backdrop. Gallery: Professional interior shots of kitchen, master suite, pool area, and entertaining spaces.',
      abVariants: [
        {
          headline: 'Your Dream Mountain Estate Awaits',
          subheadline: '5BR luxury home in Ridgemont\'s most sought-after location',
          cta: 'Book Your Tour Today',
          performance: '+23% conversion vs original',
        },
      ],
    },
    socialPosts: [
      {
        platform: 'Instagram',
        variant: 'Variant A - Lifestyle Focus',
        content: '✨ JUST LISTED ✨\n\nDream home alert! This stunning 5BR estate offers everything you\'ve been looking for.\n\n📍 Ridgemont | 💰 $2.4M\n\nSwipe to see the breathtaking views 👉',
        imageDescription: 'Square 1080x1080: Split-screen showing exterior at golden hour on left, infinity pool view on right. Professional photography with warm filter.',
        dimensions: '1080x1080 (Square)',
        hashtags: '#LuxuryRealEstate #DreamHome #NewListing #RidgemontHomes #MountainViews',
      },
      {
        platform: 'Instagram',
        variant: 'Variant B - Feature Highlight',
        content: 'POV: You wake up to THIS view every morning ☀️🏔️\n\nJust listed: 5-bedroom mountain estate with infinity pool, chef\'s kitchen, and smart home tech.\n\nLink in bio for full tour 📸',
        imageDescription: 'Square 1080x1080: Master bedroom view looking out floor-to-ceiling windows at mountain vista. Luxury bedding in foreground. Aspirational lifestyle shot.',
        dimensions: '1080x1080 (Square)',
        hashtags: '#LuxuryHomes #RealEstateGoals #MountainLiving #DreamViews',
      },
      {
        platform: 'Facebook',
        variant: 'Variant A - Detailed Post',
        content: 'NEW LISTING: 5-Bedroom Mountain Estate in Ridgemont\n\nThis architectural masterpiece features:\n✓ Panoramic mountain views from every room\n✓ Infinity pool with valley overlook\n✓ Chef\'s kitchen with Wolf & Sub-Zero appliances\n✓ Smart home technology\n✓ Private guest house\n\n$2.4M | Schedule your private showing today!\n\n👉 [Link to landing page]',
        imageDescription: 'Landscape 1200x630: Wide-angle exterior shot showing full property with mountains. Professional twilight photography with all lights on.',
        dimensions: '1200x630 (Link Preview)',
      },
      {
        platform: 'LinkedIn',
        variant: 'Professional Approach',
        content: 'New Listing: Premier Ridgemont Estate\n\nProud to present this exceptional 5-bedroom property in one of Ridgemont\'s most sought-after neighborhoods. \n\nKey Investment Highlights:\n• 5,200 sq ft on 2.5 acres\n• Built 2019 - like-new condition\n• Ridgemont schools (top-rated)\n• 15 min to downtown\n• Appreciation: 12% annually (5-yr avg)\n\n$2.4M | Serious inquiries: [Contact info]',
        imageDescription: 'Landscape 1200x627: Professional aerial shot showing entire property, landscaping, and mountain context. Clean, sophisticated composition.',
        dimensions: '1200x627 (Professional)',
      },
    ],
    email: {
      subject: 'You Won\'t Believe This New Listing - Mountain Estate $2.4M',
      preview: 'Exclusive first look at Ridgemont\'s newest luxury property',
      body: 'Hi [Name],\n\nI wanted you to be among the first to see this incredible property that just hit the market.\n\nThis 5-bedroom estate in exclusive Ridgemont offers panoramic mountain views, an infinity pool, and smart home technology throughout.\n\nProperties like this don\'t last long. Can we schedule a private showing this week?',
      cta: 'Schedule Showing',
      imageDescription: 'Email hero image: Landscape photo of exterior at dusk with warm lighting. Secondary images: 3-column grid showing kitchen, pool, and master suite.',
    },
    results: '14 showings booked in first 72 hours, 3 offers received',
  },
  {
    id: 'life-coach-webinar',
    title: 'Free Breakthrough Session Webinar',
    industry: 'Life Coaching',
    tier: 'PulseFlow',
    description: 'Webinar registration campaign with automated email sequence',
    strategy: 'Target women 35-50 feeling stuck in career/life. Use empowering, transformational messaging. Purple/gold color scheme conveys spirituality and success.',
    thumbnail: 'life-coaching',
    brandColors: {
      primary: '#6B46C1',
      secondary: '#F59E0B',
      accent: '#FEF3C7',
    },
    landingPage: {
      headline: 'Discover Your Purpose in 90 Minutes',
      subheadline: 'Free live webinar: Break through limiting beliefs and design the life you deserve',
      cta: 'Save My Spot (Free)',
      benefits: [
        'Identify your core values and life purpose',
        'Learn the 3-step breakthrough framework',
        'Get personalized action steps',
        'Live Q&A with certified coach',
      ],
      imageDescription: 'Hero: Confident woman in business casual, arms crossed, looking at camera with warm smile. Background: Soft bokeh, professional yet approachable. Video thumbnail: Coach at desk in bright, modern office.',
      abVariants: [
        {
          headline: 'Feeling Stuck? This 90-Minute Session Will Change Everything',
          subheadline: 'Free breakthrough webinar reveals the 3-step framework to find your purpose',
          cta: 'Reserve My Free Spot',
          performance: '+18% registration rate',
        },
      ],
    },
    socialPosts: [
      {
        platform: 'Instagram',
        variant: 'Variant A - Question Hook',
        content: 'Feeling stuck? 🤔\n\nJoin my FREE webinar this Thursday and discover:\n\n✨ Your unique life purpose\n✨ How to break limiting beliefs\n✨ Actionable steps to transform your life\n\n90 minutes that could change everything.\nLink in bio! 💜',
        imageDescription: 'Square 1080x1080: Coach in thoughtful pose with overlay text "What\'s Your Purpose?" Purple gradient background with inspirational imagery (sunrise, mountains). Professional branding.',
        dimensions: '1080x1080 (Square)',
        hashtags: '#LifeCoach #PersonalGrowth #Breakthrough #FindYourPurpose #Transformation',
      },
      {
        platform: 'Instagram',
        variant: 'Variant B - Testimonial Style',
        content: '"This webinar helped me finally see what I\'ve been meant to do all along" - Sarah M.\n\nJoin 500+ people who\'ve found clarity through my Breakthrough Session.\n\nFREE this Thursday 7PM EST 💫\n\nTap link in bio to register 👆',
        imageDescription: 'Square 1080x1080: Before/after style split screen. Left: Frustrated woman at desk. Right: Same woman confident and smiling. Overlay: 5-star rating and testimonial quote.',
        dimensions: '1080x1080 (Square)',
        hashtags: '#PersonalDevelopment #LifeCoaching #CareerChange #Success',
      },
      {
        platform: 'Facebook',
        variant: 'Event Style Post',
        content: '🎉 FREE WEBINAR: Discover Your Purpose in 90 Minutes\n\nThursday, [Date] at 7 PM EST\n\nIf you\'ve been feeling stuck or unfulfilled, this is for you.\n\nYou\'ll learn:\n✓ The #1 mistake people make when setting goals\n✓ My proven 3-step breakthrough framework\n✓ How to identify your core values\n✓ Action steps you can take immediately\n\nSpots are limited - register now!\n\n👉 [Registration link]',
        imageDescription: 'Landscape 1200x630: Event banner style. Coach headshot on left, key takeaways on right. Professional branding with purple/gold color scheme. "LIVE EVENT" badge.',
        dimensions: '1200x630 (Event Banner)',
      },
    ],
    email: {
      subject: '✨ Your free breakthrough session is confirmed! Here\'s what to expect',
      preview: 'Thursday at 7 PM EST - Prep checklist inside',
      body: 'Hi [Name]!\n\nI\'m so excited you\'re joining the Breakthrough Session this Thursday at 7 PM EST.\n\nHere\'s what we\'ll cover:\n\n✓ The #1 mistake people make when setting goals (and how to fix it)\n✓ My proven 3-step framework for finding your purpose\n✓ How to break free from limiting beliefs\n✓ Live Q&A where I\'ll answer YOUR questions\n\nPlease mark your calendar - this is going to be powerful!\n\nP.S. Bring a journal. You\'ll want to take notes! 📝',
      cta: 'Add to Calendar',
      imageDescription: 'Email header: Coach portrait with welcoming gesture. Body: Icon graphics for each agenda item (goal setting, framework, Q&A). Footer: Social proof - "Join 500+ Breakthrough Session Alumni".',
    },
    results: '287 registrations, 64% attendance rate, 23 discovery call bookings',
  },
  {
    id: 'financial-advisor-retirement',
    title: 'Free Retirement Planning Workshop',
    industry: 'Financial Services',
    tier: 'PulseCore',
    description: 'Workshop promotion with pre-qualification funnel',
    strategy: 'Target pre-retirees 55-70 with concerns about retirement savings. Professional, trustworthy tone. Navy blue conveys stability and trust.',
    thumbnail: 'financial-services',
    brandColors: {
      primary: '#1e3a8a',
      secondary: '#10b981',
      accent: '#e0f2fe',
    },
    landingPage: {
      headline: 'Are You on Track for the Retirement You Deserve?',
      subheadline: 'Free workshop: Discover the 5 critical mistakes that could derail your retirement plans',
      cta: 'Reserve Your Seat',
      benefits: [
        'Calculate your true retirement number',
        'Uncover hidden fees eating your savings',
        'Tax-efficient withdrawal strategies',
        'Social Security optimization blueprint',
      ],
      imageDescription: 'Hero: Happy retired couple on beach at sunset. Professional but aspirational. Secondary: Charts showing retirement growth trajectory, advisor consultation shots.',
    },
    socialPosts: [
      {
        platform: 'Facebook',
        variant: 'Value-Focused',
        content: '🚨 Retirement Reality Check 🚨\n\nThink you\'re on track? Many people discover they\'re 5-10 years behind where they should be.\n\nJoin our FREE workshop and learn:\n✓ How to calculate your TRUE retirement number\n✓ The 5 mistakes that derail retirement plans\n✓ Tax strategies that can save you $100K+\n\nLimited seats available!\n\n👉 Register now (link in comments)',
        imageDescription: 'Landscape 1200x630: Split image - worried couple looking at bills on left, same couple relaxed and smiling on right. "Before" and "After" labels. Professional, clean design.',
        dimensions: '1200x630',
      },
      {
        platform: 'LinkedIn',
        variant: 'Professional Authority',
        content: 'Hosting a complimentary retirement planning workshop for professionals approaching retirement.\n\nTopics:\n• Calculating your retirement income needs\n• Tax-efficient withdrawal strategies\n• Social Security optimization\n• Healthcare cost planning\n• Legacy and estate considerations\n\n25+ years experience. Fiduciary advisor. No sales pitch.\n\nSeats limited. DM to register.',
        imageDescription: 'Landscape 1200x627: Professional headshot of advisor with credentials. Clean office background. Subtle branding.',
        dimensions: '1200x627',
      },
    ],
    email: {
      subject: 'Your retirement workshop seat is confirmed + preparation checklist',
      preview: 'Here\'s what to bring on Tuesday...',
      body: 'Hi [Name],\n\nThank you for registering for the Retirement Planning Workshop this Tuesday at 6:30 PM.\n\nTo get the most value, please bring:\n✓ Recent retirement account statements\n✓ Social Security estimate (get at ssa.gov)\n✓ Questions about your specific situation\n\nWe\'ll cover the 5 critical retirement planning mistakes and create a personalized action plan.\n\nLooking forward to seeing you there!',
      cta: 'Add to Calendar',
      imageDescription: 'Email header: Professional workshop setting. Body: Checklist graphics with icons. Footer: Credentials and testimonials.',
    },
    results: '47 attendees, 18 follow-up consultations booked, $2.1M AUM acquired',
  },
  {
    id: 'oxygen-studio-creative-agency',
    title: 'Oxygen Studio - Creative Agency Launch',
    industry: 'Creative Agency',
    tier: 'PulseCommand',
    description: 'Full-service creative agency website showcasing UI/UX design, web development, branding, and digital marketing services',
    strategy: 'Target modern businesses seeking digital transformation. Emphasize strategic thinking, quality execution, and partnership approach. Clean, minimalist design with strong social proof.',
    thumbnail: 'creative-agency',
    liveUrl: 'https://oxygen-studio.webflow.io/',
    brandColors: {
      primary: '#0f172a',
      secondary: '#3b82f6',
      accent: '#f8fafc',
    },
    landingPage: {
      headline: 'Smart Designer / Smart Developer / Smart Branding',
      subheadline: 'We are a creative agency that blends strategy, design, and technology to deliver meaningful digital solutions',
      cta: 'Let\'s Contact',
      benefits: [
        'UI/UX Design - Crafting intuitive and pixel-perfect designs that engage users',
        'Web Development - Building responsive, high-performing websites that deliver',
        'Brand Identity - Creating unique brand identities that reflect your vision',
        'Digital Marketing - Designing strategies that drive engagement and growth',
      ],
      imageDescription: 'Hero: Modern abstract geometric shapes with gradient overlays. Clean typography. Secondary: Service icons with minimalist illustrations. Portfolio showcase grid with hover effects. Client logos section.',
      abVariants: [
        {
          headline: 'Your Strategic Growth Partner',
          subheadline: 'Transform your digital presence with award-winning design and development',
          cta: 'Start Your Project',
          performance: '+31% lead generation vs original',
        },
      ],
    },
    socialPosts: [
      {
        platform: 'Instagram',
        variant: 'Portfolio Showcase',
        content: '✨ Fresh off the design board ✨\n\nOur latest UI/UX project helped a SaaS company cut onboarding time in half.\n\nSwipe to see the before & after 👉\n\n💼 Ready to elevate your digital presence?\nDM us to discuss your project.',
        imageDescription: 'Square 1080x1080: Split-screen showing old vs new interface design. Left: cluttered old UI. Right: clean, modern redesign. Minimal color palette with blue accent. Professional mockup presentation.',
        dimensions: '1080x1080 (Square)',
        hashtags: '#UIUXDesign #WebDesign #DigitalAgency #CreativeStudio #DesignInspiration',
      },
      {
        platform: 'LinkedIn',
        variant: 'Case Study Highlight',
        content: '📊 Case Study: How strategic UX design reduced onboarding friction by 50%\n\nOur client was losing users during signup. Here\'s what we did:\n\n✓ Conducted user research & pain point analysis\n✓ Redesigned onboarding flow with progressive disclosure\n✓ Implemented real-time validation & helpful guidance\n✓ A/B tested 3 variants to find the winner\n\nResult: 50% faster onboarding, 23% increase in completion rate\n\nInterested in optimizing your product experience? Let\'s talk.',
        imageDescription: 'Landscape 1200x627: Professional case study layout with before/after metrics. Clean infographic showing user journey improvements. Branded color scheme with data visualization.',
        dimensions: '1200x627 (Professional)',
      },
      {
        platform: 'Facebook',
        variant: 'Service Highlight',
        content: '🎨 Looking for a creative partner who gets it?\n\nAt Oxygen Studio, we don\'t just design websites—we build digital experiences that:\n\n✓ Reflect your unique brand identity\n✓ Convert visitors into customers\n✓ Scale with your business growth\n✓ Stand out from the competition\n\nFrom startups to established brands, we\'ve helped 1200+ businesses transform their digital presence.\n\nReady to start your project? 👉 [Link in bio]',
        imageDescription: 'Landscape 1200x630: Collage of diverse project screenshots showing websites, mobile apps, and branding work. Modern, vibrant presentation with agency branding overlay.',
        dimensions: '1200x630 (Link Preview)',
      },
    ],
    email: {
      subject: 'Your free project consultation is confirmed - here\'s what to expect',
      preview: 'We\'re excited to discuss your vision...',
      body: 'Hi [Name],\n\nThank you for scheduling a consultation with Oxygen Studio!\n\nDuring our 30-minute call, we\'ll:\n\n✓ Discuss your business goals and challenges\n✓ Review your current digital presence\n✓ Explore design & development solutions\n✓ Provide initial recommendations\n✓ Answer all your questions\n\nTo make the most of our time, please prepare:\n• Examples of designs you love\n• Your target audience demographics\n• Key features or functionality you need\n• Timeline and budget expectations\n\nLooking forward to bringing your vision to life!\n\nThe Oxygen Studio Team',
      cta: 'Add to Calendar',
      imageDescription: 'Email header: Clean agency branding with geometric shapes. Body: Checklist items with custom icons. Portfolio preview thumbnails. Footer: Team photo and social links.',
    },
    results: '1,200+ satisfied clients, 4.9/5 average rating, 50% reduction in client onboarding time',
  },
];

export default function ShowcasePage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedContentType, setSelectedContentType] = useState<string>('All');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [carouselType, setCarouselType] = useState<'landing' | 'social' | 'email' | 'all'>('all');

  const industries = ['All', ...Array.from(new Set(campaigns.map((c) => c.industry)))];
  const tiers = ['All', ...Array.from(new Set(campaigns.map((c) => c.tier)))];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const industryMatch = selectedIndustry === 'All' || campaign.industry === selectedIndustry;
    const tierMatch = selectedTier === 'All' || campaign.tier === selectedTier;
    return industryMatch && tierMatch;
  });

  const openCampaignModal = (campaign: Campaign, type: 'landing' | 'social' | 'email' | 'all' = 'all') => {
    setSelectedCampaign(campaign);
    setCarouselType(type);
    setCarouselIndex(0);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
  };

  const nextSlide = () => {
    if (!selectedCampaign) return;
    const totalSlides = carouselType === 'social' ? selectedCampaign.socialPosts.length : 3;
    setCarouselIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (!selectedCampaign) return;
    const totalSlides = carouselType === 'social' ? selectedCampaign.socialPosts.length : 3;
    setCarouselIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <>
      <Script src="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />

      <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#ffffff', minHeight: '100vh' }}>
        {/* Fixed Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              padding: '0 32px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link href="/" style={{ textDecoration: 'none' }}>
              <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ height: '60px' }} />
            </Link>
            <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}>
                Home
              </Link>
              <Link href="/products" style={{ color: '#64748b', textDecoration: 'none', fontSize: '15px', fontWeight: 500, transition: 'color 0.2s' }}>
                Products
              </Link>
              <Link
                href="/showcase"
                style={{ color: '#2B4C7E', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}
              >
                Showcase
              </Link>
              <Link
                href="/get-started"
                style={{
                  background: 'linear-gradient(135deg, #2B4C7E 0%, #1a2f50 100%)',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(43, 76, 126, 0.3)',
                  transition: 'all 0.3s',
                }}
              >
                Get Started
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section with Stats */}
        <section
          style={{
            marginTop: '80px',
            padding: '120px 32px 80px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
          />

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(147, 197, 253, 0.15)',
                border: '2px solid rgba(147, 197, 253, 0.4)',
                borderRadius: '24px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#93c5fd',
                marginBottom: '32px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: '20px' }}>✨</span>
              <span>AI-GENERATED MARKETING CAMPAIGNS</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                color: '#ffffff',
                marginBottom: '24px',
                textAlign: 'center',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              See What's Possible
            </h1>

            <p
              style={{
                fontSize: '26px',
                lineHeight: 1.5,
                color: '#cbd5e1',
                marginBottom: '48px',
                textAlign: 'center',
                maxWidth: '900px',
                margin: '0 auto 48px',
              }}
            >
              Browse real marketing campaigns created with AI. Every campaign includes landing pages, social media posts, and email templates with unified branding.
            </p>

            {/* Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                marginTop: '56px',
              }}
            >
              {[
                { number: '500+', label: 'Campaigns Created', icon: '🎨' },
                { number: '50+', label: 'Industries Covered', icon: '🏢' },
                { number: '1,000+', label: 'Variations Generated', icon: '🔄' },
                { number: '95%', label: 'Client Satisfaction', icon: '⭐' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>{stat.icon}</div>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#ffffff',
                      marginBottom: '8px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {stat.number}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section
          style={{
            padding: '48px 32px',
            background: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            position: 'sticky',
            top: '80px',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Filters */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Industry Filter */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Industry
                  </label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      minWidth: '220px',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Tier Filter */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Product Tier
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      minWidth: '220px',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Type Filter */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#64748b',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Content Type
                  </label>
                  <select
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '2px solid #e2e8f0',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#0f172a',
                      cursor: 'pointer',
                      minWidth: '220px',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <option value="All">All Content</option>
                    <option value="Landing Pages">Landing Pages</option>
                    <option value="Social Posts">Social Posts</option>
                    <option value="Emails">Email Templates</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {filteredCampaigns.reduce((acc, c) => acc + c.socialPosts.length, 0)} total variations
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Masonry Gallery Grid */}
        <section style={{ padding: '80px 32px', background: '#ffffff' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '32px',
              }}
            >
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => openCampaignModal(campaign)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = campaign.brandColors.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Campaign Thumbnail */}
                  <div
                    style={{
                      height: '280px',
                      background: `linear-gradient(135deg, ${campaign.brandColors.primary} 0%, ${campaign.brandColors.primary}dd 50%, ${campaign.brandColors.secondary}44 100%)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Background Pattern */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
                      }}
                    />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                        {campaign.thumbnail === 'real-estate' ? '🏠' : campaign.thumbnail === 'life-coaching' ? '💫' : '💼'}
                      </div>
                      <h3
                        style={{
                          fontSize: '24px',
                          fontWeight: 800,
                          color: '#ffffff',
                          lineHeight: 1.3,
                          textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {campaign.title}
                      </h3>
                    </div>
                  </div>

                  {/* Campaign Info */}
                  <div style={{ padding: '24px' }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {campaign.industry}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2B4C7E',
                          background: 'rgba(43, 76, 126, 0.1)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {campaign.tier}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#10b981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                        }}
                      >
                        {campaign.socialPosts.length} variations
                      </span>
                      {campaign.liveUrl && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#f59e0b',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            animation: 'pulse 2s ease-in-out infinite',
                          }}
                        >
                          🌐 LIVE WEBSITE
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, marginBottom: '20px' }}>
                      {campaign.description}
                    </p>

                    {/* Quick Access Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCampaignModal(campaign, 'landing');
                        }}
                        style={{
                          padding: '10px',
                          background: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = campaign.brandColors.primary;
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = campaign.brandColors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        📄 Landing
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCampaignModal(campaign, 'social');
                        }}
                        style={{
                          padding: '10px',
                          background: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = campaign.brandColors.primary;
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = campaign.brandColors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        📱 Social
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCampaignModal(campaign, 'email');
                        }}
                        style={{
                          padding: '10px',
                          background: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = campaign.brandColors.primary;
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = campaign.brandColors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        ✉️ Email
                      </button>
                    </div>

                    {/* Results Badge */}
                    {campaign.results && (
                      <div
                        style={{
                          marginTop: '16px',
                          padding: '12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '10px',
                          border: '2px solid rgba(16, 185, 129, 0.2)',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          📊 Results
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#065f46' }}>{campaign.results}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full-Screen Modal with Carousel */}
        {selectedCampaign && (
          <div
            onClick={closeModal}
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
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                maxWidth: '1400px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 25px 100px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  fontSize: '28px',
                  cursor: 'pointer',
                  zIndex: 100,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 300,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>

              {/* Navigation Arrows */}
              {carouselType !== 'all' && (
                <>
                  <button
                    onClick={prevSlide}
                    style={{
                      position: 'absolute',
                      left: '24px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '56px',
                      height: '56px',
                      fontSize: '28px',
                      cursor: 'pointer',
                      zIndex: 100,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = selectedCampaign.brandColors.primary;
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextSlide}
                    style={{
                      position: 'absolute',
                      right: '24px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '56px',
                      height: '56px',
                      fontSize: '28px',
                      cursor: 'pointer',
                      zIndex: 100,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = selectedCampaign.brandColors.primary;
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Modal Content */}
              <div style={{ padding: '60px' }}>
                {/* Campaign Header */}
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                  <h2
                    style={{
                      fontSize: '42px',
                      fontWeight: 900,
                      color: selectedCampaign.brandColors.primary,
                      marginBottom: '16px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {selectedCampaign.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '8px 16px',
                        borderRadius: '10px',
                      }}
                    >
                      {selectedCampaign.industry}
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#2B4C7E',
                        background: 'rgba(43, 76, 126, 0.1)',
                        padding: '8px 16px',
                        borderRadius: '10px',
                      }}
                    >
                      {selectedCampaign.tier}
                    </span>
                  </div>

                  {/* Brand Colors */}
                  <div
                    style={{
                      display: 'inline-flex',
                      gap: '16px',
                      padding: '20px 32px',
                      background: '#f8fafc',
                      borderRadius: '16px',
                      border: '2px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: selectedCampaign.brandColors.primary,
                          border: '2px solid #e2e8f0',
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
                        {selectedCampaign.brandColors.primary}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: selectedCampaign.brandColors.secondary,
                          border: '2px solid #e2e8f0',
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
                        {selectedCampaign.brandColors.secondary}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: selectedCampaign.brandColors.accent,
                          border: '2px solid #e2e8f0',
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
                        {selectedCampaign.brandColors.accent}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carousel Content */}
                {carouselType === 'landing' && (
                  <div>
                    {selectedCampaign.liveUrl ? (
                      /* Show Live Website Preview */
                      <div>
                        <div
                          style={{
                            border: '3px solid #e2e8f0',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            position: 'relative',
                            minHeight: '600px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '60px',
                            textAlign: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🌐</div>
                            <h3 style={{ fontSize: '48px', fontWeight: 900, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
                              Live Website Preview
                            </h3>
                            <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '32px', lineHeight: 1.6 }}>
                              This is a real, live website created with our AI platform
                            </p>
                            <a
                              href={selectedCampaign.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '20px 48px',
                                background: '#ffffff',
                                color: '#667eea',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontSize: '20px',
                                fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                transition: 'transform 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              Open Live Website
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                              </svg>
                            </a>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: '24px',
                            padding: '24px',
                            background: '#f0f9ff',
                            borderRadius: '12px',
                            border: '2px solid #0ea5e9',
                          }}
                        >
                          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0369a1', marginBottom: '12px' }}>
                            💡 Why can't I see it embedded?
                          </div>
                          <div style={{ fontSize: '15px', color: '#0c4a6e', lineHeight: 1.8 }}>
                            This Webflow site uses security headers that prevent iframe embedding from localhost. Click the button above to view the full, interactive website in a new tab. You'll see all the animations, interactions, and functionality live!
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Show Landing Page Mockup */
                      <div>
                        <div
                          style={{
                            border: '3px solid #e2e8f0',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                          }}
                        >
                          <div
                            style={{
                              background: `linear-gradient(135deg, ${selectedCampaign.brandColors.primary} 0%, ${selectedCampaign.brandColors.primary}dd 100%)`,
                              padding: '80px 60px',
                              textAlign: 'center',
                              color: '#ffffff',
                            }}
                          >
                            <h3 style={{ fontSize: '52px', fontWeight: 900, lineHeight: 1.2, marginBottom: '20px' }}>
                              {selectedCampaign.landingPage.headline}
                            </h3>
                            <p style={{ fontSize: '24px', lineHeight: 1.6, marginBottom: '40px', opacity: 0.95 }}>
                              {selectedCampaign.landingPage.subheadline}
                            </p>
                            <button
                              style={{
                                background: selectedCampaign.brandColors.secondary,
                                color: selectedCampaign.brandColors.primary,
                                padding: '20px 60px',
                                borderRadius: '12px',
                                fontSize: '20px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                              }}
                            >
                              {selectedCampaign.landingPage.cta}
                            </button>
                          </div>

                          {/* Benefits */}
                          <div style={{ padding: '60px', background: selectedCampaign.brandColors.accent }}>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '20px',
                              }}
                            >
                              {selectedCampaign.landingPage.benefits.map((benefit, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '20px',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    border: `2px solid ${selectedCampaign.brandColors.secondary}`,
                                  }}
                                >
                                  <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke={selectedCampaign.brandColors.secondary}
                                    strokeWidth="3"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                  <span style={{ fontSize: '16px', color: selectedCampaign.brandColors.primary, fontWeight: 500 }}>
                                    {benefit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Image Description */}
                        <div
                          style={{
                            marginTop: '24px',
                            padding: '20px',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                            📸 Image Strategy:
                          </div>
                          <div style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7 }}>
                            {selectedCampaign.landingPage.imageDescription}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {carouselType === 'social' && (
                  <div>
                    {(() => {
                      const post = selectedCampaign.socialPosts[carouselIndex];
                      const isInstagram = post.platform === 'Instagram';
                      const isFacebook = post.platform === 'Facebook';
                      const isLinkedIn = post.platform === 'LinkedIn';

                      return (
                        <div>
                          {/* Social Post Preview */}
                          <div
                            style={{
                              border: '3px solid #e2e8f0',
                              borderRadius: '20px',
                              overflow: 'hidden',
                              background: '#ffffff',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                              maxWidth: '600px',
                              margin: '0 auto',
                            }}
                          >
                            {/* Post Header */}
                            <div
                              style={{
                                padding: '20px',
                                borderBottom: '2px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: isInstagram
                                  ? 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
                                  : isFacebook
                                  ? '#1877f2'
                                  : '#0a66c2',
                              }}
                            >
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '50%',
                                  background: selectedCampaign.brandColors.secondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '24px',
                                  fontWeight: 700,
                                  border: '3px solid #ffffff',
                                  color: selectedCampaign.brandColors.primary,
                                }}
                              >
                                {selectedCampaign.industry[0]}
                              </div>
                              <div>
                                <div style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff' }}>
                                  {selectedCampaign.title.split(' ')[0]}
                                </div>
                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                                  {post.platform} • {post.variant}
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div style={{ padding: '24px' }}>
                              <div
                                style={{
                                  fontSize: '15px',
                                  lineHeight: 1.7,
                                  color: '#0f172a',
                                  whiteSpace: 'pre-wrap',
                                  marginBottom: '20px',
                                }}
                              >
                                {post.content}
                              </div>
                              {post.hashtags && (
                                <div style={{ fontSize: '14px', color: '#2563eb', marginBottom: '20px' }}>
                                  {post.hashtags}
                                </div>
                              )}

                              {/* Image Placeholder */}
                              <div
                                style={{
                                  width: '100%',
                                  aspectRatio: isInstagram ? '1/1' : '1200/630',
                                  background: `linear-gradient(135deg, ${selectedCampaign.brandColors.accent} 0%, ${selectedCampaign.brandColors.accent}88 100%)`,
                                  borderRadius: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '40px',
                                  textAlign: 'center',
                                  border: `3px solid ${selectedCampaign.brandColors.secondary}`,
                                }}
                              >
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
                                <div
                                  style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: selectedCampaign.brandColors.primary,
                                    marginBottom: '12px',
                                  }}
                                >
                                  {post.dimensions}
                                </div>
                                <div
                                  style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {post.imageDescription}
                                </div>
                              </div>
                            </div>

                            {/* Engagement */}
                            <div
                              style={{
                                padding: '16px 24px',
                                borderTop: '2px solid #e2e8f0',
                                display: 'flex',
                                gap: '24px',
                                fontSize: '15px',
                                color: '#64748b',
                                fontWeight: 600,
                              }}
                            >
                              <span>❤️ 847</span>
                              <span>💬 43</span>
                              <span>🔄 128</span>
                            </div>
                          </div>

                          {/* Carousel Indicator */}
                          <div style={{ marginTop: '32px', textAlign: 'center' }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#64748b', marginBottom: '12px' }}>
                              Variation {carouselIndex + 1} of {selectedCampaign.socialPosts.length}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {selectedCampaign.socialPosts.map((_, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setCarouselIndex(idx)}
                                  style={{
                                    width: idx === carouselIndex ? '32px' : '12px',
                                    height: '12px',
                                    borderRadius: '6px',
                                    background: idx === carouselIndex ? selectedCampaign.brandColors.secondary : '#e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {carouselType === 'email' && (
                  <div>
                    {/* Email Preview */}
                    <div
                      style={{
                        border: '3px solid #e2e8f0',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        background: '#ffffff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        maxWidth: '700px',
                        margin: '0 auto',
                      }}
                    >
                      {/* Email Header */}
                      <div
                        style={{
                          padding: '24px',
                          background: '#f8fafc',
                          borderBottom: '2px solid #e2e8f0',
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
                          FROM: {selectedCampaign.title.split(' ')[0]} &lt;hello@business.com&gt;
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                          Subject:
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                          {selectedCampaign.email.subject}
                        </div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          <span style={{ fontWeight: 700 }}>Preview:</span> {selectedCampaign.email.preview}
                        </div>
                      </div>

                      {/* Email Body */}
                      <div style={{ padding: '48px' }}>
                        <div
                          style={{
                            fontSize: '16px',
                            lineHeight: 1.8,
                            color: '#0f172a',
                            whiteSpace: 'pre-wrap',
                            marginBottom: '40px',
                          }}
                        >
                          {selectedCampaign.email.body}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <button
                            style={{
                              background: selectedCampaign.brandColors.secondary,
                              color: selectedCampaign.brandColors.primary,
                              padding: '16px 48px',
                              borderRadius: '12px',
                              fontSize: '18px',
                              fontWeight: 700,
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            }}
                          >
                            {selectedCampaign.email.cta}
                          </button>
                        </div>
                      </div>

                      {/* Email Footer */}
                      <div
                        style={{
                          padding: '20px',
                          background: '#f8fafc',
                          borderTop: '2px solid #e2e8f0',
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#94a3b8',
                        }}
                      >
                        You\'re receiving this because you signed up at [Business Name]
                        <br />
                        <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>
                          Unsubscribe
                        </a>
                      </div>
                    </div>

                    {/* Image Description */}
                    <div
                      style={{
                        marginTop: '24px',
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        maxWidth: '700px',
                        margin: '24px auto 0',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                        📸 Email Images:
                      </div>
                      <div style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.7 }}>
                        {selectedCampaign.email.imageDescription}
                      </div>
                    </div>
                  </div>
                )}

                {carouselType === 'all' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <p style={{ fontSize: '18px', color: '#64748b', textAlign: 'center', lineHeight: 1.7 }}>
                      {selectedCampaign.description}
                    </p>
                    <p style={{ fontSize: '16px', color: '#64748b', textAlign: 'center', lineHeight: 1.7, fontStyle: 'italic' }}>
                      {selectedCampaign.strategy}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                      <button
                        onClick={() => setCarouselType('landing')}
                        style={{
                          padding: '24px',
                          background: `linear-gradient(135deg, ${selectedCampaign.brandColors.primary}, ${selectedCampaign.brandColors.primary}dd)`,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        📄<br />Landing Page
                      </button>
                      <button
                        onClick={() => setCarouselType('social')}
                        style={{
                          padding: '24px',
                          background: `linear-gradient(135deg, ${selectedCampaign.brandColors.primary}, ${selectedCampaign.brandColors.primary}dd)`,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        📱<br />Social Posts ({selectedCampaign.socialPosts.length})
                      </button>
                      <button
                        onClick={() => setCarouselType('email')}
                        style={{
                          padding: '24px',
                          background: `linear-gradient(135deg, ${selectedCampaign.brandColors.primary}, ${selectedCampaign.brandColors.primary}dd)`,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ✉️<br />Email Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Results */}
                {selectedCampaign.results && (
                  <div
                    style={{
                      marginTop: '40px',
                      padding: '32px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '16px',
                      border: '3px solid rgba(16, 185, 129, 0.3)',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#047857', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      📊 Campaign Results
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#065f46' }}>{selectedCampaign.results}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <section
          style={{
            padding: '120px 32px',
            background: 'linear-gradient(135deg, #2B4C7E 0%, #1a2f50 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.05,
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)`,
            }}
          />

          <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontSize: '56px',
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                marginBottom: '24px',
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Ready to Create Your Own Campaigns?
            </h2>
            <p style={{ fontSize: '24px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '48px' }}>
              Generate cohesive, professional campaigns with multiple variations in minutes. <br/>
              Landing pages, social posts, and emails—all with unified branding.
            </p>
            <Link
              href="/get-started"
              style={{
                background: '#ffffff',
                color: '#2B4C7E',
                padding: '22px 64px',
                borderRadius: '14px',
                textDecoration: 'none',
                fontSize: '20px',
                fontWeight: 800,
                display: 'inline-block',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
              }}
            >
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '80px 32px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ height: '64px', marginBottom: '40px', opacity: 0.9 }} />
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '40px',
                fontSize: '14px',
                color: '#94a3b8',
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

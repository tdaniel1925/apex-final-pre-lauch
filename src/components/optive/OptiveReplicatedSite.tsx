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

interface OptiveReplicatedSiteProps {
  distributor: Distributor;
}

export default function OptiveReplicatedSite({ distributor }: OptiveReplicatedSiteProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pricingToggle, setPricingToggle] = useState(false);
  const signupUrl = `/signup?ref=${distributor.slug}`;

  useEffect(() => {
    setMounted(true);
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

      <div className="optive-template-wrapper">
        {/* Preloader Start */}
        <div className="preloader" style={{ display: mounted ? 'none' : 'flex' }}>
          <div className="loading-container">
            <div className="loading"></div>
            <div id="loading-icon"><img src="/optive/images/loader.svg" alt="" /></div>
          </div>
        </div>
        {/* Preloader End */}

        {/* Header Start */}
        <header className="main-header">
          <div className="header-sticky">
            <nav className="navbar navbar-expand-lg">
              <div className="container">
                {/* Logo Start */}
                <a className="navbar-brand" href={`/optive/${distributor.slug}`}>
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
                <div className="collapse navbar-collapse main-menu" id="navbarNav">
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto" id="menu">
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}`}>Home</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#about`}>About</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#opportunity`}>Opportunity</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#process`}>Get Started</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#faq`}>FAQ</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#contact`}>Contact</a></li>
                    </ul>
                  </div>

                  {/* Header Btn Start */}
                  <div className="header-btn">
                    <a href={signupUrl} className="btn-default">Join My Team</a>
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
              backgroundColor: 'rgba(43, 76, 126, 0.7)',
              zIndex: 1
            }}></div>
          </div>
          {/* Video End */}

          <div className="container" style={{position: 'relative', zIndex: 2}}>
            <div className="row align-items-end">
              <div className="col-xl-8">
                {/* Hero Content Start */}
                <div className="hero-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">
                      Build Financial Freedom with {distributor.first_name} {distributor.last_name}
                    </span>
                    <h1 className="text-anime-style-3" data-cursor="-opaque">
                      Start Earning Day One. Build Insurance Wealth for Life.
                    </h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s" style={{color: '#fff', fontSize: '18px', marginTop: '20px', maxWidth: '600px'}}>
                      No license required to start. No upfront costs. Own your book. Build dual income streams with ancillary products and insurance sales.
                    </p>
                  </div>
                  {/* Section Title End */}
                </div>
                {/* Hero Content End */}
              </div>

              <div className="col-xl-4">
                {/* Hero Info Box Start */}
                <div className="hero-info-box wow fadeInUp" data-wow-delay="0.2s">
                  {/* Hero Info Image Box Start */}
                  <div className="hero-info-image-box">
                    {/* Hero Info Image Start */}
                    <div className="hero-info-image">
                      <figure>
                        <img src="/optive/images/hero-info-image.jpg" alt="" />
                      </figure>
                    </div>
                    {/* Hero Info Image End */}
                  </div>
                  {/* Hero Info Image Box End */}

                  {/* Hero Info Box Content Start */}
                  <div className="hero-info-box-content">
                    <h2>$0 to Start</h2>
                    <p>Begin earning immediately with ancillary products while you get licensed. Zero joining fees, zero monthly dues.</p>
                  </div>
                  {/* Hero Info Box Content End */}
                </div>
                {/* Hero Info Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Hero Section End */}


        {/* About US Section Start */}
        <div className="about-us">
          <div className="container">
            <div className="row section-row align-items-center">
              <div className="col-xl-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="about">About Apex Affinity Group</span>
                  <h2 className="text-effect" data-cursor="-opaque">We help aspiring insurance agents build wealth through <span className="about-us-title-img-1"><img src="/optive/images/author-2.jpg" alt="" /><img src="/optive/images/author-1.jpg" alt="" /><img src="/optive/images/author-3.jpg" alt="" /></span> proven systems, <span className="about-us-title-img-2"><img src="/optive/images/about-us-title-img-1.jpg" alt="" /></span> dual income streams, and team support</h2>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* About Counter List Start */}
                <div className="about-counter-item-list wow fadeInUp" data-wow-delay="0.2s">
                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Agents Onboarded Successfully</li>
                    </ul>
                    <h2><span className="counter">320</span>+</h2>
                    <p>Helping agents across the country achieve financial clarity and sustainable growth.</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Agent Retention Rate</li>
                    </ul>
                    <h2><span className="counter">98</span>%</h2>
                    <p>Our Agent Retention Rate highlights to building lasting relationships, ensuring</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Dollars in Commissions Paid</li>
                    </ul>
                    <h2>$<span className="counter">10</span>M+</h2>
                    <p>Over $10M in commissions paid to maximize growth & secure our agents.</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Expert Insurance Agents</li>
                    </ul>
                    <h2><span className="counter">100</span>+</h2>
                    <p>Our 100+ expert insurance agents guide you with precision.</p>
                  </div>
                  {/* About Counter Item End */}
                </div>
                {/* About Counter List End */}
              </div>

              <div className="col-lg-12">
                {/* Section Footer Text Start */}
                <div className="section-footer-text wow fadeInUp" data-wow-delay="0.4s">
                  <p>Join our team and help weave innovation, quality, and success together nationwide.</p>
                </div>
                {/* Section Footer Text End */}
              </div>
            </div>
          </div>
        </div>
        {/* About US Section End */}

        {/* Our Services Section Start */}
        <div id="services" className="our-services">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="opportunity">What You Get</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Everything You Need to Succeed</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">From day-one income opportunities to advanced CRM tools and team support, we provide the complete ecosystem for building your insurance business.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Service Items List Start */}
                <div className="service-items-list wow fadeInUp" data-wow-delay="0.4s">
                  {/* Service Item Start */}
                  <div className="service-item">
                    {/* Service Item Image Start */}
                    <div className="service-item-bg-shape">
                      <img src="/optive/images/service-item-bg-shape-1.png" alt="" />
                    </div>
                    {/* Service Item Image End */}

                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <img src="/optive/images/icon-service-item-1.svg" alt="" />
                    </div>
                    {/* Icon Box End */}

                    {/* Service Item Body Start */}
                    <div className="service-item-body">
                      {/* Service Item Content Start */}
                      <div className="service-item-content">
                        <h2><a href={signupUrl}>Ancillary Products</a></h2>
                        <p>Start earning immediately with telemedicine, roadside assistance, ID theft protection, and legal services - no license required.</p>
                      </div>
                      {/* Service Item Content End */}

                      {/* Service Item Button Start */}
                      <div className="service-item-btn">
                        <a href={signupUrl} className="readmore-btn">Get Started</a>
                      </div>
                      {/* Service Item Button End */}
                    </div>
                    {/* Service Item Body End */}
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item">
                    {/* Service Item Image Start */}
                    <div className="service-item-bg-shape">
                      <img src="/optive/images/service-item-bg-shape-2.png" alt="" />
                    </div>
                    {/* Service Item Image End */}

                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <img src="/optive/images/icon-service-item-2.svg" alt="" />
                    </div>
                    {/* Icon Box End */}

                    {/* Service Item Body Start */}
                    <div className="service-item-body">
                      {/* Service Item Content Start */}
                      <div className="service-item-content">
                        <h2><a href={signupUrl}>Insurance Sales</a></h2>
                        <p>Build generational wealth selling life, health, and Medicare insurance. Keep 100% ownership of your book of business.</p>
                      </div>
                      {/* Service Item Content End */}

                      {/* Service Item Button Start */}
                      <div className="service-item-btn">
                        <a href={signupUrl} className="readmore-btn">Get Started</a>
                      </div>
                      {/* Service Item Button End */}
                    </div>
                    {/* Service Item Body End */}
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item">
                    {/* Service Item Image Start */}
                    <div className="service-item-bg-shape">
                      <img src="/optive/images/service-item-bg-shape-3.png" alt="" />
                    </div>
                    {/* Service Item Image End */}

                    {/* Icon Box Start */}
                    <div className="icon-box">
                      <img src="/optive/images/icon-service-item-3.svg" alt="" />
                    </div>
                    {/* Icon Box End */}

                    {/* Service Item Body Start */}
                    <div className="service-item-body">
                      {/* Service Item Content Start */}
                      <div className="service-item-content">
                        <h2><a href={signupUrl}>Team Building</a></h2>
                        <p>Build passive income by developing a team. Earn override commissions and team development bonuses on your organization's production.</p>
                      </div>
                      {/* Service Item Content End */}

                      {/* Service Item Button Start */}
                      <div className="service-item-btn">
                        <a href={signupUrl} className="readmore-btn">Get Started</a>
                      </div>
                      {/* Service Item Button End */}
                    </div>
                    {/* Service Item Body End */}
                  </div>
                  {/* Service Item End */}

                  {/* Service CTA Box Start */}
                  <div className="service-cta-box">
                    {/* Service CTA Image Start */}
                    <div className="service-cta-image">
                      <figure>
                        <img src="/optive/images/service-cta-image.jpg" alt="" />
                      </figure>
                    </div>
                    {/* Service CTA Image End */}

                    {/* Service CTA Body Start */}
                    <div className="service-cta-body">
                      <div className="service-cta-content">
                        <h3>Ready to Get Started?</h3>
                        <p>Connect with {distributor.first_name} today and start building your financial future with Apex Affinity Group.</p>
                      </div>
                      <div className="service-cta-contact-list">
                        {distributor.phone && <p>Call: <a href={`tel:${distributor.phone}`}>{distributor.phone}</a></p>}
                        <p>Email: <a href={`mailto:${distributor.email}`}>{distributor.email}</a></p>
                      </div>
                    </div>
                    {/* Service CTA Body End */}
                  </div>
                  {/* Service CTA Box End */}
                </div>
                {/* Service Items List End */}
              </div>

              <div className="col-lg-12">
                {/* Section Footer Text Start */}
                <div className="section-footer-text wow fadeInUp" data-wow-delay="0.4s">
                  <p><span>Free</span>Let's make something great work together - <a href={signupUrl}>View all services.</a></p>
                </div>
                {/* Section Footer Text End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Services Section End */}

        {/* Why Choose Us Section Start */}
        <div className="why-choose-us">
          <div className="container">
            <div className="row">
              <div className="col-xl-6">
                {/* Why Choose Us Image Box Start */}
                <div className="why-choose-us-image-box">
                  {/* Why Choose Us Image Start */}
                  <div className="why-choose-us-image">
                    <figure className="image-anime reveal">
                      <img src="/optive/images/why-choose-us-image.jpg" alt="" />
                    </figure>
                  </div>
                  {/* Why Choose Us Image End */}

                  {/* Why Choose Growth Box Start */}
                  <div className="why-choose-growth-box">
                    {/* Why Choose Growth Box Header Start */}
                    <div className="why-choose-growth-box-header">
                      <div className="icon-box">
                        <img src="/optive/images/icon-why-choose-growth-box.svg" alt="" />
                      </div>
                      <div className="why-choose-growth-box-counter">
                        <p>+<span>0,54</span>%</p>
                      </div>
                    </div>
                    {/* Why Choose Growth Box Header End */}

                    {/* Why Choose Growth Box Body Start */}
                    <div className="why-choose-growth-box-body">
                      <div className="why-choose-growth-box-content">
                        <p>Total Growth</p>
                        <h2><span className="counter">96.567</span></h2>
                      </div>
                      <div className="why-choose-growth-box-image">
                        <img src="/optive/images/why-choose-growth-box-image.svg" alt="" />
                      </div>
                    </div>
                    {/* Why Choose Growth Box Body End */}
                  </div>
                  {/* Why Choose Growth Box End */}
                </div>
                {/* Why Choose Us Image Box End */}
              </div>

              <div className="col-xl-6">
                {/* Why Choose Us Content Start */}
                <div className="why-choose-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">Why Choose Apex</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">A Proven System Built for Your Success</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Unlike traditional agencies, Apex gives you complete ownership of your business, dual income streams from day one, and a team that genuinely wants you to win. We've removed every barrier to entry so you can start building wealth immediately.</p>
                  </div>
                  {/* Section Title End */}

                  {/* Why Choose Body Start */}
                  <div className="why-choose-body wow fadeInUp" data-wow-delay="0.4s">
                    {/* Why Choose Us Item Start */}
                    <div className="why-choose-body-item">
                      <div className="icon-box">
                        <img src="/optive/images/icon-why-choose-body-item-1.svg" alt="" />
                      </div>
                      <div className="why-choose-body-item-content">
                        <h3>Zero Risk Entry</h3>
                        <p>No upfront costs, no monthly fees, no hidden charges. Start earning before you invest a single dollar.</p>
                      </div>
                    </div>
                    {/* Why Choose Us Item End */}

                    {/* Why Choose Us Item Start */}
                    <div className="why-choose-body-item">
                      <div className="icon-box">
                        <img src="/optive/images/icon-why-choose-body-item-2.svg" alt="" />
                      </div>
                      <div className="why-choose-body-item-content">
                        <h3>True Book Ownership</h3>
                        <p>Keep 100% ownership of your client relationships. Build equity that becomes generational wealth.</p>
                      </div>
                    </div>
                    {/* Why Choose Us Item End */}
                  </div>
                  {/* Why Choose Body End */}

                  {/* Why Choose List Start */}
                  <div className="why-choose-list wow fadeInUp" data-wow-delay="0.6s">
                    <ul>
                      <li>Start earning immediately with ancillary products</li>
                      <li>AI-powered CRM with automated lead nurturing</li>
                      <li>Proven training system with weekly live support</li>
                      <li>Team building bonuses and passive income</li>
                    </ul>
                  </div>
                  {/* Why Choose List End */}

                  {/* Why Choose Button Start */}
                  <div className="why-choose-btn wow fadeInUp" data-wow-delay="0.8s">
                    <a href={signupUrl} className="btn-default">Join {distributor.first_name}'s Team</a>
                  </div>
                  {/* Why Choose Button End */}
                </div>
                {/* Why Choose Us Content End */}
              </div>

              <div className="col-lg-12">
                {/* Section Footer Text Start */}
                <div className="section-footer-text wow fadeInUp" data-wow-delay="0.2s">
                  <p>Join our team and help weave innovation, quality, and success together nationwide.</p>
                  <ul>
                    <li><span className="counter">4.9</span>/5</li>
                    <li>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </li>
                    <li>Our 4200 Review</li>
                  </ul>
                </div>
                {/* Section Footer Text End */}
              </div>
            </div>
          </div>
        </div>
        {/* Why Choose Us Section End */}

        {/* Our Story Section Start */}
        <div className="our-story dark-section">
          {/* Video Start */}
          <div className="our-story-bg-video">
            <video autoPlay muted loop id="storyvideo">
              <source src="/videos/flag-waving.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Video End */}

          <div className="container">
            <div className="row">
              <div className="col-xl-6">
                {/* Our Story Content Start */}
                <div className="our-story-content">
                  {/* Our Story Content Header Start */}
                  <div className="our-story-content-header">
                    {/* Section Title Start */}
                    <div className="section-title">
                      <span className="section-sub-title wow fadeInUp">Our Mission</span>
                      <h2 className="text-anime-style-3" data-cursor="-opaque">Democratizing Insurance Wealth for Everyone</h2>
                      <p className="wow fadeInUp" data-wow-delay="0.2s">Apex Affinity Group was founded on a simple belief: building wealth through insurance shouldn't require massive upfront investment or surrendering ownership of your business. We've created a system where anyone with drive and determination can build a thriving insurance business with zero barriers to entry.</p>
                    </div>
                    {/* Section Title End */}
                  </div>
                  {/* Our Story Content Header End */}

                  {/* Our Story Content Body Start */}
                  <div className="our-story-content-body wow fadeInUp" data-wow-delay="0.6s">
                    <h3>" We believe every agent deserves to own their book, earn from day one, and build generational wealth. That's not just our philosophy—it's our guarantee.</h3>
                  </div>
                  {/* Our Story Content Body End */}
                </div>
                {/* Our Story Content End */}
              </div>

              <div className="col-xl-6">
                {/* Our Story History Box Start */}
                <div className="our-story-history-box">
                  {/* Story History Box Header Start */}
                  <div className="story-history-box-header wow fadeInUp">
                    {/* Satisfy Client Images Start */}
                    <div className="satisfy-client-images">
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-1.jpg" alt="" />
                        </figure>
                      </div>
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-2.jpg" alt="" />
                        </figure>
                      </div>
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-3.jpg" alt="" />
                        </figure>
                      </div>
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-4.jpg" alt="" />
                        </figure>
                      </div>
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-5.jpg" alt="" />
                        </figure>
                      </div>
                    </div>
                    {/* Satisfy Client Images End */}

                    {/* Story History Box Header Content Start */}
                    <div className="story-history-box-header-content">
                      <h3><span className="counter">320</span>+ Successful Agents</h3>
                      <p>Our growing network of successful agents represents thousands of families protected and millions in commissions earned while building true book ownership.</p>
                    </div>
                    {/* Story History Box Header Content End */}
                  </div>
                  {/* Story History Box Header End */}

                  {/* Story Counter Items List Start */}
                  <div className="story-counter-items-list wow fadeInUp" data-wow-delay="0.2s">
                    {/* Story Counter Item Start */}
                    <div className="story-counter-item">
                      <div className="story-counter-item-header">
                        <h2><span className="counter">50</span></h2>
                        <h3>States Covered</h3>
                      </div>
                      <div className="story-counter-item-content">
                        <p>Nationwide presence with agents in all 50 states.</p>
                      </div>
                    </div>
                    {/* Story Counter Item End */}

                    {/* Story Counter Item Start */}
                    <div className="story-counter-item">
                      <div className="story-counter-item-header">
                        <h2><span className="counter">98</span>%</h2>
                        <h3>Agent Retention Rate</h3>
                      </div>
                      <div className="story-counter-item-content">
                        <p>Agents stay because they own their business and earn real income.</p>
                      </div>
                    </div>
                    {/* Story Counter Item End */}
                  </div>
                  {/* Story Counter Items List End */}
                </div>
                {/* Our Story History Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Story Section End */}

        {/* Our Process Section Start */}
        <div className="our-process">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="process">Get Started Today</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Three Simple Steps to Financial Freedom</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Getting started with Apex is incredibly simple. No complex paperwork, no waiting periods, no barriers. Follow these three steps and you could be earning within days.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Process Steps Item List Start */}
                <div className="process-steps-item-list">
                  {/* Process Step Item Start */}
                  <div className="process-step-item box-1 wow fadeInUp">
                    {/* Process Step Item Header Start */}
                    <div className="process-step-item-header">
                      <div className="process-step-item-no">
                        <h2>01.</h2>
                      </div>
                      <div className="process-step-item-image">
                        <figure>
                          <img src="/optive/images/process-step-item-image-1.jpg" alt="" />
                        </figure>
                      </div>
                    </div>
                    {/* Process Step Item Header End */}

                    {/* Process Step Item Content Start */}
                    <div className="process-step-item-content">
                      <h3>Sign Up & Get Onboarded</h3>
                      <p>Complete your free registration and attend our comprehensive onboarding session.</p>
                      <ul>
                        <li>Zero cost to join, no credit card required</li>
                        <li>Immediate access to our AI-powered CRM</li>
                      </ul>
                    </div>
                    {/* Process Step Item Content End */}
                  </div>
                  {/* Process Step Item End */}

                  {/* Process Step Item Start */}
                  <div className="process-step-item box-2 wow fadeInUp" data-wow-delay="0.2s">
                    {/* Process Step Item Header Start */}
                    <div className="process-step-item-header">
                      <div className="process-step-item-no">
                        <h2>02.</h2>
                      </div>
                      <div className="process-step-item-image">
                        <figure>
                          <img src="/optive/images/process-step-item-image-2.jpg" alt="" />
                        </figure>
                      </div>
                    </div>
                    {/* Process Step Item Header End */}

                    {/* Process Step Item Content Start */}
                    <div className="process-step-item-content">
                      <h3>Start Earning Immediately</h3>
                      <p>Begin selling ancillary products right away while pursuing your insurance license.</p>
                      <ul>
                        <li>Earn commissions on day one with ancillary products</li>
                        <li>We guide you through licensing at your own pace</li>
                      </ul>
                    </div>
                    {/* Process Step Item Content End */}
                  </div>
                  {/* Process Step Item End */}

                  {/* Process Step Item Start */}
                  <div className="process-step-item box-3 wow fadeInUp" data-wow-delay="0.4s">
                    {/* Process Step Item Header Start */}
                    <div className="process-step-item-header">
                      <div className="process-step-item-no">
                        <h2>03.</h2>
                      </div>
                      <div className="process-step-item-image">
                        <figure>
                          <img src="/optive/images/process-step-item-image-3.jpg" alt="" />
                        </figure>
                      </div>
                    </div>
                    {/* Process Step Item Header End */}

                    {/* Process Step Item Content Start */}
                    <div className="process-step-item-content">
                      <h3>Scale Your Business</h3>
                      <p>Build your client base, get licensed, and optionally develop a team for passive income.</p>
                      <ul>
                        <li>100% ownership of your growing book of business</li>
                        <li>Team building bonuses as you help others succeed</li>
                      </ul>
                    </div>
                    {/* Process Step Item Content End */}
                  </div>
                  {/* Process Step Item End */}
                </div>
                {/* Process Steps Item List End */}
              </div>

              <div className="col-lg-12">
                {/* Our Process Footer Start */}
                <div className="our-process-footer wow fadeInUp" data-wow-delay="0.4s">
                  {/* Our Process Footer List Start */}
                  <div className="our-process-footer-list">
                    <ul>
                      <li>Life Insurance</li>
                      <li>Health Insurance</li>
                      <li>Medicare Advantage</li>
                      <li>Ancillary Products</li>
                    </ul>
                  </div>
                  {/* Our Process Footer List End */}

                  {/* Section Footer Text Start */}
                  <div className="section-footer-text section-satisfy-img">
                    {/* Satisfy Client Images Start */}
                    <div className="satisfy-client-images">
                      <div className="satisfy-client-image">
                        <figure className="image-anime">
                          <img src="/optive/images/author-1.jpg" alt="" />
                        </figure>
                      </div>
                      <div className="satisfy-client-image add-more">
                        <img src="/optive/images/icon-phone-white.svg" alt="" />
                      </div>
                    </div>
                    {/* Satisfy Client Images End */}
                    <p>Ready to take control of your financial future? <a href={signupUrl}>Join {distributor.first_name}'s Team Now</a></p>
                  </div>
                  {/* Section Footer Text End */}
                </div>
                {/* Our Process Footer End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Process Section End */}

        {/* Our Case Studies Section Start */}
        <div className="our-case-study">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">Success Stories</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Real Agents, Real Results</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Meet agents who transformed their financial future with Apex. From zero to six-figure earners, these stories prove our system works for anyone willing to put in the effort.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Case Study Slider Start */}
                <div className="case-study-slider wow fadeInUp">
                  <div className="swiper">
                    <div className="swiper-wrapper" data-cursor-text="Drag">
                      {/* Case Study Slide Start */}
                      <div className="swiper-slide">
                        {/* Case Study Item Start */}
                        <div className="case-study-item">
                          {/* Case Study Item Image Start */}
                          <div className="case-study-item-image">
                            <a href={signupUrl} data-cursor-text="View">
                              <figure>
                                <img src="/optive/images/case-study-image-1.jpg" alt="" />
                              </figure>
                            </a>
                          </div>
                          {/* Case Study Item Image End */}

                          {/* Case Study Item Btn Start */}
                          <div className="case-study-item-btn">
                            <a href={signupUrl}><img src="/optive/images/arrow-white.svg" alt="" /></a>
                          </div>
                          {/* Case Study Item Btn End */}

                          {/* Case Study Item Content Start */}
                          <div className="case-study-item-content">
                            <ul>
                              <li><a href="#">New Agent Success</a></li>
                            </ul>
                            <h2><a href={signupUrl}>From Teacher to Six-Figure Earner</a></h2>
                          </div>
                          {/* Case Study Item Content End */}
                        </div>
                        {/* Case Study Item End */}
                      </div>
                      {/* Case Study Slide End */}

                      {/* Case Study Slide Start */}
                      <div className="swiper-slide">
                        {/* Case Study Item Start */}
                        <div className="case-study-item">
                          {/* Case Study Item Image Start */}
                          <div className="case-study-item-image">
                            <a href={signupUrl} data-cursor-text="View">
                              <figure>
                                <img src="/optive/images/case-study-image-2.jpg" alt="" />
                              </figure>
                            </a>
                          </div>
                          {/* Case Study Item Image End */}

                          {/* Case Study Item Btn Start */}
                          <div className="case-study-item-btn">
                            <a href={signupUrl}><img src="/optive/images/arrow-white.svg" alt="" /></a>
                          </div>
                          {/* Case Study Item Btn End */}

                          {/* Case Study Item Content Start */}
                          <div className="case-study-item-content">
                            <ul>
                              <li><a href="#">Team Building</a></li>
                            </ul>
                            <h2><a href={signupUrl}>Building Passive Income Through Teams</a></h2>
                          </div>
                          {/* Case Study Item Content End */}
                        </div>
                        {/* Case Study Item End */}
                      </div>
                      {/* Case Study Slide End */}

                      {/* Case Study Slide Start */}
                      <div className="swiper-slide">
                        {/* Case Study Item Start */}
                        <div className="case-study-item">
                          {/* Case Study Item Image Start */}
                          <div className="case-study-item-image">
                            <a href={signupUrl} data-cursor-text="View">
                              <figure>
                                <img src="/optive/images/case-study-image-3.jpg" alt="" />
                              </figure>
                            </a>
                          </div>
                          {/* Case Study Item Image End */}

                          {/* Case Study Item Btn Start */}
                          <div className="case-study-item-btn">
                            <a href={signupUrl}><img src="/optive/images/arrow-white.svg" alt="" /></a>
                          </div>
                          {/* Case Study Item Btn End */}

                          {/* Case Study Item Content Start */}
                          <div className="case-study-item-content">
                            <ul>
                              <li><a href="#">Medicare Specialist</a></li>
                            </ul>
                            <h2><a href={signupUrl}>Medicare Made Simple & Profitable</a></h2>
                          </div>
                          {/* Case Study Item Content End */}
                        </div>
                        {/* Case Study Item End */}
                      </div>
                      {/* Case Study Slide End */}

                      {/* Case Study Slide Start */}
                      <div className="swiper-slide">
                        {/* Case Study Item Start */}
                        <div className="case-study-item">
                          {/* Case Study Item Image Start */}
                          <div className="case-study-item-image">
                            <a href={signupUrl} data-cursor-text="View">
                              <figure>
                                <img src="/optive/images/case-study-image-4.jpg" alt="" />
                              </figure>
                            </a>
                          </div>
                          {/* Case Study Item Image End */}

                          {/* Case Study Item Btn Start */}
                          <div className="case-study-item-btn">
                            <a href={signupUrl}><img src="/optive/images/arrow-white.svg" alt="" /></a>
                          </div>
                          {/* Case Study Item Btn End */}

                          {/* Case Study Item Content Start */}
                          <div className="case-study-item-content">
                            <ul>
                              <li><a href="#">Part-Time Success</a></li>
                            </ul>
                            <h2><a href={signupUrl}>Part-Time Hours, Full-Time Income</a></h2>
                          </div>
                          {/* Case Study Item Content End */}
                        </div>
                        {/* Case Study Item End */}
                      </div>
                      {/* Case Study Slide End */}

                      {/* Case Study Slide Start */}
                      <div className="swiper-slide">
                        {/* Case Study Item Start */}
                        <div className="case-study-item">
                          {/* Case Study Item Image Start */}
                          <div className="case-study-item-image">
                            <a href={signupUrl} data-cursor-text="View">
                              <figure>
                                <img src="/optive/images/case-study-image-5.jpg" alt="" />
                              </figure>
                            </a>
                          </div>
                          {/* Case Study Item Image End */}

                          {/* Case Study Item Btn Start */}
                          <div className="case-study-item-btn">
                            <a href={signupUrl}><img src="/optive/images/arrow-white.svg" alt="" /></a>
                          </div>
                          {/* Case Study Item Btn End */}

                          {/* Case Study Item Content Start */}
                          <div className="case-study-item-content">
                            <ul>
                              <li><a href="#">Life Insurance Expert</a></li>
                            </ul>
                            <h2><a href={signupUrl}>Building Generational Wealth with Life Insurance</a></h2>
                          </div>
                          {/* Case Study Item Content End */}
                        </div>
                        {/* Case Study Item End */}
                      </div>
                      {/* Case Study Slide End */}
                    </div>
                  </div>
                </div>
                {/* Case Study Slider End */}
              </div>

              <div className="col-lg-12">
                {/* Section Footer Text Start */}
                <div className="section-footer-text section-satisfy-img wow fadeInUp" data-wow-delay="0.2s">
                  {/* Satisfy Client Images Start */}
                  <div className="satisfy-client-images">
                    <div className="satisfy-client-image">
                      <figure className="image-anime">
                        <img src="/optive/images/author-1.jpg" alt="" />
                      </figure>
                    </div>
                    <div className="satisfy-client-image add-more">
                      <img src="/optive/images/icon-phone-white.svg" alt="" />
                    </div>
                  </div>
                  {/* Satisfy Client Images End */}
                  <p>Your success story starts here. <a href={signupUrl}>Join {distributor.first_name}'s Team Today</a></p>
                </div>
                {/* Section Footer Text End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Case Studies Section End */}

        {/* Our Pricing Section Start */}
        <div className="our-pricing">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">Income Opportunities</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Multiple Ways to Build Wealth</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Apex offers three distinct revenue streams, allowing you to build immediate income, long-term residual commissions, and passive team bonuses. Choose your path or combine all three for maximum earning potential.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Our Pricing Box Start */}
                <div className="our-pricing-box wow fadeInUp" data-wow-delay="0.4s">
                  {/* Income Streams Display - No Toggle Needed */}
                  <div className="pricing-tab-item" id="income-streams" style={{ display: 'block' }}>
                    <div className="row">
                      <div className="col-xl-4 col-md-6">
                        {/* Pricing Item Start */}
                        <div className="pricing-item">
                          {/* Icon Box Start */}
                          <div className="icon-box">
                            <img src="/optive/images/icon-pricing-1.svg" alt="" />
                          </div>
                          {/* Icon Box End */}

                          {/* Pricing Item Content Start */}
                          <div className="pricing-item-content">
                            <h2>Ancillary Products</h2>
                            <p>Start earning immediately, no insurance license required</p>
                            <h3>Day 1<sub>Income</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>Products Include:</h3>
                            <ul>
                              <li>Telemedicine Services</li>
                              <li>Roadside Assistance</li>
                              <li>ID Theft Protection</li>
                              <li>Legal Services</li>
                            </ul>
                          </div>
                          {/* Pricing Item List End */}

                          {/* Pricing Item Button Start */}
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">Start Earning Now</a>
                          </div>
                          {/* Pricing Item Button End */}
                        </div>
                        {/* Pricing Item End */}
                      </div>

                      <div className="col-xl-4 col-md-6">
                        {/* Pricing Item Start */}
                        <div className="pricing-item">
                          {/* Icon Box Start */}
                          <div className="icon-box">
                            <img src="/optive/images/icon-pricing-2.svg" alt="" />
                          </div>
                          {/* Icon Box End */}

                          {/* Pricing Item Content Start */}
                          <div className="pricing-item-content">
                            <h2>Insurance Sales</h2>
                            <p>Build generational wealth with 100% book ownership</p>
                            <h3>Unlimited<sub>Potential</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>What You Sell:</h3>
                            <ul>
                              <li>Life Insurance (Term & Whole Life)</li>
                              <li>Health Insurance (ACA & Private)</li>
                              <li>Medicare Advantage & Supplements</li>
                              <li>Annuities & Retirement Planning</li>
                            </ul>
                          </div>
                          {/* Pricing Item List End */}

                          {/* Pricing Item Button Start */}
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">Build Your Book</a>
                          </div>
                          {/* Pricing Item Button End */}
                        </div>
                        {/* Pricing Item End */}
                      </div>

                      <div className="col-xl-4 col-md-6">
                        {/* Pricing Item Start */}
                        <div className="pricing-item">
                          {/* Icon Box Start */}
                          <div className="icon-box">
                            <img src="/optive/images/icon-pricing-3.svg" alt="" />
                          </div>
                          {/* Icon Box End */}

                          {/* Pricing Item Content Start */}
                          <div className="pricing-item-content">
                            <h2>Team Building</h2>
                            <p>Earn passive income by helping others succeed</p>
                            <h3>Residual<sub>Income</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>Team Benefits:</h3>
                            <ul>
                              <li>Override Commissions on Team Sales</li>
                              <li>Team Development Bonuses</li>
                              <li>Leadership & Mentorship Rewards</li>
                              <li>Passive Income Streams</li>
                            </ul>
                          </div>
                          {/* Pricing Item List End */}

                          {/* Pricing Item Button Start */}
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">Build Your Team</a>
                          </div>
                          {/* Pricing Item Button End */}
                        </div>
                        {/* Pricing Item End */}
                      </div>
                    </div>
                  </div>
                  {/* Income Streams Display End */}

                  {/* Pricing Benefits List Start */}
                  <div className="pricing-benefit-list wow fadeInUp" data-wow-delay="0.2s">
                    <ul>
                      <li><img src="/optive/images/icon-pricing-benefit-1.svg" alt="" />$0 to join, no monthly fees</li>
                      <li><img src="/optive/images/icon-pricing-benefit-2.svg" alt="" />100% book ownership guaranteed</li>
                      <li><img src="/optive/images/icon-pricing-benefit-3.svg" alt="" />Earn from day one with ancillaries</li>
                    </ul>
                  </div>
                  {/* Pricing Benefits List End */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Our Pricing Section End */}

        {/* Our Expert Solutions Section Start */}
        <div className="our-expert-solution">
          {/* Our Expert Solutions Box Start */}
          <div className="our-expert-solution-box dark-section">
            <div className="container">
              <div className="row section-row">
                <div className="col-lg-12">
                  {/* Section Title Start */}
                  <div className="section-title section-title-center">
                    <span className="section-sub-title wow fadeInUp">Our Expert Solutions</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">Industry we Work With</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">We provide tailored financial advisory and business consulting solutions to a wide range of industries. By understanding the unique challenges.</p>
                  </div>
                  {/* Section Title End */}
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  {/* Expert Solutions Content Box Start */}
                  <div className="expert-solution-content-box">
                    {/* Expert Solutions List Start */}
                    <div className="expert-solution-list wow fadeInUp">
                      <ul>
                        <li>Financial Planning</li>
                        <li>Digital Marketing</li>
                        <li>Startup Advisory</li>
                        <li>Retail & E-commerce</li>
                        <li>Business Strategy</li>
                        <li>Growth Consulting</li>
                        <li>Financial Services</li>
                        <li>Supply Chain Management</li>
                        <li>Renewable Resources</li>
                      </ul>
                    </div>
                    {/* Expert Solutions List End */}

                    {/* Section Footer Text Start */}
                    <div className="section-footer-text section-satisfy-img wow fadeInUp" data-wow-delay="0.2s">
                      {/* Satisfy Client Images Start */}
                      <div className="satisfy-client-images">
                        <div className="satisfy-client-image">
                          <figure className="image-anime">
                            <img src="/optive/images/author-1.jpg" alt="" />
                          </figure>
                        </div>
                        <div className="satisfy-client-image add-more">
                          <img src="/optive/images/icon-phone-white.svg" alt="" />
                        </div>
                      </div>
                      {/* Satisfy Client Images End */}
                      <p>Let's make something great work together. - <a href={signupUrl}>Get Free Quote</a></p>
                    </div>
                    {/* Section Footer Text End */}
                  </div>
                  {/* Expert Solutions Content Box End */}
                </div>
              </div>
            </div>
          </div>
          {/* Our Expert Solutions Box End */}

          {/* Our Expert Solutions CTA Section Start */}
          <div id="contact" className="expert-solution-cta-section">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  {/* Expert Solutions CTA Box Start */}
                  <div className="expert-solution-cta-box">
                    {/* Expert Solutions CTA Image Start */}
                    <div className="expert-solution-cta-image">
                      <figure>
                        <img src="/optive/images/expert-solution-cta-image.png" alt="" />
                      </figure>
                    </div>
                    {/* Expert Solutions CTA Image End */}

                    {/* Expert Solutions CTA Content Start */}
                    <div className="expert-solution-cta-content">
                      {/* Expert Solutions Contact Item List Start */}
                      <div className="expert-solution-contact-item-list wow fadeInUp">
                        {/* Expert Solutions Contact Item Start */}
                        <div className="expert-solution-contact-item">
                          <h3>Our Location</h3>
                          <p>{distributor.company_name || `${distributor.first_name}'s Office`}</p>
                        </div>
                        {/* Expert Solutions Contact Item End */}

                        {/* Expert Solutions Contact Item Start */}
                        <div className="expert-solution-contact-item">
                          <h3>Contact Information</h3>
                          {distributor.phone && <p>Call Us: <a href={`tel:${distributor.phone}`}>{distributor.phone}</a></p>}
                          <p>Email At: <a href={`mailto:${distributor.email}`}>{distributor.email}</a></p>
                        </div>
                        {/* Expert Solutions Contact Item End */}
                      </div>
                      {/* Expert Solutions Contact Item List End */}

                      {/* Expert Solutions CTA Info Start */}
                      <div className="expert-solution-cta-info wow fadeInUp" data-wow-delay="0.2s">
                        <h3>Connect With {distributor.first_name}'s Expert Team</h3>
                        <p>Get in touch with our experienced insurance advisors and business consultants to discuss your goals and challenges. We're here to provide clear guidance, practical solutions and strategic support.</p>
                        <ul>
                          <li>Speak directly with our business.</li>
                          <li>Case studies & success stories.</li>
                          <li>Industry focused consulting layout.</li>
                          <li>Google Maps & location support.</li>
                        </ul>
                      </div>
                      {/* Expert Solutions CTA Info End */}
                    </div>
                    {/* Expert Solutions CTA Content End */}
                  </div>
                  {/* Expert Solutions CTA Box End */}
                </div>
              </div>
            </div>
          </div>
          {/* Our Expert Solutions CTA Section End */}
        </div>
        {/* Our Expert Solutions Section End */}

        {/* Our Faqs Section Start */}
        <div className="our-faqs">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="faq">Frequently Asked Questions</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Everything You Need to Know</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We believe in complete transparency. Here are honest answers to the most common questions about joining Apex Affinity Group and building your insurance business.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-xl-6">
                {/* FAQ Accordion Start */}
                <div className="faq-accordion" id="accordion">
                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp">
                    <h2 className="accordion-header" id="heading1">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                        Q1. Is there really no cost to join Apex?
                      </button>
                    </h2>
                    <div id="collapse1" className="accordion-collapse collapse" role="region" aria-labelledby="heading1" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>Absolutely zero. No joining fees, no monthly dues, no hidden costs. You can sign up today and start earning immediately with ancillary products before investing a single dollar. We only succeed when you succeed.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.2s">
                    <h2 className="accordion-header" id="heading2">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                        Q2. Do I need an insurance license to get started?
                      </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse" role="region" aria-labelledby="heading2" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>No! You can start earning immediately with our ancillary products (telemedicine, roadside assistance, ID theft protection, legal services) with no license required. We'll support you through the licensing process at your own pace when you're ready to sell insurance.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.4s">
                    <h2 className="accordion-header" id="heading3">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                        Q3. What does "100% book ownership" mean?
                      </button>
                    </h2>
                    <div id="collapse3" className="accordion-collapse collapse show" role="region" aria-labelledby="heading3" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>Unlike traditional agencies, you retain complete ownership of all client relationships and policies you write. If you ever leave Apex, your book comes with you. You're building equity in your own business, not someone else's. This is generational wealth, not just a paycheck.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.6s">
                    <h2 className="accordion-header" id="heading4">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                        Q4. How much can I realistically earn?
                      </button>
                    </h2>
                    <div id="collapse4" className="accordion-collapse collapse" role="region" aria-labelledby="heading4" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>Your income potential is truly unlimited. Our top agents earn six figures annually, but your results depend on your effort and dedication. Most new agents earn $2,000-$5,000/month within their first 90 days with ancillary products alone. Once licensed, insurance sales can add $5,000-$15,000+ monthly.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.8s">
                    <h2 className="accordion-header" id="heading5">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                        Q5. What training and support do you provide?
                      </button>
                    </h2>
                    <div id="collapse5" className="accordion-collapse collapse" role="region" aria-labelledby="heading5" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>We provide comprehensive onboarding, weekly live training calls, one-on-one mentorship, an AI-powered CRM with automated lead nurturing, product training for all insurance types, sales scripts and presentations, and ongoing support from {distributor.first_name} and the entire Apex team.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="1s">
                    <h2 className="accordion-header" id="heading6">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6" aria-expanded="false" aria-controls="collapse6">
                        Q6. Can I do this part-time?
                      </button>
                    </h2>
                    <div id="collapse6" className="accordion-collapse collapse" role="region" aria-labelledby="heading6" data-bs-parent="#accordion">
                      <div className="accordion-body">
                        <p>Absolutely! Many of our successful agents started part-time while keeping their day jobs. You control your schedule completely. Some agents work evenings and weekends, building their business until it replaces their full-time income. There's no minimum hour requirement.</p>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}
                </div>
                {/* FAQ Accordion End */}
              </div>

              <div className="col-xl-6">
                {/* Faq Image Box Start */}
                <div className="faq-image-box">
                  {/* Faq Image Start */}
                  <div className="faq-image">
                    <figure className="image-anime reveal">
                      <img src="/optive/images/faq-image.jpg" alt="" />
                    </figure>
                  </div>
                  {/* Faq Image End */}

                  {/* FAQ CTA Box Start */}
                  <div className="faq-cta-box">
                    {/* FAQ CTA Image Box Start */}
                    <div className="faq-cta-box-image">
                      {/* FAQ CTA Image Start */}
                      <div className="faq-cta-image">
                        <figure>
                          <img src="/optive/images/faq-cta-box-image.jpg" alt="" />
                        </figure>
                      </div>
                      {/* FAQ CTA Image End */}
                    </div>
                    {/* FAQ CTA Image Box End */}

                    {/* FAQ CTA Box Content Start */}
                    <div className="faq-cta-box-content">
                      <h3>"The best time to start building wealth was yesterday. The second best time is today."</h3>
                    </div>
                    {/* FAQ CTA Box Content End */}
                  </div>
                  {/* FAQ CTA Box End */}
                </div>
                {/* Faq Image Box End */}
              </div>

              <div className="col-xl-12">
                {/* FAQ Company Slider Start */}
                <div className="faq-company-slider-box wow fadeInUp" data-wow-delay="0.2s">
                  {/* FAQ Company Content Start */}
                  <div className="faq-company-content">
                    <hr />
                    <h3>Trusted By Leading Businesses Nationwide</h3>
                    <hr />
                  </div>
                  {/* FAQ Company Content End */}

                  {/* FAQ Company Slider Start */}
                  <div className="faq-company-slider">
                    <div className="swiper">
                      <div className="swiper-wrapper">
                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-1.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-2.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-3.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-4.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-1.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-2.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-3.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}

                        {/* Company Support Logo Start */}
                        <div className="swiper-slide">
                          <div className="faq-company-logo">
                            <img src="/optive/images/company-supports-logo-4.svg" alt="" />
                          </div>
                        </div>
                        {/* FAQ Company Logo End */}
                      </div>
                    </div>
                  </div>
                  {/* FAQ Company Slider End */}
                </div>
                {/* FAQ Company Slider End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Faqs Section End */}

        {/* Our Testimonials Section Start*/}
        <div className="our-testimonials">
          {/* Video Start */}
          <div className="our-testimonial-bg-video">
            <video autoPlay muted loop id="testimonialsvideo">
              <source src="/videos/flag-waving.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Video End */}
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                {/* Testimonial Slider Box Start */}
                <div className="testimonial-slider-box">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">Agent Testimonials</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">Hear From Successful Apex Agents</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Don't just take our word for it. These are real agents who transformed their financial future by joining Apex Affinity Group and taking control of their income.</p>
                  </div>
                  {/* Section Title End */}

                  {/* Testimonial Slider Start */}
                  <div className="testimonial-slider wow fadeInUp">
                    <div className="swiper">
                      <div className="swiper-wrapper" data-cursor-text="Drag">
                        {/* Testimonial Slide Start */}
                        <div className="swiper-slide">
                          {/* Testimonial Item Start */}
                          <div className="testimonial-item">
                            {/* Testimonial Item Rating Start */}
                            <div className="testimonial-item-rating">
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                            </div>
                            {/* Testimonial Item Rating End */}

                            {/* Testimonial Item Content Start */}
                            <div className="testimonial-item-content">
                              <p>" I was skeptical about the zero-cost entry, but Apex delivered on every promise. I started earning with ancillary products within my first week and got licensed within 60 days. I now own my book and earn more in a month than I made in a quarter at my old job."</p>
                            </div>
                            {/* Testimonial Item Content End */}

                            {/* Testimonial Item Author Start */}
                            <div className="testimonial-item-author">
                              <div className="testimonial-author-image">
                                <figure>
                                  <img src="/optive/images/author-1.jpg" alt="" />
                                </figure>
                              </div>
                              <div className="testimonial-author-content">
                                <h2>Michael Rodriguez</h2>
                                <p>Former Teacher, Now Licensed Agent</p>
                              </div>
                            </div>
                            {/* Testimonial Item Author End */}
                          </div>
                          {/* Testimonial Item End */}
                        </div>
                        {/* Testimonial Slide End */}

                        {/* Testimonial Slide Start */}
                        <div className="swiper-slide">
                          {/* Testimonial Item Start */}
                          <div className="testimonial-item">
                            {/* Testimonial Item Rating Start */}
                            <div className="testimonial-item-rating">
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                              <i className="fa-solid fa-star"></i>
                            </div>
                            {/* Testimonial Item Rating End */}

                            {/* Testimonial Item Content Start */}
                            <div className="testimonial-item-content">
                              <p>" What sets Apex apart is true book ownership. I'm not building someone else's business—I'm building mine. The AI CRM handles follow-ups automatically, the training is world-class, and {distributor.first_name}'s team actually cares about my success. Best career decision I ever made."</p>
                            </div>
                            {/* Testimonial Item Content End */}

                            {/* Testimonial Item Author Start */}
                            <div className="testimonial-item-author">
                              <div className="testimonial-author-image">
                                <figure>
                                  <img src="/optive/images/author-2.jpg" alt="" />
                                </figure>
                              </div>
                              <div className="testimonial-author-content">
                                <h2>Jennifer Chen</h2>
                                <p>Part-Time Agent, Full-Time Mom</p>
                              </div>
                            </div>
                            {/* Testimonial Item Author End */}
                          </div>
                          {/* Testimonial Item End */}
                        </div>
                        {/* Testimonial Slide End */}
                      </div>
                    </div>
                  </div>
                  {/* Testimonial Slider End */}
                </div>
                {/* Testimonial Slider Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Testimonials Section End*/}

        {/* Our Blog Section Start */}
        <div className="our-blog">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">Latest Insights</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Insurance Industry News & Tips</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Stay informed about the insurance industry, learn proven sales strategies, and discover opportunities to grow your business. Knowledge is power in building your insurance career.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-xl-4 col-md-6">
                {/* Post Item Start */}
                <div className="post-item wow fadeInUp">
                  {/* Post Featured Image Start*/}
                  <div className="post-featured-image">
                    <a href={signupUrl} data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/optive/images/post-1.jpg" alt="" />
                      </figure>
                    </a>
                    <div className="post-item-tags">
                      <a href={signupUrl}>Insurance Trends</a>
                    </div>
                  </div>
                  {/* Post Featured Image End */}

                  {/* Post Item Body Start */}
                  <div className="post-item-body">
                    <div className="post-item-content">
                      <h2><a href={signupUrl}>Why 2026 is the Perfect Time to Join the Insurance Industry</a></h2>
                    </div>
                    <div className="post-item-btn">
                      <a href={signupUrl} className="readmore-btn">Read More</a>
                    </div>
                  </div>
                  {/* Post Item Body End */}
                </div>
                {/* Post Item End */}
              </div>

              <div className="col-xl-4 col-md-6">
                {/* Post Item Start */}
                <div className="post-item wow fadeInUp" data-wow-delay="0.2s">
                  {/* Post Featured Image Start*/}
                  <div className="post-featured-image">
                    <a href={signupUrl} data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/optive/images/post-2.jpg" alt="" />
                      </figure>
                    </a>
                    <div className="post-item-tags">
                      <a href={signupUrl}>Sales Strategies</a>
                    </div>
                  </div>
                  {/* Post Featured Image End */}

                  {/* Post Item Body Start */}
                  <div className="post-item-body">
                    <div className="post-item-content">
                      <h2><a href={signupUrl}>5 Proven Strategies for Closing More Life Insurance Sales</a></h2>
                    </div>
                    <div className="post-item-btn">
                      <a href={signupUrl} className="readmore-btn">Read More</a>
                    </div>
                  </div>
                  {/* Post Item Body End */}
                </div>
                {/* Post Item End */}
              </div>

              <div className="col-xl-4 col-md-6">
                {/* Post Item Start */}
                <div className="post-item wow fadeInUp" data-wow-delay="0.4s">
                  {/* Post Featured Image Start*/}
                  <div className="post-featured-image">
                    <a href={signupUrl} data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/optive/images/post-3.jpg" alt="" />
                      </figure>
                    </a>
                    <div className="post-item-tags">
                      <a href={signupUrl}>Medicare</a>
                    </div>
                  </div>
                  {/* Post Featured Image End */}

                  {/* Post Item Body Start */}
                  <div className="post-item-body">
                    <div className="post-item-content">
                      <h2><a href={signupUrl}>Medicare Advantage: The Untapped Gold Mine for New Agents</a></h2>
                    </div>
                    <div className="post-item-btn">
                      <a href={signupUrl} className="readmore-btn">Read More</a>
                    </div>
                  </div>
                  {/* Post Item Body End */}
                </div>
                {/* Post Item End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Blog Section End */}

        {/* Main Footer End */}
        <footer className="main-footer dark-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                {/* About Footer Start */}
                <div className="about-footer">
                  {/* Footer Logo Start */}
                  <div className="footer-logo">
                    <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{height: '60px'}} />
                  </div>
                  {/* Footer Logo End */}

                  {/* About Footer Content Start */}
                  <div className="about-footer-content">
                    <p>Apex Affinity Group empowers aspiring insurance agents to build generational wealth through true book ownership, dual income streams, and a proven support system. Join {distributor.first_name}'s team today and start your journey to financial freedom.</p>
                  </div>
                  {/* About Footer Content End */}
                </div>
                {/* About Footer Box End */}
              </div>

              <div className="col-xl-5">
                {/* Footer Newsletter Box Start */}
                <div className="footer-newsletter-box">
                  {/* Footer Newsletter Title Start */}
                  <div className="footer-newsletter-title">
                    <h2>Stay Connected</h2>
                    <p>Get exclusive insurance sales tips, industry news, and success strategies delivered to your inbox.</p>
                  </div>

                  {/* Footer Newsletter Form Start */}
                  <div className="footer-newsletter-form">
                    <form id="newslettersForm" action="#" method="POST">
                      <div className="form-group">
                        <input type="email" name="mail" className="form-control" id="mail" placeholder="Email Address *" required />
                        <button type="submit" className="btn-default btn-highlighted">Subscribe Now</button>
                      </div>
                    </form>
                  </div>
                  {/* Footer Newsletter Form End */}

                  {/* Footer Social Links Start */}
                  <div className="footer-social-links">
                    <h3>Follow Us On Socials:</h3>
                    <ul>
                      <li><a href="#"><i className="fa-brands fa-instagram"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-facebook-f"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-dribbble"></i></a></li>
                      <li><a href="#"><i className="fa-brands fa-linkedin-in"></i></a></li>
                    </ul>
                  </div>
                  {/* Footer Social Links End */}
                </div>
                {/* Footer Newsletter Box End */}
              </div>

              <div className="col-xl-7">
                {/* Footer Links Box Start */}
                <div className="footer-links-box">
                  {/* Footer Links End */}
                  <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                      <li><a href={`/optive/${distributor.slug}`}>Home</a></li>
                      <li><a href={`/optive/${distributor.slug}#about`}>About</a></li>
                      <li><a href={`/optive/${distributor.slug}#services`}>Services</a></li>
                      <li><a href={signupUrl}>Join Now</a></li>
                      <li><a href={`/optive/${distributor.slug}#contact`}>Contact</a></li>
                    </ul>
                  </div>
                  {/* Footer Links End */}

                  {/* Footer Links End */}
                  <div className="footer-links">
                    <h3>What We Offer</h3>
                    <ul>
                      <li><a href={signupUrl}>Ancillary Products</a></li>
                      <li><a href={signupUrl}>Life Insurance</a></li>
                      <li><a href={signupUrl}>Health Insurance</a></li>
                      <li><a href={signupUrl}>Medicare Solutions</a></li>
                      <li><a href={signupUrl}>Team Building</a></li>
                    </ul>
                  </div>
                  {/* Footer Links End */}

                  {/* Footer Links Start */}
                  <div className="footer-links footer-contact-list">
                    <h3>Contact Information</h3>
                    <ul>
                      <li><img src="/optive/images/icon-mail-white.svg" alt="" /><a href={`mailto:${distributor.email}`}>{distributor.email}</a></li>
                      {distributor.phone && <li><img src="/optive/images/icon-phone-white.svg" alt="" /><a href={`tel:${distributor.phone}`}>{distributor.phone}</a></li>}
                      <li><img src="/optive/images/icon-location-white.svg" alt="" />{distributor.company_name || `${distributor.first_name}'s Office`}</li>
                    </ul>
                  </div>
                  {/* Footer Links End */}
                </div>
                {/* Footer Links Box End */}
              </div>

              <div className="col-xl-12">
                {/* About Footer Box Start */}
                <div className="footer-copyright">
                  {/* Footer Copyright Text Start */}
                  <div className="footer-copyright-text">
                    <p>Copyright © {new Date().getFullYear()} All Rights Reserved.</p>
                  </div>
                  {/* Footer Copyright Text End */}

                  {/* Footer Privacy Policy Start */}
                  <div className="footer-privacy-policy">
                    <ul>
                      <li><a href="#">Terms & Conditions</a></li>
                      <li><a href="#">Privacy Policy</a></li>
                    </ul>
                  </div>
                  {/* Footer Privacy Policy End */}
                </div>
                {/* About Footer Box End */}
              </div>

              <div className="col-lg-12">
                {/* Footer Site Name Start */}
                <div className="footer-site-name">
                  <h2>Apex Affinity Group</h2>
                </div>
                {/* Footer Site Name End */}
              </div>
            </div>
          </div>
        </footer>
        {/* Main Footer End */}
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
      <Script src="/optive/js/magiccursor.js" strategy="afterInteractive" />
      <Script src="/optive/js/function.js" strategy="afterInteractive" />
    </>
  );
}

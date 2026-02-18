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

      {/* Force FAQ Text Visibility */}
      <style dangerouslySetInnerHTML={{__html: `
        .faq-accordion .accordion-collapse > div {
          background-color: white !important;
          color: black !important;
          padding: 20px !important;
        }
        .faq-accordion .accordion-collapse > div > div {
          color: black !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        .faq-accordion .accordion-collapse.show > div {
          background-color: white !important;
        }
        .faq-accordion .accordion-collapse.show > div > div {
          color: #000000 !important;
        }
      `}} />

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
                <div className="navbar-collapse main-menu" id="navbarNav" style={{display: 'flex'}}>
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto" id="menu">
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}`}>Home</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#about`}>About</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#newcomers`}>Newcomers & Licensed</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#mission`}>Mission</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#income`}>Income Opportunities</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#faq`}>FAQs</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#contact`}>Contact</a></li>
                    </ul>
                  </div>

                  {/* Header Btn Start */}
                  <div className="header-btn">
                    <a href={signupUrl} className="btn-default" style={{background: '#2B4C7E', backgroundColor: '#2B4C7E', backgroundImage: 'none', borderColor: '#2B4C7E'}}>Join My Team</a>
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
              backgroundColor: 'rgba(4, 33, 77, 0.7)',
              zIndex: 1
            }}></div>
          </div>
          {/* Video End */}

          <div className="container" style={{position: 'relative', zIndex: 2}}>
            <div className="row align-items-start">
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
                <div className="hero-info-box wow fadeInUp" data-wow-delay="0.2s" style={{border: '5px solid #ffffff', padding: '0'}}>
                  {/* Hero Info Image Box Start */}
                  <div className="hero-info-image-box">
                    {/* Hero Info Image Start */}
                    <div className="hero-info-image">
                      <figure>
                        {/* Show distributor photo if available, otherwise Apex logo */}
                        <img
                          src={distributor.profile_photo_url || '/apex-logo-full.png'}
                          alt={`${distributor.first_name} ${distributor.last_name}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            borderRadius: distributor.profile_photo_url ? '0' : '0'
                          }}
                        />
                      </figure>
                    </div>
                    {/* Hero Info Image End */}
                  </div>
                  {/* Hero Info Image Box End */}

                  {/* Hero Info Box Content Start */}
                  <div className="hero-info-box-content">
                    <h2 style={{textTransform: 'capitalize'}}>{distributor.first_name} {distributor.last_name}</h2>
                    <div style={{marginTop: '10px'}}>
                      {distributor.phone && (
                        <p style={{margin: '5px 0'}}>
                          <i className="fa-solid fa-phone" style={{marginRight: '8px', color: '#ffffff'}}></i>
                          <a href={`tel:${distributor.phone}`} style={{color: '#ffffff', textDecoration: 'none'}}>
                            {distributor.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                          </a>
                        </p>
                      )}
                      {distributor.email && (
                        <p style={{margin: '5px 0'}}>
                          <i className="fa-solid fa-envelope" style={{marginRight: '8px', color: '#ffffff'}}></i>
                          <a href={`mailto:${distributor.email}`} style={{color: '#ffffff', textDecoration: 'none'}}>
                            {distributor.email}
                          </a>
                        </p>
                      )}
                    </div>
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
                      <li>Annual Industry Premiums</li>
                    </ul>
                    <h2>$<span className="counter">700</span>B+</h2>
                    <p>The U.S. life insurance industry represents over $700 billion in annual premiums nationwide.</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Americans Underinsured</li>
                    </ul>
                    <h2><span className="counter">50</span>%+</h2>
                    <p>Over half of Americans lack adequate life insurance coverage, creating opportunity to help families.</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Income Potential</li>
                    </ul>
                    <h2>6-Figure</h2>
                    <p>Top life insurance agents regularly earn six-figure incomes with unlimited commission potential.</p>
                  </div>
                  {/* About Counter Item End */}

                  {/* About Counter Item Start */}
                  <div className="about-counter-item">
                    <ul>
                      <li>Career Flexibility</li>
                    </ul>
                    <h2>100% Remote</h2>
                    <p>Build your insurance business from anywhere with complete location independence and flexibility.</p>
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

        {/* Dual Audience Comparison Section Start */}
        <div className="our-pricing" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="newcomers">Find Your Path</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Whether You're Brand New or Already Licensed</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Apex Affinity Group provides the perfect opportunity for everyone. Start earning immediately as a beginner, or maximize your potential as a licensed professional. Both paths lead to financial freedom.</p>
                </div>
                {/* Section Title End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Comparison Cards Box Start */}
                <div className="our-pricing-box wow fadeInUp" data-wow-delay="0.4s">
                  <div className="pricing-tab-item" style={{ display: 'block' }}>
                    <div className="row">
                      {/* NEW TO INSURANCE CARD */}
                      <div className="col-xl-6 col-md-6">
                        <div className="pricing-item" style={{border: '3px solid #2B4C7E'}}>
                          {/* Icon Box Start */}
                          <div className="icon-box">
                            <i className="fa-solid fa-graduation-cap" style={{fontSize: '48px', color: '#2B4C7E'}}></i>
                          </div>
                          {/* Icon Box End */}

                          {/* Pricing Item Content Start */}
                          <div className="pricing-item-content">
                            <h2>New to Insurance</h2>
                            <p>Perfect for beginners ready to build wealth</p>
                            <h3>Start <sub>Day 1</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>What You Get:</h3>
                            <ul>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> No License Required to Start</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Earn Immediately with Ancillary Products</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Free Training & Licensing Support</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> AI-Powered CRM & Lead Tools</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> 1-on-1 Mentorship from {distributor.first_name}</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Path to Full Insurance Sales</li>
                            </ul>
                          </div>
                          {/* Pricing Item List End */}

                          {/* Pricing Item Button Start */}
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">Start Your Journey</a>
                          </div>
                          {/* Pricing Item Button End */}
                        </div>
                      </div>

                      {/* LICENSED AGENTS CARD */}
                      <div className="col-xl-6 col-md-6">
                        <div className="pricing-item pricing-item-popular" style={{border: '3px solid #2B4C7E', position: 'relative'}}>
                          {/* Popular Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '20px',
                            background: '#28a745',
                            color: '#fff',
                            padding: '5px 20px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>SCALE FASTER</div>

                          {/* Icon Box Start */}
                          <div className="icon-box">
                            <i className="fa-solid fa-briefcase" style={{fontSize: '48px', color: '#2B4C7E'}}></i>
                          </div>
                          {/* Icon Box End */}

                          {/* Pricing Item Content Start */}
                          <div className="pricing-item-content">
                            <h2>Licensed Agents</h2>
                            <p>Maximize earnings with premium contracts</p>
                            <h3>Unlimited <sub>Potential</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>What You Get:</h3>
                            <ul>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> 100% Ownership of Your Book</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Higher Commission Contracts</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Advanced Sales Training</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Lead Generation System</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Team Building Opportunities</li>
                              <li><i className="fa-solid fa-check" style={{color: '#28a745'}}></i> Multiple Carrier Appointments</li>
                            </ul>
                          </div>
                          {/* Pricing Item List End */}

                          {/* Pricing Item Button Start */}
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">Join {distributor.first_name}'s Team</a>
                          </div>
                          {/* Pricing Item Button End */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shared Benefits List Start */}
                  <div className="pricing-benefit-list wow fadeInUp" data-wow-delay="0.2s" style={{marginTop: '40px'}}>
                    <h3 style={{textAlign: 'center', marginBottom: '20px', color: '#2B4C7E', fontSize: '24px'}}>Everyone Gets These Benefits:</h3>
                    <ul style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px'}}>
                      <li><img src="/optive/images/icon-pricing-benefit-1.svg" alt="" />$0 to join, no monthly fees</li>
                      <li><img src="/optive/images/icon-pricing-benefit-2.svg" alt="" />AI-powered CRM included free</li>
                      <li><img src="/optive/images/icon-pricing-benefit-3.svg" alt="" />Full training & support</li>
                      <li><img src="/optive/images/icon-pricing-benefit-1.svg" alt="" />Team development bonuses</li>
                    </ul>
                  </div>
                  {/* Shared Benefits List End */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Dual Audience Comparison Section End */}

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
                      <span className="section-sub-title wow fadeInUp" id="mission">Our Mission</span>
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
                  <div className="story-history-box-header wow fadeInUp" style={{alignItems: 'flex-start'}}>
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
                    <div className="story-history-box-header-content" style={{marginTop: 0, paddingTop: 0}}>
                      <h3>Building Financial Freedom</h3>
                      <p>Life insurance careers offer the opportunity to help families protect their future while building your own financial independence with true book ownership and unlimited earning potential.</p>
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

            </div>
          </div>
        </div>
        {/* Our Process Section End */}

        {/* Our Pricing Section Start */}
        <div className="our-pricing" style={{paddingTop: '40px'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="income">Income Opportunities</span>
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
                            <h3>Day 1 <sub>Income</sub></h3>
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
                            <h3>Unlimited <sub>Potential</sub></h3>
                          </div>
                          {/* Pricing Item Content End */}

                          {/* Pricing Item List Start */}
                          <div className="pricing-item-list">
                            <h3>What You Sell:</h3>
                            <ul>
                              <li>Term Life Insurance</li>
                              <li>Whole Life Insurance</li>
                              <li>Final Expense Insurance</li>
                              <li>Indexed Universal Life (IUL)</li>
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
                            <h3>Residual <sub>Income</sub></h3>
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
          <div className="our-expert-solution-box dark-section" style={{paddingTop: '60px', paddingBottom: '60px'}}>
            <div className="container">
              <div className="row section-row" style={{marginBottom: 0}}>
                <div className="col-lg-12">
                  {/* Section Title Start */}
                  <div className="section-title section-title-center" style={{marginBottom: 0}}>
                    <span className="section-sub-title wow fadeInUp">Your Path to Success</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">Technology Meets Opportunity</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Success in the life insurance business today requires more than hard work—it demands smart tools and real opportunity. With cutting-edge AI-powered CRM technology automating your follow-ups, lead nurturing, and client management, you can focus on what matters: building relationships and closing sales. Combined with true book ownership, dual income streams from day one, and comprehensive training, you have everything needed to build a sustainable, profitable insurance business on your own terms.</p>
                  </div>
                  {/* Section Title End */}
                </div>
              </div>
            </div>
          </div>
          {/* Our Expert Solutions Box End */}
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
              <div className="col-xl-12">
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Absolutely zero. No joining fees, no monthly dues, no hidden costs. You can sign up today and start earning immediately with ancillary products before investing a single dollar. We only succeed when you succeed.</div>
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>No! You can start earning immediately with our ancillary products (telemedicine, roadside assistance, ID theft protection, legal services) with no license required. We'll support you through the licensing process at your own pace when you're ready to sell insurance.</div>
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Unlike traditional agencies, you retain complete ownership of all client relationships and policies you write. If you ever leave Apex, your book comes with you. You're building equity in your own business, not someone else's. This is generational wealth, not just a paycheck.</div>
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Your income potential is truly unlimited. Our top agents earn six figures annually, but your results depend on your effort and dedication. Most new agents earn $2,000-$5,000/month within their first 90 days with ancillary products alone. Once licensed, insurance sales can add $5,000-$15,000+ monthly.</div>
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>We provide comprehensive onboarding, weekly live training calls, one-on-one mentorship, an AI-powered CRM with automated lead nurturing, product training for all insurance types, sales scripts and presentations, and ongoing support from {distributor.first_name} and the entire Apex team.</div>
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
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Absolutely! Many of our successful agents started part-time while keeping their day jobs. You control your schedule completely. Some agents work evenings and weekends, building their business until it replaces their full-time income. There's no minimum hour requirement.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}
                </div>
                {/* FAQ Accordion End */}
              </div>

            </div>
          </div>
        </div>
        {/* Our Faqs Section End */}

        {/* Main Footer End */}
        <footer className="main-footer dark-section" id="contact" style={{paddingTop: '50px'}}>
          <div className="container">
            <div className="row align-items-start" style={{paddingTop: '0px', paddingBottom: '40px'}}>

              {/* Column 1: Corporate Address */}
              <div className="col-md-4 text-center">
                <div style={{color: '#ffffff', fontSize: '14px', lineHeight: '1.8'}}>
                  <p style={{margin: 0, fontWeight: 'bold'}}>Apex Affinity Group</p>
                  <p style={{margin: 0}}>1600 Highway 6 Ste 400</p>
                  <p style={{margin: 0}}>Sugar Land, TX 77478</p>
                </div>
              </div>

              {/* Column 2: Logo */}
              <div className="col-md-4 text-center">
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{maxHeight: '100px', width: 'auto', objectFit: 'contain', display: 'block', margin: '-30px auto 0 auto'}} />
              </div>

              {/* Column 3: Legal Links */}
              <div className="col-md-4 text-center">
                <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                  <li style={{marginBottom: '15px'}}>
                    <a href="#" style={{color: '#ffffff', textDecoration: 'none', fontSize: '16px'}}>Terms & Conditions</a>
                  </li>
                  <li>
                    <a href="#" style={{color: '#ffffff', textDecoration: 'none', fontSize: '16px'}}>Privacy Policy</a>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </footer>
        {/* Main Footer End */}

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="back-to-top"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#2B4C7E',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            zIndex: 999,
            opacity: 0,
            visibility: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1a2c4e';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2B4C7E';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
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

      {/* Back to Top Button Script */}
      <Script id="back-to-top-script" strategy="afterInteractive">
        {`
          window.addEventListener('scroll', function() {
            const backToTopBtn = document.querySelector('.back-to-top');
            if (backToTopBtn) {
              if (window.scrollY > 300) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
              } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
              }
            }
          });
        `}
      </Script>
    </>
  );
}

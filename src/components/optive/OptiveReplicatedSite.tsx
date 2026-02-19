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
  // For generic homepage (slug='apex'), don't add ref parameter
  const signupUrl = distributor.slug === 'apex' ? '/signup' : `/signup?ref=${distributor.slug}`;

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
                <a className="navbar-brand" href="/">
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
                <div className="navbar-collapse main-menu" id="navbarNav">
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto" id="menu">
                      <li className="nav-item"><a className="nav-link" href="#home">Home</a></li>
                      <li className="nav-item"><a className="nav-link" href="#journey">Your Journey</a></li>
                      <li className="nav-item"><a className="nav-link" href="#services">Our Services</a></li>
                      <li className="nav-item"><a className="nav-link" href="#faq">FAQs</a></li>
                      <li className="nav-item"><a className="nav-link" href="#contact">Contact</a></li>
                    </ul>
                  </div>

                  {/* Header Btn Start */}
                  <div className="header-btn">
                    <a href={signupUrl} className="btn-default" style={{background: '#2B4C7E', backgroundColor: '#2B4C7E', backgroundImage: 'none', borderColor: '#2B4C7E'}}>
                      {distributor.slug === 'apex' ? 'Join the Waitlist' : 'Join My Team'}
                    </a>
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
              <div className={distributor.slug === 'apex' ? 'col-xl-12' : 'col-xl-8'}>
                {/* Hero Content Start */}
                <div className="hero-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">
                      {distributor.slug === 'apex'
                        ? 'Where Insurance Professionals Come Home'
                        : `Your Professional Home — with ${distributor.first_name} ${distributor.last_name}`
                      }
                    </span>
                    <h1 className="text-anime-style-3" data-cursor="-opaque">
                      Aspiring. Growing. Established. You Belong Here.
                    </h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s" style={{color: '#fff', fontSize: '18px', marginTop: '20px', maxWidth: '680px'}}>
                      Whether you're just starting out, building your career, or a seasoned professional ready to scale — Apex Affinity Group is your home. We're not just insurance. We're a full suite of services built to help every agent better serve their clients, grow their practice, and strengthen their community.
                    </p>
                  </div>
                  {/* Section Title End */}
                </div>
                {/* Hero Content End */}
              </div>

              {/* Only show contact card on replicated sites, not generic homepage */}
              {distributor.slug !== 'apex' && (
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
              )}
            </div>
          </div>
        </div>
        {/* Hero Section End */}



        {/* Your Journey — 3 Pillars Section Start */}
        <div className="our-pricing" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="journey">Every Stage. One Home.</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">No Matter Where You Are, Apex Meets You There</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">Apex Affinity Group was built for insurance professionals at every stage of their journey. Whether you're just exploring, actively building, or a seasoned veteran — we have the tools, support, and community to take you further.</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="our-pricing-box wow fadeInUp" data-wow-delay="0.4s">
                  <div className="pricing-tab-item" style={{ display: 'block' }}>
                    <div className="row">

                      {/* ASPIRING CARD */}
                      <div className="col-xl-4 col-md-6" style={{marginBottom: '20px'}}>
                        <div className="pricing-item" style={{border: '3px solid #2B4C7E', height: '100%'}}>
                          <div className="icon-box">
                            <i className="fa-solid fa-seedling" style={{fontSize: '48px', color: '#2B4C7E'}}></i>
                          </div>
                          <div className="pricing-item-content">
                            <h2>Aspiring</h2>
                            <p>Curious about insurance. No license yet.</p>
                            <h3>Start <sub>From Zero</sub></h3>
                          </div>
                          <div className="pricing-item-list">
                            <h3>What You Get:</h3>
                            <ul>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> No License Needed to Start</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Earn Day One with Ancillary Products</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Free Licensing Guidance & Study Support</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> AI-Powered CRM from Day One</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> 1-on-1 Mentorship &amp; Onboarding</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Built-in Path to Full Insurance Sales</li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">
                              {distributor.slug === 'apex' ? 'Join the Waitlist' : 'Start Your Journey'}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* GROWING CARD */}
                      <div className="col-xl-4 col-md-6" style={{marginBottom: '20px'}}>
                        <div className="pricing-item pricing-item-popular" style={{border: '3px solid #2B4C7E', position: 'relative', height: '100%'}}>
                          <div style={{
                            position: 'absolute', top: '-15px', right: '20px',
                            background: '#2B4C7E', color: '#fff',
                            padding: '5px 20px', borderRadius: '20px',
                            fontWeight: 'bold', fontSize: '12px'
                          }}>MOST COMMON</div>
                          <div className="icon-box">
                            <i className="fa-solid fa-chart-line" style={{fontSize: '48px', color: '#2B4C7E'}}></i>
                          </div>
                          <div className="pricing-item-content">
                            <h2>Growing</h2>
                            <p>Licensed and building. Ready for more.</p>
                            <h3>Level <sub>Up Now</sub></h3>
                          </div>
                          <div className="pricing-item-list">
                            <h3>What You Get:</h3>
                            <ul>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Stronger Carrier Contracts</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Sales Training Podcast &amp; Live Calls</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Lead Generation &amp; Client Management Tools</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Compliance &amp; Product Support</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Peer Community &amp; Accountability</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> 100% Book of Business Ownership</li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">
                              {distributor.slug === 'apex' ? 'Join the Waitlist' : 'Grow With Us'}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* ESTABLISHED CARD */}
                      <div className="col-xl-4 col-md-6" style={{marginBottom: '20px'}}>
                        <div className="pricing-item" style={{border: '3px solid #2B4C7E', height: '100%'}}>
                          <div className="icon-box">
                            <i className="fa-solid fa-award" style={{fontSize: '48px', color: '#2B4C7E'}}></i>
                          </div>
                          <div className="pricing-item-content">
                            <h2>Established</h2>
                            <p>Seasoned pro. Time to serve at a higher level.</p>
                            <h3>Unlimited <sub>Potential</sub></h3>
                          </div>
                          <div className="pricing-item-list">
                            <h3>What You Get:</h3>
                            <ul>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Top-Tier Commission Contracts</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Multiple Carrier Appointments</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Team Building &amp; Residual Income</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Advanced CRM &amp; Automation Tools</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Leadership &amp; Mentorship Opportunities</li>
                              <li><i className="fa-solid fa-check" style={{color: '#2B4C7E'}}></i> Replicated Site &amp; Personal Brand Tools</li>
                            </ul>
                          </div>
                          <div className="pricing-item-btn">
                            <a href={signupUrl} className="btn-default">
                              {distributor.slug === 'apex' ? 'Join the Waitlist' : `Join ${distributor.first_name}'s Network`}
                            </a>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Universal Benefits */}
                  <div className="pricing-benefit-list wow fadeInUp" data-wow-delay="0.2s" style={{marginTop: '40px'}}>
                    <h3 style={{textAlign: 'center', marginBottom: '20px', color: '#2B4C7E', fontSize: '24px'}}>Every Member Gets These From Day One:</h3>
                    <ul style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px'}}>
                      <li><img src="/optive/images/icon-pricing-benefit-1.svg" alt="" />$0 to join, no monthly fees</li>
                      <li><img src="/optive/images/icon-pricing-benefit-2.svg" alt="" />AI-powered CRM included free</li>
                      <li><img src="/optive/images/icon-pricing-benefit-3.svg" alt="" />Training podcast &amp; live calls</li>
                      <li><img src="/optive/images/icon-pricing-benefit-1.svg" alt="" />100% book of business ownership</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Your Journey — 3 Pillars Section End */}


        {/* Our Services Section Start */}
        <div className="our-process">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="services">What We Offer</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">The Tools That Help You Serve Better</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">At Apex, we believe a well-equipped agent is a better agent — and a better agent means better-protected clients and stronger communities. Everything we provide is designed to help you serve at a higher level.</p>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="process-steps-item-list">

                  <div className="process-step-item box-1 wow fadeInUp">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>01.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-1.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>AI-Powered Tools & CRM</h3>
                      <p>Technology that works as hard as you do — automating follow-ups, managing your pipeline, and keeping you focused on what matters most: your clients.</p>
                      <ul>
                        <li>Smart lead management and automated nurturing</li>
                        <li>Your own replicated website from day one</li>
                      </ul>
                    </div>
                  </div>

                  <div className="process-step-item box-2 wow fadeInUp" data-wow-delay="0.2s">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>02.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-2.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>Training, Mentorship & Community</h3>
                      <p>You're never figuring it out alone. From our AI-powered sales training podcast to live calls and 1-on-1 mentorship, Apex keeps you sharp and supported.</p>
                      <ul>
                        <li>Weekly live training calls and sales coaching</li>
                        <li>A peer community that lifts every member up</li>
                      </ul>
                    </div>
                  </div>

                  <div className="process-step-item box-3 wow fadeInUp" data-wow-delay="0.4s">
                    <div className="process-step-item-header">
                      <div className="process-step-item-no"><h2>03.</h2></div>
                      <div className="process-step-item-image">
                        <figure><img src="/optive/images/process-step-item-image-3.jpg" alt="" /></figure>
                      </div>
                    </div>
                    <div className="process-step-item-content">
                      <h3>Carrier Access & Compliance Support</h3>
                      <p>Access top-tier carrier appointments and the compliance support you need to serve your clients with confidence — no matter what product or market you're in.</p>
                      <ul>
                        <li>Multiple carrier appointments across product lines</li>
                        <li>100% ownership of your book of business, always</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Our Services Section End */}


        {/* Mission / Community Impact Section Start */}
        <div className="our-expert-solution">
          <div className="our-expert-solution-box dark-section" style={{paddingTop: '70px', paddingBottom: '70px'}}>
            <div className="container">
              <div className="row section-row" style={{marginBottom: 0}}>
                <div className="col-lg-12">
                  <div className="section-title section-title-center" style={{marginBottom: 0}}>
                    <span className="section-sub-title wow fadeInUp">Why It Matters</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">Better Agents. Better Service. Stronger Communities.</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s" style={{maxWidth: '800px', margin: '0 auto'}}>
                      When agents are properly equipped, trained, and supported — they show up differently for their clients. They close coverage gaps that could devastate families. They build trust that lasts decades. They become pillars in their communities. That's the real mission behind everything Apex Affinity Group does. We invest in you so you can invest in the people who need you most.
                    </p>
                    <div className="wow fadeInUp" data-wow-delay="0.4s" style={{marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap'}}>
                      <a href={signupUrl} className="btn-default" style={{background: '#ffffff', color: '#2B4C7E', borderColor: '#ffffff'}}>
                        {distributor.slug === 'apex' ? 'Join the Waitlist' : 'Join the Mission'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mission / Community Impact Section End */}

        {/* Our Faqs Section Start */}
        <div className="our-faqs">
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                {/* Section Title Start */}
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp" id="faq">Frequently Asked Questions</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">Real Answers. No Runaround.</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We believe transparency builds trust. Here are honest answers to the questions we hear most from insurance professionals considering Apex as their professional home.</p>
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
                        Q1. What exactly is Apex Affinity Group?
                      </button>
                    </h2>
                    <div id="collapse1" className="accordion-collapse collapse" role="region" aria-labelledby="heading1" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Apex Affinity Group is a professional home for insurance agents at every stage — aspiring, growing, and established. We're not just an insurance opportunity; we're an insurance services platform. We provide the tools, training, carrier relationships, and community that help agents serve their clients better and build practices they're proud of. When agents are well-supported, their clients are better protected — and that's good for everyone.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.2s">
                    <h2 className="accordion-header" id="heading2">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                        Q2. Do I need an insurance license to join?
                      </button>
                    </h2>
                    <div id="collapse2" className="accordion-collapse collapse" role="region" aria-labelledby="heading2" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>No license is required to get started. You can begin earning immediately with our ancillary product line — telemedicine, roadside assistance, ID theft protection, and legal services — while we guide you through the licensing process at your own pace. For already-licensed agents, you plug directly into stronger contracts, better tools, and a supportive professional community.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.4s">
                    <h2 className="accordion-header" id="heading3">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                        Q3. I'm already a licensed agent. Why would I join Apex?
                      </button>
                    </h2>
                    <div id="collapse3" className="accordion-collapse collapse show" role="region" aria-labelledby="heading3" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Seasoned agents join Apex because we give them what they've been missing: better carrier contracts, AI-powered client management tools, a supportive professional community, and the ability to build residual income through team development — all while keeping 100% ownership of their book of business. It's the infrastructure of a large agency without giving up your independence.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.6s">
                    <h2 className="accordion-header" id="heading4">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                        Q4. What does "insurance services" mean — are you different from a typical agency?
                      </button>
                    </h2>
                    <div id="collapse4" className="accordion-collapse collapse" role="region" aria-labelledby="heading4" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Yes — significantly. A traditional agency focuses on recruiting agents to sell their products. Apex focuses on serving agents with the resources they need to build better practices. We provide technology, training, carrier access, compliance support, and community — because we believe the best way to grow is to make every agent we work with genuinely excellent at what they do. Better agents serve better. It's that simple.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="0.8s">
                    <h2 className="accordion-header" id="heading5">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                        Q5. What training and support does Apex actually provide?
                      </button>
                    </h2>
                    <div id="collapse5" className="accordion-collapse collapse" role="region" aria-labelledby="heading5" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>From day one, you get access to comprehensive onboarding, an AI-powered sales training podcast, weekly live training calls, 1-on-1 mentorship, an AI-powered CRM with automated lead nurturing, product training across all insurance types, and ongoing support from {distributor.slug === 'apex' ? 'the Apex team' : `${distributor.first_name} and the entire Apex team`}. We're invested in your success because your success is our mission.</div>
                      </div>
                    </div>
                  </div>
                  {/* FAQ Item End */}

                  {/* FAQ Item Start */}
                  <div className="accordion-item wow fadeInUp" data-wow-delay="1s">
                    <h2 className="accordion-header" id="heading6">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6" aria-expanded="false" aria-controls="collapse6">
                        Q6. Is there a cost to join, and what's the commitment?
                      </button>
                    </h2>
                    <div id="collapse6" className="accordion-collapse collapse" role="region" aria-labelledby="heading6" data-bs-parent="#accordion">
                      <div style={{backgroundColor: 'white', padding: '20px'}}>
                        <div style={{color: 'black', fontSize: '16px', lineHeight: '1.8', fontFamily: 'inherit'}}>Zero cost to join. No monthly fees, no hidden dues, no minimum production requirements. Apex is your professional home — and a home doesn't charge you rent to belong. Many agents start part-time while keeping their current role, building at their own pace until Apex becomes their primary focus. You control your schedule, your growth, and your business.</div>
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

'use client';

// =============================================
// Optive Template - EXACT Replication
// Business Consulting HTML Template
// with Distributor Personalization
// =============================================

import { useState, useEffect } from 'react';
import type { Distributor } from '@/lib/types';
import Script from 'next/script';
import Head from 'next/head';

interface OptiveReplicatedSiteProps {
  distributor: Distributor;
}

export default function OptiveReplicatedSite({ distributor }: OptiveReplicatedSiteProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mounted, setMounted] = useState(false);
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
                  <img src="/optive/images/logo.svg" alt="Logo" />
                </a>
                {/* Logo End */}

                {/* Main Menu Start */}
                <div className="collapse navbar-collapse main-menu">
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto" id="menu">
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}`}>Home</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#about`}>About {distributor.first_name}</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#services`}>Services</a></li>
                      <li className="nav-item"><a className="nav-link" href={`/optive/${distributor.slug}#contact`}>Contact</a></li>
                    </ul>
                  </div>

                  {/* Header Btn Start */}
                  <div className="header-btn">
                    <a href={signupUrl} className="btn-default">Join {distributor.first_name}'s Team</a>
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

        {/* Hero Section Start - WITH FLAG VIDEO */}
        <div className="hero hero-video dark-section">
          {/* Video Start - USING YOUR FLAG VIDEO */}
          <div className="hero-bg-video">
            <video autoPlay muted loop id="herovideo">
              <source src="/videos/flag-waving.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Video End */}

          <div className="container">
            <div className="row align-items-end">
              <div className="col-xl-8">
                {/* Hero Content Start */}
                <div className="hero-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">
                      Join {distributor.first_name} {distributor.last_name}'s Team
                    </span>
                    <h1 className="text-anime-style-3" data-cursor="-opaque">
                      Build Your Insurance Business with {distributor.first_name}
                    </h1>
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
                    <h2>Start Earning Day 1</h2>
                    <p>Sell ancillary products immediately - no license required. 100% free to join.</p>
                  </div>
                  {/* Hero Info Box Content End */}
                </div>
                {/* Hero Info Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Hero Section End */}

        {/* Company Slider Start */}
        <div className="company-slider">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                {/* Company Slider Box Start */}
                <div className="company-slider-box wow fadeInUp">
                  {/* Company Slider Title Start */}
                  <div className="company-slider-title">
                    <h3>Trusted By Agents Nationwide</h3>
                  </div>
                  {/* Company Slider Title End */}

                  {/* Trust Badges */}
                  <div className="company-supports-slider">
                    <div className="swiper">
                      <div className="swiper-wrapper">
                        <div className="swiper-slide">
                          <div className="company-supports-logo">
                            <p style={{color: '#fff', fontSize: '18px', fontWeight: '600'}}>$0 to Join</p>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="company-supports-logo">
                            <p style={{color: '#fff', fontSize: '18px', fontWeight: '600'}}>100% Book Ownership</p>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="company-supports-logo">
                            <p style={{color: '#fff', fontSize: '18px', fontWeight: '600'}}>Dual Income Streams</p>
                          </div>
                        </div>
                        <div className="swiper-slide">
                          <div className="company-supports-logo">
                            <p style={{color: '#fff', fontSize: '18px', fontWeight: '600'}}>AI-Powered CRM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Trust Badges End */}
                </div>
                {/* Company Slider Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Company Slider End */}

        {/* About US Section Start */}
        <div id="about" className="about-us about-image-collage">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                {/* About Image Start */}
                <div className="about-image-collage-box">
                  <div className="about-experience-years wow fadeInUp">
                    <h2>{distributor.licensing_status === 'licensed' ? 'Licensed' : 'Building'}</h2>
                    <p>Insurance Professional</p>
                  </div>

                  <div className="about-image wow fadeInUp" data-wow-delay="0.25s">
                    <figure className="image-anime reveal">
                      <img src="/optive/images/about-us-image-1-royal.jpg" alt="" />
                    </figure>
                  </div>

                  <div className="about-image wow fadeInUp" data-wow-delay="0.5s">
                    <figure className="image-anime reveal">
                      <img src="/optive/images/about-us-image-2-royal.jpg" alt="" />
                    </figure>
                  </div>
                </div>
                {/* About Image End */}
              </div>

              <div className="col-lg-6">
                {/* About Content Start */}
                <div className="about-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <span className="section-sub-title wow fadeInUp">About {distributor.first_name}</span>
                    <h2 className="text-anime-style-3" data-cursor="-opaque">
                      Building Financial Freedom Through Insurance
                    </h2>
                  </div>
                  {/* Section Title End */}

                  {/* About Body Start */}
                  <div className="about-body wow fadeInUp" data-wow-delay="0.25s">
                    <p>
                      I'm {distributor.first_name} {distributor.last_name}, and I'm here to help you build your insurance business
                      with Apex Affinity Group. You can start earning immediately selling ancillary products (no license needed),
                      and when you're ready, I'll guide you through getting licensed to sell insurance.
                    </p>
                    <p>
                      The best part? It's 100% free to join, you'll own your entire book of business, and you can earn from
                      both your sales and team development.
                    </p>
                  </div>
                  {/* About Body End */}

                  {/* About Contact Info Start */}
                  <div className="about-contact-info wow fadeInUp" data-wow-delay="0.5s">
                    <div className="about-contact-info-box">
                      <div className="icon-box">
                        <i className="fa-solid fa-envelope"></i>
                      </div>
                      <div className="about-contact-content">
                        <p>Email Address</p>
                        <h3>
                          <button onClick={handleCopyEmail} className="text-link">
                            {copiedEmail ? '✓ Copied!' : distributor.email}
                          </button>
                        </h3>
                      </div>
                    </div>

                    {distributor.phone && (
                      <div className="about-contact-info-box">
                        <div className="icon-box">
                          <i className="fa-solid fa-phone"></i>
                        </div>
                        <div className="about-contact-content">
                          <p>Phone Number</p>
                          <h3><a href={`tel:${distributor.phone}`}>{distributor.phone}</a></h3>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* About Contact Info End */}

                  {/* Section Footer Text Start */}
                  <div className="section-footer-text wow fadeInUp" data-wow-delay="0.75s">
                    <p>{distributor.company_name || `${distributor.first_name}'s Insurance Agency`}</p>
                  </div>
                  {/* Section Footer Text End */}
                </div>
                {/* About Content End */}
              </div>
            </div>
          </div>
        </div>
        {/* About US Section End */}

        {/* Our Services Section Start */}
        <div id="services" className="our-services">
          <div className="container">
            <div className="row section-row align-items-end">
              <div className="col-lg-7">
                {/* Section Title Start */}
                <div className="section-title">
                  <span className="section-sub-title wow fadeInUp">What You Get</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">
                    Everything You Need to Succeed
                  </h2>
                </div>
                {/* Section Title End */}
              </div>

              <div className="col-lg-5">
                {/* Section Title Content Start */}
                <div className="section-title-content wow fadeInUp" data-wow-delay="0.25s">
                  <p>Start earning immediately and build a successful insurance business with full support.</p>
                </div>
                {/* Section Title Content End */}
              </div>
            </div>

            <div className="row">
              {/* Service Item 1 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp">
                  <div className="icon-box">
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div className="service-body">
                    <h3>Start Earning Day 1</h3>
                    <p>Sell telemedicine, roadside assistance, identity theft protection, and legal services - no license required.</p>
                  </div>
                </div>
              </div>

              {/* Service Item 2 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp" data-wow-delay="0.2s">
                  <div className="icon-box">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div className="service-body">
                    <h3>100% Book Ownership</h3>
                    <p>You own your clients and renewals forever. Your business, your asset.</p>
                  </div>
                </div>
              </div>

              {/* Service Item 3 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp" data-wow-delay="0.4s">
                  <div className="icon-box">
                    <i className="fa-solid fa-certificate"></i>
                  </div>
                  <div className="service-body">
                    <h3>Full Licensing Support</h3>
                    <p>When ready, we guide you through getting licensed to sell insurance products.</p>
                  </div>
                </div>
              </div>

              {/* Service Item 4 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp" data-wow-delay="0.6s">
                  <div className="icon-box">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <div className="service-body">
                    <h3>AI-Powered CRM</h3>
                    <p>Automated follow-ups, lead tracking, and sales tools included free.</p>
                  </div>
                </div>
              </div>

              {/* Service Item 5 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp" data-wow-delay="0.8s">
                  <div className="icon-box">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div className="service-body">
                    <h3>Real-Time Dashboard</h3>
                    <p>Track your sales, team growth, and earnings all in one place.</p>
                  </div>
                </div>
              </div>

              {/* Service Item 6 */}
              <div className="col-lg-4 col-md-6">
                <div className="service-item wow fadeInUp" data-wow-delay="1s">
                  <div className="icon-box">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div className="service-body">
                    <h3>Team Development Bonuses</h3>
                    <p>Earn from your direct sales plus team development bonuses.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Footer Text Start */}
            <div className="section-footer-text wow fadeInUp">
              <p>Ready to build your financial future?</p>
            </div>
            {/* Section Footer Text End */}
          </div>
        </div>
        {/* Our Services Section End */}

        {/* Contact CTA Section Start */}
        <div id="contact" className="contact-cta">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="contact-cta-box wow fadeInUp">
                  <div className="section-title">
                    <h2>Ready to Get Started?</h2>
                    <p>Join {distributor.first_name}'s team and start building your insurance business today.</p>
                  </div>
                  <div className="contact-cta-btn">
                    <a href={signupUrl} className="btn-default">Join {distributor.first_name}'s Team →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Contact CTA Section End */}

        {/* Footer Start */}
        <footer className="main-footer">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="footer-copyright">
                  <p>© {new Date().getFullYear()} Apex Affinity Group. All rights reserved.</p>
                  <p className="mt-2" style={{fontSize: '14px'}}>
                    Independent Distributor: {distributor.first_name} {distributor.last_name}
                    {distributor.company_name && ` | ${distributor.company_name}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
        {/* Footer End */}
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

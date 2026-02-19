// =============================================
// About Page — Apex Affinity Group
// =============================================

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'About Us — Apex Affinity Group',
  description: 'Where insurance professionals come home. Learn who we are, what we stand for, and why agents at every stage choose Apex.',
};

export default function AboutPage() {
  return (
    <>
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/all.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/animate.css" rel="stylesheet" />
      <link href="/optive/css/custom.css" rel="stylesheet" media="screen" />

      <div className="optive-template-wrapper">

        {/* ── HEADER ── */}
        <header className="main-header">
          <div className="header-sticky">
            <nav className="navbar navbar-expand-lg">
              <div className="container">
                <a className="navbar-brand" href="/">
                  <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ height: '80px' }} />
                </a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarAbout" aria-controls="navbarAbout" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
                </button>
                <div className="navbar-collapse main-menu" id="navbarAbout">
                  <div className="nav-menu-wrapper">
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
                      <li className="nav-item"><a className="nav-link" href="/about" style={{ color: '#2B4C7E', fontWeight: 700 }}>About</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#faq">FAQs</a></li>
                      <li className="nav-item"><a className="nav-link" href="/#contact">Contact</a></li>
                    </ul>
                  </div>
                  <div className="header-btn">
                    <a href="/signup" className="btn-default" style={{ background: '#2B4C7E', backgroundColor: '#2B4C7E', backgroundImage: 'none', borderColor: '#2B4C7E' }}>
                      Join the Waitlist
                    </a>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        </header>

        {/* ── HERO ── */}
        <div className="hero hero-video dark-section" style={{ minHeight: '420px' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #1a2f50 0%, #2B4C7E 60%, #1a3a6b 100%)',
            zIndex: 0
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                <span className="section-sub-title wow fadeInUp" style={{ display: 'block', marginBottom: '16px' }}>
                  Our Story & Mission
                </span>
                <h1 className="text-anime-style-3" data-cursor="-opaque" style={{ color: '#fff', fontSize: '48px', fontWeight: 800 }}>
                  Where Insurance Professionals Come Home.
                </h1>
                <p className="wow fadeInUp" data-wow-delay="0.2s" style={{ color: '#c7d9f5', fontSize: '19px', marginTop: '24px', lineHeight: '1.8' }}>
                  We believe every insurance professional — regardless of where they are in their journey — deserves a home built around their growth, their clients, and their community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── WHO WE ARE ── */}
        <div style={{ background: '#fff', padding: '80px 0' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 wow fadeInLeft">
                <img src="/apex-logo-full.png" alt="Apex Affinity Group" style={{ width: '100%', maxWidth: '400px', display: 'block', margin: '0 auto' }} />
              </div>
              <div className="col-lg-6 wow fadeInRight" data-wow-delay="0.2s">
                <span className="section-sub-title" style={{ display: 'block', marginBottom: '12px' }}>Who We Are</span>
                <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1a2f50', lineHeight: '1.2', marginBottom: '24px' }}>
                  Not Just Insurance.<br />Insurance Elevated.
                </h2>
                <p style={{ fontSize: '17px', color: '#4b5563', lineHeight: '1.8', marginBottom: '20px' }}>
                  Apex Affinity Group is a professional services platform for insurance agents. We were founded on a simple belief: the insurance industry works best when agents are genuinely equipped to serve — not just recruited and left to figure it out.
                </p>
                <p style={{ fontSize: '17px', color: '#4b5563', lineHeight: '1.8', marginBottom: '20px' }}>
                  We provide every member — aspiring, growing, or established — with AI-powered tools, world-class training, strong carrier relationships, compliance support, and a community of professionals invested in each other's success.
                </p>
                <p style={{ fontSize: '17px', color: '#4b5563', lineHeight: '1.8' }}>
                  <strong style={{ color: '#2B4C7E' }}>The result?</strong> Better-equipped agents who serve better clients — and better-served clients who build stronger communities. That chain reaction is the whole point.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MISSION STATEMENT ── */}
        <div className="dark-section" style={{ padding: '80px 0' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                <span className="section-sub-title wow fadeInUp" style={{ display: 'block', marginBottom: '16px' }}>Our Mission</span>
                <h2 className="text-anime-style-3" style={{ color: '#fff', fontSize: '36px', fontWeight: 800, marginBottom: '32px' }}>
                  Better Agents. Better Service. Stronger Communities.
                </h2>
                <div className="wow fadeInUp" data-wow-delay="0.2s" style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
                  {[
                    { icon: 'fa-user-graduate', label: 'Equip the Agent' },
                    { icon: 'fa-arrow-right', label: '' },
                    { icon: 'fa-handshake', label: 'Serve the Client' },
                    { icon: 'fa-arrow-right', label: '' },
                    { icon: 'fa-city', label: 'Strengthen the Community' },
                  ].map((item, i) => (
                    item.label ? (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                          <i className={`fa-solid ${item.icon}`} style={{ fontSize: '28px', color: '#93c5fd' }}></i>
                        </div>
                        <span style={{ color: '#c7d9f5', fontSize: '13px', fontWeight: 600 }}>{item.label}</span>
                      </div>
                    ) : (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', paddingBottom: '24px' }}>
                        <i className={`fa-solid ${item.icon}`} style={{ fontSize: '22px', color: '#4b7ab8' }}></i>
                      </div>
                    )
                  ))}
                </div>
                <p className="wow fadeInUp" data-wow-delay="0.3s" style={{ color: '#c7d9f5', fontSize: '17px', lineHeight: '1.9', maxWidth: '700px', margin: '0 auto' }}>
                  Every tool we build, every training we run, every agent we support — it all flows toward one end. When we invest in agents, agents invest in clients, and clients invest in communities. That's not a tagline. That's the business model.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 PILLARS ── */}
        <div style={{ background: '#f8faff', padding: '80px 0' }}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center">
                  <span className="section-sub-title wow fadeInUp">Every Stage. One Home.</span>
                  <h2 className="text-anime-style-3" data-cursor="-opaque">A Professional Home for Every Chapter</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s">We don't pick favorites. Whether you're just starting or you've been doing this for 20 years, Apex has a place for you and a plan to take you further.</p>
                </div>
              </div>
            </div>
            <div className="row wow fadeInUp" data-wow-delay="0.3s">
              {[
                {
                  icon: 'fa-seedling',
                  title: 'Aspiring',
                  sub: 'Just getting started',
                  desc: 'You don\'t need a license to find your home at Apex. We walk you through everything — from your first product to your license exam to your first client — with mentorship, tools, and community every step of the way.',
                  color: '#e8f0fd',
                },
                {
                  icon: 'fa-chart-line',
                  title: 'Growing',
                  sub: 'Licensed & building momentum',
                  desc: 'You\'ve got the license and the drive. Now you need the infrastructure. Apex gives you stronger carrier contracts, smarter technology, and a professional community that accelerates your growth.',
                  color: '#fff',
                },
                {
                  icon: 'fa-award',
                  title: 'Established',
                  sub: 'Seasoned & ready to scale',
                  desc: 'You\'ve built something real. Apex helps you protect it, scale it, and leverage it — with top-tier contracts, team-building income, and tools that let you serve your clients at the level they deserve.',
                  color: '#e8f0fd',
                },
              ].map((pillar, i) => (
                <div key={i} className="col-lg-4 col-md-6" style={{ marginBottom: '30px' }}>
                  <div style={{ background: pillar.color, border: '2px solid #dbeafe', borderRadius: '16px', padding: '40px 32px', height: '100%', textAlign: 'center' }}>
                    <div style={{ width: '72px', height: '72px', background: '#2B4C7E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <i className={`fa-solid ${pillar.icon}`} style={{ fontSize: '30px', color: '#fff' }}></i>
                    </div>
                    <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#1a2f50', marginBottom: '6px' }}>{pillar.title}</h3>
                    <p style={{ fontSize: '13px', color: '#2B4C7E', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>{pillar.sub}</p>
                    <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.8' }}>{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AGENTPULSE SUITE ── */}
        <div style={{ background: '#1a2f50', padding: '80px 0' }}>
          <div className="container">
            <div className="row section-row">
              <div className="col-lg-12">
                <div className="section-title section-title-center" style={{ marginBottom: '50px' }}>
                  <span className="section-sub-title wow fadeInUp" style={{ display: 'block' }}>The Technology</span>
                  <h2 className="text-anime-style-3" style={{ color: '#fff' }}>Introducing AgentPulse</h2>
                  <p className="wow fadeInUp" data-wow-delay="0.2s" style={{ color: '#93c5fd' }}>
                    A full suite of tools built for insurance professionals who are serious about serving more people, closing more business, and running a practice they're proud of.
                  </p>
                </div>
              </div>
            </div>
            <div className="row wow fadeInUp" data-wow-delay="0.3s">
              {[
                { icon: 'fa-phone-volume', name: 'WarmLine', desc: 'Smart warm calling — surfaces everything you need before you dial, so every conversation starts with confidence.' },
                { icon: 'fa-rotate', name: 'LeadLoop', desc: 'Intelligent lead management that keeps your pipeline organized, staged, and always moving forward.' },
                { icon: 'fa-chart-bar', name: 'PulseInsight', desc: 'Real-time analytics on your business — conversions, pipeline, team production, and revenue trends at a glance.' },
                { icon: 'fa-robot', name: 'AgentPilot', desc: 'Your AI sales assistant — objection coaching, presentation prep, and next-step guidance on every deal.' },
                { icon: 'fa-paper-plane', name: 'PulseFollow', desc: 'Automated, personalized follow-up that runs in the background so no prospect ever slips through the cracks.' },
                { icon: 'fa-bell', name: 'PolicyPing', desc: 'Full policy status tracking — renewals, lapses, anniversaries — so you\'re always proactive, never reactive.' },
              ].map((tool, i) => (
                <div key={i} className="col-lg-4 col-md-6" style={{ marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '28px 24px', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '46px', height: '46px', background: '#2B4C7E', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fa-solid ${tool.icon}`} style={{ fontSize: '20px', color: '#93c5fd' }}></i>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{tool.name}</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#93c5fd', lineHeight: '1.7' }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center wow fadeInUp" data-wow-delay="0.4s" style={{ marginTop: '40px' }}>
              <p style={{ color: '#c7d9f5', fontSize: '16px', fontStyle: 'italic' }}>
                "AgentPulse doesn't just help you sell more — it helps you serve better."
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: '#fff', padding: '80px 0', textAlign: 'center' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 wow fadeInUp">
                <span className="section-sub-title" style={{ display: 'block', marginBottom: '12px' }}>Ready to Come Home?</span>
                <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#1a2f50', marginBottom: '20px' }}>
                  Your Place at Apex Is Waiting.
                </h2>
                <p style={{ fontSize: '17px', color: '#4b5563', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto 36px' }}>
                  Join the professionals who've stopped figuring it out alone and started building something that lasts. No cost to join. No pressure. Just a genuine home for your career.
                </p>
                <a href="/signup" className="btn-default" style={{ background: '#2B4C7E', backgroundColor: '#2B4C7E', backgroundImage: 'none', borderColor: '#2B4C7E', fontSize: '17px', padding: '16px 48px' }}>
                  Join the Waitlist Today
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="main-footer dark-section" id="contact" style={{ paddingTop: '50px' }}>
          <div className="container">
            <div className="row align-items-start" style={{ paddingBottom: '40px' }}>
              <div className="col-md-4 text-center">
                <div style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.8' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>Apex Affinity Group</p>
                  <p style={{ margin: 0 }}>1600 Highway 6 Ste 400</p>
                  <p style={{ margin: 0 }}>Sugar Land, TX 77478</p>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <img src="/apex-logo-white.png" alt="Apex Affinity Group" style={{ maxHeight: '100px', width: 'auto', display: 'block', margin: '-30px auto 0 auto' }} />
              </div>
              <div className="col-md-4 text-center">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '15px' }}><a href="/terms" style={{ color: '#ffffff', textDecoration: 'none' }}>Terms & Conditions</a></li>
                  <li><a href="/privacy" style={{ color: '#ffffff', textDecoration: 'none' }}>Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <Script src="/optive/js/jquery-3.7.1.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/bootstrap.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/wow.min.js" strategy="afterInteractive" />
      <Script src="/optive/js/function.js" strategy="afterInteractive" />
    </>
  );
}

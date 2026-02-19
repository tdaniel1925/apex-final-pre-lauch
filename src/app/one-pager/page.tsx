// =============================================
// One-Pager — Apex Affinity Group
// Print-optimized marketing sheet
// =============================================

'use client';

export default function OnePagerPage() {
  return (
    <>
      <link href="/optive/css/bootstrap.min.css" rel="stylesheet" media="screen" />
      <link href="/optive/css/all.min.css" rel="stylesheet" media="screen" />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .page-wrap { box-shadow: none !important; }
        }

        .page-wrap {
          max-width: 850px;
          margin: 0 auto;
          background: #fff;
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }

        .op-header {
          background: linear-gradient(135deg, #1a2f50 0%, #2B4C7E 100%);
          color: #fff;
          padding: 36px 48px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .op-header-logo img {
          height: 72px;
          width: auto;
        }

        .op-header-copy h1 {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px;
          line-height: 1.2;
        }

        .op-header-copy p {
          font-size: 14px;
          color: #93c5fd;
          margin: 0;
          line-height: 1.6;
        }

        .op-tagline {
          background: #f0f5ff;
          border-left: 5px solid #2B4C7E;
          padding: 18px 48px;
          font-size: 17px;
          font-weight: 600;
          color: #1a2f50;
          font-style: italic;
        }

        .op-section {
          padding: 32px 48px;
          border-bottom: 1px solid #e5eaf3;
        }

        .op-section h2 {
          font-size: 15px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #2B4C7E;
          margin: 0 0 14px;
        }

        .op-section p {
          font-size: 14px;
          color: #374151;
          line-height: 1.75;
          margin: 0;
        }

        .op-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 6px;
        }

        .op-pillar {
          background: #f8faff;
          border: 1.5px solid #dbeafe;
          border-radius: 10px;
          padding: 18px 16px;
          text-align: center;
        }

        .op-pillar-icon {
          width: 44px;
          height: 44px;
          background: #2B4C7E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }

        .op-pillar-icon i {
          font-size: 18px;
          color: #fff;
        }

        .op-pillar h3 {
          font-size: 16px;
          font-weight: 800;
          color: #1a2f50;
          margin: 0 0 3px;
        }

        .op-pillar .sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #2B4C7E;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .op-pillar p {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }

        .op-benefits {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 6px;
        }

        .op-benefit {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .op-benefit i {
          font-size: 14px;
          color: #2B4C7E;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .op-benefit p {
          font-size: 13px;
          color: #374151;
          line-height: 1.5;
          margin: 0;
        }

        .op-benefit strong {
          color: #1a2f50;
        }

        .op-tools {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 6px;
        }

        .op-tool {
          background: #f0f5ff;
          border-radius: 8px;
          padding: 12px 14px;
        }

        .op-tool h4 {
          font-size: 13px;
          font-weight: 800;
          color: #1a2f50;
          margin: 0 0 4px;
        }

        .op-tool p {
          font-size: 11px;
          color: #4b5563;
          line-height: 1.5;
          margin: 0;
        }

        .op-footer {
          background: linear-gradient(135deg, #1a2f50 0%, #2B4C7E 100%);
          color: #fff;
          padding: 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .op-footer-cta h3 {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px;
        }

        .op-footer-cta p {
          font-size: 13px;
          color: #93c5fd;
          margin: 0;
        }

        .op-footer-contact p {
          font-size: 13px;
          color: #c7d9f5;
          line-height: 1.7;
          margin: 0;
          text-align: right;
        }

        .op-chain {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .op-chain-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .op-chain-item i {
          font-size: 22px;
          color: #2B4C7E;
        }

        .op-chain-item span {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #374151;
        }

        .op-chain-arrow {
          font-size: 18px;
          color: #9ca3af;
          margin-bottom: 14px;
        }

        .print-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #2B4C7E;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 100;
          text-decoration: none;
        }

        .print-btn:hover {
          background: #1a3a6b;
          color: #fff;
          text-decoration: none;
        }
      `}</style>

      {/* Print Button (screen only) */}
      <button
        className="print-btn no-print"
        onClick={() => window.print()}
        style={{ position: 'fixed', bottom: '24px', right: '24px' }}
      >
        <i className="fa-solid fa-print"></i>
        Print / Save PDF
      </button>

      <div className="page-wrap" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.12)', minHeight: '100vh' }}>

        {/* ── HEADER ── */}
        <div className="op-header">
          <div className="op-header-logo">
            <img src="/apex-logo-full.png" alt="Apex Affinity Group" />
          </div>
          <div className="op-header-copy" style={{ textAlign: 'right' }}>
            <h1>Where Insurance Professionals Come Home.</h1>
            <p>Aspiring · Growing · Established — Every stage. One platform. One community.</p>
          </div>
        </div>

        {/* ── PULL QUOTE ── */}
        <div className="op-tagline">
          "We're not just another IMO. We're the professional home your insurance career has been missing."
        </div>

        {/* ── WHO WE ARE ── */}
        <div className="op-section">
          <h2>Who We Are</h2>
          <p>
            Apex Affinity Group is a full-service professional platform for insurance agents at every career stage. We provide AI-powered productivity tools, structured training and mentorship, multi-carrier contract access, compliance support, and a community of professionals invested in each other's growth. Whether you're just exploring the industry or you've been in the field for decades, Apex is built to be your home — not just your upline.
          </p>
        </div>

        {/* ── MISSION ── */}
        <div className="op-section">
          <h2>Our Mission</h2>
          <p style={{ textAlign: 'center', fontWeight: 600, fontSize: '16px', color: '#1a2f50', marginBottom: '8px' }}>
            Better Agents. Better Service. Stronger Communities.
          </p>
          <div className="op-chain">
            <div className="op-chain-item">
              <i className="fa-solid fa-user-graduate"></i>
              <span>Equip the Agent</span>
            </div>
            <i className="fa-solid fa-arrow-right op-chain-arrow"></i>
            <div className="op-chain-item">
              <i className="fa-solid fa-handshake"></i>
              <span>Serve the Client</span>
            </div>
            <i className="fa-solid fa-arrow-right op-chain-arrow"></i>
            <div className="op-chain-item">
              <i className="fa-solid fa-city"></i>
              <span>Strengthen the Community</span>
            </div>
          </div>
          <p style={{ marginTop: '14px', textAlign: 'center', color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>
            Every tool we build and every training we run flows toward one end: a stronger insurance community.
          </p>
        </div>

        {/* ── 3 PILLARS ── */}
        <div className="op-section">
          <h2>A Professional Home for Every Chapter</h2>
          <div className="op-pillars">
            {[
              {
                icon: 'fa-seedling',
                title: 'Aspiring',
                sub: 'Just Getting Started',
                desc: 'Pre-license support, product training, study resources, and a mentor who walks with you through your first client conversation.',
              },
              {
                icon: 'fa-chart-line',
                title: 'Growing',
                sub: 'Licensed & Building',
                desc: 'Stronger carrier contracts, smart productivity tools, accountability structures, and a community that accelerates your momentum.',
              },
              {
                icon: 'fa-award',
                title: 'Established',
                sub: 'Seasoned & Scaling',
                desc: "Top-tier contracts, team-building income, enterprise tools, and the infrastructure to protect and grow what you've built.",
              },
            ].map((p, i) => (
              <div key={i} className="op-pillar">
                <div className="op-pillar-icon">
                  <i className={`fa-solid ${p.icon}`}></i>
                </div>
                <h3>{p.title}</h3>
                <p className="sub">{p.sub}</p>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT YOU GET ── */}
        <div className="op-section">
          <h2>What You Get with Apex</h2>
          <div className="op-benefits">
            {[
              { icon: 'fa-check-circle', title: 'Multi-Carrier Access', desc: 'Direct contracts with top-rated life, health, and annuity carriers — more options for your clients, better compensation for you.' },
              { icon: 'fa-check-circle', title: 'AI-Powered Agent Tools', desc: 'The AgentPulse suite: calling, lead management, follow-up, analytics, and AI coaching — all in one platform.' },
              { icon: 'fa-check-circle', title: 'Training & Mentorship', desc: "Live webinars, on-demand video library, and 1:1 mentorship from agents who've built the kind of business you're building." },
              { icon: 'fa-check-circle', title: 'Compliance Support', desc: 'Stay compliant without the headache. We keep you current on regulations, E&O guidance, and carrier-specific requirements.' },
              { icon: 'fa-check-circle', title: 'Team-Building Income', desc: 'Build a team and earn overrides on their production. A real residual income opportunity — not a recruitment pitch.' },
              { icon: 'fa-check-circle', title: 'Community & Accountability', desc: "Weekly calls, peer accountability groups, and a culture of professionals who celebrate each other's wins." },
            ].map((b, i) => (
              <div key={i} className="op-benefit">
                <i className={`fa-solid ${b.icon}`}></i>
                <p><strong>{b.title}.</strong> {b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AGENTPULSE ── */}
        <div className="op-section" style={{ background: '#f8faff' }}>
          <h2>AgentPulse — Productivity Suite</h2>
          <p style={{ marginBottom: '14px' }}>
            A purpose-built technology suite for insurance professionals — in development, launching with the platform.
          </p>
          <div className="op-tools">
            {[
              { name: 'WarmLine', desc: 'Smart warm calling with full prospect intel before you dial.' },
              { name: 'LeadLoop', desc: 'Intelligent pipeline management that keeps deals moving.' },
              { name: 'PulseInsight', desc: 'Real-time business analytics — conversions, revenue, team output.' },
              { name: 'AgentPilot', desc: 'AI sales coaching for objections, presentations, and closing.' },
              { name: 'PulseFollow', desc: 'Automated, personalized follow-up so no lead goes cold.' },
              { name: 'PolicyPing', desc: 'Policy tracking — renewals, lapses, anniversaries, on autopilot.' },
            ].map((t, i) => (
              <div key={i} className="op-tool">
                <h4>{t.name}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER / CTA ── */}
        <div className="op-footer">
          <div className="op-footer-cta">
            <h3>Join the Waitlist</h3>
            <p>
              Sign up free at <strong style={{ color: '#fff' }}>theapexway.net</strong><br />
              Be first when we open — no cost, no commitment.
            </p>
          </div>
          <div className="op-footer-contact">
            <p>
              <strong style={{ color: '#fff' }}>Apex Affinity Group</strong><br />
              1600 Highway 6, Ste 400<br />
              Sugar Land, TX 77478<br />
              <a href="mailto:info@theapexway.net" style={{ color: '#93c5fd' }}>info@theapexway.net</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

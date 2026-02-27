// =============================================
// Apex Email Template
// Branded email template for all Apex communications
// =============================================

interface ApexEmailTemplateParams {
  preheader?: string;
  content: string;
  ctaText?: string;
  ctaLink?: string;
}

export function createApexEmailTemplate({
  preheader,
  content,
  ctaText,
  ctaLink,
}: ApexEmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Affinity Group</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --navy: #1B3A7D;
      --navy-deep: #0F2354;
      --navy-dark: #0A1A3F;
      --red: #C7181F;
      --red-glow: #E02028;
      --red-soft: #FF4C52;
      --white: #FAFBFF;
      --offwhite: #F0F2F8;
      --silver: #E4E7F0;
      --text: #1A1F36;
      --text-mid: #4A5068;
      --text-light: #7A8098;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--offwhite);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      margin: 0;
      padding: 0;
    }

    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: var(--white);
    }

    .header {
      background: var(--navy-dark);
      padding: 40px 24px;
      text-align: center;
      position: relative;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    .logo {
      max-width: 180px;
      height: auto;
      position: relative;
      z-index: 1;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border: 1.5px solid var(--red);
      border-radius: 100px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--red-soft);
      margin-top: 20px;
      background: rgba(199,24,31,0.08);
      position: relative;
      z-index: 1;
    }

    .badge .star { font-size: 12px; }

    .content {
      padding: 40px 32px;
      background: var(--white);
    }

    h1 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px;
      line-height: 1.2;
      color: var(--navy-deep);
      margin-bottom: 20px;
    }

    h1 em {
      font-style: italic;
      color: var(--red);
    }

    h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 22px;
      line-height: 1.3;
      color: var(--navy-deep);
      margin-top: 32px;
      margin-bottom: 12px;
    }

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--navy-deep);
      margin-top: 24px;
      margin-bottom: 10px;
    }

    p {
      font-size: 15px;
      line-height: 1.7;
      color: var(--text-mid);
      margin-bottom: 16px;
    }

    strong {
      color: var(--navy-deep);
      font-weight: 700;
    }

    ul {
      margin: 16px 0;
      padding-left: 24px;
    }

    li {
      font-size: 15px;
      line-height: 1.7;
      color: var(--text-mid);
      margin-bottom: 8px;
    }

    .info-box {
      background: var(--offwhite);
      border-left: 4px solid var(--navy);
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
    }

    .info-box h3 {
      margin-top: 0;
      font-size: 14px;
      color: var(--navy-deep);
    }

    .info-box p {
      margin-bottom: 12px;
      font-size: 14px;
    }

    .info-box p:last-child {
      margin-bottom: 0;
    }

    .contact-info {
      font-size: 16px;
      font-weight: 700;
      color: var(--navy);
    }

    .phone {
      color: var(--red);
      font-size: 18px;
      font-weight: 700;
    }

    .highlight {
      background: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
      color: var(--text);
    }

    .tip-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }

    .tip-box strong {
      color: var(--text);
    }

    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: var(--red);
      color: #fff !important;
      font-size: 16px;
      font-weight: 700;
      border-radius: 100px;
      text-decoration: none;
      letter-spacing: 0.5px;
      margin: 24px 0;
      box-shadow: 0 0 30px rgba(199,24,31,0.3);
    }

    .cta-button:hover {
      background: var(--red-glow);
    }

    .footer {
      background: var(--navy-dark);
      padding: 32px 24px;
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      line-height: 1.7;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .footer a {
      color: var(--red-soft);
      text-decoration: none;
    }

    .footer p {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      margin-bottom: 8px;
    }

    @media only screen and (max-width: 600px) {
      .header { padding: 30px 20px; }
      .content { padding: 30px 24px; }
      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      .info-box { padding: 20px; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <div class="email-wrapper">
    <!-- Header -->
    <div class="header">
      <img src="https://reachtheapex.net/apex-logo.png" alt="Apex Affinity Group" class="logo" />
      <div class="badge"><span class="star">★</span> Apex Affinity Group</div>
    </div>

    <!-- Content -->
    <div class="content">
      ${content}

      ${ctaText && ctaLink ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${ctaLink}" class="cta-button">${ctaText}</a>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Apex Affinity Group</strong></p>
      <p>Changing the insurance industry. One agent at a time.</p>
      <p style="margin-top: 16px;">
        <a href="https://reachtheapex.net">reachtheapex.net</a>
      </p>
      <p style="margin-top: 16px; font-size: 11px; color: rgba(255,255,255,0.3);">
        © ${new Date().getFullYear()} Apex Affinity Group. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// =============================================
// Apex Email Template V2
// Email-client-safe version with inline styles
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
</head>
<body style="margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0F2F8;">
  ${preheader ? `
  <!--[if !gte mso 9]><!-->
  <div style="display:none;font-size:1px;color:#F0F2F8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <!--<![endif]-->
  ` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0F2F8;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff;" align="center">

          <!-- Header with Navy Blue Background and Grid Pattern -->
          <tr>
            <td style="background-color: #0A1A3F; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAwIDUwIE0gMCAwIEwgNTAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4='); padding: 50px 24px; text-align: center;">
              <!-- Logo - Larger and Centered -->
              <img src="https://reachtheapex.net/apex-logo.png" alt="Apex Affinity Group" style="max-width: 250px; height: auto; display: block; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px; background-color: #ffffff; color: #4A5068; font-size: 15px; line-height: 1.7;">
              ${content}

              ${ctaText && ctaLink ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 32px 0;">
                    <a href="${ctaLink}" style="display: inline-block; padding: 16px 40px; background-color: #C7181F; color: #ffffff; font-size: 16px; font-weight: 700; border-radius: 100px; text-decoration: none; letter-spacing: 0.5px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Footer with Navy Blue Background and Grid -->
          <tr>
            <td style="background-color: #0A1A3F; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAwIDUwIE0gMCAwIEwgNTAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4='); padding: 32px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #ffffff;">Apex Affinity Group</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.5);">Changing the insurance industry. One agent at a time.</p>
              <p style="margin: 16px 0 0; font-size: 13px;">
                <a href="https://reachtheapex.net" style="color: #FF4C52; text-decoration: none;">reachtheapex.net</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: rgba(255,255,255,0.3);">
                © ${new Date().getFullYear()} Apex Affinity Group. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <style>
    /* Email-safe styles */
    h1 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 28px;
      line-height: 1.2;
      color: #0F2354;
      margin: 0 0 20px 0;
    }

    h1 em {
      font-style: italic;
      color: #C7181F;
    }

    h2 {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 22px;
      line-height: 1.3;
      color: #0F2354;
      margin: 32px 0 12px 0;
    }

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: #0F2354;
      margin: 24px 0 10px 0;
    }

    p {
      margin: 0 0 16px 0;
    }

    strong {
      color: #0F2354;
      font-weight: 700;
    }

    ul {
      margin: 16px 0;
      padding-left: 24px;
    }

    li {
      margin-bottom: 8px;
    }

    .info-box {
      background-color: #F0F2F8;
      border-left: 4px solid #1B3A7D;
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
    }

    .info-box h3 {
      margin-top: 0;
      font-size: 14px;
    }

    .info-box p {
      margin-bottom: 12px;
      font-size: 14px;
    }

    .info-box p:last-child {
      margin-bottom: 0;
    }

    .phone {
      color: #C7181F;
      font-size: 18px;
      font-weight: 700;
    }

    .highlight {
      background-color: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }

    .tip-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }

    a {
      color: #1B3A7D;
    }
  </style>
</body>
</html>
  `;
}

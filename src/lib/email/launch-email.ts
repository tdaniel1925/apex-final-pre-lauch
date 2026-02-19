// =============================================
// Launch Email Template
// Sent to waitlist when signups go live
// =============================================

const BASE_URL = 'https://reachtheapex.net';

export function buildLaunchEmail(sourceSlug: string | null) {
  const signupUrl = sourceSlug
    ? `${BASE_URL}/signup?ref=${sourceSlug}`
    : `${BASE_URL}/signup`;

  const returnUrl = sourceSlug ? `${BASE_URL}/${sourceSlug}` : BASE_URL;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We're LIVE — Apex Affinity Group</title>
</head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f6;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(43,76,126,0.12);">

          <!-- ============ HEADER ============ -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2f50 0%,#2B4C7E 100%);padding:48px 40px 40px;text-align:center;">
              <img
                src="${BASE_URL}/apex-logo-white.png"
                alt="Apex Affinity Group"
                style="height:64px;width:auto;display:block;margin:0 auto 20px;"
              />
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:50px;padding:6px 18px;margin-bottom:20px;">
                <span style="color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                  🚀 &nbsp;We're Live
                </span>
              </div>
              <h1 style="margin:0;font-size:36px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
                Your Spot Is Waiting.
              </h1>
            </td>
          </tr>

          <!-- ============ BODY ============ -->
          <tr>
            <td style="padding:44px 44px 12px;">

              <p style="margin:0 0 20px;font-size:17px;color:#374151;line-height:1.7;">
                The wait is officially over.
              </p>

              <p style="margin:0 0 20px;font-size:16px;color:#4b5563;line-height:1.7;">
                You were one of the first people to raise your hand and say
                <strong style="color:#2B4C7E;">"I'm ready."</strong>
                That matters. Now it's time to back that up and claim your place in the Apex Affinity Group matrix.
              </p>

              <p style="margin:0 0 32px;font-size:16px;color:#4b5563;line-height:1.7;">
                Signups are open <strong>right now.</strong> Your position is held on a first-come,
                first-served basis — so don't wait on this one.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
                <tr>
                  <td align="center" style="background:linear-gradient(135deg,#2B4C7E,#1a3a6b);border-radius:12px;box-shadow:0 4px 16px rgba(43,76,126,0.4);">
                    <a
                      href="${signupUrl}"
                      style="display:block;padding:18px 52px;color:#ffffff;text-decoration:none;font-size:17px;font-weight:800;letter-spacing:0.3px;white-space:nowrap;"
                    >
                      Claim My Spot Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you get section -->
              <table cellpadding="0" cellspacing="0" width="100%" style="background:#f8faff;border:1px solid #e0e9f7;border-radius:12px;margin-bottom:36px;">
                <tr>
                  <td style="padding:28px 28px 20px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#2B4C7E;text-transform:uppercase;letter-spacing:1.5px;">
                      What you get when you join
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      ${[
                        ['Your own replicated agent website', 'Share your link, grow your team'],
                        ['AI-powered sales training podcast', 'Learn on the go, close more deals'],
                        ['Built-in matrix compensation', 'Earn from your entire downline'],
                        ['Full back-office dashboard', 'Track your team and commissions in real time'],
                      ].map(([title, desc]) => `
                      <tr>
                        <td style="padding:6px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:12px;vertical-align:top;">
                                <div style="width:22px;height:22px;background:#2B4C7E;border-radius:50%;text-align:center;line-height:22px;font-size:11px;color:#fff;font-weight:700;">✓</div>
                              </td>
                              <td>
                                <p style="margin:0;font-size:14px;font-weight:700;color:#1f2937;">${title}</p>
                                <p style="margin:2px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join('')}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0 0 36px;font-size:12px;color:#2B4C7E;word-break:break-all;font-family:monospace;">
                ${signupUrl}
              </p>

            </td>
          </tr>

          <!-- ============ FOOTER ============ -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:28px 44px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
                You're receiving this because you joined the Apex Affinity Group pre-launch waitlist.
              </p>
              <p style="margin:0;font-size:13px;">
                <a href="${returnUrl}" style="color:#2B4C7E;text-decoration:none;font-weight:600;">
                  Visit Apex Affinity Group
                </a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Below card -->
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
          &copy; ${new Date().getFullYear()} Apex Affinity Group &bull; reachtheapex.net
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  return {
    subject: "🚀 Signups Are LIVE — Your Spot Is Waiting",
    html,
  };
}

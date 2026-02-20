// =============================================
// Training Content Email Template
// Audio podcast-style email with embedded player
// =============================================

import type { TrainingContent, TrainingStreak } from '@/types/training';

interface TrainingContentEmailProps {
  content: TrainingContent;
  streak?: TrainingStreak;
  userName: string;
  contentUrl: string;
}

export function TrainingContentEmail({
  content,
  streak,
  userName,
  contentUrl,
}: TrainingContentEmailProps) {
  const durationMinutes = content.duration_seconds
    ? Math.ceil(content.duration_seconds / 60)
    : 2;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title} - APEX Training</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2B4E7E 0%, #1e3a5f 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      color: #e0e0e0;
      margin: 10px 0 0 0;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .title-section {
      margin-bottom: 30px;
    }
    .title-section h2 {
      color: #2B4E7E;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .duration {
      color: #666666;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .audio-player {
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .audio-player audio {
      width: 100%;
      max-width: 500px;
      outline: none;
    }
    .cta-button {
      display: inline-block;
      background: #2B4E7E;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: background 0.3s;
    }
    .cta-button:hover {
      background: #1e3a5f;
    }
    .key-takeaways {
      background: #f0f7ff;
      border-left: 4px solid #2B4E7E;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .key-takeaways h3 {
      color: #2B4E7E;
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    .key-takeaways ul {
      margin: 0;
      padding-left: 20px;
      color: #333333;
    }
    .key-takeaways li {
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .streak-section {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #ffffff;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
    }
    .streak-section h3 {
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .streak-stats {
      display: flex;
      justify-content: space-around;
      gap: 20px;
      margin-top: 15px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 700;
      display: block;
    }
    .stat-label {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 14px;
    }
    .footer a {
      color: #2B4E7E;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .streak-stats {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎓 APEX Training</h1>
      <p>Your Daily Growth Delivered</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${userName},</p>

      <div class="title-section">
        <h2>${content.title}</h2>
        <span class="duration">🎧 ${durationMinutes} min listen</span>
      </div>

      ${content.description ? `<p style="color: #555555; line-height: 1.8; font-size: 16px;">${content.description}</p>` : ''}

      <!-- Audio Player -->
      ${
        content.audio_url
          ? `
      <div class="audio-player">
        <audio controls preload="metadata">
          <source src="${content.audio_url}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
        <p style="margin: 15px 0 0 0; color: #666666; font-size: 13px;">
          Can't play? <a href="${content.audio_url}" style="color: #2B4E7E;">Download the audio</a>
        </p>
      </div>
      `
          : ''
      }

      <!-- CTA Button -->
      <center>
        <a href="${contentUrl}" class="cta-button">
          Mark as Complete
        </a>
      </center>

      <!-- Key Takeaways -->
      ${
        content.key_takeaways && content.key_takeaways.length > 0
          ? `
      <div class="key-takeaways">
        <h3>📝 Key Takeaways</h3>
        <ul>
          ${content.key_takeaways.map((takeaway) => `<li>${takeaway}</li>`).join('')}
        </ul>
      </div>
      `
          : ''
      }

      <!-- Streak Section -->
      ${
        streak
          ? `
      <div class="streak-section">
        <h3>🔥 Your Learning Journey</h3>
        <div class="streak-stats">
          <div class="stat">
            <span class="stat-value">${streak.current_streak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
          <div class="stat">
            <span class="stat-value">${streak.total_points}</span>
            <span class="stat-label">Total Points</span>
          </div>
          <div class="stat">
            <span class="stat-value">${streak.total_lessons_completed}</span>
            <span class="stat-label">Lessons Done</span>
          </div>
        </div>
      </div>
      `
          : ''
      }

      ${
        content.transcript
          ? `
      <details style="margin-top: 30px;">
        <summary style="cursor: pointer; color: #2B4E7E; font-weight: 600; padding: 10px 0;">
          📄 View Full Transcript
        </summary>
        <div style="margin-top: 15px; padding: 20px; background: #f8f9fa; border-radius: 8px; color: #333333; line-height: 1.8;">
          ${content.transcript}
        </div>
      </details>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>APEX Affinity Group</strong><br>
        Building Success Together
      </p>
      <p style="margin: 10px 0;">
        <a href="${contentUrl}">View in Dashboard</a> |
        <a href="${contentUrl}/settings">Manage Subscription</a>
      </p>
      <p style="margin: 20px 0 0 0; font-size: 12px; color: #999999;">
        You're receiving this because you subscribed to APEX Training.<br>
        © ${new Date().getFullYear()} APEX Affinity Group. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

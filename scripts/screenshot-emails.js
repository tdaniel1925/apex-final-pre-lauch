const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const emails = [
  {
    name: 'real-estate-listing',
    file: 'real-estate-listing.html',
    title: 'Luxury Real Estate Listing'
  },
  {
    name: 'financial-newsletter',
    file: 'financial-newsletter.html',
    title: 'Financial Market Newsletter'
  },
  {
    name: 'healthcare-appointment',
    file: 'healthcare-appointment.html',
    title: 'Healthcare Appointment Reminder'
  },
  {
    name: 'coaching-webinar',
    file: 'coaching-webinar.html',
    title: 'Business Coaching Webinar'
  }
];

(async () => {
  console.log('Starting email screenshot capture...\n');

  const browser = await chromium.launch({ headless: false });

  // High-quality context for email screenshots
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1600 }, // Email-friendly dimensions
    deviceScaleFactor: 2, // 2x resolution for retina displays
  });

  const page = await context.newPage();

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'public', 'examples', 'email-screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const email of emails) {
    try {
      console.log(`Processing: ${email.title}...`);

      // Load the email HTML file
      const emailPath = path.join(__dirname, '..', 'public', 'examples', 'emails', email.file);
      await page.goto(`file://${emailPath}`);

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take full page screenshot
      const screenshotPath = path.join(outputDir, `${email.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        type: 'png',
        fullPage: true,
        scale: 'device'
      });

      const stats = fs.statSync(screenshotPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✓ Saved ${email.name}.png (${fileSizeKB} KB)`);

    } catch (error) {
      console.error(`✗ Failed to screenshot ${email.title}:`, error.message);
    }
  }

  await browser.close();
  console.log('\n✓ Email screenshot capture complete!');
})();

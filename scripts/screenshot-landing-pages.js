/**
 * Screenshot Landing Pages
 * Takes screenshots of all landing page HTML files for thumbnails
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EXAMPLES_DIR = path.join(__dirname, '../public/examples');
const SCREENSHOTS_DIR = path.join(__dirname, '../public/examples/screenshots');

// Landing pages to screenshot
const landingPages = [
  'Luxury Real Estate Agency',
  'Modern Medical Clinic',
  'Neon Fintech Platform',
  'Minimal SaaS Productivity Tool',
  'Organic Food Brand',
  'Travel & Adventure Landing Page',
  'Fitness & Wellness Landing Page',
  'Kids Education App',
  'Legal Services Landing Page',
  'Automotive Landing Page',
  'Brutalist Architecture Firm',
  'Retro Music Streaming',
];

async function screenshotLandingPages() {
  console.log('🎬 Starting screenshot process...\n');

  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    console.log('✅ Created screenshots directory\n');
  }

  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();

  let successCount = 0;
  let errorCount = 0;

  for (const landingPage of landingPages) {
    try {
      const htmlPath = path.join(EXAMPLES_DIR, landingPage, 'index.html');

      if (!fs.existsSync(htmlPath)) {
        console.log(`⚠️  Skipping "${landingPage}" - HTML file not found`);
        errorCount++;
        continue;
      }

      console.log(`📸 Screenshotting: ${landingPage}`);

      // Load the HTML file
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

      // Wait a bit for any animations to settle
      await page.waitForTimeout(1000);

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${landingPage}.jpg`);
      await page.screenshot({
        path: screenshotPath,
        type: 'jpeg',
        quality: 85,
        fullPage: true, // Capture entire page, not just viewport
      });

      console.log(`   ✅ Saved to: ${path.basename(screenshotPath)}\n`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error screenshotting "${landingPage}":`, error.message, '\n');
      errorCount++;
    }
  }

  await browser.close();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✨ Screenshot process complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${landingPages.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

screenshotLandingPages().catch(console.error);

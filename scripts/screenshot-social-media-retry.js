const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Retry for the platforms that failed
const socialMediaChannels = [
  {
    name: 'linkedin',
    url: 'https://www.linkedin.com/company/apex-affinity-group',
    waitFor: 5000
  },
  {
    name: 'facebook',
    url: 'https://www.facebook.com/apexaffinitygroup',
    waitFor: 5000
  },
  {
    name: 'twitter',
    url: 'https://x.com/ApexAffinityGrp',
    waitFor: 5000
  }
];

async function captureScreenshots() {
  console.log('🚀 Retrying failed social media screenshots...\n');

  const outputDir = path.join(__dirname, '..', 'public', 'examples', 'social-media');
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--window-size=1400,900',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const page = await context.newPage();

  for (const channel of socialMediaChannels) {
    try {
      console.log(`📸 Capturing ${channel.name.toUpperCase()}...`);

      // Navigate with reduced timeout and different wait strategy
      await page.goto(channel.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });

      // Wait for content
      await page.waitForTimeout(channel.waitFor);

      // Try to dismiss any popups/modals
      try {
        // Close cookie banners, login prompts, etc.
        const closeButtons = await page.$$('button[aria-label*="Close"], button[aria-label*="close"], [role="button"][aria-label*="Close"]');
        for (const button of closeButtons) {
          try {
            await button.click({ timeout: 1000 });
          } catch (e) {
            // Ignore if click fails
          }
        }
      } catch (e) {
        // Ignore popup dismissal errors
      }

      await page.waitForTimeout(2000);

      // Scroll to trigger content
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(1500);

      // Capture full page screenshot
      const fullPagePath = path.join(outputDir, `${channel.name}-full.jpg`);
      await page.screenshot({
        path: fullPagePath,
        type: 'jpeg',
        quality: 85,
        fullPage: true
      });
      console.log(`  ✅ Full page screenshot saved: ${channel.name}-full.jpg`);

      // Capture hero view
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);

      const heroPath = path.join(outputDir, `${channel.name}-hero.jpg`);
      await page.screenshot({
        path: heroPath,
        type: 'jpeg',
        quality: 85,
        fullPage: false
      });
      console.log(`  ✅ Hero screenshot saved: ${channel.name}-hero.jpg\n`);

    } catch (error) {
      console.error(`❌ Error capturing ${channel.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Retry complete!');
  console.log(`📁 Screenshots saved to: ${outputDir}`);
}

captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

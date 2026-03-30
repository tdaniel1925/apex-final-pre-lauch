const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const socialMediaChannels = [
  {
    name: 'youtube',
    url: 'https://www.youtube.com/@ApexAffinityGroup',
    selector: 'ytd-rich-item-renderer',
    waitFor: 3000
  },
  {
    name: 'instagram',
    url: 'https://www.instagram.com/apexaffinitygroup/',
    selector: 'article',
    waitFor: 4000
  },
  {
    name: 'tiktok',
    url: 'https://www.tiktok.com/@apexaffinitygroup',
    selector: 'div[data-e2e="user-post-item"]',
    waitFor: 4000
  },
  {
    name: 'linkedin',
    url: 'https://linkedin.com/company/apex-affinity-group',
    selector: '.feed-shared-update-v2',
    waitFor: 3000
  },
  {
    name: 'facebook',
    url: 'https://www.facebook.com/apexaffinitygroup',
    selector: 'div[role="article"]',
    waitFor: 3000
  },
  {
    name: 'twitter',
    url: 'https://x.com/ApexAffinityGrp',
    selector: 'article[data-testid="tweet"]',
    waitFor: 3000
  }
];

async function captureScreenshots() {
  console.log('🚀 Starting social media screenshot capture...\n');

  // Create output directory
  const outputDir = path.join(__dirname, '..', 'public', 'examples', 'social-media');
  await fs.mkdir(outputDir, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    headless: false, // Set to true for production
    args: ['--window-size=1400,900']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  for (const channel of socialMediaChannels) {
    try {
      console.log(`📸 Capturing ${channel.name.toUpperCase()}...`);

      // Navigate to the page
      await page.goto(channel.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(channel.waitFor);

      // Scroll down a bit to trigger lazy loading
      await page.evaluate(() => window.scrollBy(0, 500));
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

      // Capture above-the-fold view
      const heroPath = path.join(outputDir, `${channel.name}-hero.jpg`);
      await page.screenshot({
        path: heroPath,
        type: 'jpeg',
        quality: 85,
        fullPage: false
      });
      console.log(`  ✅ Hero screenshot saved: ${channel.name}-hero.jpg`);

      // Try to capture individual posts (if selectors work)
      try {
        const posts = await page.$$(channel.selector);
        if (posts.length > 0) {
          // Capture first 3 posts
          const postsToCapture = Math.min(3, posts.length);
          for (let i = 0; i < postsToCapture; i++) {
            try {
              const postPath = path.join(outputDir, `${channel.name}-post-${i + 1}.jpg`);
              await posts[i].screenshot({
                path: postPath,
                type: 'jpeg',
                quality: 85
              });
              console.log(`  ✅ Post ${i + 1} screenshot saved: ${channel.name}-post-${i + 1}.jpg`);
            } catch (postError) {
              console.log(`  ⚠️  Could not capture post ${i + 1}: ${postError.message}`);
            }
          }
        }
      } catch (selectorError) {
        console.log(`  ℹ️  Could not capture individual posts (selector may have changed)`);
      }

      console.log('');

    } catch (error) {
      console.error(`❌ Error capturing ${channel.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`📁 Screenshots saved to: ${outputDir}`);
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

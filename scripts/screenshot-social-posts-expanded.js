const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const socialPlatforms = [
  {
    name: 'youtube',
    url: 'https://www.youtube.com/@ApexAffinityGroup/videos',
    postSelector: 'ytd-rich-item-renderer',
    clickSelector: 'ytd-rich-item-renderer #thumbnail',
    modalSelector: 'ytd-watch-flexy',
    closeSelector: null,
    waitTime: 3000,
    maxPosts: 6,
    useForceClick: true
  },
  {
    name: 'instagram',
    url: 'https://www.instagram.com/apexaffinitygroup/',
    postSelector: 'article a[href*="/p/"]',
    clickSelector: 'article a[href*="/p/"]',
    modalSelector: 'div[role="dialog"] article',
    closeSelector: 'button svg[aria-label="Close"]',
    waitTime: 4000,
    maxPosts: 6,
    useForceClick: true
  },
  {
    name: 'tiktok',
    url: 'https://www.tiktok.com/@apexaffinitygroup',
    postSelector: 'div[data-e2e="user-post-item"]',
    clickSelector: 'div[data-e2e="user-post-item"] a',
    modalSelector: 'div[data-e2e="browse-video"]',
    closeSelector: 'button[data-e2e="browse-close"]',
    waitTime: 4000,
    maxPosts: 6
  },
  {
    name: 'facebook',
    url: 'https://www.facebook.com/apexaffinitygroup',
    postSelector: 'div[data-pagelet*="FeedUnit"]',
    clickSelector: 'div[data-pagelet*="FeedUnit"] img',
    modalSelector: 'div[role="dialog"]',
    closeSelector: 'div[aria-label="Close"]',
    waitTime: 4000,
    maxPosts: 4
  }
];

async function captureExpandedPosts() {
  console.log('🚀 Capturing EXPANDED social media posts (full modal views)...\n');

  const outputDir = path.join(__dirname, '..', 'public', 'examples', 'social-posts');
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: false, // Keep visible to debug
    args: [
      '--window-size=1920,1080',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const page = await context.newPage();
  let totalCaptured = 0;

  for (const platform of socialPlatforms) {
    try {
      console.log(`📸 Capturing ${platform.name.toUpperCase()} expanded posts...`);

      await page.goto(platform.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });

      await page.waitForTimeout(platform.waitTime);

      // Dismiss popups
      try {
        const closeButtons = await page.$$('button[aria-label*="Close"], button[aria-label*="close"], [aria-label*="Dismiss"]');
        for (const button of closeButtons.slice(0, 3)) {
          try {
            await button.click({ timeout: 1000 });
            await page.waitForTimeout(500);
          } catch (e) {
            // Ignore
          }
        }
      } catch (e) {
        // Ignore
      }

      // Scroll to load posts
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(2000);

      // Find clickable posts
      const postLinks = await page.$$(platform.clickSelector);

      if (postLinks.length === 0) {
        console.log(`  ⚠️  No posts found - platform may have bot protection\n`);
        continue;
      }

      console.log(`  ✅ Found ${postLinks.length} posts`);

      const postsToCapture = Math.min(platform.maxPosts, postLinks.length);
      let captured = 0;

      for (let i = 0; i < postsToCapture; i++) {
        try {
          // Refresh post links (DOM may have changed)
          const currentPostLinks = await page.$$(platform.clickSelector);
          if (i >= currentPostLinks.length) break;

          console.log(`  🔍 Opening post ${i + 1}...`);

          // Click post to open modal (use force if needed)
          if (platform.useForceClick) {
            await currentPostLinks[i].click({ force: true });
          } else {
            await currentPostLinks[i].click();
          }
          await page.waitForTimeout(3000); // Wait for modal to load

          // Wait for modal to appear
          try {
            await page.waitForSelector(platform.modalSelector, { timeout: 5000 });
          } catch (e) {
            console.log(`  ⚠️  Modal didn't appear for post ${i + 1}`);
            await page.goBack();
            await page.waitForTimeout(2000);
            continue;
          }

          await page.waitForTimeout(2000); // Extra time for images to load

          // Screenshot the modal
          const postPath = path.join(outputDir, `${platform.name}-post-${i + 1}.png`);

          if (platform.name === 'youtube') {
            // For YouTube, screenshot the whole page
            await page.screenshot({
              path: postPath,
              type: 'png',
              fullPage: false
            });
          } else {
            // For others, try to screenshot just the modal
            const modal = await page.$(platform.modalSelector);
            if (modal) {
              await modal.screenshot({
                path: postPath,
                type: 'png'
              });
            } else {
              await page.screenshot({
                path: postPath,
                type: 'png',
                fullPage: false
              });
            }
          }

          captured++;
          totalCaptured++;
          console.log(`  ✅ Captured expanded post ${i + 1}`);

          // Close modal
          if (platform.closeSelector) {
            try {
              await page.click(platform.closeSelector, { timeout: 2000 });
            } catch (e) {
              await page.keyboard.press('Escape');
            }
          } else {
            await page.goBack();
          }

          await page.waitForTimeout(2000);

        } catch (postError) {
          console.log(`  ⚠️  Could not capture post ${i + 1}: ${postError.message}`);
          // Try to recover
          try {
            await page.keyboard.press('Escape');
            await page.goBack();
          } catch (e) {
            // Continue
          }
          await page.waitForTimeout(2000);
        }
      }

      console.log(`  📊 Successfully captured ${captured}/${postsToCapture} expanded posts from ${platform.name}\n`);

    } catch (error) {
      console.error(`❌ Failed to process ${platform.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Expanded post capture complete!');
  console.log(`📁 Captured ${totalCaptured} total expanded post screenshots`);
  console.log(`📁 Screenshots saved to: ${outputDir}`);
}

captureExpandedPosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

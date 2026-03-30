const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const socialPlatforms = [
  {
    name: 'youtube',
    url: 'https://www.youtube.com/@ApexAffinityGroup/videos',
    postSelector: 'ytd-rich-item-renderer',
    scrollAmount: 1000,
    waitTime: 3000,
    maxPosts: 6
  },
  {
    name: 'instagram',
    url: 'https://www.instagram.com/apexaffinitygroup/',
    postSelector: 'article > div > div > div > div a',
    scrollAmount: 800,
    waitTime: 4000,
    maxPosts: 6
  },
  {
    name: 'tiktok',
    url: 'https://www.tiktok.com/@apexaffinitygroup',
    postSelector: 'div[data-e2e="user-post-item"]',
    scrollAmount: 1000,
    waitTime: 4000,
    maxPosts: 6
  },
  {
    name: 'linkedin',
    url: 'https://www.linkedin.com/company/apex-affinity-group/posts/',
    postSelector: '.feed-shared-update-v2',
    scrollAmount: 1000,
    waitTime: 4000,
    maxPosts: 4
  },
  {
    name: 'facebook',
    url: 'https://www.facebook.com/apexaffinitygroup',
    postSelector: 'div[data-pagelet*="FeedUnit"]',
    scrollAmount: 1000,
    waitTime: 4000,
    maxPosts: 4
  },
  {
    name: 'twitter',
    url: 'https://x.com/ApexAffinityGrp',
    postSelector: 'article[data-testid="tweet"]',
    scrollAmount: 1000,
    waitTime: 3000,
    maxPosts: 6
  }
];

async function capturePostScreenshots() {
  console.log('🚀 Capturing individual social media posts...\n');

  const outputDir = path.join(__dirname, '..', 'public', 'examples', 'social-posts');
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
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2, // 2x resolution for retina displays
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const page = await context.newPage();
  let totalCaptured = 0;

  for (const platform of socialPlatforms) {
    try {
      console.log(`📸 Capturing ${platform.name.toUpperCase()} posts...`);

      await page.goto(platform.url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });

      await page.waitForTimeout(platform.waitTime);

      // Dismiss any popups
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

      // Scroll to load more content
      await page.evaluate((scrollAmount) => window.scrollBy(0, scrollAmount), platform.scrollAmount);
      await page.waitForTimeout(2000);

      // Try to find posts
      const posts = await page.$$(platform.postSelector);

      if (posts.length === 0) {
        console.log(`  ⚠️  No posts found - platform may have bot protection or selector outdated\n`);
        continue;
      }

      console.log(`  ✅ Found ${posts.length} posts`);

      // Capture up to maxPosts
      const postsToCapture = Math.min(platform.maxPosts, posts.length);
      let captured = 0;

      for (let i = 0; i < postsToCapture; i++) {
        try {
          // Scroll post into view
          await posts[i].scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          const postPath = path.join(outputDir, `${platform.name}-post-${i + 1}.png`);
          await posts[i].screenshot({
            path: postPath,
            type: 'png',
            scale: 'device' // Use device scale factor (2x)
          });

          captured++;
          totalCaptured++;
          console.log(`  ✅ Captured post ${i + 1}`);
        } catch (postError) {
          console.log(`  ⚠️  Could not capture post ${i + 1}: ${postError.message}`);
        }
      }

      console.log(`  📊 Successfully captured ${captured}/${postsToCapture} posts from ${platform.name}\n`);

    } catch (error) {
      console.error(`❌ Failed to load ${platform.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('✨ Screenshot capture complete!');
  console.log(`📁 Captured ${totalCaptured} total post screenshots`);
  console.log(`📁 Screenshots saved to: ${outputDir}`);
}

capturePostScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

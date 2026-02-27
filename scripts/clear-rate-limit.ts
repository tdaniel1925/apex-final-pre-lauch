// =============================================
// Clear Rate Limit Script
// Use this to reset rate limits during development
// =============================================

import { Redis } from '@upstash/redis';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

async function clearRateLimits() {
  try {
    console.log('🧹 Clearing password reset rate limits...');

    // Get all keys with the password reset rate limit prefix
    const keys = await redis.keys('ratelimit:password:*');

    if (keys.length === 0) {
      console.log('✅ No rate limit keys found - you should be good to go!');
      return;
    }

    console.log(`Found ${keys.length} rate limit keys to clear`);

    // Delete all the keys
    for (const key of keys) {
      await redis.del(key);
      console.log(`  ✓ Cleared: ${key}`);
    }

    console.log('\n✅ All password reset rate limits cleared!');
    console.log('You can now test the password reset flow again.');

  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
    process.exit(1);
  }
}

clearRateLimits();

# Scaling Implementation Guide
**Step-by-step instructions to implement production scaling**

---

## Quick Start: Critical Optimizations (Do First)

### ✅ Step 1: Next.js Configuration (COMPLETED)
**Status**: ✅ Done
**Time**: 15 minutes

The `next.config.ts` has been optimized with:
- Security headers (X-Frame-Options, CSP, etc.)
- Image optimization (AVIF, WebP support)
- Compression enabled
- Production-ready settings

**No action needed** - already implemented.

---

### 🚀 Step 2: Set Up Upstash Redis (Required for Rate Limiting)
**Status**: ⏳ Pending - You Need to Do This
**Time**: 10 minutes
**Cost**: Free tier available (10k requests/day)

#### Instructions:

1. **Create Upstash Account**
   - Go to https://console.upstash.com/
   - Sign up (free)
   - Click "Create Database"
   - Choose: **Redis** (not Kafka)
   - Region: **us-east-1** (closest to Vercel)
   - Type: **Regional** (cheaper, fine for rate limiting)
   - Name: `apex-ratelimit`

2. **Get Your Credentials**
   - After creation, click on your database
   - Scroll to "REST API" section
   - Copy these two values:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

3. **Add to Environment Variables**

   **Local Development** (`.env.local`):
   ```bash
   UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token-here"
   ```

   **Vercel Production**:
   - Go to Vercel dashboard
   - Project settings → Environment Variables
   - Add both variables
   - Redeploy your app

4. **Verify It Works**
   ```bash
   # In Upstash console, go to "CLI" tab and run:
   PING
   # Should respond: PONG
   ```

---

### 🛡️ Step 3: Add Rate Limiting to API Routes
**Status**: ✅ Library created, ⏳ needs to be added to routes
**Time**: 2-3 hours (for all 59 routes)

#### Quick Reference:

**For Public Routes** (signup, login, password reset):
```typescript
import { publicRateLimit, checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit by IP address
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(publicRateLimit, ip);
  if (rateLimitResponse) return rateLimitResponse;

  // Your route logic here...
}
```

**For Authenticated API Routes**:
```typescript
import { apiRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit by user ID
  const rateLimitResponse = await checkRateLimit(apiRateLimit, user.id);
  if (rateLimitResponse) return rateLimitResponse;

  // Your route logic here...
}
```

**For Admin Routes**:
```typescript
import { adminRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit by admin ID
  const rateLimitResponse = await checkRateLimit(adminRateLimit, admin.id);
  if (rateLimitResponse) return rateLimitResponse;

  // Your route logic here...
}
```

**For Email Sending Routes** (stricter limit):
```typescript
import { emailRateLimit, checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Strict limit: 5 emails per hour
  const rateLimitResponse = await checkRateLimit(emailRateLimit, admin.id);
  if (rateLimitResponse) return rateLimitResponse;

  // Send email here...
}
```

#### Priority Order for Adding Rate Limiting:

**🔴 Critical - Do First** (highest abuse risk):
1. ✅ `/api/admin/distributors/[id]/resend-welcome` - DONE (example)
2. `/api/admin/test-email` - Email testing
3. `/api/admin/waitlist/send` - Bulk email sending
4. Any password reset routes
5. Any signup/registration routes

**🟡 High Priority**:
6. All email template routes
7. Matrix placement routes
8. User profile update routes
9. Admin distributor management routes

**🟢 Standard Priority**:
10. All remaining GET routes (read-only, less critical)

---

### 📊 Step 4: Set Up Sentry for Error Monitoring
**Status**: ⏳ Pending
**Time**: 30 minutes
**Cost**: Free tier (5k errors/month)

#### Instructions:

1. **Create Sentry Account**
   - Go to https://sentry.io/
   - Sign up (free)
   - Create new project
   - Platform: **Next.js**
   - Name: `apex-affinity-group`

2. **Install Sentry**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
   This will:
   - Install @sentry/nextjs
   - Create sentry configuration files
   - Add environment variables to .env.local

3. **Configure**
   The wizard will create:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`

   Update them with:
   ```typescript
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
     environment: process.env.NODE_ENV,
     enabled: process.env.NODE_ENV === 'production',
   });
   ```

4. **Add to Vercel**
   - Vercel → Environment Variables
   - Add `NEXT_PUBLIC_SENTRY_DSN`
   - Add `SENTRY_AUTH_TOKEN` (for source maps)

5. **Test It**
   Create a test error:
   ```typescript
   // In any page for testing
   throw new Error('Testing Sentry integration');
   ```
   Check Sentry dashboard for the error.

---

### 💰 Step 5: Add Redis Caching (High Impact)
**Status**: ⏳ Pending (requires Upstash from Step 2)
**Time**: 3-4 hours
**Performance Gain**: 80-90% for cached queries

#### Create Caching Utility:

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await redis.get(key);
    if (cached) {
      return cached as T;
    }

    // Cache miss - fetch data
    const data = await fetcher();

    // Store in cache
    await redis.set(key, data, { ex: ttl });

    return data;
  } catch (error) {
    // If Redis fails, still return data (fail gracefully)
    console.error('Cache error:', error);
    return fetcher();
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}
```

#### Usage Examples:

**Cache Dashboard Stats** (30s TTL):
```typescript
// src/app/admin/page.tsx
import { getCached } from '@/lib/cache';

const totalDistributors = await getCached(
  'stats:total-distributors',
  async () => {
    const { count } = await serviceClient
      .from('distributors')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  },
  30 // 30 seconds
);
```

**Cache Leaderboard** (60s TTL):
```typescript
const leaderboard = await getCached(
  'leaderboard:top100',
  async () => {
    const { data } = await serviceClient
      .from('distributors')
      .select('id, first_name, last_name, points')
      .order('points', { ascending: false })
      .limit(100);
    return data;
  },
  60
);
```

**Cache Matrix Tree** (5min TTL):
```typescript
const matrixTree = await getCached(
  `matrix:tree:${userId}`,
  async () => {
    // Expensive genealogy query
    return await fetchCompleteMatrixTree(userId);
  },
  300 // 5 minutes
);
```

**Invalidate Cache on Updates**:
```typescript
// After adding a new distributor
await invalidateCache('stats:*');
await invalidateCache('leaderboard:*');
await invalidateCache(`matrix:tree:${parentId}`);
```

#### What to Cache:

| Data Type | Cache Key | TTL | When to Use |
|-----------|-----------|-----|-------------|
| Global stats | `stats:global` | 30s | Admin dashboard totals |
| Leaderboard | `leaderboard:top100` | 60s | Frequently viewed, changes slowly |
| Matrix tree | `matrix:tree:{userId}` | 300s | Expensive query, rarely changes |
| User profile | `user:{userId}` | 600s | Changes infrequently |
| Training leaderboard | `training:leaderboard` | 60s | Gamification data |
| Email templates | `email:templates` | 3600s | Rarely change |

---

### 🔄 Step 6: Background Jobs with Inngest (Optional but Recommended)
**Status**: ⏳ Pending
**Time**: 4-5 hours
**Cost**: Free tier (50k steps/month)

#### When You Need This:
- Training audio transcoding (blocking API requests)
- Sending bulk emails (timeouts)
- Matrix recalculation (database locks)
- Periodic leaderboard updates

#### Quick Setup:

1. **Create Inngest Account**
   - Go to https://www.inngest.com/
   - Sign up (free)
   - Create app: `apex-affinity-group`

2. **Install Inngest**
   ```bash
   npm install inngest
   ```

3. **Create Inngest Client**
   ```typescript
   // src/lib/inngest/client.ts
   import { Inngest } from 'inngest';

   export const inngest = new Inngest({ id: 'apex-affinity-group' });
   ```

4. **Define Jobs**
   ```typescript
   // src/lib/inngest/functions.ts
   import { inngest } from './client';
   import { sendWelcomeEmail } from '@/lib/email/campaign-service';

   export const sendWelcomeEmailJob = inngest.createFunction(
     { id: 'send-welcome-email' },
     { event: 'user.signup' },
     async ({ event, step }) => {
       await step.run('send-email', async () => {
         return sendWelcomeEmail(event.data.userId);
       });
     }
   );

   export const transcodeAudioJob = inngest.createFunction(
     { id: 'transcode-audio' },
     { event: 'training.audio.uploaded' },
     async ({ event, step }) => {
       const audioUrl = event.data.audioUrl;

       // This can take 5+ minutes, perfect for background job
       await step.run('transcode', async () => {
         return transcodeTrainingAudio(audioUrl);
       });
     }
   );
   ```

5. **Create API Route**
   ```typescript
   // src/app/api/inngest/route.ts
   import { serve } from 'inngest/next';
   import { inngest } from '@/lib/inngest/client';
   import { sendWelcomeEmailJob, transcodeAudioJob } from '@/lib/inngest/functions';

   export const { GET, POST, PUT } = serve({
     client: inngest,
     functions: [
       sendWelcomeEmailJob,
       transcodeAudioJob,
     ],
   });
   ```

6. **Trigger Jobs**
   ```typescript
   // After user signup
   await inngest.send({
     name: 'user.signup',
     data: { userId: newUser.id },
   });

   // After audio upload
   await inngest.send({
     name: 'training.audio.uploaded',
     data: { audioUrl: uploadedFile.url },
   });
   ```

---

## Testing Your Scaling Implementation

### Test Rate Limiting:

```bash
# Test public rate limit (10 req/min)
for i in {1..15}; do
  curl -X POST http://localhost:3050/api/some-public-route
done
# Should get 429 error after 10 requests
```

### Test Caching:

1. Visit admin dashboard
2. Check Redis console - should see keys like `stats:total-distributors`
3. Refresh page - should load faster (cached)
4. Wait for TTL to expire - should refresh data

### Load Test with k6:

```bash
# Install k6
npm install -g k6

# Create test script
# k6-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('https://reachtheapex.net/dashboard');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}

# Run test
k6 run k6-test.js
```

---

## Deployment Checklist

Before deploying to production with scaling features:

- [ ] Upstash Redis created and credentials added to Vercel
- [ ] Rate limiting added to all 59 API routes
- [ ] Sentry configured and tested
- [ ] Caching implemented for expensive queries
- [ ] Next.js config optimized (already done)
- [ ] Load testing performed (at least basic k6 test)
- [ ] Monitoring dashboards set up (Vercel Analytics, Sentry, Upstash)
- [ ] Alert rules configured (email/Slack for critical errors)
- [ ] .env.example updated with all new variables
- [ ] Documentation updated for new developers

---

## Monitoring After Deployment

### Week 1 After Launch:
- Check Sentry daily for error spikes
- Monitor Upstash dashboard for rate limit hits
- Review Vercel Analytics for slow pages
- Watch database connection pool usage in Supabase

### Ongoing:
- Review Sentry issues weekly
- Check cache hit rates monthly (should be > 70%)
- Monitor Redis memory usage
- Track API response times (P95 should be < 500ms)

---

## Cost Projection

At different user scales:

| Users | Upstash | Sentry | Inngest | Vercel | Supabase | Total/mo |
|-------|---------|--------|---------|--------|----------|----------|
| < 500 | Free | Free | Free | Free | Free | $0 |
| 1,000 | $20 | Free | Free | $20 | $25 | $65 |
| 5,000 | $50 | $26 | $20 | $20 | $99 | $215 |
| 10,000 | $80 | $80 | $100 | $150 | $199 | $609 |

**ROI**: At 1,000 users paying $50/mo = $50k revenue vs. $65/mo infrastructure = 99.87% profit margin on infrastructure.

---

## Need Help?

- **Upstash Setup**: https://docs.upstash.com/redis
- **Rate Limiting Docs**: https://upstash.com/docs/oss/sdks/ts/ratelimit/overview
- **Sentry Next.js**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Inngest**: https://www.inngest.com/docs

---

**This guide should be updated as you implement each step and discover platform-specific quirks.**

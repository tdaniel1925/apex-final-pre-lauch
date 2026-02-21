

# Service Cost Tracking System
**Complete guide to monitoring and managing 3rd party service costs**

---

## Overview

This system automatically tracks usage and costs for all 3rd party services:
- **OpenAI** (GPT-4o, GPT-4o-mini, embeddings)
- **Anthropic Claude** (when added)
- **Upstash Redis** (caching, rate limiting)
- **Resend** (email sending)

Every API call is logged with:
- Exact cost calculation
- Token/request counts
- Which feature triggered it
- Performance metrics
- Context (user, admin, system)

---

## Quick Start

### 1. Apply Database Migration

```bash
# Apply the migration to create all tables
cd supabase
supabase migration up
```

This creates 5 tables:
- `services` - Service configuration
- `service_usage_logs` - Every API call with cost
- `service_budgets` - Monthly budgets per service
- `service_cost_alerts` - Budget warnings
- `service_pricing` - Current pricing models

### 2. Set Monthly Budgets

Visit: `/admin/services`

Or use API:
```typescript
// Set $50/month budget for OpenAI
await setServiceBudget({
  service: 'openai',
  budgetUsd: 50,
  alertThresholdPercent: 80, // Alert at 80% ($40)
});

// Set $20/month for Resend
await setServiceBudget({
  service: 'resend',
  budgetUsd: 20,
  alertThresholdPercent: 75,
});
```

### 3. Use Tracked Service Clients

Instead of using services directly, use the tracked wrappers:

**Before** (no tracking):
```typescript
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const response = await openai.chat.completions.create({...});
```

**After** (with tracking):
```typescript
import { createTrackedCompletion } from '@/lib/services/openai-tracked';

const response = await createTrackedCompletion({
  messages: [{ role: 'user', content: 'Hello!' }],
  model: 'gpt-4o-mini',
  triggeredBy: 'user',
  userId: user.id,
  feature: 'pulse-follow', // What feature is this for?
});
```

---

## Tracked Service Usage

### OpenAI

```typescript
import { createTrackedCompletion, createTrackedEmbedding } from '@/lib/services/openai-tracked';

// Chat completion
const response = await createTrackedCompletion({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain MLM to me.' }
  ],
  model: 'gpt-4o-mini', // or 'gpt-4o'
  temperature: 0.7,
  max_tokens: 500,

  // Tracking context
  triggeredBy: 'user', // or 'admin', 'system', 'cron'
  userId: user.id,
  feature: 'training-content-generation',
});

// Embeddings
const embedding = await createTrackedEmbedding({
  input: 'Text to embed',
  model: 'text-embedding-3-small',

  triggeredBy: 'system',
  feature: 'search-indexing',
});
```

**Automatic tracking**:
- Input tokens: Charged at $0.00015/1k (gpt-4o-mini)
- Output tokens: Charged at $0.0006/1k
- Total cost calculated automatically
- Logged to `service_usage_logs`
- Budget updated in real-time

### Resend Email

```typescript
import { sendTrackedEmail, sendTrackedBatchEmails } from '@/lib/services/resend-tracked';

// Single email
const result = await sendTrackedEmail({
  from: 'noreply@reachtheapex.net',
  to: distributor.email,
  subject: 'Welcome to Apex Affinity Group!',
  html: '<p>Welcome!</p>',

  // Tracking context
  triggeredBy: 'system',
  userId: distributor.id,
  feature: 'welcome-email',
});

// Batch emails
const batchResult = await sendTrackedBatchEmails({
  emails: [
    { from: '...', to: 'user1@example.com', subject: '...', html: '...' },
    { from: '...', to: 'user2@example.com', subject: '...', html: '...' },
  ],

  triggeredBy: 'admin',
  adminId: admin.id,
  feature: 'email-campaign',
});
```

**Automatic tracking**:
- Email count (1 or batch size)
- Cost: $0.001 per email after free tier (100/day)
- Failed emails tracked but not charged
- Budget updated

### Upstash Redis

```typescript
import { getTracked, setTracked, getCached } from '@/lib/services/redis-tracked';

const context = {
  triggeredBy: 'user' as const,
  userId: user.id,
  feature: 'leaderboard-cache',
};

// Get from cache
const leaderboard = await getTracked<Distributor[]>('leaderboard:top100', context);

// Set in cache
await setTracked(
  'leaderboard:top100',
  topDistributors,
  { ex: 60 }, // TTL in seconds
  context
);

// Get with fallback (common pattern)
const data = await getCached({
  key: 'stats:global',
  fetcher: async () => {
    // Expensive database query
    const stats = await fetchGlobalStats();
    return stats;
  },
  ttl: 300, // 5 minutes
  context,
});
```

**Automatic tracking**:
- Request count (GET, SET, DEL, etc.)
- Data size (for SET operations)
- Cache hit/miss status
- Cost: ~$0.000002 per request

---

## Admin Dashboard

### View Costs

Visit: `/admin/services`

**You'll see**:
- Total spend this month
- Budget utilization
- Projected month-end spend
- Per-service breakdown
- Top features by cost
- Trend vs. last month
- Active budget alerts

### Set Budgets

```typescript
// In admin dashboard or via API
POST /api/admin/services/budget

{
  "service": "openai",
  "budgetUsd": 100,
  "alertThresholdPercent": 80
}
```

When spend reaches 80% ($80), an alert is created automatically.

### Budget Alerts

Alerts are triggered automatically when:
1. **Threshold reached** (e.g., 80% of budget)
2. **Budget exceeded** (100%+)

**Alert example**:
```
Service: OpenAI
Message: Service budget threshold (80%) reached
Severity: warning
Details: $80.42 spent of $100 budget
```

Alerts appear on:
- Admin dashboard (`/admin/services`)
- Unacknowledged alerts section

**Acknowledge alerts** via:
```typescript
POST /api/admin/services/alerts/{alertId}/acknowledge
```

---

## Budget Management

### Setting Smart Budgets

**Recommended monthly budgets for 1,000 active users**:

| Service | Recommended Budget | Reasoning |
|---------|-------------------|-----------|
| OpenAI | $50-100 | GPT-4o-mini for Pulse Follow, occasional GPT-4o |
| Resend | $20-30 | ~100 emails/day free, then $1 per 1,000 emails |
| Redis | $20-40 | 10k req/day free, then ~$0.2 per 100k requests |
| Total | $90-170/mo | At 1,000 users |

**At 10,000 users**:
- OpenAI: $200-400
- Resend: $100-200
- Redis: $80-150
- Total: $380-750/mo

### Alert Thresholds

**Conservative** (early warning):
- Alert at 60%
- Stop non-critical features at 90%
- Hard stop at 100%

**Standard** (default):
- Alert at 80%
- Review usage at 90%
- Hard stop at 110%

**Aggressive** (growth mode):
- Alert at 90%
- Review at 100%
- No hard stop

---

## Cost Optimization

### 1. Use Cheaper Models

```typescript
// ❌ Expensive: GPT-4o for simple tasks
await createTrackedCompletion({
  model: 'gpt-4o', // $0.0025/1k input, $0.01/1k output
  messages: [{ role: 'user', content: 'Summarize this.' }],
  ...
});

// ✅ Cheaper: GPT-4o-mini for most tasks
await createTrackedCompletion({
  model: 'gpt-4o-mini', // $0.00015/1k input, $0.0006/1k output
  messages: [{ role: 'user', content: 'Summarize this.' }],
  ...
});
```

**Cost difference**: 17x cheaper!

### 2. Cache Expensive Queries

```typescript
// ❌ No caching - hits database every time
const leaderboard = await getTopDistributors();

// ✅ With caching - hits database once per minute
const leaderboard = await getCached({
  key: 'leaderboard:top100',
  fetcher: () => getTopDistributors(),
  ttl: 60,
  context,
});
```

### 3. Batch Email Sending

```typescript
// ❌ Individual sends (N API calls, N emails charged)
for (const user of users) {
  await sendTrackedEmail({ to: user.email, ... });
}

// ✅ Batch send (1 API call, N emails charged)
await sendTrackedBatchEmails({
  emails: users.map(user => ({ to: user.email, ... })),
  ...
});
```

### 4. Monitor Top Features

Check dashboard to see which features cost most:

```
Top Features for OpenAI:
1. pulse-follow: $45.20 (500 completions)
2. training-transcription: $12.80 (20 transcriptions)
3. welcome-email-personalization: $3.40 (150 completions)
```

**Optimization**:
- Reduce pulse-follow frequency (daily → every 2 days)
- Cache transcriptions
- Use templates instead of AI for welcome emails

---

## Updating Existing Code

### Find All OpenAI Usage

```bash
# Search for direct OpenAI usage
grep -r "openai.chat.completions" src/
grep -r "new OpenAI" src/
```

### Migration Pattern

**Before**:
```typescript
// src/app/api/pulse-follow/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [...]
  });

  return NextResponse.json({ content: response.choices[0].message.content });
}
```

**After**:
```typescript
// src/app/api/pulse-follow/route.ts
import { createTrackedCompletion } from '@/lib/services/openai-tracked';

export async function POST(request: NextRequest) {
  const user = await getUser();

  const response = await createTrackedCompletion({
    model: 'gpt-4o-mini',
    messages: [...],

    // Add tracking context
    triggeredBy: 'user',
    userId: user.id,
    feature: 'pulse-follow',
  });

  return NextResponse.json({ content: response.choices[0].message.content });
}
```

### Find All Email Usage

```bash
grep -r "resend.emails.send" src/
grep -r "new Resend" src/
```

Same pattern: replace with `sendTrackedEmail`.

---

## API Reference

### GET /api/admin/services/usage

Returns cost overview for all services.

**Response**:
```json
{
  "totalSpendCurrentMonth": 125.43,
  "totalBudgetCurrentMonth": 200,
  "budgetUtilization": 62.7,
  "projectedMonthlySpend": 187.65,
  "services": [
    {
      "service": {
        "name": "openai",
        "display_name": "OpenAI"
      },
      "currentMonth": {
        "totalCost": 85.20,
        "totalRequests": 1250,
        "totalTokens": 425000,
        "budget": {...}
      },
      "previousMonth": {
        "totalCost": 62.40,
        "totalRequests": 980
      },
      "trend": "up",
      "trendPercent": 36.5,
      "topFeatures": [
        {
          "feature": "pulse-follow",
          "cost": 45.20,
          "requests": 500
        }
      ]
    }
  ],
  "recentAlerts": []
}
```

### POST /api/admin/services/budget

Set monthly budget for a service.

**Request**:
```json
{
  "service": "openai",
  "budgetUsd": 100,
  "alertThresholdPercent": 80,
  "month": "2026-02-01" // Optional, defaults to current month
}
```

### POST /api/admin/services/alerts/{id}/acknowledge

Mark an alert as acknowledged.

**Response**:
```json
{
  "success": true,
  "message": "Alert acknowledged"
}
```

---

## Database Schema

### services
- Stores config for each 3rd party service
- Pre-seeded: openai, anthropic, redis, resend

### service_usage_logs
- **Every API call logged here**
- Columns: service_id, operation, tokens, cost_usd, triggered_by, feature, etc.
- Indexed by service_id, created_at, feature

### service_budgets
- Monthly budgets per service
- Unique constraint: (service_id, month)
- Tracks: budget_usd, spent_usd, alert_threshold

### service_cost_alerts
- Budget alerts (threshold, exceeded)
- Acknowledged status

### service_pricing
- Pricing models for cost calculation
- Effective_from / effective_to for pricing changes

---

## Monitoring Best Practices

### Daily Checks
- Review active alerts
- Check if any service is trending up sharply

### Weekly Reviews
- Analyze top features by cost
- Look for optimization opportunities
- Verify budgets are appropriate

### Monthly Tasks
- Set next month's budgets
- Review cost trends
- Optimize high-cost features
- Check for pricing changes from providers

### Alerts to Set Up
1. **Budget threshold** (80%) - Review usage
2. **Budget exceeded** (100%) - Urgent action needed
3. **Anomaly detection** (future) - Sudden 3x spike in cost

---

## Troubleshooting

### "No usage data showing"

**Check**:
1. Migration applied? (`SELECT * FROM services;`)
2. Using tracked clients? (not direct OpenAI/Resend)
3. Tracking errors in logs? (check console)

### "Costs seem wrong"

**Verify**:
1. Pricing table is up-to-date
2. Token counts are correct
3. Model name matches pricing record

**Debug**:
```sql
SELECT
  operation,
  cost_calculation,
  tokens_input,
  tokens_output,
  cost_usd
FROM service_usage_logs
WHERE service_id = (SELECT id FROM services WHERE name = 'openai')
ORDER BY created_at DESC
LIMIT 10;
```

### "Budget not updating"

Check trigger:
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_budget_spent';

-- Manually test
SELECT update_budget_spent();
```

---

## Future Enhancements

### Planned Features
- [ ] Cost anomaly detection (ML-based)
- [ ] Budget forecasting
- [ ] Cost allocation by distributor/team
- [ ] Webhook alerts (Slack, Discord)
- [ ] CSV export for accounting
- [ ] Cost comparison by feature
- [ ] A/B testing cost impact

### Adding New Services

To track a new service (e.g., Twilio, Stripe):

1. **Add to services table**:
```sql
INSERT INTO services (name, display_name, category)
VALUES ('twilio', 'Twilio SMS', 'communications');
```

2. **Add pricing**:
```sql
INSERT INTO service_pricing (service_id, pricing_type, request_cost, effective_from)
SELECT id, 'per_sms', 0.0075, '2026-01-01'
FROM services WHERE name = 'twilio';
```

3. **Create tracked wrapper**:
```typescript
// src/lib/services/twilio-tracked.ts
import { trackUsage } from './tracking';

export async function sendTrackedSMS(params) {
  const startTime = Date.now();

  try {
    const result = await twilio.messages.create({...});

    await trackUsage({
      service: 'twilio',
      operation: 'sms.send',
      requestsCount: 1,
      triggeredBy: params.triggeredBy,
      userId: params.userId,
      feature: params.feature,
      durationMs: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    // Track failed attempt
    await trackUsage({ ... error: error.message });
    throw error;
  }
}
```

4. **Update TypeScript types**:
```typescript
// src/types/service-tracking.ts
export type ServiceName = 'openai' | 'anthropic' | 'redis' | 'resend' | 'twilio';
```

---

## Support

**Issues or Questions?**
- Check this guide first
- Review database logs: `SELECT * FROM service_usage_logs ORDER BY created_at DESC LIMIT 100;`
- Check Supabase dashboard for query performance
- Review admin dashboard at `/admin/services`

**Cost Spike?**
1. Identify feature: Check `topFeatures` in dashboard
2. Review usage logs for that feature
3. Implement caching or reduce frequency
4. Adjust budget if needed

---

**System Version**: 1.0
**Last Updated**: February 21, 2026
**Database Migration**: `20250221000000_create_service_usage_tracking.sql`

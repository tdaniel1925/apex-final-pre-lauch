# Platform Cost Tracking Setup Guide
**Track Vercel and Supabase costs for THIS project only**

---

## Overview

This tracks **project-specific** costs for:
- **Vercel** (hosting, functions, bandwidth)
- **Supabase** (database, storage, bandwidth)

Unlike API-based services (OpenAI, Resend) which track per-request, these platform services collect **daily snapshots** of usage via APIs.

---

## Quick Start

### 1. Apply Database Migrations

```bash
cd supabase
supabase migration up
```

This creates:
- `platform_usage_snapshots` table
- Adds Vercel and Supabase to `services` table
- Adds pricing models
- Creates cost calculation functions

### 2. Get Vercel API Token

**Step-by-step**:

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `apex-usage-tracking`
4. Scope: Select your team
5. Permissions: Read-only access
6. Copy the token

**Add to environment variables**:
```bash
# .env.local
VERCEL_API_TOKEN="vercel_token_here"
VERCEL_TEAM_ID="team_xCohiIMthEe2uzQHqYofvXax"  # From your Vercel URL
VERCEL_PROJECT_ID="prj_wC7jcslsKKw9ub4Yni2PN0blJN9t"  # From project settings
```

**In Vercel Dashboard**:
- Project Settings → Environment Variables
- Add all three variables
- Redeploy

### 3. Get Supabase Management Token

**Step-by-step**:

1. Go to https://app.supabase.com/account/tokens
2. Click "Generate new token"
3. Name: `apex-usage-tracking`
4. Scope: Read access to your organization
5. Copy the token

**Add to environment variables**:
```bash
# .env.local
SUPABASE_ACCESS_TOKEN="sbp_your_token_here"
```

**Note**: This is different from `SUPABASE_SERVICE_ROLE_KEY`. The management token accesses usage stats, not your database.

### 4. Set Cron Secret (Optional but Recommended)

Protects the cron endpoint from unauthorized access:

```bash
# Generate a random secret
openssl rand -hex 32

# Add to .env.local
CRON_SECRET="your_random_secret_here"
```

Add to Vercel:
- Project Settings → Environment Variables
- Add `CRON_SECRET`

### 5. Verify Cron Job Configured

Check `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/collect-platform-usage",
      "schedule": "0 1 * * *"
    }
  ]
}
```

This runs **daily at 1 AM UTC** to collect yesterday's usage.

### 6. Manual First Run

Trigger manually to verify setup:

```bash
# Via API
curl -X POST https://your-domain.com/api/admin/services/collect-platform
# Or visit /admin/services and click "Collect Platform Usage"
```

Check admin dashboard at `/admin/services` to see Vercel and Supabase costs.

---

## How It Works

### Daily Collection Process

**1 AM UTC every day**:
1. Cron job hits `/api/cron/collect-platform-usage`
2. Fetches Vercel usage for **yesterday** via Vercel API
3. Fetches Supabase usage for **yesterday** via Supabase Management API
4. Calculates costs based on pricing models
5. Stores snapshot in `platform_usage_snapshots` table

**Why yesterday?**
Current day's usage is incomplete. We collect previous day's complete data.

### What Gets Tracked

**Vercel** (per project):
- Function executions
- Bandwidth (GB)
- Build minutes

**Supabase** (per project):
- Database size (GB)
- Database bandwidth (GB)
- Storage size (GB)
- Database requests

### Cost Calculation

**Vercel Pro Plan** ($20/month base):
- Function executions: First 1M free, then $0.60 per additional 1M
- Bandwidth: First 100GB free, then $0.40 per GB
- Build minutes: First 6000 free, then $40 per 1000

**Supabase Pro Plan** ($25/month base):
- Database size: First 8GB free, then $0.125 per GB/month
- Bandwidth: First 50GB free, then $0.09 per GB
- Storage: First 250GB free, then $0.021 per GB/month

**Daily costs** = (Base cost / 30) + Overage costs

---

## Admin Dashboard

Visit `/admin/services` to see:

**Platform Services Section**:
```
Vercel Hosting: $0.87/day
  - Base: $0.67 (Pro plan prorated)
  - Overages: $0.20
  - Function executions: 1.2M (200k over limit)
  - Bandwidth: 95GB (within limit)
  - Build minutes: 5,800 (within limit)

Supabase Database: $0.95/day
  - Base: $0.83 (Pro plan prorated)
  - Overages: $0.12
  - Database size: 9.2GB (1.2GB over limit)
  - Bandwidth: 42GB (within limit)
  - Storage: 180GB (within limit)
```

---

## Manual Collection

### Via Admin Dashboard

**Coming soon**: Button to trigger collection manually

### Via API

```typescript
POST /api/admin/services/collect-platform

// Collect for yesterday (default)
{}

// Collect for specific date
{
  "date": "2026-02-20"
}
```

**Response**:
```json
{
  "success": true,
  "date": "2026-02-20",
  "results": {
    "vercel": {
      "success": true,
      "error": null
    },
    "supabase": {
      "success": true,
      "error": null
    }
  }
}
```

---

## Troubleshooting

### "VERCEL_API_TOKEN not configured"

**Solution**:
1. Create token at https://vercel.com/account/tokens
2. Add to Vercel environment variables
3. Redeploy

### "Supabase API error: 403 Forbidden"

**Possible causes**:
1. Management token doesn't have access to the organization
2. Token expired
3. Wrong project reference

**Solution**:
- Regenerate token with correct organization access
- Verify `SUPABASE_PROJECT_REF` matches your project

### "Usage showing as estimates"

**Why**:
If Supabase Management API fails, the system falls back to estimates using database queries.

**To fix**:
- Add valid `SUPABASE_ACCESS_TOKEN`
- Verify token has read access to usage stats

### Cron job not running

**Check**:
1. `vercel.json` has correct cron configuration
2. Cron job appears in Vercel dashboard (Project → Settings → Cron Jobs)
3. Check cron execution logs in Vercel

**Manual trigger**:
```bash
curl -X POST https://your-domain.com/api/cron/collect-platform-usage \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Budgets for Platform Services

### Set Monthly Budgets

```typescript
// Vercel: $30/month ($20 base + $10 estimated overages)
await setServiceBudget({
  service: 'vercel',
  budgetUsd: 30,
  alertThresholdPercent: 80, // Alert at $24
});

// Supabase: $35/month ($25 base + $10 estimated overages)
await setServiceBudget({
  service: 'supabase',
  budgetUsd: 35,
  alertThresholdPercent: 80,
});
```

### Recommended Budgets by Scale

| Users | Vercel Budget | Supabase Budget | Total/mo |
|-------|---------------|-----------------|----------|
| < 500 | $20 (base only) | $25 (base only) | $45 |
| 1,000 | $30 | $35 | $65 |
| 5,000 | $60 | $80 | $140 |
| 10,000 | $150 | $200 | $350 |

---

## Cost Optimization

### Vercel

**Reduce function executions**:
- Use edge caching for static data
- Implement Redis caching (reduces API calls)
- Combine multiple API calls into one

**Reduce bandwidth**:
- Optimize images (use Next.js Image with AVIF/WebP)
- Enable compression
- Use CDN for large assets

**Reduce build minutes**:
- Limit builds (don't rebuild on every commit)
- Use Vercel's automatic build skipping
- Optimize build process

### Supabase

**Reduce database size**:
- Archive old data (move to cold storage)
- Use appropriate column types
- Delete unused rows/tables

**Reduce bandwidth**:
- Select only needed columns (not SELECT *)
- Implement pagination
- Use Redis caching for frequently accessed data

**Reduce storage**:
- Clean up unused files
- Use image compression before upload
- Implement file retention policies

---

## Monitoring Best Practices

### Daily Review

Check admin dashboard:
- Are costs trending up?
- Any sudden spikes?
- Overages increasing?

### Weekly Analysis

Compare week-over-week:
- What changed?
- New features causing higher usage?
- Optimization opportunities?

### Monthly Planning

Before month starts:
- Review previous month's trends
- Adjust budgets if needed
- Plan optimizations

---

## API Reference

### GET /api/cron/collect-platform-usage

**Cron job endpoint** (runs daily at 1 AM UTC)

**Authorization**: Bearer token (CRON_SECRET)

**Response**:
```json
{
  "success": true,
  "date": "2026-02-20",
  "results": {
    "vercel": { "success": true, "error": null },
    "supabase": { "success": true, "error": null }
  }
}
```

### POST /api/admin/services/collect-platform

**Manual trigger** (admin only)

**Request**:
```json
{
  "date": "2026-02-20"  // Optional, defaults to yesterday
}
```

**Response**: Same as cron endpoint

---

## Database Schema

### platform_usage_snapshots

Stores daily usage snapshots:

```sql
CREATE TABLE platform_usage_snapshots (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  snapshot_date DATE,

  -- Vercel metrics
  function_executions BIGINT,
  bandwidth_gb DECIMAL(10, 4),
  build_minutes INTEGER,

  -- Supabase metrics
  database_size_gb DECIMAL(10, 4),
  database_bandwidth_gb DECIMAL(10, 4),
  storage_size_gb DECIMAL(10, 4),
  database_requests BIGINT,

  -- Costs
  base_cost_usd DECIMAL(10, 2),
  overage_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  cost_calculation JSONB,

  UNIQUE(service_id, snapshot_date)
);
```

---

## FAQ

**Q: Why separate tracking for Vercel/Supabase vs. OpenAI/Resend?**

A: Different pricing models. API services charge per-request (track immediately). Platform services charge monthly with daily usage (track via snapshots).

**Q: Can I track multiple projects?**

A: This setup tracks ONE project only. For multiple projects, you'd need:
- Separate databases
- Separate Vercel API tokens
- Project ID filtering in queries

**Q: What if the cron job fails?**

A: You can manually trigger via `/api/admin/services/collect-platform`. Historical data is still available from Vercel/Supabase dashboards.

**Q: Are estimates accurate?**

A: No. Estimates are rough approximations when API access fails. Real tracking requires valid API tokens.

**Q: How much does tracking cost?**

A: Minimal - 1 Vercel API call + 1 Supabase API call per day. Well within free tiers.

---

## Next Steps

1. ✅ Apply migrations
2. ✅ Add API tokens to environment variables
3. ✅ Set budgets
4. ✅ Trigger first manual collection
5. ✅ Verify data in admin dashboard
6. ⏳ Wait for daily cron (runs at 1 AM UTC)
7. ⏳ Review costs daily

---

**Version**: 1.0
**Last Updated**: February 21, 2026
**Database Migration**: `20250221000001_add_platform_services.sql`

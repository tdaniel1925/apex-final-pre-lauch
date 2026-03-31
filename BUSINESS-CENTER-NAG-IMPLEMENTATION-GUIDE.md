# Business Center Nag Implementation Guide

## Overview

This guide explains how to add Business Center subscription checking and feature gating to protected dashboard pages.

## System Components

### 1. Subscription Checking (`src/lib/subscription/check-business-center.ts`)

Checks if distributor has active Business Center subscription and determines nag level:

- **Days 0-7:** Grace period - No nag
- **Days 8-21:** Soft nag - Dismissible banner
- **Day 22+:** Hard nag - Modal + feature gating

### 2. Feature Gating (`src/lib/subscription/feature-gate.ts`)

Defines which features require Business Center subscription:

**Gated Features (Day 22+):**
- AI Assistant (`/dashboard/ai-assistant`)
- AI Calls (`/dashboard/ai-calls`)
- CRM (`/dashboard/crm`)
- Genealogy (`/dashboard/genealogy`)
- Team Management (`/dashboard/team`)
- Advanced Reports (`/dashboard/reports`)
- Training (`/dashboard/training`)
- Tools (`/dashboard/tools`)
- Social Media Hub (`/dashboard/social-media`)

**Always Free:**
- Dashboard home (`/dashboard`)
- Profile (`/dashboard/profile`)
- Settings (`/dashboard/settings`)
- Store (`/dashboard/store`)
- Upgrade page (`/dashboard/upgrade`)
- Basic compensation view
- Support & Downloads

### 3. Nag Components

**Banner (`BusinessCenterBanner`):** Dismissible for 24 hours (Days 8-21)
**Modal (`BusinessCenterModal`):** Can dismiss 3 times, then can't dismiss (Day 22+)

### 4. Feature Gate Component (`FeatureGate`)

Wrapper that blocks access to gated pages and shows upgrade prompt.

## How to Add Feature Gating to a Page

### For Server Components (Recommended)

Add feature checking to server component pages:

```typescript
// src/app/dashboard/team/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import FeatureGate from '@/components/dashboard/FeatureGate';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  // Check Business Center subscription
  const bcStatus = await checkBusinessCenterSubscription(distributor.id);

  // Determine if user has access
  const hasAccess = bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard';

  // Fetch team data only if has access
  let teamData = null;
  if (hasAccess) {
    const { data } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('sponsor_id', distributor.id);
    teamData = data;
  }

  return (
    <FeatureGate
      featurePath="/dashboard/team"
      hasAccess={hasAccess}
      daysWithout={bcStatus.daysWithout}
    >
      {/* Your page content here */}
      <div>
        <h1>My Team</h1>
        {/* Team stats, member cards, etc. */}
      </div>
    </FeatureGate>
  );
}
```

### For Client Components

For client component pages, create a wrapper:

```typescript
// src/app/dashboard/ai-assistant/page.tsx (wrapper)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import FeatureGate from '@/components/dashboard/FeatureGate';
import AIAssistantClient from './AIAssistantClient';

export default async function AIAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const bcStatus = await checkBusinessCenterSubscription(distributor.id);
  const hasAccess = bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard';

  return (
    <FeatureGate
      featurePath="/dashboard/ai-assistant"
      hasAccess={hasAccess}
      daysWithout={bcStatus.daysWithout}
    >
      <AIAssistantClient />
    </FeatureGate>
  );
}

// src/app/dashboard/ai-assistant/AIAssistantClient.tsx
'use client';
// ... existing client component code
```

### For API Routes

Add subscription checking to API routes:

```typescript
// src/app/api/dashboard/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
  }

  // Check subscription
  const bcStatus = await checkBusinessCenterSubscription(distributor.id);
  if (!bcStatus.hasSubscription && bcStatus.nagLevel === 'hard') {
    return NextResponse.json(
      { error: 'Business Center subscription required', requiresUpgrade: true },
      { status: 403 }
    );
  }

  // ... rest of API logic
}
```

## Testing the System

### Manual Testing

1. **Create test distributor** with old `created_at` date:

```sql
-- Set distributor to 25 days old (hard nag)
UPDATE distributors
SET created_at = NOW() - INTERVAL '25 days'
WHERE email = 'test@example.com';
```

2. **Test grace period (Day 5):**
   - Should see NO nag
   - All features accessible

3. **Test soft nag (Day 10):**
   - Should see banner at top
   - Can dismiss for 24 hours
   - All features still accessible

4. **Test hard nag (Day 25):**
   - Should see modal on login
   - Can dismiss 3 times
   - Gated features show upgrade prompt

5. **Test with subscription:**

```sql
-- Give distributor Business Center subscription
INSERT INTO service_access (distributor_id, product_id, status, expires_at)
SELECT
  d.id,
  p.id,
  'active',
  NOW() + INTERVAL '1 month'
FROM distributors d
CROSS JOIN products p
WHERE d.email = 'test@example.com'
  AND p.slug = 'business-center';
```

### Automated Tests

See `tests/unit/lib/subscription/check-business-center.test.ts`

## Enabling Business Center in Store

Currently Business Center is disabled in `/dashboard/store` with "Available April 1" button.

To enable:

```typescript
// src/app/dashboard/store/page.tsx
// Remove this condition:
} : product.slug === 'business-center' ? (
  <button
    type="button"
    disabled
    className="w-full px-4 py-2 bg-slate-400 text-white rounded-lg cursor-not-allowed font-medium"
  >
    Available April 1
  </button>
) : (

// Replace with normal StoreClient:
) : (
  <StoreClient
    productId={product.id}
    distributorId={distributor.id}
    productName={product.name}
    price={(product.wholesale_price_cents / 100).toFixed(0)}
    isSubscription={product.is_subscription}
  />
)
```

## Configuration

### Adjust Grace Period

Edit `src/lib/subscription/check-business-center.ts`:

```typescript
const GRACE_PERIOD_DAYS = 7;        // Days 0-7: Full access, no nag
const SOFT_NAG_THRESHOLD_DAYS = 8;  // Days 8-21: Banner
const HARD_NAG_THRESHOLD_DAYS = 22; // Day 22+: Modal + gating
```

### Add/Remove Gated Features

Edit `src/lib/subscription/feature-gate.ts`:

```typescript
export const GATED_FEATURES = {
  NEW_FEATURE: '/dashboard/new-feature',  // Add new gated feature
  // ...
};

export const FREE_FEATURES = {
  NEW_FREE: '/dashboard/new-free',  // Add new free feature
  // ...
};
```

### Customize Benefits List

Edit `src/lib/subscription/feature-gate.ts`:

```typescript
export const BUSINESS_CENTER_BENEFITS = [
  'Full back office access',
  'Your new benefit here',
  // ...
] as const;
```

## Rollout Strategy

### Phase 1: Testing (Current)
- Deploy to staging
- Test with internal users
- Adjust grace periods if needed

### Phase 2: Soft Launch
- Enable for new signups only
- Monitor conversion rates
- Gather feedback

### Phase 3: Full Rollout
- Enable for all existing users
- Send email notification about changes
- Provide customer support resources

## Support

For issues or questions:
- Review logs: Check browser console and server logs
- Database queries: Use `check-business-center.ts` functions
- Contact: support@theapexway.net

## Files Created

1. `src/lib/subscription/check-business-center.ts` - Subscription checking
2. `src/lib/subscription/feature-gate.ts` - Feature gating config
3. `src/components/dashboard/BusinessCenterNag.tsx` - Banner & modal
4. `src/components/dashboard/FeatureGate.tsx` - Page wrapper
5. `src/app/dashboard/layout.tsx` - Updated with nag system
6. `tests/unit/lib/subscription/check-business-center.test.ts` - Tests

## Next Steps

1. **Enable Business Center in store** (remove "Available April 1" condition)
2. **Add feature gating to protected pages:**
   - `/dashboard/ai-assistant`
   - `/dashboard/ai-calls`
   - `/dashboard/team`
   - `/dashboard/genealogy`
   - `/dashboard/crm` (when built)
   - `/dashboard/reports` (when built)
3. **Test with real users**
4. **Monitor conversion metrics**
5. **Adjust grace periods based on data**

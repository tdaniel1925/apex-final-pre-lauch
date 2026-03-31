# Example: Adding Feature Gating to Dashboard Pages

This document shows real examples of how to add Business Center subscription checks and feature gating to existing dashboard pages.

## Example 1: Server Component Page (Team Page)

### Before (No Gating)

```typescript
// src/app/dashboard/team/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export default async function TeamPage() {
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

  // Fetch team data
  const { data: teamMembers } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('sponsor_id', distributor.id);

  return (
    <div>
      <h1>My Team</h1>
      {/* Team data display */}
    </div>
  );
}
```

### After (With Feature Gating)

```typescript
// src/app/dashboard/team/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center'; // ADD THIS
import FeatureGate from '@/components/dashboard/FeatureGate'; // ADD THIS

export default async function TeamPage() {
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

  // ADD: Check Business Center subscription
  const bcStatus = await checkBusinessCenterSubscription(distributor.id);
  const hasAccess = bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard';

  // Fetch team data ONLY if has access (optimization)
  let teamMembers = null;
  if (hasAccess) {
    const { data } = await serviceClient
      .from('distributors')
      .select('*')
      .eq('sponsor_id', distributor.id);
    teamMembers = data;
  }

  // ADD: Wrap content in FeatureGate
  return (
    <FeatureGate
      featurePath="/dashboard/team"
      hasAccess={hasAccess}
      daysWithout={bcStatus.daysWithout}
    >
      <div>
        <h1>My Team</h1>
        {/* Team data display */}
      </div>
    </FeatureGate>
  );
}
```

**Changes made:**
1. Import `checkBusinessCenterSubscription` utility
2. Import `FeatureGate` component
3. Check subscription status
4. Determine if user has access
5. Optionally skip data fetching if no access
6. Wrap entire page content in `<FeatureGate>`

## Example 2: Client Component Page (AI Assistant)

### Before (Client Component)

```typescript
// src/app/dashboard/ai-assistant/page.tsx
'use client';

import { useState } from 'react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    // AI chat logic
  };

  return (
    <div>
      <h1>AI Assistant</h1>
      {/* Chat interface */}
    </div>
  );
}
```

### After (With Feature Gating - Split into Server + Client)

**Step 1: Create server wrapper**

```typescript
// src/app/dashboard/ai-assistant/page.tsx (NEW - Server Component)
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
import FeatureGate from '@/components/dashboard/FeatureGate';
import AIAssistantClient from './AIAssistantClient'; // Import client component

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

  // Check subscription
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
```

**Step 2: Move client logic to separate file**

```typescript
// src/app/dashboard/ai-assistant/AIAssistantClient.tsx (NEW - Client Component)
'use client';

import { useState } from 'react';

export default function AIAssistantClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    // AI chat logic
  };

  return (
    <div>
      <h1>AI Assistant</h1>
      {/* Chat interface */}
    </div>
  );
}
```

**Changes made:**
1. Create new server component wrapper (page.tsx)
2. Move client logic to AIAssistantClient.tsx
3. Check subscription in server wrapper
4. Wrap client component in `<FeatureGate>`

## Example 3: API Route Protection

### Before (No Protection)

```typescript
// src/app/api/dashboard/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // AI chat logic
  const { message } = await request.json();
  const response = await callAI(message);

  return NextResponse.json({ response });
}
```

### After (With Subscription Check)

```typescript
// src/app/api/dashboard/ai-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service'; // ADD THIS
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center'; // ADD THIS

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ADD: Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
  }

  // ADD: Check subscription
  const bcStatus = await checkBusinessCenterSubscription(distributor.id);
  if (!bcStatus.hasSubscription && bcStatus.nagLevel === 'hard') {
    return NextResponse.json(
      {
        error: 'Business Center subscription required to use AI Assistant',
        requiresUpgrade: true,
        upgradeUrl: '/dashboard/store',
      },
      { status: 403 }
    );
  }

  // AI chat logic (only runs if has access)
  const { message } = await request.json();
  const response = await callAI(message);

  return NextResponse.json({ response });
}
```

**Changes made:**
1. Import subscription checking utilities
2. Get distributor from database
3. Check Business Center subscription
4. Return 403 error with upgrade info if no access
5. Proceed with API logic only if has access

## Example 4: Quick Feature Check (for UI elements)

Sometimes you just want to hide/show UI elements based on subscription:

```typescript
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  const bcStatus = await checkBusinessCenterSubscription(distributor.id);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Show AI Assistant card only if has subscription or in grace/soft nag */}
      {(bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard') && (
        <div className="card">
          <h2>AI Assistant</h2>
          <a href="/dashboard/ai-assistant">Open Assistant</a>
        </div>
      )}

      {/* Show upgrade prompt if in hard nag */}
      {!bcStatus.hasSubscription && bcStatus.nagLevel === 'hard' && (
        <div className="upgrade-prompt">
          <h2>Unlock AI Assistant</h2>
          <p>Subscribe to Business Center for $39/month</p>
          <a href="/dashboard/store">Subscribe Now</a>
        </div>
      )}
    </div>
  );
}
```

## Example 5: Middleware Pattern (for multiple pages)

If you want to protect multiple pages with same logic:

```typescript
// src/lib/subscription/middleware.ts
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from './check-business-center';

export async function requireBusinessCenter(featurePath: string) {
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

  return {
    hasAccess: bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard',
    bcStatus,
    distributor,
  };
}
```

**Usage:**

```typescript
// src/app/dashboard/team/page.tsx
import { requireBusinessCenter } from '@/lib/subscription/middleware';
import FeatureGate from '@/components/dashboard/FeatureGate';

export default async function TeamPage() {
  const { hasAccess, bcStatus, distributor } = await requireBusinessCenter('/dashboard/team');

  // Fetch data if has access
  // ...

  return (
    <FeatureGate featurePath="/dashboard/team" hasAccess={hasAccess} daysWithout={bcStatus.daysWithout}>
      {/* Page content */}
    </FeatureGate>
  );
}
```

## Testing Your Implementation

After adding feature gating, test:

1. **Grace Period (Day 5):**
   ```sql
   UPDATE distributors SET created_at = NOW() - INTERVAL '5 days' WHERE id = 'your-id';
   ```
   - Should see NO banner/modal
   - Should have full access to gated page

2. **Soft Nag (Day 10):**
   ```sql
   UPDATE distributors SET created_at = NOW() - INTERVAL '10 days' WHERE id = 'your-id';
   ```
   - Should see blue banner at top
   - Should have full access to gated page
   - Banner should be dismissible

3. **Hard Nag (Day 25):**
   ```sql
   UPDATE distributors SET created_at = NOW() - INTERVAL '25 days' WHERE id = 'your-id';
   ```
   - Should see modal on login
   - Gated page should show upgrade prompt (blocked)
   - Free pages (profile, store) should still work

4. **With Subscription:**
   ```sql
   -- Add Business Center subscription
   INSERT INTO service_access (distributor_id, product_id, status, expires_at)
   SELECT
     'your-distributor-id',
     p.id,
     'active',
     NOW() + INTERVAL '1 month'
   FROM products p
   WHERE p.slug = 'business-center';
   ```
   - Should see NO banner/modal
   - Should have full access to all pages

## Common Mistakes to Avoid

❌ **Fetching data before checking access**
```typescript
// BAD: Fetches data even if no access
const { data } = await supabase.from('team').select('*');
const hasAccess = await checkAccess();
```

✅ **Check access first, then fetch data**
```typescript
// GOOD: Only fetches if has access
const hasAccess = await checkAccess();
let data = null;
if (hasAccess) {
  const result = await supabase.from('team').select('*');
  data = result.data;
}
```

❌ **Forgetting to wrap content in FeatureGate**
```typescript
// BAD: Checks access but doesn't block rendering
const hasAccess = await checkAccess();
return <div>Sensitive content</div>;
```

✅ **Always wrap with FeatureGate**
```typescript
// GOOD: Renders gate if no access
const hasAccess = await checkAccess();
return (
  <FeatureGate hasAccess={hasAccess}>
    <div>Sensitive content</div>
  </FeatureGate>
);
```

❌ **Not protecting API routes**
```typescript
// BAD: UI is gated but API is open
// Page checks subscription, but API doesn't
```

✅ **Protect both UI and API**
```typescript
// GOOD: Both page and API check subscription
// Page: Wrapped in FeatureGate
// API: Returns 403 if no access
```

## Summary

**To add feature gating to any page:**

1. Import utilities:
   ```typescript
   import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';
   import FeatureGate from '@/components/dashboard/FeatureGate';
   ```

2. Check subscription (in server component):
   ```typescript
   const bcStatus = await checkBusinessCenterSubscription(distributorId);
   const hasAccess = bcStatus.hasSubscription || bcStatus.nagLevel !== 'hard';
   ```

3. Wrap content in FeatureGate:
   ```typescript
   return (
     <FeatureGate featurePath="/dashboard/feature" hasAccess={hasAccess} daysWithout={bcStatus.daysWithout}>
       {/* Your content */}
     </FeatureGate>
   );
   ```

4. Protect API routes:
   ```typescript
   const bcStatus = await checkBusinessCenterSubscription(distributorId);
   if (!bcStatus.hasSubscription && bcStatus.nagLevel === 'hard') {
     return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
   }
   ```

Done! ✅

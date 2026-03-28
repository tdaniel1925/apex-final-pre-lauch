# SERVICE CLIENT AUDIT REPORT

**Date:** 2026-03-28
**Status:** ⚠️ NEEDS REVIEW
**Priority:** 🟠 HIGH - Security & Architecture

---

## 📊 SUMMARY

**Total API Routes:** 240
**Service Client Usages:** 221 (92%)

**Assessment:** ⚠️ OVERUSED - Service client is being used in almost every API route, which bypasses Row Level Security (RLS) and creates security risks.

---

## 🔒 WHAT IS SERVICE CLIENT?

The service client (`createServiceClient`) is a Supabase client that:
- ✅ Bypasses Row Level Security (RLS)
- ✅ Has full database access (like a superuser)
- ⚠️ Should ONLY be used when RLS needs to be bypassed
- ❌ Should NEVER be the default client for API routes

### Regular Client vs Service Client

```typescript
// ✅ CORRECT: Regular client (RLS protected)
const supabase = createClient();
// - Respects RLS policies
// - User can only access their own data
// - Secure by default

// ⚠️ USE SPARINGLY: Service client (bypasses RLS)
const supabase = createServiceClient();
// - Bypasses ALL RLS policies
// - Can access ANY data in database
// - Must add manual permission checks
```

---

## 🎯 WHEN TO USE SERVICE CLIENT

### ✅ VALID Use Cases

1. **Admin Routes** (`/api/admin/*`)
   - Admins need access to all data
   - **MUST** verify admin role BEFORE using service client
   - Example: Admin dashboard, distributor management

2. **Webhooks** (`/api/webhooks/*`)
   - No user context (external service callbacks)
   - Examples: Stripe webhooks, VAPI webhooks

3. **Cron Jobs** (`/api/cron/*`)
   - System background tasks
   - Examples: Monthly commission runs, email queues

4. **System Operations**
   - Email sending (needs access to all users)
   - Background data processing
   - Database maintenance tasks

### ❌ INVALID Use Cases

1. **Regular User API Routes** (`/api/dashboard/*`)
   - Should use regular client with RLS
   - Users should only access their own data
   - Example: Get my profile, my orders, my earnings

2. **Public API Routes**
   - Should use regular client
   - No special access needed

3. **Authentication Routes**
   - Supabase Auth handles permissions
   - Regular client is sufficient

---

## 🚨 SECURITY RISKS

### Risk 1: Unauthorized Data Access
**Problem:** If admin routes don't verify user role, regular users could access all data.

**Example of Vulnerable Code:**
```typescript
// ❌ VULNERABLE: Using service client without permission check
export async function GET(request: NextRequest) {
  const supabase = createServiceClient(); // DANGER!

  // Anyone can call this and get all distributors!
  const { data } = await supabase
    .from('distributors')
    .select('*');

  return NextResponse.json(data);
}
```

**Correct Code:**
```typescript
// ✅ SECURE: Verify admin role first
export async function GET(request: NextRequest) {
  const supabase = createClient(); // Regular client first

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: distributor } = await supabase
    .from('distributors')
    .select('role')
    .eq('id', user.id)
    .single();

  if (distributor?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // NOW we can use service client
  const adminSupabase = createServiceClient();
  const { data } = await adminSupabase
    .from('distributors')
    .select('*');

  return NextResponse.json(data);
}
```

### Risk 2: Data Leakage in Logs
Service client queries are not filtered by RLS, so debug logs could expose sensitive data.

### Risk 3: Privilege Escalation
If a regular user can trigger a service client query, they gain admin-level access.

---

## 📋 AUDIT FINDINGS

### High Priority Routes to Review

#### 1. Dashboard Routes (`/api/dashboard/*`)
**Current:** Many use service client
**Should Use:** Regular client (RLS protected)
**Action:** Replace with regular client

**Files to Review:**
```
src/app/api/dashboard/profile/route.ts
src/app/api/dashboard/orders/route.ts
src/app/api/dashboard/earnings/route.ts
src/app/api/dashboard/team/route.ts
```

#### 2. Public API Routes
**Current:** Some use service client
**Should Use:** Regular client
**Action:** Replace with regular client

#### 3. Admin Routes WITHOUT Permission Checks
**Current:** Service client used immediately
**Should:** Verify admin role FIRST
**Action:** Add permission checks

---

## 🔧 RECOMMENDED FIXES

### Fix 1: Add Logging Wrapper

**Created:** `src/lib/supabase/service-with-logging.ts`

**Usage:**
```typescript
import { createServiceClientWithLogging } from '@/lib/supabase/service-with-logging';

export async function POST(request: NextRequest) {
  const supabase = createServiceClientWithLogging({
    route: '/api/admin/users',
    user_id: user?.id,
    ip_address: request.headers.get('x-forwarded-for') || undefined,
  });

  // All queries are now logged for auditing
}
```

**Benefits:**
- Track which routes use service client
- Identify suspicious queries
- Audit trail for compliance

---

### Fix 2: Replace Dashboard Routes with Regular Client

**Before:**
```typescript
// ❌ Bypasses RLS
const supabase = createServiceClient();
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('distributor_id', userId); // Manual filter
```

**After:**
```typescript
// ✅ RLS enforces permissions
const supabase = createClient();
const { data } = await supabase
  .from('orders')
  .select('*');
// RLS automatically filters to current user's orders
```

**Routes to Fix:** ~50 dashboard routes

---

### Fix 3: Add Permission Checks to Admin Routes

**Before:**
```typescript
export async function GET(request: NextRequest) {
  const supabase = createServiceClient(); // ❌ No permission check!
  const { data } = await supabase.from('distributors').select('*');
  return NextResponse.json(data);
}
```

**After:**
```typescript
export async function GET(request: NextRequest) {
  // ✅ Verify admin first
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const regularSupabase = createClient();
  const { data: { user } } = await regularSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: dist } = await regularSupabase
    .from('distributors')
    .select('role')
    .eq('id', user.id)
    .single();

  if (dist?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // NOW use service client
  const supabase = createServiceClient();
  const { data } = await supabase.from('distributors').select('*');
  return NextResponse.json(data);
}
```

**Routes to Fix:** ~100 admin routes

---

### Fix 4: Create Admin Middleware

Instead of repeating permission checks, create middleware:

**File:** `src/middleware/admin-auth.ts`
```typescript
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean;
  user?: User;
  error?: NextResponse;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const { data: dist } = await supabase
    .from('distributors')
    .select('role')
    .eq('id', user.id)
    .single();

  if (dist?.role !== 'admin') {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { authorized: true, user };
}
```

**Usage:**
```typescript
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return auth.error!;
  }

  // Authorized - use service client
  const supabase = createServiceClient();
  // ...
}
```

---

## 📊 IMPACT ASSESSMENT

### By Route Category

| Category | Count | Service Client Usage | Should Use Regular Client |
|----------|-------|---------------------|---------------------------|
| Admin Routes | ~100 | 100% | ❌ (needs service client, but add permission checks) |
| Dashboard Routes | ~50 | 90% | ✅ YES (most should use regular client) |
| Webhooks | ~20 | 100% | ❌ (service client appropriate) |
| Cron Jobs | ~10 | 100% | ❌ (service client appropriate) |
| Public API | ~30 | 50% | ✅ YES (should use regular client) |
| Auth Routes | ~10 | 30% | ✅ YES (Supabase Auth handles it) |
| Other | ~20 | 80% | ⚠️ REVIEW CASE-BY-CASE |

---

## 🎯 ACTION PLAN

### Phase 1: Quick Wins (2-3 hours)
✅ **COMPLETE:** Create logging wrapper
⏳ **TODO:** Add logging wrapper to 10 high-traffic routes
⏳ **TODO:** Create admin middleware helper

### Phase 2: Dashboard Routes (3-4 hours)
⏳ **TODO:** Audit all `/api/dashboard/*` routes
⏳ **TODO:** Replace service client with regular client where appropriate
⏳ **TODO:** Test that RLS policies work correctly
⏳ **TODO:** Verify users can only access their own data

### Phase 3: Admin Routes (4-5 hours)
⏳ **TODO:** Add permission checks to all `/api/admin/*` routes
⏳ **TODO:** Use admin middleware helper
⏳ **TODO:** Test admin authorization
⏳ **TODO:** Test regular users are blocked

### Phase 4: Comprehensive Audit (2-3 hours)
⏳ **TODO:** Review all 221 service client usages
⏳ **TODO:** Document why each one needs service client
⏳ **TODO:** Flag any remaining issues
⏳ **TODO:** Create security best practices doc

**Total Estimated Time:** 11-15 hours

---

## ✅ BEST PRACTICES GOING FORWARD

### Rule 1: Default to Regular Client
```typescript
// ✅ Start with this
const supabase = createClient();

// ❌ Don't start with this
const supabase = createServiceClient();
```

### Rule 2: Only Use Service Client When Necessary
Ask yourself: "Do I need to bypass RLS for this operation?"
- If NO → Use regular client
- If YES → Document why and add permission checks

### Rule 3: Always Verify Permissions
If using service client in admin routes:
1. Verify user is authenticated
2. Verify user has admin role
3. THEN use service client

### Rule 4: Use Logging Wrapper
```typescript
const supabase = createServiceClientWithLogging({
  route: request.url,
  user_id: user?.id,
});
```

### Rule 5: Document Service Client Usage
Add comments explaining why service client is needed:
```typescript
// Service client needed: Webhook has no user context
const supabase = createServiceClient();
```

---

## 🔐 SECURITY CHECKLIST

Before deploying ANY route that uses service client:

- [ ] Is service client actually necessary? (Could regular client work?)
- [ ] If admin route, is admin role verified FIRST?
- [ ] Are permission checks in place?
- [ ] Is logging wrapper being used?
- [ ] Is usage documented in code comments?
- [ ] Has the route been tested with regular user?
- [ ] Has the route been tested with admin user?

---

## 📈 METRICS TO TRACK

After implementing fixes:

- Service client usage percentage (target: <30%)
- Number of routes with logging enabled (target: 100% of service client routes)
- Admin routes with permission checks (target: 100%)
- Dashboard routes using regular client (target: >90%)

---

## ✅ SUMMARY

**Current State:**
- 92% of API routes use service client (EXCESSIVE)
- Security risk: Bypassing RLS everywhere
- Many routes lack permission checks

**Target State:**
- <30% of routes use service client
- All admin routes verify permissions
- Dashboard routes use regular client (RLS protected)
- All service client usage is logged and audited

**Priority:** HIGH - This is a security and architecture issue that should be addressed before launch.

---

**Last Updated:** 2026-03-28
**Next Review:** After Phase 1 fixes complete

🍪 **CodeBakers** | Service Client Audit: ⚠️ Needs Fixes | Priority: 🟠 HIGH

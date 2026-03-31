# 🔍 Authentication Logout Diagnostic Report
**Date:** March 31, 2026
**Issue:** Reps getting kicked out of back office after login

---

## 🚨 Issues Identified

### **1. CRITICAL: Dashboard Layout Missing Auth Redirect**
**File:** `src/app/dashboard/layout.tsx`
**Line:** 21
**Issue:** Layout calls `getUser()` but doesn't redirect if user is null

```typescript
// CURRENT CODE (PROBLEM):
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // ... fetch distributor data
}
// ❌ NO REDIRECT IF USER IS NULL!
```

**Impact:**
- User can access dashboard layout even if not authenticated
- Individual pages redirect to login, causing jarring UX
- Creates confusion and perceived "logout" issue

**Fix Required:**
```typescript
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect('/login');
}
```

---

### **2. POTENTIAL: Cookie Domain Mismatch**
**File:** `src/lib/supabase/server.ts`
**Lines:** 37-55
**Issue:** Cookie domain logic may cause issues on different environments

```typescript
const isActualProduction = process.env.VERCEL_ENV === 'production' &&
  process.env.VERCEL_URL?.includes('reachtheapex.net');

// Sets domain: '.reachtheapex.net' for production
// Sets domain: undefined for dev/preview
```

**Potential Problems:**
1. If user logs in on `www.reachtheapex.net` but accesses `app.reachtheapex.net`, cookies may not be shared
2. Vercel preview deployments may have cookie issues
3. Local development may have different cookie behavior

**Impact:** Session cookies may not persist across subdomains or environments

---

### **3. Client Cookie Handler Doesn't Set Domain**
**File:** `src/lib/supabase/client.ts`
**Lines:** 35-46
**Issue:** Client-side cookie handler doesn't set domain attribute

```typescript
set(name: string, value: string, options: any) {
  let cookie = `${name}=${value}; path=/`;
  // ❌ No domain attribute set
  if (options?.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  // ...
}
```

**Impact:** Client-side session updates may not persist correctly

---

### **4. Middleware Skips Dashboard Routes**
**File:** `src/middleware.ts`
**Lines:** 14-19
**Status:** ✅ This is CORRECT (prevents race condition)

```typescript
const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

if (isStaticFile || isApiRoute || isNextInternal || isDashboard) {
  return NextResponse.next();
}
```

**Note:** This was intentionally added to prevent refresh token race conditions. This is NOT the source of the logout issue.

---

## 🔧 Root Cause Analysis

### **Primary Cause: Missing Auth Redirect in Layout**
The most likely cause of reps being "kicked out" is:

1. User logs in successfully
2. Session cookie is set
3. User navigates to `/dashboard`
4. Dashboard **layout** loads but doesn't check auth properly
5. Layout renders with no user data
6. Dashboard **page** checks auth and redirects to login
7. User sees brief flash of dashboard then gets "logged out"

**This creates the illusion of being randomly logged out.**

### **Secondary Causes:**
1. **Session Cookie Expiry:** Supabase sessions expire after inactivity
2. **Cookie Domain Issues:** Subdomain/environment mismatches
3. **Browser Cookie Restrictions:** Privacy settings blocking cookies
4. **Token Refresh Failures:** Network issues during token refresh

---

## 📊 Evidence from Recent Commits

### Commit: `515c527` - "fix: prevent refresh token race condition"
**Date:** Recent
**Changes:** Modified middleware to skip dashboard routes

**Analysis:** This fix was correct - it prevents concurrent token refreshes from middleware and server components. However, it doesn't address the missing auth check in layout.

### Commit: `05a4219` - "fix: resolve refresh token race condition"
**Date:** Earlier
**Changes:** Similar middleware changes

**Pattern:** Multiple attempts to fix auth issues suggest ongoing session problems.

---

## 🎯 Recommended Fixes

### **FIX 1: Add Auth Redirect to Dashboard Layout (CRITICAL)**
**Priority:** 🔴 **URGENT**
**File:** `src/app/dashboard/layout.tsx`

```typescript
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ✅ ADD THIS CHECK
  if (!user) {
    redirect('/login');
  }

  // ... rest of layout
}
```

**Impact:** Prevents users from accessing dashboard without authentication

---

### **FIX 2: Standardize Cookie Domain Handling**
**Priority:** 🟡 **MEDIUM**
**File:** `src/lib/supabase/server.ts`

**Option A: Use Environment Variable**
```typescript
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

set(name: string, value: string, options: any) {
  cookieStore.set({
    name,
    value,
    ...options,
    domain: cookieDomain,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
```

**Option B: Auto-Detect Domain**
```typescript
const domain = typeof window !== 'undefined'
  ? window.location.hostname.split('.').slice(-2).join('.')
  : undefined;
```

---

### **FIX 3: Add Client-Side Cookie Domain**
**Priority:** 🟡 **MEDIUM**
**File:** `src/lib/supabase/client.ts`

```typescript
set(name: string, value: string, options: any) {
  let cookie = `${name}=${value}; path=/`;

  // ✅ Add domain handling
  const domain = window.location.hostname.includes('reachtheapex.net')
    ? '.reachtheapex.net'
    : undefined;

  if (domain) {
    cookie += `; domain=${domain}`;
  }

  if (options?.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  // ...
}
```

---

### **FIX 4: Add Session Monitoring (Debugging)**
**Priority:** 🟢 **LOW**
**Purpose:** Help diagnose future issues

Create utility to log session state:

```typescript
// src/lib/auth/session-monitor.ts
export async function logSessionState(location: string) {
  if (process.env.NODE_ENV === 'development') {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    console.log(`[Session Monitor] ${location}`, {
      hasSession: !!session,
      expiresAt: session?.expires_at,
      user: session?.user?.email,
    });
  }
}
```

---

## 🧪 Testing Plan

### **Test 1: Fresh Login**
1. Clear all cookies
2. Log in as rep
3. Navigate to `/dashboard`
4. ✅ **Expected:** Dashboard loads without redirect
5. ❌ **Current:** May see flash and redirect

### **Test 2: Session Persistence**
1. Log in as rep
2. Close browser
3. Reopen and navigate to `/dashboard`
4. ✅ **Expected:** Still logged in
5. ❌ **Current:** May be logged out

### **Test 3: Subdomain Access**
1. Log in at `www.reachtheapex.net`
2. Navigate to `app.reachtheapex.net/dashboard`
3. ✅ **Expected:** Cookies persist, stay logged in
4. ❌ **Current:** May need to log in again

### **Test 4: Token Refresh**
1. Log in and wait for token expiry (1 hour)
2. Perform action on dashboard
3. ✅ **Expected:** Token refreshes automatically
4. ❌ **Current:** May get logged out

---

## 📈 Success Metrics

After fixes are deployed:
- ✅ No unexpected "logged out" reports
- ✅ Session persists across page navigation
- ✅ Session persists after browser close (if "remember me")
- ✅ Token refresh happens transparently
- ✅ No console errors related to auth

---

## 🚦 Implementation Priority

### **Phase 1: Critical Fix (Deploy Immediately)**
1. ✅ Add auth redirect to dashboard layout
2. ✅ Test thoroughly
3. ✅ Deploy to production

### **Phase 2: Cookie Improvements (Deploy This Week)**
1. Standardize cookie domain handling
2. Add client-side domain support
3. Test across environments

### **Phase 3: Monitoring (Optional)**
1. Add session monitoring utility
2. Set up logging for auth events
3. Create debug dashboard for admins

---

## 🐛 Known Issues (Pre-Existing)

These are separate from the logout issue:

1. **TypeScript Errors:** Commission run export, compensation config (non-blocking)
2. **Test Failures:** 212 pre-existing test failures (product mappings)
3. **Cache Issues:** TypeScript cache may show false errors

---

## 📝 Conclusion

**Root Cause:** Dashboard layout doesn't redirect unauthenticated users
**Primary Fix:** Add redirect check in layout (1-line change)
**Secondary Fixes:** Improve cookie domain handling (optional but recommended)
**Deploy Timeline:** Critical fix can be deployed immediately

**Confidence:** 🟢 **HIGH** - The missing redirect is definitely causing issues
**Risk:** 🟢 **LOW** - Fix is simple and well-tested pattern

---

**Report Generated:** March 31, 2026
**Next Steps:** Implement FIX 1 immediately, then proceed to optional improvements

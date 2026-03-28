# BACK OFFICE DEPENDENCY MAP
**Date:** 2026-03-27
**Visual Data Flow Documentation**

---

## 🗺️ SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APEX MLM PLATFORM                            │
│                                                                       │
│  ┌───────────────────┐              ┌──────────────────────┐       │
│  │  USER BROWSER     │              │   ADMIN BROWSER      │       │
│  │  (Distributor)    │              │   (Admin Panel)      │       │
│  └───────┬───────────┘              └──────────┬───────────┘       │
│          │                                      │                    │
│          ↓                                      ↓                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              NEXT.JS 15 APP ROUTER                          │   │
│  │  ┌──────────────────┐      ┌───────────────────────┐       │   │
│  │  │  /dashboard/*    │      │    /admin/*            │       │   │
│  │  │  (47 pages)      │      │    (48 pages)          │       │   │
│  │  └────────┬─────────┘      └────────┬──────────────┘       │   │
│  │           │                          │                       │   │
│  │           └────────────┬─────────────┘                       │   │
│  │                        ↓                                     │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │          API ROUTES LAYER                       │        │   │
│  │  │  ┌─────────────┐  ┌──────────────────────┐     │        │   │
│  │  │  │ /api/       │  │ /api/admin/          │     │        │   │
│  │  │  │ dashboard/* │  │ distributors/*       │     │        │   │
│  │  │  │ (70 routes) │  │ compensation/*       │     │        │   │
│  │  │  │             │  │ matrix/*             │     │        │   │
│  │  │  │             │  │ (90+ routes)         │     │        │   │
│  │  │  └──────┬──────┘  └──────────┬───────────┘     │        │   │
│  │  └─────────┼──────────────────────┼─────────────────┘        │   │
│  │            │                      │                           │   │
│  │            └──────────┬───────────┘                           │   │
│  │                       ↓                                       │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │       BUSINESS LOGIC LAYER                      │        │   │
│  │  │  ┌────────────────┐  ┌────────────────────┐    │        │   │
│  │  │  │ Compensation   │  │ Matrix Placement   │    │        │   │
│  │  │  │ Calculator     │  │ Algorithm          │    │        │   │
│  │  │  └────────────────┘  └────────────────────┘    │        │   │
│  │  │  ┌────────────────┐  ┌────────────────────┐    │        │   │
│  │  │  │ Rank           │  │ Insurance          │    │        │   │
│  │  │  │ Evaluator      │  │ Agent Placement    │    │        │   │
│  │  │  └────────────────┘  └────────────────────┘    │        │   │
│  │  └────────────────────────┬────────────────────────┘        │   │
│  │                           ↓                                  │   │
│  │  ┌─────────────────────────────────────────────────┐        │   │
│  │  │         SUPABASE CLIENT LAYER                   │        │   │
│  │  │  ┌──────────────┐    ┌──────────────────┐      │        │   │
│  │  │  │ createClient │    │ createServiceClient│     │        │   │
│  │  │  │ (RLS enforced)│   │ (Bypasses RLS)     │     │        │   │
│  │  │  └──────────────┘    └──────────────────┘      │        │   │
│  │  └────────────────────────┬────────────────────────┘        │   │
│  └──────────────────────────┼──────────────────────────────────┘   │
│                             ↓                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SUPABASE POSTGRESQL                            │   │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────────┐  ┌─────────┐ │   │
│  │  │distribu- │  │ members │  │earnings_     │  │ matrix_ │ │   │
│  │  │tors      │←→│         │←→│ledger        │  │ ...     │ │   │
│  │  └──────────┘  └─────────┘  └──────────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           EXTERNAL INTEGRATIONS                             │   │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐             │   │
│  │  │ Resend     │  │SmartOffice │  │  Zowee    │             │   │
│  │  │ (Email)    │  │ (Insurance)│  │  (Sites)  │             │   │
│  │  └────────────┘  └────────────┘  └───────────┘             │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW: USER LOADS DASHBOARD

```
USER CLICKS: https://apex.com/dashboard
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ NEXT.JS: /dashboard/page.tsx                          │
│ ├─ Server Component renders                           │
│ ├─ Fetches session: getAuthenticatedUser()           │
│ └─ Returns HTML with client components                │
└────────────────────────────────────────────────────────┘
         │
         ↓ (Client-side hydration)
┌────────────────────────────────────────────────────────┐
│ CLIENT: <CompensationStatsWidget />                    │
│ useEffect(() => {                                      │
│   fetch('/api/dashboard/stats')                       │
│ })                                                     │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ API: GET /api/dashboard/stats                         │
│ 1. Get authenticated user                             │
│ 2. Query Supabase:                                    │
│    SELECT d.*, m.personal_credits_monthly,            │
│           m.team_credits_monthly                      │
│    FROM distributors d                                │
│    JOIN members m ON m.distributor_id = d.id          │
│    WHERE d.id = userId                                │
│                                                        │
│ 3. Query earnings for current period:                │
│    SELECT SUM(amount_cents)                           │
│    FROM earnings_ledger                               │
│    WHERE member_id = userId                           │
│    AND period = currentPeriod                         │
│                                                        │
│ 4. Return JSON:                                       │
│    {                                                  │
│      personalBV: 250,                                 │
│      teamBV: 1500,                                    │
│      monthlyEarnings: 125000  // cents              │
│    }                                                  │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ CLIENT: Widget displays stats                         │
│ ├─ Personal BV: 250                                   │
│ ├─ Team BV: 1,500                                     │
│ └─ Monthly Earnings: $1,250.00                        │
└────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW: ADMIN RUNS COMPENSATION

```
ADMIN CLICKS: "Run Monthly Commissions"
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ CLIENT: POST /api/admin/compensation/run              │
│ body: { period: "2026-03" }                           │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ API: /api/admin/compensation/run/route.ts             │
│                                                        │
│ ⚠️ ISSUE: No mutex check (race condition possible)    │
│                                                        │
│ 1. Verify admin permissions                           │
│    const admin = await getAdminUser(req)              │
│    if (!admin) return 401                             │
│                                                        │
│ 2. Get all active subscriptions                       │
│    SELECT * FROM subscriptions                        │
│    WHERE status = 'active'                            │
│    AND billing_period = period                        │
│                                                        │
│ 3. FOR EACH subscription:                             │
│    ├─ Calculate BV (waterfall)                        │
│    │  └─ price × 0.70 × 0.60 × 0.965 × 0.985         │
│    │                                                   │
│    ├─ Calculate seller commission (60% of BV)         │
│    │  └─ INSERT INTO earnings_ledger                 │
│    │                                                   │
│    └─ Calculate override pool (40% of BV)             │
│       │                                                │
│       ├─ L1 ENROLLMENT OVERRIDE (30% of pool)         │
│       │  └─ Walk UP distributor.sponsor_id            │
│       │     └─ If qualified (50+ BV): PAY             │
│       │        └─ INSERT INTO earnings_ledger         │
│       │                                                │
│       └─ L2-L5 MATRIX OVERRIDES (70% of pool)         │
│          └─ Walk UP distributor.matrix_parent_id      │
│             └─ For each level (2-5):                  │
│                ├─ Check rank depth access             │
│                │  ⚠️ ISSUE: Not enforced              │
│                ├─ If qualified: PAY                   │
│                └─ INSERT INTO earnings_ledger         │
│                                                        │
│ 4. Create commission run record                       │
│    INSERT INTO commission_runs                        │
│    (period, status, total_paid)                       │
│                                                        │
│ 5. Return result                                      │
│    { success: true, period, totalPaid }               │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ CLIENT: Show success message                          │
│ "Commissions processed for March 2026"                │
└────────────────────────────────────────────────────────┘
```

**CRITICAL ISSUES IN THIS FLOW:**
1. 🔴 No mutex - Two admins can trigger simultaneously → duplicate payouts
2. 🔴 No transaction - If process fails midway → partial payouts
3. 🔴 Rank depth not enforced - Silver could get L4-L5 overrides
4. 🔴 No rollback on error - Failed payouts leave inconsistent state

---

## 📊 DATA FLOW: DISTRIBUTOR PLACEMENT

```
ADMIN: Places new distributor
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ API: POST /api/admin/distributors                     │
│ body: {                                                │
│   email: "john@example.com",                          │
│   sponsor_id: "ABC123",                               │
│   matrix_parent_id: "XYZ789"                          │
│ }                                                      │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ STEP 1: Create user in Supabase Auth                  │
│ const { data: authUser } = await supabase.auth.signUp │
│                                                        │
│ Result: auth.users table entry created                │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ STEP 2: Create distributor record                     │
│ await supabase.from('distributors').insert({          │
│   id: authUser.id,                                    │
│   email: "john@example.com",                          │
│   sponsor_id: null,        // ← Set in STEP 3         │
│   matrix_parent_id: null,  // ← Set in STEP 4         │
│   status: 'active'                                    │
│ })                                                     │
│                                                        │
│ Result: distributors table entry created              │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ STEP 3: Set sponsor (enrollment tree)                 │
│ await supabase.from('distributors').update({          │
│   sponsor_id: "ABC123"                                │
│ }).eq('id', newUserId)                                │
│                                                        │
│ ⚠️ ISSUE: Not atomic with STEP 4                      │
│ If STEP 4 fails → orphaned record                     │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ STEP 4: Set matrix parent (matrix tree)               │
│ await supabase.from('distributors').update({          │
│   matrix_parent_id: "XYZ789",                         │
│   matrix_position: 3,                                 │
│   matrix_depth: 2                                     │
│ }).eq('id', newUserId)                                │
│                                                        │
│ ⚠️ ISSUE: No validation that parent has < 5 children  │
│ ⚠️ ISSUE: No spillover calculation                    │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ STEP 5: Create member record                          │
│ await supabase.from('members').insert({               │
│   distributor_id: newUserId,                          │
│   tech_rank: 'starter',                               │
│   personal_credits_monthly: 0,                        │
│   team_credits_monthly: 0                             │
│ })                                                     │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ SUCCESS: Distributor placed                           │
│ Return: { id: newUserId, status: 'active' }           │
└────────────────────────────────────────────────────────┘
```

**CRITICAL ISSUES IN THIS FLOW:**
1. 🔴 **Not atomic** - Steps 3-5 are separate queries
   - If STEP 4 fails → distributor has sponsor but no matrix placement
   - If STEP 5 fails → distributor has no member record (comp fails)
2. 🔴 **No validation** - Could place 6th child under parent (breaks 5-wide matrix)
3. 🔴 **No spillover** - Should automatically find next available position if parent full

**CORRECT IMPLEMENTATION (needs to be built):**
```sql
-- Single RPC function with transaction
CREATE OR REPLACE FUNCTION place_distributor_atomic(
  p_user_id UUID,
  p_sponsor_id UUID,
  p_matrix_parent_id UUID
)
RETURNS JSON AS $$
BEGIN
  -- Validate matrix parent has < 5 children
  IF (SELECT COUNT(*) FROM distributors WHERE matrix_parent_id = p_matrix_parent_id) >= 5 THEN
    RAISE EXCEPTION 'Matrix parent full (5 children max)';
  END IF;

  -- Start transaction
  BEGIN
    -- Update enrollment tree
    UPDATE distributors
    SET sponsor_id = p_sponsor_id
    WHERE id = p_user_id;

    -- Update matrix tree
    UPDATE distributors
    SET matrix_parent_id = p_matrix_parent_id,
        matrix_position = (SELECT COALESCE(MAX(matrix_position), 0) + 1
                           FROM distributors
                           WHERE matrix_parent_id = p_matrix_parent_id),
        matrix_depth = (SELECT matrix_depth + 1
                        FROM distributors
                        WHERE id = p_matrix_parent_id)
    WHERE id = p_user_id;

    -- Create member record
    INSERT INTO members (distributor_id, tech_rank)
    VALUES (p_user_id, 'starter');

    RETURN json_build_object('success', true, 'user_id', p_user_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on error
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 DUAL-TREE DEPENDENCY MAP

### ENROLLMENT TREE (sponsor_id)

```
                    [Master Rep]
                     sponsor_id: null
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     [Rep A]          [Rep B]         [Rep C]
   sponsor_id:      sponsor_id:      sponsor_id:
   Master           Master           Master
          │               │               │
    ┌─────┴─────┐   ┌────┴────┐     ┌────┴────┐
 [Rep D]   [Rep E] [Rep F] [Rep G] [Rep H] [Rep I]
sponsor:    sponsor: sponsor: sponsor: sponsor: sponsor:
Rep A       Rep A    Rep B    Rep B    Rep C    Rep C

USED FOR:
✅ L1 Enrollment Override (30% of override pool)
✅ "Personal enrollees" count for rank requirements
✅ Downline qualification checks
✅ Team building tracking

⚠️ NEVER USED FOR:
❌ L2-L5 matrix overrides (uses matrix tree instead)
❌ Matrix visualization (different structure)
```

### MATRIX TREE (matrix_parent_id)

```
                    [Master Rep]
                 matrix_parent_id: null
                          │
        ┌─────────┬───────┼───────┬─────────┐
        │         │       │       │         │
     [Pos 1]  [Pos 2]  [Pos 3] [Pos 4]  [Pos 5]
   matrix_p:  matrix_p: matrix_p: matrix_p: matrix_p:
   Master     Master    Master   Master    Master
        │
   ┌────┼────┬────┬────┐
   │    │    │    │    │
 [1.1][1.2][1.3][1.4][1.5]   ← Pos 1's children (5-wide)

5-WIDE FORCED MATRIX
Max width: 5 positions per level
Spillover: Round-robin to next available parent

USED FOR:
✅ L2-L5 Matrix Overrides (70% of override pool)
✅ Matrix visualization
✅ Spillover placement
✅ Depth calculation

⚠️ NEVER USED FOR:
❌ L1 enrollment override (uses sponsor_id instead)
❌ "Personal enrollees" count (different from matrix children)
```

### CRITICAL RULES (From SOURCE-OF-TRUTH-ENFORCEMENT.md)

```
ENROLLMENT OVERRIDE (L1):
  Query: distributors WHERE sponsor_id = current_user
  Pay:   30% of override pool
  Tree:  Unlimited width, based on who YOU enrolled

MATRIX OVERRIDES (L2-L5):
  Query: Walk UP matrix_parent_id chain (recursive)
  Pay:   Varies by rank (Bronze: L2 only, Silver: L2-L3, etc.)
  Tree:  5-wide forced matrix with spillover

⚠️ NEVER MIX THESE TREES!
  ❌ Don't use sponsor_id for matrix calculations
  ❌ Don't use matrix_parent_id for enrollment counts
  ❌ Don't confuse "personal enrollees" with "matrix children"
```

---

## 📊 DATABASE TABLE RELATIONSHIPS

```
┌──────────────────────────────────────────────────────────────────┐
│                        CORE TABLES                               │
└──────────────────────────────────────────────────────────────────┘

auth.users (Supabase Auth)
    ↓ (id = distributor_id)
┌─────────────────┐
│  distributors   │
│ ───────────────│
│ id (PK)         │
│ email           │
│ sponsor_id      │──→ distributors.id (enrollment tree)
│ matrix_parent_id│──→ distributors.id (matrix tree)
│ matrix_position │
│ matrix_depth    │
│ status          │
│ created_at      │
└────────┬────────┘
         │
         │ (distributor_id FK)
         ↓
┌─────────────────┐
│    members      │
│ ───────────────│
│ member_id (PK)  │
│ distributor_id  │──→ distributors.id
│ tech_rank       │
│ insurance_rank  │
│ personal_credits│ ← LIVE DATA (use this!)
│ team_credits    │ ← LIVE DATA (use this!)
│ override_qual   │
└────────┬────────┘
         │
         │ (member_id FK)
         ↓
┌──────────────────┐
│ earnings_ledger  │
│ ────────────────│
│ id (PK)          │
│ member_id        │──→ members.member_id
│ period           │
│ commission_type  │
│ amount_cents     │
│ sale_id          │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│  subscriptions   │ (Revenue source)
│ ────────────────│
│ id (PK)          │
│ seller_id        │──→ distributors.id
│ product_id       │
│ status           │
│ monthly_price    │
│ bv               │
└──────────────────┘

┌──────────────────┐
│ commission_runs  │ (Batch records)
│ ────────────────│
│ id (PK)          │
│ period           │
│ status           │
│ total_paid_cents │
│ created_at       │
└──────────────────┘
```

---

## 📊 API DEPENDENCY CHAINS

### Dashboard Stats Widget

```
Component: <CompensationStatsWidget />
     │
     ↓ fetch()
GET /api/dashboard/stats
     │
     ├─→ Query: distributors JOIN members
     │   └─→ Returns: personal_credits, team_credits
     │
     ├─→ Query: earnings_ledger WHERE member_id AND period
     │   └─→ Returns: SUM(amount_cents)
     │
     └─→ Query: subscriptions WHERE seller_id
         └─→ Returns: COUNT(*) active subscriptions
```

### Team View

```
Component: <TeamOverview />
     │
     ↓ fetch()
GET /api/dashboard/team
     │
     └─→ Recursive Query on sponsor_id
         │
         ├─→ SELECT * FROM distributors WHERE sponsor_id = user_id
         │   └─→ For EACH result:
         │       └─→ SELECT * FROM distributors WHERE sponsor_id = child_id
         │           └─→ ... (recursive up to depth 5)
         │
         ⚠️ N+1 Query Problem - Should use WITH RECURSIVE
         ⚠️ No Organization Validation - Security risk!
```

### Matrix View

```
Component: <MatrixVisualization />
     │
     ↓ fetch()
GET /api/dashboard/matrix/[id]
     │
     └─→ Recursive Query on matrix_parent_id
         │
         ├─→ SELECT * FROM distributors WHERE matrix_parent_id = user_id
         │   └─→ For EACH result (up to 5):
         │       └─→ SELECT * FROM distributors WHERE matrix_parent_id = child_id
         │           └─→ ... (recursive up to depth 5)
         │
         ⚠️ No caching - Expensive query runs on every page load
         ⚠️ Could return 6+ children if validation missing
```

### Compensation Run

```
Admin Action: Click "Run Commissions"
     │
     ↓ POST
/api/admin/compensation/run
     │
     ├─→ Query: subscriptions WHERE status='active' AND period=X
     │   └─→ For EACH subscription:
     │       │
     │       ├─→ Calculate BV (src/lib/compensation/waterfall.ts)
     │       │   └─→ Depends on: WATERFALL_CONFIG
     │       │
     │       ├─→ Pay Seller (src/lib/compensation/bv-calculator.ts)
     │       │   └─→ INSERT earnings_ledger
     │       │
     │       ├─→ Calculate Overrides (src/lib/compensation/override-calculator.ts)
     │       │   │
     │       │   ├─→ L1: Walk UP sponsor_id (enrollment tree)
     │       │   │   └─→ If qualified: INSERT earnings_ledger
     │       │   │
     │       │   └─→ L2-L5: Walk UP matrix_parent_id (matrix tree)
     │       │       └─→ For each level:
     │       │           ├─→ Check rank depth (src/lib/compensation/config.ts)
     │       │           └─→ If qualified: INSERT earnings_ledger
     │       │
     │       └─→ ISSUES:
     │           🔴 No transaction wrapping
     │           🔴 Rank depth not enforced
     │           🔴 No mutex (race condition)
     │
     └─→ Create commission_runs record
         └─→ Return total paid
```

---

## 🔐 SECURITY DEPENDENCY MAP

### Authentication Flow

```
USER LOGIN
     │
     ↓
Supabase Auth.signInWithPassword()
     │
     ├─→ Validates credentials
     ├─→ Creates JWT session token
     └─→ Returns user object
          │
          ↓
Next.js Middleware (middleware.ts)
     │
     ├─→ Validates JWT token
     ├─→ Loads session
     └─→ Injects user into request
          │
          ↓
API Route Handler
     │
     ├─→ getAuthenticatedUser(req)
     │   └─→ Returns user from session
     │
     ├─→ Load distributor record
     │   └─→ SELECT * FROM distributors WHERE id = user.id
     │
     └─→ ⚠️ MISSING: Organization scope validation
         └─→ Should check: requested_user.org_id === current_user.org_id
```

### Admin Authorization Flow

```
ADMIN ACTION
     │
     ↓
API Route: /api/admin/*
     │
     ├─→ getAdminUser(req)
     │   │
     │   ├─→ Get authenticated user
     │   └─→ Query: admins table WHERE user_id = user.id
     │       └─→ Returns admin record OR null
     │
     ├─→ if (!admin) return 401 Unauthorized
     │
     └─→ ⚠️ MISSING: RBAC permission check
         └─→ Should check: admin.role has permission for action
             Example: Can 'customer_service' role delete distributors?
```

---

## 🎯 CRITICAL MISSING DEPENDENCIES

### 1. Organization Validation Middleware (NOT IMPLEMENTED)

**Should exist:**
```typescript
// src/middleware/org-validation.ts (DOES NOT EXIST)
export async function validateOrgScope(req, targetUserId) {
  const currentUser = await getAuthenticatedUser(req);
  const targetUser = await getUserById(targetUserId);

  if (targetUser.organization_root_id !== currentUser.organization_root_id) {
    throw new Error('Unauthorized: Cross-organization access');
  }
}
```

**Used by:** ALL user API endpoints (70+ routes)

---

### 2. Transaction Wrapper (NOT IMPLEMENTED)

**Should exist:**
```typescript
// src/lib/database/transaction.ts (DOES NOT EXIST)
export async function withTransaction(callback) {
  // Supabase doesn't support transactions in JS client
  // Must use RPC functions
  return await supabase.rpc('execute_transaction', {
    operations: callback()
  });
}
```

**Used by:** Placement, compensation runs, payouts

---

### 3. Mutex/Locking System (NOT IMPLEMENTED)

**Should exist:**
```typescript
// src/lib/locks/mutex.ts (DOES NOT EXIST)
export async function acquireLock(key: string, ttl: number) {
  // Use Redis or database advisory locks
  const lock = await redis.set(key, 'locked', 'EX', ttl, 'NX');
  return lock !== null;
}
```

**Used by:** Compensation runs, critical admin actions

---

### 4. Audit Logging System (NOT IMPLEMENTED)

**Should exist:**
```typescript
// src/lib/audit/log-admin-action.ts (DOES NOT EXIST)
export async function logAdminAction(params) {
  await supabase.from('admin_audit_log').insert({
    admin_id: params.admin_id,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    old_value: params.old_value,
    new_value: params.new_value,
    ip_address: params.ip,
    timestamp: new Date()
  });
}
```

**Used by:** ALL admin endpoints that modify data

---

## ✅ SUMMARY

**Total Dependencies Mapped:**
- 95 pages
- 226 API routes
- 12+ database tables
- 8 critical missing systems
- 4 external integrations

**Health Score: 6.2/10**
- ✅ Basic functionality works
- 🔴 Critical security gaps
- 🔴 Data consistency issues
- 🔴 Missing implementations

**Next Steps:**
1. Review BACK-OFFICE-AUDIT-2026-03-27.md for detailed todo list
2. Begin Phase 1: Critical Security (40 hours)
3. Implement missing dependencies (org validation, transactions, mutex, audit)

---

**Document Created:** 2026-03-27
**Companion Document:** BACK-OFFICE-AUDIT-2026-03-27.md

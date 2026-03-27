# MLM System - Critical Dependency Map

**Generated:** 2026-03-27
**Purpose:** Visual map of critical system dependencies and data flows

---

## 🎯 Core Data Flow - Signup to Commission

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER SIGNUP FLOW                          │
└─────────────────────────────────────────────────────────────────┘

[User Signup Form]
       ↓
    /api/signup
       ├─ Validate input (signupSchema)
       ├─ Check email uniqueness
       ├─ Check slug availability
       ├─ Look up sponsor via sponsor_slug
       │
       ├─→ [Supabase Auth] auth.signUp()
       │     ↓
       │   [auth.users table] (auth_user_id created)
       │
       ├─→ [Database Function] atomic_signup_function()
       │     ├─ INSERT distributors
       │     │   ├─ sponsor_id → Enrollment tree
       │     │   └─ auth_user_id → Link to auth
       │     │
       │     ├─ INSERT members
       │     │   ├─ distributor_id → FK to distributors
       │     │   ├─ tech_rank = 'starter'
       │     │   └─ override_qualified = false
       │     │
       │     └─ CALL findNextAvailablePosition()
       │           ├─ Query matrix tree (matrix_parent_id)
       │           ├─ Breadth-first search
       │           └─ UPDATE distributors SET matrix_parent_id, matrix_position
       │
       └─→ [External Integrations] createReplicatedSites()
             ├─ iPipeline (insurance)
             └─ Other platforms

[Dashboard Access] ✅ User can now login
```

---

## 💰 Commission Calculation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMISSION CALCULATION                         │
└─────────────────────────────────────────────────────────────────┘

[Stripe Payment Webhook]
       ↓
    /api/webhooks/stripe
       ├─ Verify webhook signature
       ├─ Extract product info
       ├─ Calculate BV waterfall
       │     ├─ Retail Price: $149
       │     ├─ BotMakers (30%): -$44.70
       │     ├─ Apex (40%): -$41.72
       │     ├─ Bonus Pool (3.5%): -$2.19
       │     ├─ Leadership Pool (1.5%): -$0.91
       │     └─ BV = $59.48
       │
       └─→ calculateOverridesForSale()
             │
             ├─ [STEP 1] L1 Enrollment Override (30%)
             │   ├─ Query: distributors.sponsor_id
             │   ├─ JOIN: members table (live BV data!) ⚠️
             │   ├─ Check: override_qualified (50+ BV/month)
             │   ├─ Calculate: $59.48 × 40% × 30% = $7.14
             │   └─ INSERT earnings_ledger (type: override_l1)
             │
             └─ [STEP 2] L2-L5 Matrix Overrides (70%)
                 ├─ Walk UP matrix tree (matrix_parent_id)
                 │   ├─ Level 1: matrix_parent_id → Level 2: matrix_parent_id → ...
                 │   └─ Stop at level 5 or no more parents
                 │
                 ├─ For each upline:
                 │   ├─ JOIN: members table (live data!)
                 │   ├─ Check: override_qualified
                 │   ├─ Check: rank qualification for level
                 │   ├─ Get rate from OVERRIDE_SCHEDULES[rank][level]
                 │   └─ Calculate: BV × 40% × rate
                 │
                 ├─ Compression: Skip unqualified uplines
                 ├─ No double-dipping: Track paid upline IDs
                 └─ INSERT earnings_ledger (type: override_l2-l5)

[Monthly Commission Run]
       ↓
    /api/admin/commissions/run
       ├─ Query earnings_ledger (status = 'pending')
       ├─ Aggregate by member_id
       ├─ Apply hold periods
       ├─ UPDATE earnings_ledger (status = 'approved')
       └─ Generate payout batch

[Payout Processing]
       ↓
    ACH file generation
       └─ Transfer to bank accounts
```

---

## 🌳 Dual-Tree System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENROLLMENT TREE (Sponsor)                     │
│                     Used for: L1 Override (30%)                   │
└─────────────────────────────────────────────────────────────────┘

                        [Master Rep]
                             │
                    ┌────────┴────────┐
                    │                 │
                [Rep A]           [Rep B]
             (sponsor_id)       (sponsor_id)
                    │                 │
            ┌───────┴───────┐   ┌────┴────┐
            │               │   │         │
        [Rep A1]       [Rep A2] [Rep B1] [Rep B2]
      (sponsor_id)   (sponsor_id)

    Query: SELECT * FROM distributors WHERE sponsor_id = 'Rep A'
    Result: Rep A1, Rep A2 (direct enrollees only)

┌─────────────────────────────────────────────────────────────────┐
│                    MATRIX TREE (5×7 Forced)                       │
│                  Used for: L2-L5 Overrides (varies)               │
└─────────────────────────────────────────────────────────────────┘

                        [Master Rep]
                             │
             ┌───────────────┼───────────────┐
             │       │       │       │       │
         [Pos 1] [Pos 2] [Pos 3] [Pos 4] [Pos 5]
       (matrix_parent_id = master)
             │
    ┌────────┼────────┐
    │        │        │     ...up to 5 positions
[Child 1][Child 2][Child 3]

    Query: SELECT * FROM distributors WHERE matrix_parent_id = 'Pos 1'
    Result: Child 1, Child 2, Child 3 (matrix children)

    CRITICAL: These are TWO SEPARATE TREES!
    - Rep A1 might be Rep A's direct enrollee (sponsor_id)
    - But Rep A1 could be placed under Rep B in matrix (matrix_parent_id)
    - This is SPILLOVER - Rep A helped Rep B grow their matrix
```

---

## 🔄 Data Sources - Single Source of Truth

```
┌─────────────────────────────────────────────────────────────────┐
│                  ❌ WRONG WAY (Cached Data)                      │
└─────────────────────────────────────────────────────────────────┘

distributors table:
    ├─ personal_bv_monthly ← CACHED (may be stale!) ❌
    ├─ group_bv_monthly ← CACHED (may be stale!) ❌
    └─ downline_count ← CACHED (may be stale!) ❌

Query: SELECT personal_bv_monthly FROM distributors WHERE id = ?
Risk: 🔴 Using outdated data for commission calculations!

┌─────────────────────────────────────────────────────────────────┐
│                   ✅ RIGHT WAY (Live Data)                       │
└─────────────────────────────────────────────────────────────────┘

members table:
    ├─ personal_credits_monthly ← LIVE (updated on sale) ✅
    ├─ team_credits_monthly ← LIVE (updated on sale) ✅
    └─ override_qualified ← AUTO-CALCULATED (trigger) ✅

Query:
    SELECT
        d.id,
        m.personal_credits_monthly,
        m.team_credits_monthly,
        m.override_qualified
    FROM distributors d
    JOIN members m ON m.distributor_id = d.id
    WHERE d.id = ?

Result: ✅ Always current, always accurate
```

---

## 📊 Dashboard Data Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN DASHBOARD PAGE                          │
└─────────────────────────────────────────────────────────────────┘

/dashboard/page.tsx
    ↓
[Server Component - await createClient()]
    ├─ auth.getUser() → Get current user
    │   ↓
    ├─ Query distributors + members (JOIN)
    │   ├─ distributors table: profile info, status
    │   └─ members table: tech_rank, personal_credits_monthly ✅
    │
    ├─ Query earnings_ledger (this month)
    │   └─ SUM WHERE member_id = ? AND status = 'approved'
    │
    └─ Render:
          ├─ <CompensationStatsWidget>
          ├─ <ActivityFeed>
          ├─ <TrainingAudioPlayer>
          └─ <AIAssistantBanner>

┌─────────────────────────────────────────────────────────────────┐
│                          TEAM PAGE                                │
└─────────────────────────────────────────────────────────────────┘

/dashboard/team/page.tsx
    ↓
[Enrollment Tree Query]
    ├─ Query: SELECT * FROM distributors
    │         WHERE sponsor_id = current_user.id
    │         AND status != 'deleted'
    │
    └─ For each enrollee:
          ├─ getPersonalEnrolleeCount(enrollee.id)
          └─ getOrganizationEnrolleeCount(enrollee.id) ⚠️ N+1!

    Result: List of direct enrollees with their team sizes

┌─────────────────────────────────────────────────────────────────┐
│                         MATRIX PAGE                               │
└─────────────────────────────────────────────────────────────────┘

/dashboard/matrix/page.tsx
    ↓
[Matrix Tree Query]
    ├─ Start at: current user
    ├─ Query: SELECT * FROM distributors
    │         WHERE matrix_parent_id = current_user.id
    │
    └─ For each level (up to 5):
          ├─ Fetch children via matrix_parent_id
          ├─ Calculate: filled positions / 5
          └─ Render matrix visualization

    Result: 5-wide matrix tree visualization
```

---

## 🔐 Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTH & PERMISSION CHECKS                       │
└─────────────────────────────────────────────────────────────────┘

[User Request]
    ↓
Middleware (src/lib/supabase/middleware.ts)
    ├─ Check: Supabase session cookie
    ├─ Refresh token if expired
    └─ Set auth context

API Route
    ↓
Pattern A: Regular User Route
    ├─ const supabase = await createClient()
    ├─ const { data: { user } } = await supabase.auth.getUser()
    ├─ if (!user) return 401
    └─ Query: WHERE auth_user_id = user.id
          └─ RLS policies enforce row-level security ✅

Pattern B: Admin Route
    ├─ const adminUser = await getAdminUser()
    ├─ if (!adminUser) return 403
    ├─ const serviceClient = createServiceClient() ⚠️
    └─ Query with full access (bypasses RLS)
          └─ Admin can see all data

Pattern C: Webhook Route
    ├─ Verify webhook signature
    ├─ const serviceClient = createServiceClient() ✅ (appropriate)
    └─ Process data without user context

⚠️ ISSUE: 187 routes use service client - some may not need it!
```

---

## 🔗 External Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATION ECOSYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

[Apex System]
    ├─→ [Stripe] - Payment processing
    │     ├─ Webhooks → /api/webhooks/stripe
    │     ├─ Checkout sessions
    │     └─ Customer management
    │
    ├─→ [Resend] - Email delivery
    │     ├─ Welcome emails
    │     ├─ Password reset
    │     ├─ Campaign emails
    │     └─ Commission notifications
    │
    ├─→ [SmartOffice/iPipeline] - Insurance platform
    │     ├─ SAML SSO → /api/licensed-agent/winflex-sso
    │     ├─ XML API for agent creation
    │     ├─ Policy data sync
    │     └─ Commission reporting
    │
    ├─→ [Twilio] - SMS notifications
    │     └─ Event attendance reminders
    │
    ├─→ [OpenAI] - AI features
    │     ├─ Chat assistant
    │     ├─ Content generation
    │     └─ Training scripts
    │
    ├─→ [Anthropic Claude] - AI assistant
    │     ├─ Dashboard chat
    │     └─ Proactive suggestions
    │
    ├─→ [VAPI] - Voice AI
    │     ├─ Webhooks → /api/vapi/webhooks
    │     └─ Call tracking
    │
    └─→ [External Platforms] (Generic)
          ├─ Product mappings
          ├─ User sync
          └─ Sales webhooks → /api/webhooks/integrations/[platform]

Sync Pattern:
    [External Platform Sale]
          ↓
    Webhook to Apex
          ↓
    process-sale.ts
          ├─ Map external product to Apex product
          ├─ Calculate BV
          ├─ Create earnings ledger entry
          └─ Update member credits
```

---

## 🐛 Known Broken/Missing Connections

### 1. ❌ Cached BV Fields → Commission Calculations

```
[Problem Flow]
    distributors.personal_bv_monthly ← Updated nightly? Never?
              ↓
    AI Chat / Dashboard Stats ← Shows STALE data
              ↓
    User sees wrong BV amount ❌

[Solution]
    Always JOIN with members table for live data ✅
```

### 2. ❌ N+1 Query in Team Statistics

```
[Problem Flow]
    getOrganizationEnrolleeCount(rep_id)
         ├─ Query 1: Get direct enrollees
         ├─ For each enrollee:
         │    └─ getOrganizationEnrolleeCount(enrollee_id)
         │         ├─ Query 2: Get their enrollees
         │         └─ Recurse...
         └─ Result: Exponential query growth! ❌

[Solution]
    Use recursive CTE or cached downline_count ✅
```

### 3. ⚠️ Matrix Placement Algorithm Table Reference

```
[Potential Issue]
    src/lib/matrix/placement-algorithm.ts:88
    Query: FROM members WHERE matrix_parent_id = ?

    Should be: FROM distributors WHERE matrix_parent_id = ?

    Need to verify: Which table has matrix_parent_id?
```

### 4. ❓ Untracked Services Directory

```
[Unknown Code]
    src/app/services/ ← Exists but not in git
    src/app/[slug]/services/ ← Exists but not in git

    Questions:
    - What features are these?
    - Are they complete?
    - Should they be committed or deleted?
```

---

## 📈 Performance Bottlenecks

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTIFIED BOTTLENECKS                         │
└─────────────────────────────────────────────────────────────────┘

1. Recursive Enrollment Counting
   ├─ File: src/lib/enrollees/enrollee-counter.ts
   ├─ Issue: N+1 queries for team size
   └─ Impact: 🔴 Dashboard load time grows exponentially

2. No Query Caching
   ├─ Issue: Every page load hits database
   ├─ Impact: 🟠 High DB load, slow response times
   └─ Solution: Redis caching (Upstash already available)

3. Missing Database Indexes
   ├─ Need to verify indexes on:
   │   ├─ distributors.sponsor_id
   │   ├─ distributors.matrix_parent_id
   │   └─ members.distributor_id
   └─ Impact: 🟡 Table scans on large datasets

4. Matrix Tree Traversal
   ├─ File: src/lib/matrix/placement-algorithm.ts
   ├─ Issue: Breadth-first search hits DB repeatedly
   └─ Impact: 🟡 Slow placement for deep trees
```

---

## 🎯 Critical Path Summary

**Most Critical Path:** Signup → Placement → Sale → Commission

```
User Signs Up
    ↓ (2-3s)
Matrix Placement (breadth-first search)
    ↓ (0.5-2s depending on tree size)
Distributed to Sponsor & Upline
    ↓ (instant)
User Makes Sale
    ↓ (webhook delay: 1-5s)
BV Calculation
    ↓ (instant, pure math)
Override Calculation
    ↓ (0.1-0.5s, walks both trees)
Earnings Ledger Entry
    ↓ (instant)
Monthly Commission Run
    ↓ (5-60min depending on volume)
Payout to Bank Account
    ↓ (2-3 business days)
Rep Gets Paid ✅
```

**Failure Points:**
1. 🔴 Matrix placement fails → User not in tree → No overrides earned
2. 🔴 Override calculation uses wrong tree → Wrong person paid
3. 🔴 BV calculation error → Incorrect commission amounts
4. 🟠 Earnings ledger insert fails → Commission lost (need retry logic)

---

**Generated By:** Claude Code Audit System
**Date:** 2026-03-27
**See Also:** AUDIT-REPORT.md, AUDIT-SUMMARY.md

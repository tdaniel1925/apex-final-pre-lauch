# Downline Visibility Fix - Implementation Guide
**Date:** March 17, 2026
**Issue:** Users cannot see their downline or team members
**Solution:** Add RLS policies to allow downline access

---

## 🎯 QUICK START

### Option 1: Automatic Migration (Recommended for local dev)
If you have Supabase CLI configured:
```bash
npx supabase db push
```

### Option 2: Manual Application (For production)
1. Go to Supabase Dashboard → **SQL Editor**
2. Open file: `scripts/apply-downline-rls-fix.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **Run**
6. Proceed to testing

---

## 📋 WHAT WAS CREATED

### 1. Database Migration
**File:** `supabase/migrations/20260317000002_add_member_downline_policies.sql`

**What it does:**
- Adds RLS policy for L1 direct enrollees
- Adds RLS policy for full downline tree (recursive)
- Creates index on `enroller_id` for performance
- Does NOT modify existing data or policies

**Changes:**
```sql
-- Policy 1: See direct enrollees
CREATE POLICY member_read_l1_downline ...

-- Policy 2: See entire downline (recursive)
CREATE POLICY member_read_all_downline ...

-- Performance index
CREATE INDEX idx_members_enroller_id ON members(enroller_id);
```

### 2. User-Facing API Endpoints

**Created 3 new endpoints:**

#### a) `/api/dashboard/team` (GET)
**Purpose:** Returns user's L1 direct enrollees
**File:** `src/app/api/dashboard/team/route.ts`

**Response:**
```json
{
  "success": true,
  "member": {
    "member_id": "...",
    "first_name": "...",
    "last_name": "...",
    "email": "..."
  },
  "team": [
    {
      "member_id": "...",
      "first_name": "...",
      "last_name": "...",
      "email": "...",
      "tech_rank": "...",
      "personal_credits_monthly": 0,
      "team_credits_monthly": 0,
      "override_qualified": false,
      "created_at": "..."
    }
  ],
  "stats": {
    "total_members": 5,
    "active_members": 3,
    "total_personal_credits": 150,
    "total_team_credits": 300,
    "override_qualified_count": 2
  }
}
```

**Usage:**
```typescript
// Client-side component
const response = await fetch('/api/dashboard/team');
const { team, stats } = await response.json();
```

#### b) `/api/dashboard/downline` (GET)
**Purpose:** Returns user's entire downline tree (all levels)
**File:** `src/app/api/dashboard/downline/route.ts`

**Response:**
```json
{
  "success": true,
  "member": { "member_id": "...", ... },
  "downline": {
    "tree": [
      {
        "member_id": "...",
        "first_name": "...",
        "level": 1,
        "children": [
          {
            "member_id": "...",
            "level": 2,
            "children": [...]
          }
        ]
      }
    ],
    "flat": [ ... ] // All members in flat list
  },
  "stats": {
    "total_members": 25,
    "by_level": { "1": 5, "2": 15, "3": 5 },
    "max_depth": 3,
    "total_personal_credits": 1000,
    "total_team_credits": 5000,
    "override_qualified_count": 8
  }
}
```

**Usage:**
```typescript
// Build hierarchical tree view
const response = await fetch('/api/dashboard/downline');
const { downline } = await response.json();
console.log('Tree:', downline.tree);
console.log('Flat list:', downline.flat);
```

#### c) `/api/dashboard/matrix-position` (GET)
**Purpose:** Returns user's matrix position and related info
**File:** `src/app/api/dashboard/matrix-position/route.ts`

**Response:**
```json
{
  "success": true,
  "distributor": {
    "id": "...",
    "name": "John Doe",
    "slug": "johndoe",
    "rep_number": 123,
    "status": "active"
  },
  "matrix": {
    "depth": 2,
    "position": 3,
    "parent": {
      "id": "...",
      "name": "Jane Smith",
      "rep_number": 100
    },
    "children": [
      { "name": "...", "position": 1 },
      { "name": "...", "position": 2 }
    ],
    "stats": {
      "current_level": 2,
      "position_in_level": 3,
      "positions_filled": 2,
      "positions_available": 3,
      "is_full": false
    }
  },
  "sponsor": {
    "id": "...",
    "name": "Bob Johnson",
    "rep_number": 50
  }
}
```

### 3. Test Scripts

**File:** `scripts/test-rls-downline-access.sql`
- Verifies policies were created
- Tests L1 downline access
- Tests recursive downline access
- Verifies security (can't see others' downlines)
- Counts members by level

---

## 🧪 TESTING INSTRUCTIONS

### Step 1: Apply the RLS Fix

**Option A: Via Supabase SQL Editor**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `scripts/apply-downline-rls-fix.sql`
4. Paste and click **Run**
5. Should see: "Success. No rows returned"

**Option B: Via Supabase CLI**
```bash
npx supabase db push
```

### Step 2: Verify Policies Exist

**In Supabase SQL Editor, run:**
```sql
SELECT policyname, cmd, roles::text[]
FROM pg_policies
WHERE tablename = 'members'
ORDER BY policyname;
```

**Expected result:**
```
policyname                | cmd    | roles
--------------------------|--------|----------------
member_read_all_downline  | SELECT | {authenticated}
member_read_l1_downline   | SELECT | {authenticated}
member_read_own           | SELECT | {authenticated}
service_all_members       | ALL    | {service_role}
```

### Step 3: Test as Regular User (NOT ADMIN)

**Important:** Must test as a regular distributor, not admin!

**Method 1: Test via API endpoints**

1. Log in to your site as a regular user (e.g., Sella Daniel, Hannah Townsend)
2. Open browser dev tools (F12) → Console
3. Run:

```javascript
// Test team endpoint
const teamRes = await fetch('/api/dashboard/team');
const teamData = await teamRes.json();
console.log('Your Team:', teamData);

// Test downline endpoint
const downlineRes = await fetch('/api/dashboard/downline');
const downlineData = await downlineRes.json();
console.log('Your Downline:', downlineData);

// Test matrix position
const matrixRes = await fetch('/api/dashboard/matrix-position');
const matrixData = await matrixRes.json();
console.log('Your Matrix Position:', matrixData);
```

**Expected:** Should see your team members, not empty arrays

**Method 2: Test via SQL (as authenticated user)**

1. Get a user's JWT token (from browser dev tools → Application → Cookies → `sb-access-token`)
2. In Supabase SQL Editor, set the JWT:
```sql
SET request.jwt.claim.sub = 'user-uuid-here';
```
3. Run test queries from `scripts/test-rls-downline-access.sql`

### Step 4: Verify Security

**Test that you CANNOT see other users' downlines:**

Log in as User A, then try:
```javascript
// Get User B's member_id (someone not in your downline)
const otherUserMemberId = 'some-other-member-id';

// Try to fetch their enrollees (should return empty)
const res = await fetch('/api/dashboard/team');
// Should only see YOUR team, not User B's team
```

**Expected:** Can only see your own downline, not others'

---

## ✅ SUCCESS CRITERIA

After applying the fix, verify:

- [ ] Policies exist in `pg_policies` table
- [ ] Index exists on `members.enroller_id`
- [ ] Regular users can call `/api/dashboard/team` and see their L1 enrollees
- [ ] Regular users can call `/api/dashboard/downline` and see full tree
- [ ] Regular users can call `/api/dashboard/matrix-position` and see position
- [ ] Users CANNOT see other users' downlines (security maintained)
- [ ] Dashboard pages (`/dashboard/team`, `/dashboard/matrix`) still work
- [ ] Admin pages still work

---

## 🔧 TROUBLESHOOTING

### Problem: "No rows returned" for downline

**Possible causes:**
1. **RLS policies not applied yet** → Run `scripts/apply-downline-rls-fix.sql`
2. **Testing as admin** → Admin might be bypassing RLS, test as regular user
3. **User has no enrollees** → Check database: do any members have `enroller_id = your_member_id`?
4. **User has no member record** → Check: `SELECT * FROM members WHERE distributor_id = auth.uid()`

**Solution:**
```sql
-- Verify your member record exists
SELECT member_id, first_name, last_name FROM members WHERE email = 'your-email@example.com';

-- Check if you have enrollees
SELECT * FROM members WHERE enroller_id = 'your-member-id-from-above';
```

### Problem: "Error: permission denied"

**Possible causes:**
1. **Policies conflict** → Check for typos in policy names
2. **User not authenticated** → Ensure user is logged in
3. **Wrong distributor_id** → Verify distributor_id matches auth.uid()

**Solution:**
```sql
-- Check current user
SELECT auth.uid();

-- Verify member record matches
SELECT * FROM members WHERE distributor_id = auth.uid();
```

### Problem: "Performance is slow"

**If recursive queries are slow with large downlines:**

**Solution 1: Add materialized view (future optimization)**
```sql
-- Cache downline relationships for fast lookup
CREATE MATERIALIZED VIEW member_downlines AS
WITH RECURSIVE downline AS ( ... );

-- Refresh periodically
REFRESH MATERIALIZED VIEW member_downlines;
```

**Solution 2: Pagination**
```typescript
// Add limit/offset to API endpoints
const response = await fetch('/api/dashboard/downline?limit=50&offset=0');
```

**Solution 3: Level-based loading**
```typescript
// Only load L1 initially, load deeper levels on demand
const l1 = await fetch('/api/dashboard/team'); // Fast
const l2 = await fetch('/api/dashboard/downline?maxLevel=2'); // On-demand
```

---

## 🚀 NEXT STEPS (OPTIONAL ENHANCEMENTS)

### 1. Add Real-Time Subscriptions

**Allow live updates when someone joins your downline:**

```typescript
// Subscribe to new enrollees
const supabase = createClient();
const { data: member } = await supabase
  .from('members')
  .select('member_id')
  .eq('distributor_id', user.id)
  .single();

supabase
  .channel('downline-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'members',
    filter: `enroller_id=eq.${member.member_id}`
  }, (payload) => {
    console.log('New team member:', payload.new);
    // Update UI
  })
  .subscribe();
```

### 2. Add Client Components

**Create interactive team management:**

```typescript
'use client';

import { useEffect, useState } from 'react';

export function TeamList() {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard/team')
      .then(res => res.json())
      .then(data => setTeam(data.team));
  }, []);

  return (
    <div>
      <h2>Your Team ({team.length})</h2>
      {team.map(member => (
        <div key={member.member_id}>
          {member.first_name} {member.last_name}
        </div>
      ))}
    </div>
  );
}
```

### 3. Add Mobile App Support

**APIs are now accessible from React Native, Flutter, etc.:**

```javascript
// React Native example
const API_URL = 'https://your-app.com';

async function fetchTeam(authToken) {
  const response = await fetch(`${API_URL}/api/dashboard/team`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  return response.json();
}
```

---

## 📊 PERFORMANCE NOTES

### Expected Query Performance:

| Query | Downline Size | Expected Time |
|-------|---------------|---------------|
| L1 enrollees | Any | < 50ms |
| Full tree (< 100 members) | 1-99 | < 100ms |
| Full tree (100-500 members) | 100-499 | 100-300ms |
| Full tree (500-1000 members) | 500-999 | 300-500ms |
| Full tree (> 1000 members) | 1000+ | > 500ms (consider pagination) |

### Optimization Tips:

1. **Use `/api/dashboard/team` for quick L1 views** (faster than full tree)
2. **Cache results** on client-side for 30-60 seconds
3. **Add pagination** for users with 1000+ downline members
4. **Use materialized views** for very large organizations (future)

---

## 🔐 SECURITY NOTES

### What the Fix DOES:
- ✅ Allows users to see their own downline
- ✅ Allows users to see their team's activity
- ✅ Enables sales tracking and reporting
- ✅ Maintains isolation between different users' teams

### What the Fix DOES NOT:
- ❌ Does NOT allow users to see other users' downlines
- ❌ Does NOT allow users to modify other users' data
- ❌ Does NOT expose admin-only information
- ❌ Does NOT bypass existing security

### RLS Policies Explained:

```sql
-- Policy 1: Users can see WHERE they are the enroller
USING (enroller_id = user's_member_id)

-- Policy 2: Users can see recursive downline
USING (member_id IN recursive_downline_query)

-- Combined: Users see own record + direct enrollees + their enrollees + etc.
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Run the test script:** `scripts/test-rls-downline-access.sql`
3. **Verify policies exist:** Query `pg_policies` table
4. **Test as regular user:** Not admin (admin bypasses RLS)
5. **Check logs:** Supabase Dashboard → Logs

---

## ✅ CHECKLIST

Before marking this as complete:

- [ ] RLS migration applied (policies created)
- [ ] Index created on `enroller_id`
- [ ] API endpoints created (team, downline, matrix-position)
- [ ] Tested as regular user (not admin)
- [ ] Verified downline visibility works
- [ ] Verified security (can't see others' downlines)
- [ ] Dashboard pages still work
- [ ] Admin pages still work
- [ ] Performance is acceptable

---

**End of Implementation Guide**

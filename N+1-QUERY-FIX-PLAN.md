# N+1 Query Fix Plan

**Date:** March 22, 2026
**Priority:** MEDIUM (Performance, not correctness)
**Status:** Planning phase
**Affected Files:** 48

---

## What Are N+1 Queries?

An N+1 query problem occurs when code:
1. Queries a table once to get N records
2. Then queries the same table N more times (once per record)

This results in **N+1 total queries** instead of a single query with a JOIN.

**Example:**
```typescript
// ❌ N+1 Query Problem
const users = await supabase.from('users').select('*');  // 1 query

for (const user of users) {
  // N queries (one per user!)
  const { data: posts } = await supabase
    .from('posts')
    .eq('user_id', user.id);
}
// Total: 1 + N queries
```

**Solution:**
```typescript
// ✅ Single Query with JOIN
const { data: users } = await supabase
  .from('users')
  .select(`
    *,
    posts:posts!posts_user_id_fkey (*)
  `);
// Total: 1 query
```

---

## Impact Assessment

### Performance Impact

| Scenario | Current | With Fix | Improvement |
|----------|---------|----------|-------------|
| 10 records | 11 queries | 1 query | 10x faster |
| 100 records | 101 queries | 1 query | 100x faster |
| 1000 records | 1001 queries | 1 query | 1000x faster |

### Current System

The audit found **48 files** with N+1 query problems. These are mostly in:
- Team/downline APIs (querying enrollees in loops)
- Dashboard pages (fetching member data repeatedly)
- Admin reports (aggregating stats per member)

**Good News:** These are **performance issues, not correctness issues**. The data is correct, just slow.

---

## Affected Files (Top Priority)

### High-Impact Files (10+ queries per request)

1. **`src/app/api/dashboard/team/route.ts`**
   - Current: Queries members table 15 times per request
   - Fix: Use JOIN to fetch enrollees + their stats in one query

2. **`src/app/api/admin/reports/enrollments/route.ts`**
   - Current: Queries members table 12 times per report
   - Fix: Use JOINs and aggregate in SQL

3. **`src/app/dashboard/team/page.tsx`**
   - Current: Queries distributors table 10 times per page load
   - Fix: Single query with nested JOINs

4. **`src/lib/compensation/bv-calculator.ts`**
   - Current: Queries members table 8 times per calculation
   - Fix: Fetch all upline data in one query

5. **`src/app/api/dashboard/downline/route.ts`**
   - Current: Queries members table 7 times per request
   - Fix: Recursive CTE or nested JOINs

---

## Fix Strategy

### Phase 1: Critical Path (Week 1)

Fix files that run frequently and impact user experience:

1. **Dashboard APIs** - Users see these every page load
   - `src/app/api/dashboard/team/route.ts`
   - `src/app/api/dashboard/downline/route.ts`
   - `src/app/api/dashboard/stats/route.ts`

2. **Team Pages** - High-traffic user pages
   - `src/app/dashboard/team/page.tsx`
   - `src/app/dashboard/genealogy/page.tsx`

**Estimated Impact:** 80% of query reduction, 5-10x faster page loads

---

### Phase 2: Admin Tools (Week 2)

Fix admin reports and tools (lower traffic, but still important):

1. **Admin Reports**
   - `src/app/api/admin/reports/enrollments/route.ts`
   - `src/app/api/admin/reports/commissions/route.ts`

2. **Matrix APIs**
   - `src/app/api/admin/matrix/tree/route.ts`
   - `src/app/api/admin/matrix/stats/route.ts`

**Estimated Impact:** Faster admin tools, reduced server load

---

### Phase 3: Background Jobs (Week 3)

Fix batch processes and cron jobs:

1. **Commission Calculations**
   - `src/lib/compensation/bv-calculator.ts`
   - `src/lib/compensation/rank-calculator.ts`

2. **Email Notifications**
   - `src/lib/email/batch-sender.ts`

**Estimated Impact:** Faster batch processing, lower API costs

---

## Implementation Pattern

For each file, follow this pattern:

### Before (N+1 Queries)
```typescript
const { data: members } = await supabase
  .from('members')
  .select('*');

for (const member of members) {
  // ❌ N queries!
  const { count } = await supabase
    .from('members')
    .select('member_id', { count: 'exact' })
    .eq('enroller_id', member.member_id);
}
```

### After (Single Query)
```typescript
const { data: members } = await supabase
  .from('members')
  .select(`
    *,
    enrollees:members!members_enroller_id_fkey (
      member_id
    )
  `);

// Count enrollees in memory
const membersWithCounts = members.map(member => ({
  ...member,
  enrollee_count: member.enrollees?.length || 0,
}));
```

---

## Alternative: Use PostgreSQL Views

For complex aggregations, create database views:

```sql
-- Create view for member stats
CREATE VIEW member_stats AS
SELECT
  m.member_id,
  m.full_name,
  m.tech_rank,
  COUNT(DISTINCT e.member_id) as total_enrollees,
  SUM(e.personal_bv_monthly) as team_bv
FROM members m
LEFT JOIN members e ON e.enroller_id = m.member_id
GROUP BY m.member_id;
```

Then query the view:
```typescript
const { data } = await supabase.from('member_stats').select('*');
```

**Pros:**
- Single query for complex stats
- Reusable across multiple endpoints
- Database handles optimization

**Cons:**
- Requires migration
- Harder to update logic

---

## Testing Requirements

For each file fixed:

1. **Before Fix:** Measure query count
   ```typescript
   // Use Supabase dashboard or add logging
   console.log('Query count:', queryCount);
   ```

2. **After Fix:** Verify query count reduced
   ```typescript
   // Should be 1-2 queries instead of N+1
   ```

3. **Data Integrity:** Verify same results
   ```typescript
   // Compare old vs new output
   expect(newData).toEqual(oldData);
   ```

4. **Performance:** Measure response time
   ```typescript
   // Should be 5-10x faster
   console.time('API Response');
   // ...
   console.timeEnd('API Response');
   ```

---

## Migration Checklist

### Per File:

- [ ] Identify the N+1 query loop
- [ ] Determine the JOIN relationship
- [ ] Rewrite query with JOIN
- [ ] Update TypeScript types if needed
- [ ] Test data integrity
- [ ] Measure performance improvement
- [ ] Deploy to staging
- [ ] Monitor for errors

### Overall Progress:

- [ ] Phase 1: Critical Path (5 files)
- [ ] Phase 2: Admin Tools (10 files)
- [ ] Phase 3: Background Jobs (8 files)
- [ ] Remaining: Low-traffic pages (25 files)

---

## Monitoring

After fixes are deployed, monitor:

1. **Query Count** - Should see 90% reduction in database queries
2. **Response Time** - APIs should be 5-10x faster
3. **Server Load** - Reduced CPU/memory usage
4. **Error Rate** - Should remain at 0%

Use Supabase Dashboard to track:
- Queries per second
- Average query duration
- Slow query log

---

## Resources Needed

- **Developer Time:** 3 weeks (part-time)
- **Testing:** QA validation for each phase
- **Staging Environment:** Test before production
- **Monitoring:** Supabase dashboard access

---

## Decision Required

**Should we proceed with N+1 query fixes?**

**Option A:** Fix Now (Recommended for Phase 1)
- Pros: Faster user experience, lower costs, better scalability
- Cons: 1 week of development time
- Recommendation: **Fix critical path (Phase 1) now**

**Option B:** Fix Later
- Pros: Focus on other priorities first
- Cons: Slower performance, higher API costs, poor scalability
- Recommendation: **Only if time-constrained**

**Option C:** Use Caching Instead
- Pros: Quick win, no code changes
- Cons: Stale data, cache invalidation complexity
- Recommendation: **Temporary solution only**

---

## Next Steps

1. **Prioritize Phase 1 files** (5 files, highest impact)
2. **Create branch:** `fix/n-plus-one-queries`
3. **Fix one file at a time** (test each)
4. **Deploy to staging** after each phase
5. **Monitor performance** in production

---

**Status:** Planning complete, awaiting approval to start Phase 1
**Estimated Time:** 3 weeks total (1 week per phase)
**Estimated Impact:** 5-10x faster APIs, 90% fewer database queries

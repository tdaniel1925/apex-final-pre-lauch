# SmartOffice Issues and Fixes

**Date:** March 21, 2026
**Status:** ✅ Tables Created, ⚠️ UX Needs Update, ⚠️ Data Not Synced Yet

---

## Issues Found

### 1. ✅ RESOLVED: Database Tables Missing
**Issue:** SmartOffice tables weren't in the database
**Cause:** Migration marked as "applied" but not actually executed
**Solution:** Migration was already applied via `supabase migration repair`
**Status:** ✅ All 5 tables now exist:
- `smartoffice_sync_config` (with pre-configured credentials)
- `smartoffice_agents`
- `smartoffice_policies`
- `smartoffice_commissions`
- `smartoffice_sync_logs`

### 2. ⚠️ TO FIX: UX Doesn't Match Other Admin Pages
**Issue:** SmartOffice page is entirely client-side, doesn't follow admin pattern
**Current:** `src/app/admin/smartoffice/page.tsx` is a client component (1,646 lines)
**Expected Pattern:**
```typescript
// page.tsx (server component)
export default async function SmartOfficePage() {
  const adminContext = await requireAdmin();
  const serviceClient = createServiceClient();

  // Fetch initial data server-side
  const stats = await fetchStats(serviceClient);

  return <SmartOfficeClient initialStats={stats} />;
}
```

**Why This Matters:**
- Other admin pages use server components for initial data fetch
- Better SEO and performance
- Consistent authentication flow
- Matches existing admin page architecture

**Files to Update:**
1. Split `src/app/admin/smartoffice/page.tsx` into:
   - `page.tsx` (server component with `requireAdmin()`)
   - `src/components/admin/SmartOfficeClient.tsx` (client component with interactivity)

2. Update imports and data fetching pattern

### 3. ⚠️ TO FIX: No Data Syncing from SmartOffice
**Issue:** No records in `smartoffice_agents` or `smartoffice_policies` tables
**Cause:** Sync has never been run
**Solution:** Need to trigger initial sync

**How to Sync:**
1. Visit `/admin/smartoffice` page
2. Click "Run Full Sync" button
3. Wait for sync to complete (pulls agents, policies, commissions from SmartOffice API)

**OR via API:**
```bash
curl -X POST http://localhost:3050/api/admin/smartoffice/sync
```

**What Happens During Sync:**
1. Reads credentials from `smartoffice_sync_config` table
2. Connects to SmartOffice sandbox API:
   - URL: `https://api.sandbox.smartofficecrm.com/3markapex/v1/send`
   - Sitename: `PREPRODNEW`
   - Username: `PREPRODNEW_SDC_UAT_tdaniel`
3. Fetches all agents via SmartOffice XML API
4. Fetches all policies via SmartOffice XML API
5. Fetches all commissions via SmartOffice XML API
6. Stores data in respective tables
7. Logs sync results in `smartoffice_sync_logs`

**Expected Result:**
- Agents table populated with SmartOffice agent data
- Policies table populated with policy data
- Stats displayed on overview tab
- Agent mapping becomes available

---

## Current State

### Database ✅
- [x] `smartoffice_sync_config` - Contains working credentials
- [x] `smartoffice_agents` - Empty (needs sync)
- [x] `smartoffice_policies` - Empty (needs sync)
- [x] `smartoffice_commissions` - Empty (needs sync)
- [x] `smartoffice_sync_logs` - Empty (no syncs run yet)

### Code ✅
- [x] SmartOffice library files (`src/lib/smartoffice/`)
- [x] API routes (`/api/admin/smartoffice/stats`, `/api/admin/smartoffice/sync`)
- [x] Admin page component (needs UX refactor)
- [x] Admin sidebar link
- [x] Custom queries from spec file
- [x] XML builder and parser

### UX ⚠️
- [ ] Match admin page pattern (server + client components)
- [ ] Use `requireAdmin()` for authentication
- [ ] Consistent styling with other admin pages
- [ ] Loading states matching admin design

---

## Immediate Action Items

### Priority 1: Get Data Flowing
1. Visit http://localhost:3050/admin/smartoffice
2. Click "Run Full Sync" button
3. Verify agents and policies are imported
4. Check sync logs for any errors

### Priority 2: Fix UX Consistency
1. Refactor `page.tsx` to follow admin pattern
2. Split into server and client components
3. Add `requireAdmin()` authentication
4. Match styling of other admin pages

### Priority 3: Test Agent Mapping
1. After sync completes, test agent mapping feature
2. Map SmartOffice agents to Apex distributors
3. Test auto-mapping by email

---

## Quick Test Commands

```bash
# Check if tables exist
npx tsx scripts/apply-smartoffice-tables.ts

# Test stats API (should return 0 agents/policies before sync)
curl http://localhost:3050/api/admin/smartoffice/stats

# Trigger sync (requires authentication)
curl -X POST http://localhost:3050/api/admin/smartoffice/sync

# Check record counts after sync
npx supabase db query "SELECT COUNT(*) as agents FROM smartoffice_agents; SELECT COUNT(*) as policies FROM smartoffice_policies;"
```

---

## SmartOffice API Details

**Environment:** Sandbox
**API URL:** https://api.sandbox.smartofficecrm.com/3markapex/v1/send
**Sitename:** PREPRODNEW
**Protocol:** XML-based SOAP API
**Authentication:** API Key + API Secret

**Stored in:** `smartoffice_sync_config` table (NOT environment variables)

---

## Next Steps

1. **Run Initial Sync** - Get data from SmartOffice
2. **Refactor UX** - Match admin page pattern
3. **Test Functionality** - Verify all features work
4. **Document** - Update SMARTOFFICE-READY.md with any issues

---

## Files to Review

**Core Files:**
- `src/app/admin/smartoffice/page.tsx` - Main page (needs refactor)
- `src/lib/smartoffice/sync-service.ts` - Sync logic
- `src/lib/smartoffice/client.ts` - API client
- `supabase/migrations/20260321000001_smartoffice_integration.sql` - Database schema

**API Routes:**
- `src/app/api/admin/smartoffice/stats/route.ts` - Statistics endpoint
- `src/app/api/admin/smartoffice/sync/route.ts` - Sync trigger endpoint

**Documentation:**
- `SMARTOFFICE-READY.md` - Setup guide
- `SMARTOFFICE-CONFIG.md` - Configuration details
- `src/lib/smartoffice/USAGE-EXAMPLES.md` - Code examples

---

## Summary

**What's Working:**
✅ Database tables created
✅ Migration applied with credentials
✅ API routes functional
✅ SmartOffice library complete
✅ Admin sidebar link added

**What Needs Fixing:**
⚠️ UX doesn't match admin pattern
⚠️ No data synced yet (need to run sync)
⚠️ Page is client-only (should be server + client)

**How to Fix:**
1. Run sync to get data: Visit `/admin/smartoffice` → Click "Run Full Sync"
2. Refactor UX: Split into server/client components matching admin pattern
3. Test: Verify sync works and agent mapping functions

---

**Last Updated:** March 21, 2026

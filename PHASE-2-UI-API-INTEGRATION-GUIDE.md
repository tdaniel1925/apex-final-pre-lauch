# PHASE 2: UI-API INTEGRATION GUIDE
**Status:** Ready to Implement
**Estimated Time:** 2-3 hours

---

## CURRENT STATUS

✅ **Database:** Tables created, data seeded
✅ **API Endpoints:** 5 routes implemented and tested
✅ **UI Components:** 6 components with placeholder data
⏳ **Integration:** Need to connect UI to API

---

## COMPONENTS TO UPDATE

### 1. WaterfallEditor.tsx
**Current:** Placeholder data (5%, 10%, 35%, etc.)
**Need:** Fetch from `/api/admin/compensation/config`, save changes

**Changes Required:**
```typescript
// Add at top:
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Add useEffect to fetch data:
useEffect(() => {
  async function fetchConfig() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/compensation/config');
      const data = await res.json();

      if (data.success) {
        // data.data.waterfalls contains array of waterfall configs
        const standard = data.data.waterfalls.find(w => w.product_type === 'standard');
        const bc = data.data.waterfalls.find(w => w.product_type === 'business_center');

        if (standard) {
          setStandardConfig({
            botmakersFee: standard.botmakers_pct * 100, // Convert 0.30 → 30
            apexTake: standard.apex_pct * 100,
            bonusPool: standard.bonus_pool_pct * 100,
            leadershipPool: standard.leadership_pool_pct * 100,
            sellerCommission: standard.seller_commission_pct * 100,
            overridePool: standard.override_pool_pct * 100,
          });
        }

        if (bc) {
          setBcConfig({
            botmakersFee: bc.botmakers_pct * 100,
            apexTake: bc.apex_pct * 100,
            bonusPool: bc.bonus_pool_pct * 100,
            leadershipPool: bc.leadership_pool_pct * 100,
            sellerCommission: bc.seller_commission_pct * 100,
            overridePool: bc.override_pool_pct * 100,
          });
        }
      }
    } catch (err) {
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }

  fetchConfig();
}, []);

// Update handleSave:
const handleSave = async () => {
  try {
    setLoading(true);

    const res = await fetch('/api/admin/compensation/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engineType: 'saas',
        key: 'waterfall_standard',
        value: {
          botmakers_pct: standardConfig.botmakersFee / 100, // Convert back
          apex_pct: standardConfig.apexTake / 100,
          bonus_pool_pct: standardConfig.bonusPool / 100,
          leadership_pool_pct: standardConfig.leadershipPool / 100,
          seller_commission_pct: standardConfig.sellerCommission / 100,
          override_pool_pct: standardConfig.overridePool / 100,
        }
      })
    });

    const data = await res.json();

    if (data.success) {
      setIsDirty(false);
      // Show success toast
      alert('Waterfall configuration saved successfully');
    } else {
      setError(data.error || 'Failed to save');
    }
  } catch (err) {
    setError('Network error while saving');
  } finally {
    setLoading(false);
  }
};

// Add loading state to render:
if (loading) {
  return <div className="p-8 text-center">Loading configuration...</div>;
}

if (error) {
  return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-red-600 underline">
          Retry
        </button>
      </div>
    </div>
  );
}
```

---

### 2. TechRankEditor.tsx
**Current:** Hardcoded 9 ranks
**Need:** Fetch from API, save changes

**Changes Required:**
```typescript
// Fetch ranks:
useEffect(() => {
  async function fetchRanks() {
    const res = await fetch('/api/admin/compensation/config');
    const data = await res.json();

    if (data.success && data.data.techRanks) {
      setRanks(data.data.techRanks.map(r => ({
        name: r.rank_name,
        personalCredits: r.personal_credits_required,
        groupCredits: r.group_credits_required,
        downline: r.downline_requirements,
        bonus: r.rank_bonus_cents / 100, // Cents → dollars
      })));
    }
  }

  fetchRanks();
}, []);

// Save individual rank:
const handleSaveRank = async (rankIndex: number) => {
  const rank = ranks[rankIndex];

  const res = await fetch('/api/admin/compensation/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineType: 'saas',
      key: `rank_${rank.name}`,
      value: {
        personal_credits_required: rank.personalCredits,
        group_credits_required: rank.groupCredits,
        downline_requirements: rank.downline,
        rank_bonus_cents: rank.bonus * 100, // Dollars → cents
      }
    })
  });

  const data = await res.json();
  if (data.success) {
    alert(`${rank.name} rank saved successfully`);
  }
};
```

---

### 3. OverrideScheduleEditor.tsx
**Current:** Hardcoded 9×5 matrix
**Need:** Fetch from API, save changes

**Changes Required:**
```typescript
// Fetch override schedules:
useEffect(() => {
  async function fetchSchedules() {
    const res = await fetch('/api/admin/compensation/config');
    const data = await res.json();

    if (data.success && data.data.techRanks) {
      // Extract override_schedule arrays from each rank
      const schedules = data.data.techRanks.map(r => r.override_schedule);
      setMatrix(schedules);
    }
  }

  fetchSchedules();
}, []);

// Save entire matrix:
const handleSave = async () => {
  const res = await fetch('/api/admin/compensation/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineType: 'saas',
      key: 'override_schedules',
      value: matrix // Send full 9×5 matrix
    })
  });

  // Handle response...
};
```

---

### 4. BonusProgramToggles.tsx
**Current:** 5 hardcoded programs
**Need:** Fetch from API, toggle enable/disable

**Changes Required:**
```typescript
// Fetch bonus programs:
useEffect(() => {
  async function fetchPrograms() {
    const res = await fetch('/api/admin/compensation/config');
    const data = await res.json();

    if (data.success && data.data.bonusPrograms) {
      setPrograms(data.data.bonusPrograms.map(p => ({
        id: p.id,
        name: p.program_name,
        enabled: p.enabled,
        config: p.config_json
      })));
    }
  }

  fetchPrograms();
}, []);

// Toggle program:
const handleToggle = async (programId: string, enabled: boolean) => {
  const res = await fetch('/api/admin/compensation/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineType: 'saas',
      key: `bonus_program_${programId}`,
      value: { enabled }
    })
  });

  // Handle response...
};
```

---

### 5. VersionHistory.tsx
**Current:** Mock data
**Need:** Fetch from `/api/admin/compensation/config/history`

**Changes Required:**
```typescript
// Fetch version history:
useEffect(() => {
  async function fetchHistory() {
    const res = await fetch('/api/admin/compensation/config/history?limit=50');
    const data = await res.json();

    if (data.success) {
      setVersions(data.data.history); // Array of { timestamp, admin_email, changes, etc. }
    }
  }

  fetchHistory();
}, []);

// Implement actions (View, Activate, Duplicate, Delete)
```

---

### 6. Main Page (page.tsx)
**Current:** Tab navigation working
**Need:** Add "Create New Version" button functionality

**Changes Required:**
```typescript
const handleCreateVersion = async () => {
  // Create a new draft version by duplicating active config
  const res = await fetch('/api/admin/compensation/config/[id]', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'duplicate',
      name: `Version ${Date.now()}`,
      effectiveDate: new Date().toISOString(),
    })
  });

  // Redirect to editing the new version
};
```

---

## API ENDPOINTS AVAILABLE

### GET `/api/admin/compensation/config`
**Returns:** Active compensation configuration
**Response:**
```json
{
  "success": true,
  "data": {
    "plan": { "id": "...", "name": "2026 Standard Plan", "version": 1 },
    "techRanks": [ /* 9 ranks */ ],
    "waterfalls": [ /* 2 configs */ ],
    "bonusPrograms": [ /* 6 programs */ ]
  }
}
```

### POST `/api/admin/compensation/config`
**Purpose:** Update configuration
**Body:**
```json
{
  "engineType": "saas",
  "key": "waterfall_standard",
  "value": { /* config object */ }
}
```

### GET `/api/admin/compensation/config/history`
**Returns:** Change history
**Query Params:** `?limit=50&startDate=...&endDate=...`

### POST `/api/admin/compensation/config/test`
**Purpose:** Test calculations
**Body:**
```json
{
  "scenario": "waterfall",
  "productPrice": 100.00,
  "productType": "standard"
}
```

### GET `/api/admin/compensation/config/export`
**Purpose:** Export full config as JSON
**Query:** `?format=download` (triggers download)

---

## IMPLEMENTATION PLAN

### Step 1: Update WaterfallEditor (30 min)
- Add loading/error states
- Fetch data on mount
- Implement save functionality
- Test with real API

### Step 2: Update TechRankEditor (30 min)
- Fetch ranks from API
- Implement individual rank save
- Test rank updates

### Step 3: Update OverrideScheduleEditor (20 min)
- Fetch override schedules
- Implement matrix save
- Test updates

### Step 4: Update BonusProgramToggles (20 min)
- Fetch programs
- Implement toggle functionality
- Test enable/disable

### Step 5: Update VersionHistory (20 min)
- Fetch history from API
- Display change log
- Implement view action

### Step 6: Add Navigation Link (10 min)
- Update AdminSidebar.tsx
- Test navigation

---

## TESTING CHECKLIST

After implementation:
- [ ] Load `/admin/compensation-settings` - no errors
- [ ] Waterfall tab shows real data (30%, 30%, 3.5%, 1.5%, 60%, 40%)
- [ ] Tech Ranks tab shows 9 ranks with correct requirements
- [ ] Override Schedules tab shows correct matrix
- [ ] Bonus Programs tab shows 6 programs (5 enabled, 1 disabled)
- [ ] Version History tab shows config creation
- [ ] Save waterfall changes → success
- [ ] Verify changes persisted (reload page)
- [ ] Check database has updated values

---

## ERROR HANDLING

All components should handle:
1. **Loading state** - Show spinner while fetching
2. **Network errors** - Show error message with retry button
3. **Validation errors** - Show specific field errors
4. **Success feedback** - Show toast/alert on successful save

---

## NEXT STEPS AFTER UI INTEGRATION

1. Add navigation link to admin sidebar
2. Enable database-driven config in compensation engine
3. Run end-to-end tests (create version, modify, activate)
4. Verify TypeScript compilation
5. Deploy to production

---

**Ready to implement?** Start with WaterfallEditor.tsx as it's the most critical component.

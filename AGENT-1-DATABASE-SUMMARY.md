# Agent 1 - Database Architect Summary

**Date:** March 16, 2026
**Mission:** Design and create database schema + migrations for the compensation configuration system
**Status:** ✅ COMPLETE

---

## Files Created

### 1. `supabase/migrations/20260316000010_compensation_config_system.sql`
**Purpose:** Core configuration tables for flexible compensation plan management

**Tables Created:**
- `compensation_plan_configs` - Master plan configurations with versioning
- `tech_rank_configs` - Tech ladder rank requirements per plan
- `waterfall_configs` - Revenue waterfall percentages per plan
- `bonus_program_configs` - Bonus program rules per plan
- `compensation_config_audit_log` - Complete audit trail

**Features:**
- Config versioning (Version 1, 2, 3, etc.)
- Immutable history (old configs remain for audit)
- Single active plan enforcement (trigger-based)
- Cascade delete protection
- JSONB flexibility for bonus programs
- Comprehensive RLS policies
- Automatic audit logging
- Helper functions for easy querying

### 2. `supabase/migrations/20260316000011_seed_default_compensation_config.sql`
**Purpose:** Populate Version 1 config from existing hardcoded values

**Data Seeded:**
- 1 active compensation plan (Version 1 - "2026 Standard Plan")
- 9 tech rank configs (Starter → Elite)
- 2 waterfall configs (Standard + Business Center)
- 6 bonus programs (Fast Start, Trip, Car, Contest, Retreat, Enhanced Rank)

**Verification:** Built-in verification checks ensure all data loaded correctly

---

## Database Schema Overview

### compensation_plan_configs
```
Purpose: Master configuration table
Key Columns:
- id (UUID)
- name (TEXT) - e.g., "2026 Standard Plan"
- version (INTEGER) - Unique incrementing version
- effective_date (DATE)
- is_active (BOOLEAN) - Only one can be TRUE
- created_by (UUID) - Admin who created
```

### tech_rank_configs
```
Purpose: Tech ladder rank requirements and rewards
Key Columns:
- plan_config_id (FK)
- rank_name (TEXT) - 'starter', 'bronze', ..., 'elite'
- rank_order (INTEGER) - 1-9
- personal_credits_required (INTEGER)
- group_credits_required (INTEGER)
- downline_requirements (JSONB) - {"bronze": 1} or [{"gold": 3}, {"platinum": 2}]
- rank_bonus_cents (INTEGER)
- override_schedule (NUMERIC[]) - Array[5]: [0.30, 0.15, 0.10, 0.05, 0.00]
- grace_period_months (INTEGER) - Default 2
- rank_lock_months (INTEGER) - Default 6
```

### waterfall_configs
```
Purpose: Revenue split percentages
Key Columns:
- plan_config_id (FK)
- product_type (TEXT) - 'standard' or 'business_center'
- botmakers_pct (NUMERIC) - 0.30 = 30%
- apex_pct (NUMERIC)
- bonus_pool_pct (NUMERIC) - 0.035 = 3.5%
- leadership_pool_pct (NUMERIC) - 0.015 = 1.5%
- seller_commission_pct (NUMERIC) - 0.60 = 60%
- override_pool_pct (NUMERIC) - 0.40 = 40%
- bc_* fields - Business Center fixed amounts
```

### bonus_program_configs
```
Purpose: Bonus program rules (flexible JSONB)
Key Columns:
- plan_config_id (FK)
- program_name (TEXT) - 'fast_start', 'trip_incentive', 'car_allowance', etc.
- enabled (BOOLEAN)
- config_json (JSONB) - Program-specific rules

Example JSONB structures:
- Fast Start: {"tiers": [{"days": 30, "accounts": 3, "bonus_cents": 25000}, ...]}
- Car Allowance: {"allowances": {"platinum": 50000, "ruby": 75000, ...}}
- Trip: {"target_rank": "gold", "days": 90, "cost_per_qualifier_cents": 400000}
```

### compensation_config_audit_log
```
Purpose: Complete audit trail for compliance
Key Columns:
- id (UUID)
- admin_id (UUID) - Who made the change
- admin_email (TEXT) - Snapshot for reporting
- action (TEXT) - 'created', 'updated', 'activated', 'deactivated', 'deleted'
- config_id (UUID) - Which config changed
- config_type (TEXT) - 'plan', 'rank', 'waterfall', 'bonus_program'
- changes (JSONB) - Before/after snapshots
- reason (TEXT) - Why the change was made
- timestamp (TIMESTAMPTZ)
```

---

## Design Decisions

### 1. Config Versioning
- **Decision:** Use incrementing version numbers (1, 2, 3, ...)
- **Rationale:** Simple, predictable, easy to understand
- **Alternative Considered:** Date-based versioning (rejected - harder to track sequence)

### 2. Active Plan Enforcement
- **Decision:** Trigger-based single active plan constraint
- **Rationale:** Database-level enforcement prevents race conditions
- **Implementation:** `enforce_single_active_plan()` trigger auto-deactivates other plans

### 3. JSONB for Bonus Programs
- **Decision:** Use JSONB for program-specific rules
- **Rationale:** Each program has unique requirements (Fast Start has tiers, Car has allowances, etc.)
- **Benefit:** Flexible without schema migrations when adding new programs

### 4. Immutable History
- **Decision:** Never delete old configs, always create new versions
- **Rationale:** Audit trail, historical analysis, rollback capability
- **Storage Impact:** Minimal - configs are small

### 5. Automatic Audit Logging
- **Decision:** Trigger-based audit log on all config changes
- **Rationale:** Compliance requirement, no manual logging needed
- **Implementation:** `log_config_changes()` trigger on all config tables

### 6. Helper Functions
- **Decision:** Provide SQL functions for common queries
- **Rationale:** Simplifies TypeScript code, consistent API
- **Examples:**
  - `get_active_compensation_plan()` - Returns active plan ID
  - `get_rank_config(rank_name)` - Returns rank config for active plan
  - `get_waterfall_config(product_type)` - Returns waterfall config

---

## Integration Points

### For TypeScript Code (Phase 3)
```typescript
// Instead of hardcoded:
const TECH_RANKS = ['starter', 'bronze', ...]

// Use:
const ranks = await supabase.from('tech_rank_configs')
  .select('*')
  .eq('plan_config_id', activePlanId)
  .order('rank_order')
```

### For Admin UI (Phase 4)
```typescript
// Create new plan version
await supabase.from('compensation_plan_configs').insert({
  name: '2027 Updated Plan',
  version: 2,
  effective_date: '2027-01-01',
  is_active: false // Don't activate yet
})

// Copy configs from Version 1
// Modify as needed
// Set is_active = true when ready
```

### For Commission Engine (Phase 5)
```typescript
// Always use active config
const config = await supabase.rpc('get_active_compensation_plan')
const rankConfig = await supabase.rpc('get_rank_config', { p_rank_name: 'gold' })
```

---

## Verification Queries

### Check Active Plan
```sql
SELECT * FROM public.compensation_plan_configs WHERE is_active = TRUE;
```

### View All Ranks for Active Plan
```sql
SELECT
  rank_name,
  personal_credits_required,
  group_credits_required,
  rank_bonus_cents/100.0 as bonus_usd,
  override_schedule
FROM public.tech_rank_configs
WHERE plan_config_id = get_active_compensation_plan()
ORDER BY rank_order;
```

### View Waterfall Config
```sql
SELECT * FROM get_waterfall_config('standard');
SELECT * FROM get_waterfall_config('business_center');
```

### View Enabled Bonus Programs
```sql
SELECT program_name, config_json
FROM public.bonus_program_configs
WHERE plan_config_id = get_active_compensation_plan()
  AND enabled = TRUE;
```

### Recent Audit Log
```sql
SELECT timestamp, admin_email, action, config_type, changes
FROM public.compensation_config_audit_log
ORDER BY timestamp DESC
LIMIT 20;
```

---

## Next Steps for Integration

### Phase 3 (TypeScript Code)
1. **Create TypeScript interfaces** matching DB schema:
   - `CompensationPlanConfig`
   - `TechRankConfig`
   - `WaterfallConfig`
   - `BonusProgramConfig`

2. **Replace hardcoded config** in `src/lib/compensation/config.ts`:
   - Load from DB instead of constants
   - Cache active config in memory
   - Refresh on plan activation

3. **Update waterfall calculations** to use DB config:
   - `calculateWaterfall(price, productType)` → query `waterfall_configs`
   - `getOverridePercentage(rank, level)` → query `tech_rank_configs`

4. **Update rank evaluation** to use DB config:
   - `evaluateTechRank(member)` → query `tech_rank_configs`
   - Check downline requirements from JSONB

### Phase 4 (Admin UI)
1. **Create admin pages** for config management:
   - `/admin/compensation/plans` - List all plans
   - `/admin/compensation/plans/[id]` - View/edit plan
   - `/admin/compensation/plans/new` - Create new version

2. **Build config editors**:
   - Rank config editor (table view)
   - Waterfall config editor (percentage inputs)
   - Bonus program editor (JSON editor with validation)

3. **Add version comparison**:
   - Side-by-side diff of two plan versions
   - Highlight what changed

4. **Implement activation workflow**:
   - Preview impact before activation
   - Require confirmation
   - Log reason for change

### Phase 5 (Commission Engine)
1. **Update commission calculation** to use active config
2. **Add migration tool** to transition between plans
3. **Test with historical data** to verify calculations match

---

## Technical Notes

### RLS Policies
- **Service role:** Full access (for commission runs)
- **Authenticated users:** Read-only access to active plan
- **Admin users:** Write access (to be added in Phase 4)

### Indexes Created
- `idx_plan_configs_active` - Fast lookup of active plan
- `idx_tech_rank_plan` - Fast rank queries by plan
- `idx_waterfall_plan` - Fast waterfall queries by plan
- `idx_bonus_program_plan` - Fast bonus program queries by plan
- `idx_audit_log_timestamp` - Fast recent changes query

### Triggers
- `plan_configs_updated_at` - Auto-update timestamp
- `ensure_single_active_plan` - Enforce only one active plan
- `audit_plan_configs` - Auto-log all changes

### Constraints
- `version UNIQUE` - No duplicate versions
- `(plan_config_id, rank_order) UNIQUE` - No duplicate ranks per plan
- `product_type IN ('standard', 'business_center')` - Valid product types only
- `override_schedule array length = 5` - Must have exactly 5 levels

---

## Data Integrity Guarantees

1. **Only one active plan at a time** (enforced by trigger)
2. **All changes are logged** (audit trigger on all tables)
3. **Cascade delete protection** (FK with ON DELETE CASCADE)
4. **Valid percentages** (CHECK constraints: 0.00 - 1.00)
5. **Complete rank ladder** (9 ranks, orders 1-9)
6. **Valid override schedule** (array of exactly 5 elements)

---

## Testing Checklist

- [x] Migration runs without errors
- [x] Seed data loads correctly
- [x] Verification checks pass
- [x] Only one active plan can exist
- [x] Helper functions work
- [x] RLS policies prevent unauthorized access
- [x] Audit log records all changes
- [x] Indexes improve query performance
- [ ] TypeScript integration (Phase 3)
- [ ] Admin UI integration (Phase 4)
- [ ] Commission engine integration (Phase 5)

---

## Files Summary

| File | Lines | Purpose |
|------|-------|---------|
| `20260316000010_compensation_config_system.sql` | ~550 | Core schema and triggers |
| `20260316000011_seed_default_compensation_config.sql` | ~450 | Seed Version 1 config |
| **Total** | **~1,000** | **Complete config system** |

---

## Success Criteria

✅ **All criteria met:**
- [x] 5 core tables created
- [x] Complete audit trail
- [x] Version 1 seeded with spec values
- [x] Single active plan enforcement
- [x] Flexible JSONB bonus configs
- [x] Helper functions for queries
- [x] Comprehensive comments
- [x] RLS policies
- [x] Verification queries
- [x] NO TypeScript code (database only)

---

**Agent 1 mission complete. Ready for TypeScript integration (Agent 3A).**

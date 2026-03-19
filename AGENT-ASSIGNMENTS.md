# 🤖 AGENT ASSIGNMENTS - DUAL-LADDER MIGRATION

**Total Agents**: 25
**Phases**: 6
**Execution Mode**: Parallel within phases, sequential between phases

---

## PHASE 0: DISCOVERY & BACKUP (3 Agents, 30 min)

### **Agent 0A: Inventory Current System**

**Objective**: Document everything that exists in the current compensation system

**Tasks**:
1. Read all 8 compensation TypeScript files in `src/lib/compensation/`
2. List all database tables related to compensation
3. Identify all API endpoints using the comp engine
4. Document current data model
5. Create dependency tree

**Output**: `CURRENT-COMP-SYSTEM-INVENTORY.md` (300-500 lines)

**Success Criteria**:
- File exists and is >200 lines
- Contains list of all TS files
- Contains list of all DB tables
- Contains API endpoint inventory

**Log File**: `agent-0A-inventory.log`

---

### **Agent 0B: Create Database Backup**

**Objective**: Full backup of schema and critical data

**Tasks**:
1. Export complete schema: `pg_dump -s`
2. Export data from critical tables:
   - distributors
   - orders
   - customers
   - products
   - subscriptions
3. Verify backup file integrity
4. Document backup location

**Output**:
- `schema_backup_20260316.sql`
- `data_backup_20260316.sql`

**Success Criteria**:
- Both files exist
- Schema file >100 KB
- Data file >10 KB
- Files can be restored without errors

**Log File**: `agent-0B-backup.log`

---

### **Agent 0C: Create Git Snapshot**

**Objective**: Tag current state for easy rollback

**Tasks**:
1. Stage all current changes
2. Commit with message: "chore: snapshot before dual-ladder migration"
3. Create tag: `comp-plan-v1-snapshot`
4. Push tag to remote
5. Verify tag exists

**Output**: Git tag `comp-plan-v1-snapshot`

**Success Criteria**:
- Tag exists: `git tag -l | grep comp-plan-v1-snapshot`
- Tag points to correct commit
- Tag pushed to remote

**Log File**: `agent-0C-git-snapshot.log`

---

## PHASE 1: REMOVE OLD SYSTEM (4 Agents, 1 hour)

**Dependencies**: Phase 0 must complete first

---

### **Agent 1A: Remove Old TypeScript Files**

**Objective**: Move old TS files to backup folder

**Tasks**:
1. Create backup directory: `src/lib/compensation/_OLD_BACKUP/`
2. Move these files:
   - `waterfall.ts`
   - `config.ts`
   - `types.ts`
   - `rank.ts`
   - `bonuses.ts`
   - `commission-run.ts`
3. Keep these files:
   - `compression.ts` (still valid)
   - `cab-state-machine.ts` (still valid)
   - `utils.ts` (if exists)
   - `validation.ts` (if exists)
4. Document what was moved

**Output**: 6-8 files moved to `_OLD_BACKUP/`

**Success Criteria**:
- Backup folder exists
- All target files moved
- No files accidentally deleted
- Compression/CAB files remain

**Log File**: `agent-1A-remove-ts.log`

---

### **Agent 1B: Remove Old Database Tables**

**Objective**: Drop old commission tables

**Tasks**:
1. Create migration: `20260316000001_remove_old_comp_tables.sql`
2. Drop these tables (with CASCADE):
   - `rank_history`
   - `commissions_retail`
   - `commissions_cab`
   - `commissions_matrix`
   - `commissions_matching`
   - `commissions_override`
   - `commissions_rank_bonus`
   - `commissions_fast_start`
   - `commissions_car`
   - `commissions_vacation`
   - `commissions_infinity`
   - `commissions_quarterly`
   - `bonus_pool_records`
3. Keep these tables:
   - `distributors` (will migrate to members later)
   - `orders`
   - `customers`
   - `products` (will enhance)
   - `subscriptions`
4. Apply migration
5. Verify tables dropped

**Output**: Migration file + tables dropped

**Success Criteria**:
- Migration file exists
- Migration applied successfully
- Query `SELECT * FROM pg_tables WHERE tablename LIKE 'commissions_%'` returns 0 rows
- Core tables (distributors, orders) still exist

**Log File**: `agent-1B-remove-db.log`

---

### **Agent 1C: Remove Old API Endpoints**

**Objective**: Deprecate old API routes

**Tasks**:
1. Update these files:
   - `src/app/api/admin/compensation/run/route.ts`
   - `src/app/api/admin/compensation/cab-processing/route.ts`
   - `src/app/api/admin/compensation/stress-test/route.ts`
2. Comment out all handler code
3. Add deprecation notice:
   ```typescript
   // DEPRECATED - Dual-ladder migration in progress
   // This endpoint will be replaced with new implementation
   export async function GET() {
     return NextResponse.json({ error: 'Endpoint deprecated during migration' }, { status: 501 });
   }
   ```
4. Document what was changed

**Output**: 3 route files updated

**Success Criteria**:
- All 3 files updated
- All endpoints return 501 Not Implemented
- No imports broken
- App still compiles

**Log File**: `agent-1C-remove-apis.log`

---

### **Agent 1D: Clear Old Config**

**Objective**: Clear old configuration data

**Tasks**:
1. Create migration: `20260316000001b_clear_old_config.sql`
2. Clear these tables:
   ```sql
   DELETE FROM saas_comp_engine_config;
   DELETE FROM insurance_comp_engine_config;
   DELETE FROM comp_engine_change_log;
   ```
3. Verify tables empty
4. Document what was cleared

**Output**: Migration file + config cleared

**Success Criteria**:
- Migration file exists
- Config tables empty
- Tables still exist (structure intact)

**Log File**: `agent-1D-clear-config.log`

---

## PHASE 2: BUILD NEW DATABASE SCHEMA (6 Agents, 1.5 hours)

**Dependencies**: Phase 1 must complete first

---

### **Agent 2A: Create Core Tables (members)**

**Objective**: Create new `members` table with dual-ladder structure

**Tasks**:
1. Create migration: `20260316000002_dual_ladder_core_tables.sql`
2. Create `members` table with:
   - 15+ columns (see spec)
   - Dual ranks (insurance_rank, tech_rank)
   - Credit tracking
   - Cross-credit fields
   - Insurance metrics
   - Grace periods
   - Override qualification flag
3. Create indexes
4. Add comments
5. Apply migration
6. Verify table exists

**Output**: Migration file + `members` table created

**Success Criteria**:
- Migration applied successfully
- `SELECT COUNT(*) FROM members` works (returns 0)
- All columns exist
- Indexes created

**Log File**: `agent-2A-core-tables.log`

---

### **Agent 2B: Create Products with Credits**

**Objective**: Enhance products table with credit system

**Tasks**:
1. Create migration: `20260316000003_products_with_credits.sql`
2. Add columns to products:
   - `member_price_cents INT`
   - `retail_price_cents INT`
   - `credit_pct DECIMAL(3,2)`
   - `credits INT`
3. Seed 6 products from spec:
   - PulseGuard (credit_pct=0.30, credits=18)
   - PulseFlow (credit_pct=0.50, credits=65)
   - PulseDrive (credit_pct=1.00, credits=219)
   - PulseCommand (credit_pct=1.00, credits=349)
   - SmartLook (credit_pct=0.40, credits=40)
   - Business Center (credit_pct=0.00, credits=39)
4. Apply migration
5. Verify products seeded

**Output**: Migration file + products enhanced

**Success Criteria**:
- Migration applied
- `SELECT name, credit_pct, credits FROM products` returns 6 rows
- All credit_pct values match spec

**Log File**: `agent-2B-products.log`

**Dependencies**: Needs 2A to complete first

---

### **Agent 2C: Create Commission Tables**

**Objective**: Create new earnings ledger

**Tasks**:
1. Create migration: `20260316000004_commission_tables.sql`
2. Create `earnings_ledger` table
3. Create indexes
4. Add RLS policies
5. Apply migration
6. Verify table exists

**Output**: Migration file + `earnings_ledger` created

**Success Criteria**:
- Migration applied
- Table exists
- Can insert test record
- Can query by member_id + month

**Log File**: `agent-2C-commission-tables.log`

**Dependencies**: Needs 2A to complete first

---

### **Agent 2D: Create Bonus Pool Tables**

**Objective**: Create bonus pool tracking tables

**Tasks**:
1. Create migration: `20260316000005_bonus_pool_tables.sql`
2. Create tables:
   - `bonus_pool_ledger`
   - `leadership_shares`
   - `incentive_records`
3. Create indexes
4. Add RLS policies
5. Apply migration
6. Verify tables exist

**Output**: Migration file + 3 tables created

**Success Criteria**:
- Migration applied
- All 3 tables exist
- Can insert test records

**Log File**: `agent-2D-bonus-pool.log`

**Dependencies**: Can run in parallel with 2A

---

### **Agent 2E: Create Insurance Ladder Tables**

**Objective**: Create insurance compensation tables

**Tasks**:
1. Create migration: `20260316000006_insurance_ladder.sql`
2. Create tables:
   - `insurance_production`
   - `mga_shops`
   - `insurance_overrides`
3. Create indexes
4. Add RLS policies
5. Apply migration
6. Verify tables exist

**Output**: Migration file + 3 tables created

**Success Criteria**:
- Migration applied
- All 3 tables exist
- Can insert test records

**Log File**: `agent-2E-insurance-ladder.log`

**Dependencies**: Needs 2A to complete first

---

### **Agent 2F: Create Utility Functions**

**Objective**: Create SQL utility functions

**Tasks**:
1. Create migration: `20260316000007_utility_functions.sql`
2. Create functions:
   - `calc_tech_to_insurance_credits(member_id)`
   - `calc_insurance_to_tech_credits(member_id)`
   - `check_override_qualified(member_id)`
3. Apply migration
4. Test functions with sample data

**Output**: Migration file + 3 functions created

**Success Criteria**:
- Migration applied
- All 3 functions exist
- Functions return expected results

**Log File**: `agent-2F-utility-functions.log`

**Dependencies**: Needs 2A and 2B to complete first

---

## PHASE 3: BUILD NEW TYPESCRIPT CODE (5 Agents, 2 hours)

**Dependencies**: Phase 2 must complete first

---

### **Agent 3A: New config.ts**

**Objective**: Create new config with 9 ranks and ranked overrides

**Tasks**:
1. Create: `src/lib/compensation/config.ts`
2. Implement from spec:
   - Product credit percentages
   - 9 tech ranks (Starter→Elite)
   - Ranked override schedules (9 ranks × 5 levels)
   - Bonus pool split (3.5% + 1.5%)
   - 50 credit minimum constant
   - All thresholds from spec
3. Export all configs
4. Verify TypeScript compiles

**Output**: `config.ts` (200-300 lines)

**Success Criteria**:
- File compiles with no errors
- Exports `TECH_RANKS` array (9 ranks)
- Exports `RANKED_OVERRIDES` map
- Exports `BONUS_POOL_PCT` = 0.035
- Exports `LEADERSHIP_POOL_PCT` = 0.015

**Log File**: `agent-3A-config.log`

---

### **Agent 3B: New waterfall.ts**

**Objective**: Create new waterfall with proper splits

**Tasks**:
1. Create: `src/lib/compensation/waterfall.ts`
2. Implement from spec:
   - BotMakers 30%
   - Apex 30%
   - Bonus Pool 3.5%
   - Leadership Pool 1.5%
   - Commission Pool 60/40 split
   - Business Center exception
3. Export calculation functions
4. Verify TypeScript compiles

**Output**: `waterfall.ts` (150-200 lines)

**Success Criteria**:
- File compiles
- `calculateWaterfall(499)` returns correct splits
- `calculateBizCenterSplit()` returns $11/$8/$10/$8/$2
- FLOOR/ROUND logic correct

**Log File**: `agent-3B-waterfall.log`

---

### **Agent 3C: New rank.ts**

**Objective**: Create new rank evaluation with 9 ranks

**Tasks**:
1. Create: `src/lib/compensation/rank.ts`
2. Implement from spec:
   - 9-rank evaluation
   - Credit-based thresholds
   - Downline rank requirements
   - 2-month grace period
   - 6-month rank lock
3. Export evaluation functions
4. Verify TypeScript compiles

**Output**: `rank.ts` (250-300 lines)

**Success Criteria**:
- File compiles
- `evaluateTechRank(150, 300)` returns 'bronze'
- `evaluateTechRank(8000, 120000)` returns 'elite'
- Grace period logic works

**Log File**: `agent-3C-rank.log`

---

### **Agent 3D: New override-resolution.ts**

**Objective**: Create new override resolution with ranked %

**Tasks**:
1. Create: `src/lib/compensation/override-resolution.ts`
2. Implement from spec:
   - Ranked override percentages
   - 50 credit qualification check
   - Enroller Override Rule
   - Override savings tracking
3. Export resolution functions
4. Verify TypeScript compiles

**Output**: `override-resolution.ts` (200-250 lines)

**Success Criteria**:
- File compiles
- `resolveOverrides()` checks 50 credit minimum
- Enroller always gets L1
- Ranked % applied correctly

**Log File**: `agent-3D-overrides.log`

---

### **Agent 3E: New bonus-programs.ts**

**Objective**: Create new bonus programs from spec

**Tasks**:
1. Create: `src/lib/compensation/bonus-programs.ts`
2. Implement all 7 programs:
   - Trip Incentive
   - Fast Start
   - Quarterly Contests
   - Car Allowance
   - Leadership Retreat
   - Enhanced Rank Bonuses
   - Reserve/Flex
3. Export calculation functions
4. Verify TypeScript compiles

**Output**: `bonus-programs.ts` (400-500 lines)

**Success Criteria**:
- File compiles
- All 7 programs have functions
- Functions match spec exactly

**Log File**: `agent-3E-bonuses.log`

---

## PHASE 4: UPDATE API ENDPOINTS (3 Agents, 1 hour)

**Dependencies**: Phase 3 must complete first

---

### **Agent 4A: Commission Run API**

**Objective**: Update commission run to use new system

**Tasks**:
1. Update: `src/app/api/admin/compensation/run/route.ts`
2. Use new:
   - Members table
   - Earnings ledger
   - Ranked overrides
   - 50 credit check
3. Test endpoint
4. Verify response format

**Output**: Updated route file

**Success Criteria**:
- Endpoint returns 200
- Uses new tables
- Applies 50 credit check
- Returns correct format

**Log File**: `agent-4A-run-api.log`

---

### **Agent 4B: Bonus Pool API**

**Objective**: Create new bonus pool management API

**Tasks**:
1. Create: `src/app/api/admin/compensation/bonus-pool/route.ts`
2. Implement endpoints:
   - `GET /` - View pool balance
   - `POST /allocate` - Allocate to program
   - `GET /history` - Funding history
3. Test all endpoints
4. Add authentication

**Output**: New route file

**Success Criteria**:
- All 3 endpoints work
- Returns correct data
- Auth required

**Log File**: `agent-4B-bonus-pool-api.log`

---

### **Agent 4C: Leadership Pool API**

**Objective**: Create leadership pool management API

**Tasks**:
1. Create: `src/app/api/admin/compensation/leadership-pool/route.ts`
2. Implement endpoints:
   - `POST /grant-shares` - Grant shares
   - `GET /shares/:memberId` - View shares
   - `POST /vest` - Process vesting
3. Test all endpoints
4. Add authentication

**Output**: New route file

**Success Criteria**:
- All 3 endpoints work
- Vesting logic correct
- Auth required

**Log File**: `agent-4C-leadership-pool-api.log`

---

## PHASE 5: TESTING & VALIDATION (4 Agents, 1 hour)

**Dependencies**: Phase 4 must complete first

---

### **Agent 5A: Unit Tests**

**Objective**: Create unit tests for all new code

**Tasks**:
1. Create test files:
   - `waterfall.test.ts`
   - `rank.test.ts`
   - `override-resolution.test.ts`
   - `bonus-programs.test.ts`
2. Write tests for:
   - Happy paths
   - Edge cases
   - Error handling
3. Run tests: `npm test`
4. Achieve >80% coverage

**Output**: 4 test files (50-100 lines each)

**Success Criteria**:
- All tests pass
- Coverage >80%
- No failing tests

**Log File**: `agent-5A-unit-tests.log`

---

### **Agent 5B: Integration Tests**

**Objective**: Test end-to-end commission flow

**Tasks**:
1. Create: `commission-run.integration.test.ts`
2. Test full flow:
   - Create test member
   - Assign products
   - Run commission calculation
   - Validate earnings ledger
3. Run test
4. Verify all 16 income streams

**Output**: 1 integration test file (200-300 lines)

**Success Criteria**:
- Test passes
- All income streams calculated
- No errors

**Log File**: `agent-5B-integration-tests.log`

---

### **Agent 5C: Database Validation**

**Objective**: Validate database schema

**Tasks**:
1. Run validation queries:
   - Verify all tables exist
   - Verify all columns exist
   - Verify all functions exist
   - Check for orphaned records
2. Document results
3. Fix any issues found

**Output**: Validation report

**Success Criteria**:
- All tables exist
- All functions exist
- No orphaned records
- No missing columns

**Log File**: `agent-5C-db-validation.log`

---

### **Agent 5D: Build & TypeScript**

**Objective**: Ensure everything compiles

**Tasks**:
1. Run: `npm run build`
2. Run: `tsc --noEmit`
3. Fix any TypeScript errors
4. Fix any build errors
5. Verify no warnings

**Output**: Successful build

**Success Criteria**:
- Build succeeds
- No TypeScript errors
- No build warnings
- All routes compile

**Log File**: `agent-5D-build.log`

---

## 📊 SUMMARY

**Total Agents**: 25
**Total Phases**: 6
**Estimated Duration**: 4 hours (with parallelization)
**Sequential Duration**: 7.5 hours (without parallelization)
**Time Saved**: 3.5 hours (47% faster)

**Agent Distribution**:
- Phase 0: 3 agents (30 min)
- Phase 1: 4 agents (1 hour)
- Phase 2: 6 agents (1.5 hours)
- Phase 3: 5 agents (2 hours)
- Phase 4: 3 agents (1 hour)
- Phase 5: 4 agents (1 hour)

**Dependencies**:
- Phases run sequentially (0 → 1 → 2 → 3 → 4 → 5)
- Within each phase, most agents run in parallel
- Some agents within Phase 2 have dependencies (noted above)

**Rollback Points**:
- After Phase 0: Git tag `comp-plan-v1-snapshot`
- After Phase 1: Restore old tables
- After Phase 2: Drop new tables
- After Phase 3: Restore old TS files
- After Phase 4: Revert API endpoints
- After Phase 5: Complete rollback

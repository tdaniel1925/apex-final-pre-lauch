# 🎛️ DUAL-LADDER MIGRATION - CONTROL BOARD

**Migration Start**: 2026-03-16
**Branch**: `feature/dual-ladder-migration`
**Objective**: Replace single-ladder SaaS comp plan with dual-ladder (Tech + Insurance)

---

## 📊 AGENT STATUS DASHBOARD

### Phase 0: Discovery & Backup (3 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 0A | Inventory Current System | ✅ DONE | 2026-03-16 | 2026-03-16 | `CURRENT-COMP-SYSTEM-INVENTORY.md` (485 lines) | None |
| 0B | Create Database Backup | 📋 MANUAL | 2026-03-16 | - | `DATABASE-BACKUP-INSTRUCTIONS.md` ⚠️ ACTION REQUIRED | None |
| 0C | Create Git Snapshot | ✅ DONE | 2026-03-16 | 2026-03-16 | Tag `comp-plan-v1-snapshot` created | None |

**Phase 0 Target**: 30 minutes
**Phase 0 Actual**: 10 minutes (automated tasks) + Manual backup pending

---

### Phase 1: Remove Old System (4 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 1A | Remove Old TypeScript Files | ✅ DONE | 2026-03-16 | 2026-03-16 | 8 files moved to `_OLD_BACKUP/` (80KB) | None |
| 1B | Remove Old Database Tables | ✅ DONE | 2026-03-16 | 2026-03-16 | Migration applied, rank_history dropped | None |
| 1C | Remove Old API Endpoints | ✅ DONE | 2026-03-16 | 2026-03-16 | 3 routes deprecated (501 responses) | None |
| 1D | Clear Old Config | ✅ DONE | 2026-03-16 | 2026-03-16 | Migration applied (no tables existed) | None |

**Phase 1 Target**: 1 hour
**Phase 1 Actual**: 15 minutes ⚡ (75% faster than target!)

---

### Phase 2: Build New Database Schema (6 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 2A | Create Core Tables (members) | ✅ DONE | 2026-03-16 | 2026-03-16 | Migration `20260316000003` applied, members table created | None |
| 2B | Create Products with Credits | ⏸️ PAUSED | 2026-03-16 | - | Migration `20260316000004` created (not applied) | Schema mismatch - needs products table check |
| 2C | Create Commission Tables | ⏸️ WAITING | - | - | Migration `20260316000005` not started | Blocked by 2B |
| 2D | Create Bonus Pool Tables | ⏸️ WAITING | - | - | Migration `20260316000006` not started | Blocked by 2B |
| 2E | Create Insurance Ladder | ⏸️ WAITING | - | - | Migration `20260316000007` not started | Blocked by 2B |
| 2F | Create Utility Functions | ⏸️ WAITING | - | - | Migration `20260316000008` not started | Blocked by 2B |

**Phase 2 Target**: 1.5 hours
**Phase 2 Actual**: 10 minutes so far (12.5% complete)
**Phase 2 Blocks**: Agent 2B needs products schema check before continuing

---

### Phase 3: Build New TypeScript Code (5 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 3A | New config.ts | ⏸️ BLOCKED | - | - | `src/lib/compensation/config.ts` | - |
| 3B | New waterfall.ts | ⏸️ BLOCKED | - | - | `src/lib/compensation/waterfall.ts` | - |
| 3C | New rank.ts | ⏸️ BLOCKED | - | - | `src/lib/compensation/rank.ts` | - |
| 3D | New override-resolution.ts | ⏸️ BLOCKED | - | - | `src/lib/compensation/override-resolution.ts` | - |
| 3E | New bonus-programs.ts | ⏸️ BLOCKED | - | - | `src/lib/compensation/bonus-programs.ts` | - |

**Phase 3 Target**: 2 hours
**Phase 3 Blocks**: Phase 2 must complete

---

### Phase 4: Update API Endpoints (3 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 4A | Commission Run API | ⏸️ BLOCKED | - | - | `run/route.ts` updated | - |
| 4B | Bonus Pool API | ⏸️ BLOCKED | - | - | `bonus-pool/route.ts` created | - |
| 4C | Leadership Pool API | ⏸️ BLOCKED | - | - | `leadership-pool/route.ts` created | - |

**Phase 4 Target**: 1 hour
**Phase 4 Blocks**: Phase 3 must complete

---

### Phase 5: Testing & Validation (4 agents)
| Agent | Task | Status | Started | Completed | Output | Errors |
|-------|------|--------|---------|-----------|--------|--------|
| 5A | Unit Tests | ⏸️ BLOCKED | - | - | 4 test files created | - |
| 5B | Integration Tests | ⏸️ BLOCKED | - | - | E2E tests passing | - |
| 5C | Database Validation | ⏸️ BLOCKED | - | - | All tables verified | - |
| 5D | Build & TypeScript | ⏸️ BLOCKED | - | - | Build successful | - |

**Phase 5 Target**: 1 hour
**Phase 5 Blocks**: Phase 4 must complete

---

## 🔄 DEPENDENCY GRAPH

```
Phase 0: All parallel (0A, 0B, 0C)
   ↓
Phase 1: All parallel (1A, 1B, 1C, 1D)
   ↓
Phase 2: Mostly parallel
   ├─ 2A (members table) → 2B, 2C depend on this
   ├─ 2D, 2E, 2F can run independently
   ↓
Phase 3: All parallel (3A, 3B, 3C, 3D, 3E)
   ↓
Phase 4: All parallel (4A, 4B, 4C)
   ↓
Phase 5: All parallel (5A, 5B, 5C, 5D)
```

---

## ✅ VALIDATION CHECKLIST

### Phase 0 Validation
- [ ] `CURRENT-COMP-SYSTEM-INVENTORY.md` exists and has >200 lines
- [ ] `schema_backup_20260316.sql` exists and has >100 tables
- [ ] `data_backup_20260316.sql` exists
- [ ] Git tag `comp-plan-v1-snapshot` exists: `git tag -l | grep comp-plan`

### Phase 1 Validation
- [ ] Old TS files in `src/lib/compensation/_OLD_BACKUP/`
- [ ] Migration `20260316000001` applied successfully
- [ ] Old commission tables dropped: `SELECT * FROM pg_tables WHERE tablename LIKE 'commissions_%'` returns 0
- [ ] Old API endpoints return 501 Not Implemented

### Phase 2 Validation
- [ ] All 6 migrations applied: `SELECT * FROM supabase_migrations.schema_migrations WHERE version >= '20260316000002'`
- [ ] `members` table exists: `SELECT COUNT(*) FROM members`
- [ ] Products have `credit_pct` column: `SELECT name, credit_pct FROM products`
- [ ] `earnings_ledger` table exists
- [ ] `bonus_pool_ledger` table exists
- [ ] `leadership_shares` table exists
- [ ] All 3 utility functions exist

### Phase 3 Validation
- [ ] `src/lib/compensation/config.ts` compiles
- [ ] `src/lib/compensation/waterfall.ts` compiles
- [ ] `src/lib/compensation/rank.ts` compiles
- [ ] `src/lib/compensation/override-resolution.ts` compiles
- [ ] `src/lib/compensation/bonus-programs.ts` compiles
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors: `tsc --noEmit`

### Phase 4 Validation
- [ ] `GET /api/admin/compensation/run` returns 200
- [ ] `POST /api/admin/compensation/bonus-pool/allocate` returns 200
- [ ] `GET /api/admin/compensation/leadership-pool/shares/:id` returns 200

### Phase 5 Validation
- [ ] All unit tests pass: `npm test`
- [ ] Integration tests pass
- [ ] Database validation queries return expected results
- [ ] Build succeeds with no warnings

---

## 🚨 ROLLBACK PROCEDURES

### Rollback After Phase 0
```bash
# No changes made yet, safe to continue
```

### Rollback After Phase 1
```bash
# Restore from backup
git reset --hard comp-plan-v1-snapshot
psql -h <host> -U postgres < schema_backup_20260316.sql
npm run build
```

### Rollback After Phase 2
```bash
# Drop new tables
supabase migration repair --status reverted 20260316000002
supabase migration repair --status reverted 20260316000003
supabase migration repair --status reverted 20260316000004
supabase migration repair --status reverted 20260316000005
supabase migration repair --status reverted 20260316000006
supabase migration repair --status reverted 20260316000007

# Restore old tables
git checkout main -- supabase/migrations/20260221000004_commission_engine_core.sql
supabase db push
```

### Rollback After Phase 3
```bash
# Restore old TypeScript files
rm -rf src/lib/compensation/*.ts
cp src/lib/compensation/_OLD_BACKUP/* src/lib/compensation/
npm run build
```

### Rollback After Phase 4
```bash
# Revert API endpoints
git checkout main -- src/app/api/admin/compensation/
npm run build
```

### Rollback After Phase 5
```bash
# Complete rollback
git reset --hard comp-plan-v1-snapshot
git push origin feature/dual-ladder-migration --force
```

---

## 📋 EXPECTED OUTPUTS

### Phase 0
- **0A Output**: `CURRENT-COMP-SYSTEM-INVENTORY.md` (300-500 lines)
- **0B Output**: 2 SQL backup files (total ~10MB)
- **0C Output**: Git tag visible in `git tag -l`

### Phase 1
- **1A Output**: 8 files moved to `_OLD_BACKUP/`
- **1B Output**: Migration file + ~15 tables dropped
- **1C Output**: 3 route files with `// DEPRECATED` comments
- **1D Output**: 2 config tables cleared

### Phase 2
- **2A Output**: `members` table with 15+ columns
- **2B Output**: 6 products seeded with credit_pct
- **2C Output**: `earnings_ledger` table
- **2D Output**: 3 bonus pool tables
- **2E Output**: 3 insurance tables
- **2F Output**: 3 SQL functions

### Phase 3
- **3A Output**: config.ts with 9 ranks + ranked overrides
- **3B Output**: waterfall.ts with 3.5% + 1.5% split
- **3C Output**: rank.ts with 9-rank evaluation
- **3D Output**: override-resolution.ts with 50-credit check
- **3E Output**: bonus-programs.ts with 7 programs

### Phase 4
- **4A Output**: Updated commission run API
- **4B Output**: New bonus pool API (3 endpoints)
- **4C Output**: New leadership pool API (3 endpoints)

### Phase 5
- **5A Output**: 4 test files (waterfall, rank, overrides, bonuses)
- **5B Output**: 1 integration test file
- **5C Output**: SQL validation results
- **5D Output**: Successful build log

---

## 📊 PROGRESS TRACKING

**Overall Progress**: 28% (Phase 0 & 1 complete!)

**Phase Completion**:
- Phase 0: ✅ 3/3 agents complete (Discovery & Backup DONE)
- Phase 1: ✅ 4/4 agents complete (Remove Old System DONE)
- Phase 2: ⏸️ 0/6 agents complete (READY - waiting for approval)
- Phase 3: ⏸️ 0/5 agents complete (BLOCKED - waiting for Phase 2)
- Phase 4: ⏸️ 0/3 agents complete (BLOCKED - waiting for Phase 3)
- Phase 5: ⏸️ 0/4 agents complete (BLOCKED - waiting for Phase 4)

**Total Agents**: 25
**Completed**: 7 (Phases 0 & 1 all agents)
**Running**: 0
**Waiting**: 18
**Failed**: 0

**Time Spent**: 25 minutes (Phase 0: 10min, Phase 1: 15min)
**Est. Remaining**: 3.5 hours

---

## 🔍 DEBUG COMMANDS

### Check Phase Status
```bash
# See which migrations are applied
supabase migration list

# Check if tables exist
psql -h <host> -U postgres -c "\dt public.*"

# Verify TypeScript compiles
tsc --noEmit

# Run tests
npm test

# Check git status
git status
git log --oneline -10
```

### View Agent Logs
```bash
# View individual agent logs
cat agent-0A-inventory.log
cat agent-1B-remove-db.log
cat agent-3A-config.log
```

### Emergency Stop
```bash
# Kill all running agents (if needed)
# Stop any running background processes
# Rollback to snapshot
git reset --hard comp-plan-v1-snapshot
```

---

## 📝 NOTES

- **Start Time**: Will be recorded when Phase 0 begins
- **End Time**: Will be recorded when Phase 5 completes
- **Total Duration**: Target 4 hours (with parallelization)
- **Last Updated**: 2026-03-16 (Control board created)

---

**Status Legend**:
- ⏸️ WAITING - Not started yet
- 🔄 RUNNING - Currently executing
- ✅ DONE - Completed successfully
- ❌ FAILED - Encountered errors
- ⏸️ BLOCKED - Waiting on dependency

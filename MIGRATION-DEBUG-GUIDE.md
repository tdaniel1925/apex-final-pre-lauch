# 🔍 MIGRATION DEBUG GUIDE

Quick reference for debugging the dual-ladder migration.

---

## 🚨 QUICK CHECKS

### Is the migration branch active?
```bash
git branch --show-current
# Should show: feature/dual-ladder-migration
```

### Which phase are we in?
```bash
cat MIGRATION-CONTROL-BOARD.md | grep "🔄 RUNNING"
```

### Are there any failed agents?
```bash
cat MIGRATION-CONTROL-BOARD.md | grep "❌ FAILED"
```

### What's the overall progress?
```bash
cat MIGRATION-CONTROL-BOARD.md | grep "Overall Progress"
```

---

## 📝 VIEW AGENT LOGS

### List all agent logs
```bash
ls -la | grep "agent-"
```

### View specific agent log
```bash
# Phase 0
cat agent-0A-inventory.log
cat agent-0B-backup.log
cat agent-0C-git-snapshot.log

# Phase 1
cat agent-1A-remove-ts.log
cat agent-1B-remove-db.log
cat agent-1C-remove-apis.log
cat agent-1D-clear-config.log

# Phase 2
cat agent-2A-core-tables.log
cat agent-2B-products.log
cat agent-2C-commission-tables.log
cat agent-2D-bonus-pool.log
cat agent-2E-insurance-ladder.log
cat agent-2F-utility-functions.log

# Phase 3
cat agent-3A-config.log
cat agent-3B-waterfall.log
cat agent-3C-rank.log
cat agent-3D-overrides.log
cat agent-3E-bonuses.log

# Phase 4
cat agent-4A-run-api.log
cat agent-4B-bonus-pool-api.log
cat agent-4C-leadership-pool-api.log

# Phase 5
cat agent-5A-unit-tests.log
cat agent-5B-integration-tests.log
cat agent-5C-db-validation.log
cat agent-5D-build.log
```

### Search logs for errors
```bash
grep -i "error" agent-*.log
grep -i "failed" agent-*.log
grep -i "exception" agent-*.log
```

---

## 🗄️ DATABASE DEBUGGING

### Check which migrations are applied
```bash
npx supabase migration list
```

### View recent migrations
```bash
psql -h <host> -U postgres -c "SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10"
```

### Check if old tables are gone
```bash
psql -h <host> -U postgres -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'commissions_%'"
# Should return 0 rows after Phase 1
```

### Check if new tables exist
```bash
psql -h <host> -U postgres -c "SELECT tablename FROM pg_tables WHERE tablename IN ('members', 'earnings_ledger', 'bonus_pool_ledger', 'leadership_shares', 'incentive_records', 'insurance_production', 'mga_shops')"
# Should return 7 rows after Phase 2
```

### Verify products have credit_pct
```bash
psql -h <host> -U postgres -c "SELECT name, credit_pct, credits FROM products"
# Should show 6 products with credit values
```

### Check members table structure
```bash
psql -h <host> -U postgres -c "\d members"
```

### Verify utility functions exist
```bash
psql -h <host> -U postgres -c "SELECT proname FROM pg_proc WHERE proname LIKE 'calc_%' OR proname LIKE 'check_%'"
# Should show 3 functions after Phase 2F
```

---

## 💻 TYPESCRIPT & BUILD DEBUGGING

### Check TypeScript compilation
```bash
npx tsc --noEmit
```

### Check for TypeScript errors in compensation lib
```bash
npx tsc --noEmit src/lib/compensation/*.ts
```

### Run build
```bash
npm run build 2>&1 | tee build.log
```

### Check for missing imports
```bash
grep -r "Cannot find module" .next/
```

### Verify new files exist
```bash
ls -la src/lib/compensation/
# Should show: config.ts, waterfall.ts, rank.ts, override-resolution.ts, bonus-programs.ts
```

### Check old files backed up
```bash
ls -la src/lib/compensation/_OLD_BACKUP/
# Should show moved files
```

---

## 🧪 TESTING DEBUGGING

### Run all tests
```bash
npm test 2>&1 | tee test-results.log
```

### Run specific test file
```bash
npm test -- waterfall.test.ts
npm test -- rank.test.ts
npm test -- override-resolution.test.ts
npm test -- bonus-programs.test.ts
```

### Check test coverage
```bash
npm test -- --coverage
```

### Run integration tests
```bash
npm test -- commission-run.integration.test.ts
```

---

## 🔌 API DEBUGGING

### Check if endpoints are accessible
```bash
# Commission Run
curl -X GET http://localhost:3000/api/admin/compensation/run

# Bonus Pool
curl -X GET http://localhost:3000/api/admin/compensation/bonus-pool

# Leadership Pool
curl -X GET http://localhost:3000/api/admin/compensation/leadership-pool/shares/test-id
```

### Check API route files exist
```bash
ls -la src/app/api/admin/compensation/
```

### Test endpoint with auth
```bash
curl -X GET http://localhost:3000/api/admin/compensation/run \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 GIT DEBUGGING

### Check current branch
```bash
git branch --show-current
```

### View commit history
```bash
git log --oneline -10
```

### Check if snapshot tag exists
```bash
git tag -l | grep comp-plan-v1-snapshot
```

### View uncommitted changes
```bash
git status
git diff
```

### See what files changed
```bash
git diff --name-only HEAD
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "Migration already applied"
**Fix**:
```bash
npx supabase migration repair --status reverted <migration_id>
npx supabase db push
```

### Issue: "Cannot find module '@/lib/compensation/config'"
**Fix**:
```bash
# Check if file exists
ls src/lib/compensation/config.ts

# If missing, agent 3A failed - check log
cat agent-3A-config.log
```

### Issue: "Table 'members' does not exist"
**Fix**:
```bash
# Check migration status
npx supabase migration list

# If migration not applied
npx supabase db push
```

### Issue: "Type errors in compensation files"
**Fix**:
```bash
# Run TypeScript on each file individually
npx tsc --noEmit src/lib/compensation/config.ts
npx tsc --noEmit src/lib/compensation/waterfall.ts
npx tsc --noEmit src/lib/compensation/rank.ts

# Check which file has errors
```

### Issue: "Build fails with import errors"
**Fix**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Try build again
npm run build
```

### Issue: "Tests failing"
**Fix**:
```bash
# Run tests with verbose output
npm test -- --verbose

# Check test log
cat agent-5A-unit-tests.log

# Run single failing test
npm test -- <test-file-name>
```

---

## 📊 VALIDATION COMMANDS

### Phase 0 Validation
```bash
# Check inventory exists
test -f CURRENT-COMP-SYSTEM-INVENTORY.md && echo "✅ Inventory exists" || echo "❌ Missing"

# Check backups exist
test -f schema_backup_20260316.sql && echo "✅ Schema backup exists" || echo "❌ Missing"
test -f data_backup_20260316.sql && echo "✅ Data backup exists" || echo "❌ Missing"

# Check git tag
git tag -l | grep -q comp-plan-v1-snapshot && echo "✅ Git tag exists" || echo "❌ Missing"
```

### Phase 1 Validation
```bash
# Check old files moved
test -d src/lib/compensation/_OLD_BACKUP && echo "✅ Backup folder exists" || echo "❌ Missing"

# Check old tables dropped
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM pg_tables WHERE tablename LIKE 'commissions_%'" | grep -q "0" && echo "✅ Old tables dropped" || echo "❌ Still exist"

# Check API endpoints deprecated
grep -q "DEPRECATED" src/app/api/admin/compensation/run/route.ts && echo "✅ APIs deprecated" || echo "❌ Not deprecated"
```

### Phase 2 Validation
```bash
# Check members table
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM members" && echo "✅ Members table exists" || echo "❌ Missing"

# Check products
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM products WHERE credit_pct IS NOT NULL" | grep -q "6" && echo "✅ Products seeded" || echo "❌ Missing"

# Check earnings ledger
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM earnings_ledger" && echo "✅ Earnings ledger exists" || echo "❌ Missing"

# Check functions
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'calc_%'" | grep -q "2" && echo "✅ Functions exist" || echo "❌ Missing"
```

### Phase 3 Validation
```bash
# Check all TS files exist
test -f src/lib/compensation/config.ts && echo "✅ config.ts" || echo "❌ Missing"
test -f src/lib/compensation/waterfall.ts && echo "✅ waterfall.ts" || echo "❌ Missing"
test -f src/lib/compensation/rank.ts && echo "✅ rank.ts" || echo "❌ Missing"
test -f src/lib/compensation/override-resolution.ts && echo "✅ override-resolution.ts" || echo "❌ Missing"
test -f src/lib/compensation/bonus-programs.ts && echo "✅ bonus-programs.ts" || echo "❌ Missing"

# Check TypeScript compiles
npx tsc --noEmit && echo "✅ TypeScript compiles" || echo "❌ Errors"
```

### Phase 4 Validation
```bash
# Check API files exist
test -f src/app/api/admin/compensation/run/route.ts && echo "✅ Run API" || echo "❌ Missing"
test -f src/app/api/admin/compensation/bonus-pool/route.ts && echo "✅ Bonus Pool API" || echo "❌ Missing"
test -f src/app/api/admin/compensation/leadership-pool/route.ts && echo "✅ Leadership Pool API" || echo "❌ Missing"
```

### Phase 5 Validation
```bash
# Check test files exist
test -f src/lib/compensation/waterfall.test.ts && echo "✅ waterfall.test.ts" || echo "❌ Missing"
test -f src/lib/compensation/rank.test.ts && echo "✅ rank.test.ts" || echo "❌ Missing"

# Run tests
npm test && echo "✅ All tests pass" || echo "❌ Tests failing"

# Check build
npm run build && echo "✅ Build succeeds" || echo "❌ Build fails"
```

---

## 🔄 ROLLBACK PROCEDURES

### Emergency Stop - Rollback Everything
```bash
# 1. Reset to snapshot
git reset --hard comp-plan-v1-snapshot

# 2. Force push (if needed)
git push origin feature/dual-ladder-migration --force

# 3. Restore database
psql -h <host> -U postgres < schema_backup_20260316.sql
psql -h <host> -U postgres < data_backup_20260316.sql

# 4. Rebuild
npm install
npm run build

# 5. Verify
npm test
```

### Rollback Specific Phase

**After Phase 1 (Tables dropped)**:
```bash
# Restore old migrations
git checkout main -- supabase/migrations/20260221000004_commission_engine_core.sql
npx supabase db push
```

**After Phase 2 (New tables created)**:
```bash
# Revert migrations
npx supabase migration repair --status reverted 20260316000002
npx supabase migration repair --status reverted 20260316000003
npx supabase migration repair --status reverted 20260316000004
npx supabase migration repair --status reverted 20260316000005
npx supabase migration repair --status reverted 20260316000006
npx supabase migration repair --status reverted 20260316000007
```

**After Phase 3 (New TS code)**:
```bash
# Restore old files
rm src/lib/compensation/*.ts
cp src/lib/compensation/_OLD_BACKUP/* src/lib/compensation/
npm run build
```

---

## 📞 ESCALATION

### If agent fails repeatedly (3+ times):
1. Check agent log: `cat agent-XX-name.log`
2. Identify error message
3. Search this guide for error
4. Apply fix
5. Retry agent

### If phase is blocked:
1. Check dependency: `cat AGENT-ASSIGNMENTS.md | grep "Dependencies"`
2. Verify dependent phase completed
3. Check control board: `cat MIGRATION-CONTROL-BOARD.md`
4. Manually trigger next phase if ready

### If rollback needed:
1. Document reason for rollback
2. Follow rollback procedure above
3. Create issue in GitHub
4. Review what went wrong
5. Update migration plan

---

## ✅ COMPLETION CHECKLIST

Run this at the end to verify everything worked:

```bash
#!/bin/bash

echo "🔍 MIGRATION COMPLETION CHECK"
echo "=============================="

# Git
git branch --show-current | grep -q "feature/dual-ladder-migration" && echo "✅ On correct branch" || echo "❌ Wrong branch"

# Database Tables
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM members" > /dev/null 2>&1 && echo "✅ Members table exists" || echo "❌ Missing"
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM earnings_ledger" > /dev/null 2>&1 && echo "✅ Earnings ledger exists" || echo "❌ Missing"
psql -h <host> -U postgres -c "SELECT COUNT(*) FROM bonus_pool_ledger" > /dev/null 2>&1 && echo "✅ Bonus pool exists" || echo "❌ Missing"

# TypeScript Files
test -f src/lib/compensation/config.ts && echo "✅ config.ts exists" || echo "❌ Missing"
test -f src/lib/compensation/waterfall.ts && echo "✅ waterfall.ts exists" || echo "❌ Missing"
test -f src/lib/compensation/rank.ts && echo "✅ rank.ts exists" || echo "❌ Missing"

# Build
npm run build > /dev/null 2>&1 && echo "✅ Build succeeds" || echo "❌ Build fails"

# Tests
npm test > /dev/null 2>&1 && echo "✅ Tests pass" || echo "❌ Tests fail"

echo "=============================="
echo "If all checks pass, migration is complete! 🎉"
```

---

**Last Updated**: 2026-03-16

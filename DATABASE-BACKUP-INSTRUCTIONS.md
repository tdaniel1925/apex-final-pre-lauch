# 🗄️ DATABASE BACKUP INSTRUCTIONS - Phase 0

**Purpose**: Create full database backups before dual-ladder migration
**Date**: 2026-03-16
**Agent**: 0B (Database Backup Agent)

---

## ⚠️ CRITICAL: MUST BE RUN BEFORE PHASE 1

Do NOT proceed with Phase 1 (Remove Old System) until these backups are complete!

---

## 📋 BACKUP CHECKLIST

- [ ] Schema backup created: `schema_backup_20260316.sql`
- [ ] Data backup created: `data_backup_20260316.sql`
- [ ] Backups verified (can be restored)
- [ ] Backups stored in safe location

---

## 🔧 OPTION 1: Using Supabase CLI (Recommended)

### Prerequisites:
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>
```

### Create Schema Backup:
```bash
# Export schema only (structure, no data)
supabase db dump --schema-only > schema_backup_20260316.sql

# Verify file was created
ls -lh schema_backup_20260316.sql
```

**Expected Output**: File should be 50-200KB (contains CREATE TABLE statements)

### Create Data Backup:
```bash
# Export data only (all table data)
supabase db dump --data-only > data_backup_20260316.sql

# Verify file was created
ls -lh data_backup_20260316.sql
```

**Expected Output**: File size varies based on data volume (could be 1MB-100MB+)

### Verify Backups:
```bash
# Check schema file has content
head -20 schema_backup_20260316.sql
# Should show CREATE TABLE statements

# Check data file has content
head -20 data_backup_20260316.sql
# Should show COPY or INSERT statements
```

---

## 🔧 OPTION 2: Using pg_dump Directly

### Prerequisites:
- PostgreSQL client tools installed
- Database connection string from Supabase dashboard

### Get Database Connection String:
1. Go to Supabase Dashboard
2. Settings → Database
3. Copy "Connection string" (Direct connection or Connection pooler)
4. Replace `[YOUR-PASSWORD]` with actual database password

### Create Schema Backup:
```bash
# Schema only
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres" \
  --schema-only \
  --no-owner \
  --no-privileges \
  > schema_backup_20260316.sql

# Verify
ls -lh schema_backup_20260316.sql
```

### Create Data Backup:
```bash
# Data only
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres" \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  > data_backup_20260316.sql

# Verify
ls -lh data_backup_20260316.sql
```

---

## 🔧 OPTION 3: Using Supabase Dashboard (Manual)

### Export Schema:
1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Create backup"
4. Select "Schema only"
5. Download file, rename to `schema_backup_20260316.sql`

### Export Data:
1. Database → Backups
2. Click "Create backup"
3. Select "Full database"
4. Download file, rename to `data_backup_20260316.sql`

---

## ✅ VERIFICATION STEPS

### 1. Check File Sizes:
```bash
ls -lh schema_backup_20260316.sql data_backup_20260316.sql
```

**Expected**:
- Schema: 50KB - 500KB
- Data: 1MB - 500MB (depends on data volume)

### 2. Check Schema File Content:
```bash
# Should see table definitions
grep "CREATE TABLE" schema_backup_20260316.sql | head -10
```

**Expected Output** (sample):
```sql
CREATE TABLE public.users (...);
CREATE TABLE public.products (...);
CREATE TABLE public.subscriptions (...);
CREATE TABLE public.rank_history (...);
CREATE TABLE public.commissions_waterfall (...);
```

### 3. Check Data File Content:
```bash
# Should see data inserts or COPY statements
grep -E "(INSERT INTO|COPY)" data_backup_20260316.sql | head -10
```

**Expected Output** (sample):
```sql
COPY public.users (id, email, ...) FROM stdin;
COPY public.products (id, name, ...) FROM stdin;
```

### 4. Verify Key Tables Present in Schema:
```bash
# Check for commission-related tables (should exist in backup)
grep -E "CREATE TABLE.*commissions_" schema_backup_20260316.sql
```

**Expected Tables** (should all be present):
- `commissions_waterfall`
- `commissions_overrides`
- `commissions_cabs`
- `commissions_bonuses`
- `commissions_runs`
- `commissions_payouts`
- `rank_history`

---

## 🧪 TEST RESTORE (Optional but Recommended)

### Create Test Database:
```bash
# Using Supabase CLI
supabase db create test_restore_20260316

# Restore schema
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/test_restore_20260316" \
  < schema_backup_20260316.sql

# Restore data
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/test_restore_20260316" \
  < data_backup_20260316.sql

# Verify tables exist
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/test_restore_20260316" \
  -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

# Drop test database when done
supabase db delete test_restore_20260316
```

---

## 📊 EXPECTED TABLES IN BACKUP

### Core Tables (MUST be in backup):
- [ ] `users`
- [ ] `products`
- [ ] `subscriptions`
- [ ] `rank_history`
- [ ] `commissions_waterfall`
- [ ] `commissions_overrides`
- [ ] `commissions_cabs`
- [ ] `commissions_bonuses`
- [ ] `commissions_runs`
- [ ] `commissions_payouts`
- [ ] `comp_engine_config`
- [ ] `comp_engine_rank_config`

### Additional Tables (May be present):
- `distributors`
- `teams`
- `enrollments`
- `payment_methods`
- `invoices`

---

## 💾 BACKUP STORAGE

### Store Backups In:
1. **Project Root** (for immediate rollback):
   - `schema_backup_20260316.sql`
   - `data_backup_20260316.sql`

2. **Safe Location** (for disaster recovery):
   - Cloud storage (Google Drive, Dropbox, S3)
   - External backup service
   - DO NOT commit to git (files too large)

### Add to .gitignore:
```bash
echo "schema_backup_*.sql" >> .gitignore
echo "data_backup_*.sql" >> .gitignore
```

---

## 🚨 TROUBLESHOOTING

### Error: "pg_dump: command not found"
**Fix**: Install PostgreSQL client tools
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

### Error: "connection refused"
**Fix**: Check connection string, firewall settings
1. Verify connection string is correct
2. Check Supabase dashboard for correct host/port
3. Ensure IP is whitelisted in Supabase settings

### Error: "permission denied"
**Fix**: Use database owner credentials
1. Use `postgres` user credentials from Supabase dashboard
2. Ensure password is correct (no special characters causing issues)

### Error: "out of memory"
**Fix**: Use streaming or chunk data export
```bash
# Export in chunks
pg_dump --data-only --table=users > users_backup.sql
pg_dump --data-only --table=subscriptions > subscriptions_backup.sql
# ... repeat for each table
```

---

## ✅ SUCCESS CRITERIA

Agent 0B is complete when:
1. ✅ `schema_backup_20260316.sql` exists and is >50KB
2. ✅ `data_backup_20260316.sql` exists
3. ✅ Both files contain valid SQL statements
4. ✅ All commission-related tables are in schema backup
5. ✅ Files are stored in safe location
6. ✅ Test restore successful (optional)

---

## 🔄 NEXT STEPS AFTER BACKUP

1. ✅ Verify backups complete (run verification commands above)
2. ✅ Update `MIGRATION-CONTROL-BOARD.md` → Mark Agent 0B as DONE
3. ✅ Proceed to Phase 1 only after all Phase 0 agents complete

---

## 📝 BACKUP METADATA

**Schema Backup**: `schema_backup_20260316.sql`
- Date: 2026-03-16
- Type: Schema only (structure)
- Size: ~50-500KB
- Tables: All public schema tables
- Functions: All stored procedures
- Indexes: All indexes and constraints

**Data Backup**: `data_backup_20260316.sql`
- Date: 2026-03-16
- Type: Data only (no structure)
- Size: Variable (1MB-500MB+)
- Format: SQL INSERT or COPY statements
- Includes: All table data

---

## 🆘 EMERGENCY RESTORE

If migration fails and you need to restore:

```bash
# 1. Stop all services
# 2. Restore schema
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" < schema_backup_20260316.sql

# 3. Restore data
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" < data_backup_20260316.sql

# 4. Verify
psql -c "SELECT COUNT(*) FROM commissions_runs;"

# 5. Restart services
```

---

**Agent**: 0B (Database Backup Agent)
**Status**: 📋 INSTRUCTIONS READY
**Action Required**: Run backup commands above
**Next Agent**: Proceed to Phase 1 after verification

---

**End of Backup Instructions**

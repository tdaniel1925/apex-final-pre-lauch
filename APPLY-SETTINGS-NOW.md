# ⚡ Quick Start - Apply Settings Migration

## The Problem
The initial migration file referenced `user_roles` table which doesn't exist.
Your system uses the `admins` table instead.

## ✅ The Fix
Use the **FIXED** migration file: `apply-settings-migration-FIXED.sql`

---

## 📋 How to Apply (2 Steps)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration
1. Open the file: `apply-settings-migration-FIXED.sql`
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Expected Result:
```
Settings system created successfully! 🎉
settings_created: 40
```

---

## ✅ Verification

After running the migration, verify it worked:

### Check Tables Created
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('system_settings', 'setting_audit_log');
```

Should return 2 rows.

### Check Settings Seeded
```sql
SELECT category, COUNT(*) as count
FROM system_settings
GROUP BY category
ORDER BY category;
```

Should show 8 categories with 40 total settings.

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('system_settings', 'setting_audit_log');
```

Should show 4 policies.

---

## 🚀 Access the Settings Page

After migration is applied:
1. Navigate to: `/admin/settings`
2. You should see the tabbed settings interface
3. Try changing a setting and clicking "Save Changes"

---

## 🔧 What Was Fixed

**Before (BROKEN):**
```sql
EXISTS (
  SELECT 1 FROM user_roles  -- ❌ Table doesn't exist
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
)
```

**After (FIXED):**
```sql
EXISTS (
  SELECT 1 FROM admins  -- ✅ Correct table
  WHERE admins.auth_user_id = auth.uid()
  AND admins.is_active = true
)
```

---

## 📂 Files

- ✅ **apply-settings-migration-FIXED.sql** ← USE THIS ONE
- ❌ **apply-settings-migration-manually.sql** ← OLD (broken)
- ✅ **supabase/migrations/20260316100000_create_system_settings.sql** ← Also fixed

---

## 🆘 Troubleshooting

### Error: "relation 'admins' does not exist"
**Solution:** Your admins table might not be created yet. Check:
```sql
SELECT * FROM admins LIMIT 1;
```

If this errors, you need to create the admins table first.

### Error: Permission denied
**Solution:** Make sure you're running this as a superuser/admin in Supabase.

### Settings page shows error
**Solution:**
1. Check browser console for errors
2. Verify you're logged in as an admin
3. Check that RLS policies were created correctly

---

## ✅ Success Checklist

- [ ] Migration ran without errors
- [ ] 40 settings created in database
- [ ] 4 RLS policies created
- [ ] Can access `/admin/settings` page
- [ ] Can see all 8 category tabs
- [ ] Can edit and save a setting
- [ ] Settings persist after page refresh

---

**If you get stuck, share the exact error message and I'll help debug!**

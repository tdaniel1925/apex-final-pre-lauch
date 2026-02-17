# Phase 1 Complete - Database Migration Instructions

## 📋 What This Does (Plain English)

This migration adds **licensing status tracking** to your distributor accounts. It:

1. **Adds columns to track**:
   - Whether they're licensed or not
   - When they made that choice
   - Whether admin verified their license (for licensed only)
   - Who verified it and when

2. **Creates a feature gating system**:
   - A table that defines which features are available to licensed vs non-licensed
   - Easy to add new features later
   - Central control point

## 🚀 How to Apply This Migration

### Option 1: Supabase Dashboard (Recommended - 2 minutes)

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/sql/new

2. **Copy the SQL**:
   - Open the file: `supabase/migrations/20240220000000_add_licensing_status.sql`
   - Copy ALL the SQL code

3. **Paste and Run**:
   - Paste into the SQL Editor
   - Click "RUN" button (bottom right)
   - You should see "Success" message

4. **Verify**:
   - Go to Table Editor: https://supabase.com/dashboard/project/brejvdvzwshroxkkhmzy/editor
   - Click on `distributors` table
   - Scroll right - you should see new columns:
     - `licensing_status`
     - `licensing_status_set_at`
     - `licensing_verified`
     - `licensing_verified_at`
     - `licensing_verified_by`
   - Also check for new table: `feature_access_rules`

### Option 2: Command Line (If you prefer)

```bash
cd "C:\dev\1 - New Apen 1 Site\apex-affinity-group"
npx supabase db push
```

*(Note: Requires Supabase CLI to be linked to your project)*

## ✅ What Happens After Migration

1. **Existing Distributors**:
   - All existing distributors will have `licensing_status = 'non_licensed'` (default)
   - You can manually update them in admin panel later

2. **New Signups**:
   - Will be asked to choose licensed/non-licensed during signup
   - Gets saved to their account permanently

3. **Feature Gating**:
   - The `feature_access_rules` table now defines what's available to whom
   - Easy to add new features - just insert a new row

## 📊 What's in the feature_access_rules Table

Current rules:
- `insurance_licensing_section` - Licensed: ✅ | Non-Licensed: ❌
- `insurance_license_upload` - Licensed: ✅ | Non-Licensed: ❌
- `commission_advanced` - Licensed: ✅ | Non-Licensed: ❌
- `training_materials` - Licensed: ✅ | Non-Licensed: ✅ (both)
- `lead_generation` - Licensed: ✅ | Non-Licensed: ✅ (both)
- `marketing_materials` - Licensed: ✅ | Non-Licensed: ✅ (both)

## 🔐 Security

- Row Level Security (RLS) is enabled on `feature_access_rules`
- Everyone can READ the rules (needed for UI to check access)
- Only admins can MODIFY the rules

## 🎯 Next Steps

After this migration is applied:
1. ✅ Database is ready
2. → Phase 2: Create the utility functions and hooks
3. → Phase 3: Create UI components (FeatureGate, badges)
4. → Phase 4: Update signup flow
5. → Phase 5: Update profile page
6. → Phase 6: Update admin panel

---

**Questions? Issues?** Let me know and I'll help troubleshoot!

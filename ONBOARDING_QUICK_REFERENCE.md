# Product Onboarding - Quick Reference Card

## 🚀 Quick Start

### Apply Migration First!
```bash
# Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard > SQL Editor
2. Copy: supabase/migrations/20260331000005_add_product_onboarding.sql
3. Paste and Execute

# Option 2: CLI
npx supabase db push --linked
```

---

## 📋 Admin Cheat Sheet

### View Products
```
URL: /admin/products
Look for: "Onboarding" column (blue/gray badges)
```

### Enable Onboarding
```
1. Click Edit (pencil icon)
2. Check "Require onboarding session after purchase"
3. Set duration (15-120 min)
4. Add instructions (optional)
5. Click "Update Service"
```

### Disable Onboarding
```
1. Click Edit (pencil icon)
2. Uncheck "Require onboarding session after purchase"
3. Click "Update Service"
```

### Create Product with Onboarding
```
1. Click "+ Add Service"
2. Fill basic info
3. Scroll to "Onboarding Settings"
4. Check the box + set duration
5. Click "Create Service"
```

---

## 🔍 Quick Verification

### Check Migration Applied
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products'
AND column_name = 'requires_onboarding';
-- Should return: requires_onboarding
```

### Check Current Products
```sql
SELECT name, requires_onboarding, onboarding_duration_minutes
FROM products ORDER BY name;
```

### Test API
```bash
# Check if PulseMarket requires onboarding
curl "https://your-domain.com/api/products/onboarding-check?slug=pulsemarket"

# Expected response:
{
  "requires_onboarding": true,
  "product": {
    "slug": "pulsemarket",
    "name": "PulseMarket",
    "onboarding_duration_minutes": 30
  }
}
```

---

## 🎯 Current Product Settings

| Product | Onboarding Required | Duration |
|---------|---------------------|----------|
| PulseMarket | ✅ Yes | 30 min |
| PulseFlow | ✅ Yes | 30 min |
| PulseDrive | ✅ Yes | 30 min |
| PulseCommand | ✅ Yes | 30 min |
| BusinessCenter | ❌ No | - |
| SmartLock | ❌ No | - |

---

## 🛠️ Troubleshooting

### Issue: Onboarding column doesn't show
**Fix:** Apply migration first (see top of card)

### Issue: "Column not found" error
**Fix:** Migration not applied yet. Run SQL in Supabase Dashboard.

### Issue: Success page doesn't redirect
**Fix:** Check browser console for API errors. Verify product slug is correct.

### Issue: Can't edit product
**Fix:** Ensure you're logged in as admin. Check permissions.

### Issue: Form validation errors
**Fix:** Duration must be 15-120. All required fields must be filled.

---

## 📞 Contact

- **Technical Issues:** Reference `PRODUCT_CATALOG_ENHANCEMENT.md`
- **UI Questions:** Reference `PRODUCT_CATALOG_UI_GUIDE.md`
- **Complete Details:** Reference `AGENT_12_COMPLETION_REPORT.md`

---

## 🔗 Key Files

| Type | File Path |
|------|-----------|
| Migration | `supabase/migrations/20260331000005_add_product_onboarding.sql` |
| Admin Page | `src/app/admin/products/page.tsx` |
| Form | `src/components/admin/ProductForm.tsx` |
| Edit Page | `src/app/admin/products/[id]/edit/page.tsx` |
| API Check | `src/app/api/products/onboarding-check/route.ts` |
| Success Page | `src/app/products/success/page.tsx` |

---

## ⚡ One-Liners

```bash
# Check TypeScript
npx tsc --noEmit

# View migration
cat supabase/migrations/20260331000005_add_product_onboarding.sql

# Start dev server
npm run dev
```

---

## 📊 Visual Reference

### Admin Table
```
Onboarding Column:
┌─────────────────┐
│  ✓ Required     │  ← Blue badge (onboarding on)
│  30 min         │
└─────────────────┘

┌─────────────────┐
│  ✗ Not Required │  ← Gray badge (onboarding off)
└─────────────────┘
```

### Form Section
```
Onboarding Settings
├─ ☑ Require onboarding session after purchase
├─ Duration: [30] minutes
└─ Instructions: [Optional notes...]
```

### Success Page (With Onboarding)
```
✓ Thank You for Your Purchase!
┌─────────────────────────────────┐
│ 📅 Schedule Your Onboarding    │
│ [Schedule Now] [Skip for Now]  │
└─────────────────────────────────┘
```

---

## ✅ Testing Checklist

Quick test sequence:
- [ ] Apply migration
- [ ] View /admin/products
- [ ] Edit one product - toggle onboarding on
- [ ] Create test purchase
- [ ] Verify success page shows booking prompt
- [ ] Test "Skip for Now" button

---

**Last Updated:** 2026-03-31
**Agent:** Agent 12
**Version:** 1.0

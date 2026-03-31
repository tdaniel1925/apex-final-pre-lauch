# QV/BV/GQV SYSTEM MIGRATION TRACKER

**Migration Date:** 2026-03-31
**Status:** IN PROGRESS
**Migration Type:** Credits → QV/BV/GQV System

---

## 📊 TERMINOLOGY CHANGE

| Old Term | New Term | Definition |
|----------|----------|------------|
| Credits | **QV** (Qualifying Volume) | Purchase price (what customer pays) |
| Credits | **BV** (Business Volume) | Remainder after waterfall (commission pool) |
| Group Credits | **GQV** (Group Qualifying Volume) | Sum of team's QV |
| N/A | **GBV** (Group Business Volume) | Sum of team's BV |

---

## 🎯 KEY CHANGES

1. **QV = Purchase Price** (e.g., $99 product → 99 QV)
2. **BV = After Waterfall** (e.g., $99 → ~$46 BV after BM 30%, Apex 30%, pools 5%)
3. **Rank Qualification:** Uses QV and GQV (not BV)
4. **Commissions:** Still 60% of BV pool
5. **50 QV Minimum:** Required for override eligibility (was 50 credits)

---

## ✅ MIGRATION PHASES

### PHASE 1: Single Source of Truth ⭐
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 1 (Revenue Waterfall)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 2 (Products & QV/BV)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 3 (Data Model)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 4 (Tech Ladder - QV/GQV)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 5 (Override - 50 QV min)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 7 (Cross-Credit)
- [ ] APEX_COMP_ENGINE_SPEC_FINAL.md - Section 9 (Commission Calc Order)

### PHASE 2: Database Schema (7 files)
- [ ] `supabase/migrations/20260331000001_qv_gqv_bv_system.sql` (NEW)
- [ ] `supabase/migrations/20260311000007_bv_recalculation_triggers.sql`
- [ ] `supabase/migrations/20260322100001_add_bv_tracking_fields.sql`
- [ ] `supabase/migrations/20260221000011_fix_snapshot_bv_calculation.sql`
- [ ] `supabase/migrations/20260221000005_commission_calculation_functions.sql`
- [ ] `supabase/migrations/20260221000003_products_and_orders.sql`
- [ ] `supabase/seed_test_commission_data.sql`

### PHASE 3: TypeScript Types (1 file)
- [ ] `src/db/schema.ts`

### PHASE 4: Core Calculation Libraries (7 files)
- [ ] `src/lib/compensation/qv-bv-calculator.ts` (NEW - rename from bv-calculator.ts)
- [ ] `src/lib/compensation/rank.ts`
- [ ] `src/lib/compensation/override-calculator.ts`
- [ ] `src/lib/compensation/override-resolution.ts`
- [ ] `src/lib/compensation/config.ts`
- [ ] `src/lib/compensation/config-loader.ts`
- [ ] `src/lib/compensation/bonus-programs.ts`
- [ ] `src/lib/compensation/clawback-processor.ts`

### PHASE 5: Order Processing (4 files)
- [ ] `src/app/api/webhooks/stripe/route.ts`
- [ ] `src/app/api/checkout/route.ts`
- [ ] `src/app/api/cart/add/route.ts`
- [ ] `src/lib/integrations/webhooks/process-sale.ts`

### PHASE 6: Compliance Systems (7 files)
- [ ] `src/lib/compliance/anti-frontloading.ts`
- [ ] `src/lib/compliance/retail-validation.ts`
- [ ] `src/lib/compliance/email-alerts.ts`
- [ ] `src/lib/email/templates/compliance-retail-warning.html`
- [ ] `src/lib/email/templates/compliance-frontloading-notice.html`
- [ ] `src/app/admin/compliance/page.tsx`
- [ ] `src/app/api/admin/compliance/overview/route.ts`

### PHASE 7: API Routes (8 files)
- [ ] `src/app/api/dashboard/team/route.ts`
- [ ] `src/app/api/dashboard/downline/route.ts`
- [ ] `src/app/api/dashboard/ai-chat/route.ts`
- [ ] `src/app/api/distributor/[id]/details/route.ts`
- [ ] `src/app/api/admin/matrix/tree/route.ts`
- [ ] `src/app/api/admin/compensation/leadership-pool/route.ts`
- [ ] `src/app/api/matrix/hybrid/route.ts`
- [ ] `src/lib/stripe/autopilot-helpers.ts`

### PHASE 8: UI Components (15 files)
- [ ] `src/app/dashboard/home/page.tsx`
- [ ] `src/app/dashboard/page.tsx`
- [ ] `src/app/dashboard/profile/page.tsx`
- [ ] `src/app/dashboard/team/page.tsx`
- [ ] `src/app/dashboard/genealogy/page.tsx`
- [ ] `src/app/cart/page.tsx`
- [ ] `src/components/dashboard/CompensationStatsWidget.tsx`
- [ ] `src/components/services/CartDrawer.tsx`
- [ ] `src/components/admin/hierarchy/NodeDetailPanel.tsx`
- [ ] `src/components/admin/hierarchy/MatrixNode.tsx`
- [ ] `src/components/admin/hierarchy/HierarchyCanvas.tsx`
- [ ] `src/app/admin/hierarchy/HierarchyCanvasClient.tsx`
- [ ] `src/components/matrix/MatrixNodeCard.tsx`
- [ ] `src/components/matrix/HybridMatrixView.tsx`
- [ ] `src/components/genealogy/TreeNodeCard.tsx`
- [ ] `src/components/genealogy/CompensationTreeView.tsx`
- [ ] `src/components/distributor/DistributorDetailsModal.tsx`

### PHASE 9: Tests (10 files)
- [ ] `tests/unit/compensation-calculator.test.ts`
- [ ] `tests/unit/compliance/anti-frontloading.test.ts`
- [ ] `tests/unit/compliance/retail-validation.test.ts`
- [ ] `tests/unit/api-team.test.ts`
- [ ] `tests/unit/api-matrix.test.ts`
- [ ] `tests/unit/api-genealogy.test.ts`
- [ ] `tests/unit/profile-settings.test.ts`
- [ ] `tests/e2e/signup-to-backoffice-flow.spec.ts`
- [ ] `tests/e2e/security-fixes.spec.ts`
- [ ] `tests/e2e/matrix-debug-charles-brian.spec.ts`

### PHASE 10: Admin Scripts (10 files)
- [ ] `scripts/check-compliance.ts`
- [ ] `scripts/test-compensation-fixes.ts`
- [ ] `scripts/create-test-distributor.ts`
- [ ] `scripts/create-test-member.ts`
- [ ] `scripts/add-test-team-data.ts`
- [ ] `scripts/add-retail-webhook-handler.ts`
- [ ] `scripts/fix-all-source-of-truth-violations.ts`
- [ ] `check_bv.ts` (rename to check_qv_bv.ts)
- [ ] `check_orders.ts`
- [ ] `src/lib/chatbot/activity-monitor.ts`

### PHASE 11: Documentation (20+ files)
- [ ] `CLAUDE.md`
- [ ] `PULSE-PRODUCTS-REFERRAL-SYSTEM.md`
- [ ] `TECH-LADDER-SPEC-REFERENCE.md`
- [ ] `COMP-PLAN-VERIFICATION.md`
- [ ] `COMP-PLAN-VERIFICATION-COMPLETE.md`
- [ ] `FTC-COMPLIANCE-IMPLEMENTATION.md`
- [ ] `FTC-COMPLIANCE-INTEGRATION-COMPLETE.md`
- [ ] `SOURCE-OF-TRUTH-ENFORCEMENT.md`
- [ ] `DUAL-TREE-SYSTEM.md`
- [ ] `BV-CALCULATION-REFERENCE.md`
- [ ] `BV_CALCULATION_INVESTIGATION_REPORT.md`
- [ ] `COMPENSATION-ENGINE-PORTED.md`
- [ ] `COMPENSATION-FIXES-IMPLEMENTED.md`
- [ ] `STRIPE-PRICING-UPDATE-GUIDE.md`
- [ ] `RETAIL-SALES-IMPLEMENTATION-PLAN.md`
- [ ] `SHOPPING-CART-SETUP.md`
- [ ] `INTEGRATION-TEST-PLAN.md`
- [ ] `INTEGRATION-TESTING-QUICK-START.md`
- [ ] `SCHEMA-WIRING-REFERENCE.md`
- [ ] `REP-BACK-OFFICE-WIRING-MAP.md`
- [ ] `docs/INTEGRATION_QUICKSTART.md`
- [ ] `docs/webhooks/EXTERNAL_PLATFORM_WEBHOOKS.md`
- [ ] `PRD/BUILD-DECISIONS.md`

---

## 📊 MIGRATION STATISTICS

- **Total Files to Update:** 100+
- **Database Migrations:** 7
- **TypeScript Files:** 50+
- **Test Files:** 10
- **Documentation Files:** 20+
- **Estimated Time:** 4-6 hours

---

## 🎯 TESTING CHECKLIST

After each phase:
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] No console errors in dev mode
- [ ] Database migrations run cleanly
- [ ] Existing tests pass (or updated to pass)
- [ ] Manual testing in dashboard

---

## ⚠️ ROLLBACK PLAN

If migration fails:
1. Revert database migration
2. Restore `APEX_COMP_ENGINE_SPEC_FINAL.md` from git
3. Revert TypeScript schema changes
4. Clear browser cache/localStorage

---

## 📝 NOTES

- **No backwards compatibility needed** - No sales or ranks assigned yet
- **Commission formula unchanged** - Still 60% of BV
- **QV used for rank qualification** - Not BV
- **BV used for commissions** - Not QV

---

**Last Updated:** 2026-03-31
**Updated By:** Claude Code

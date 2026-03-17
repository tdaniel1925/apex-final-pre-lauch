-- =============================================
-- MIGRATION: Remove Insurance-to-Tech Cross-Credit
-- Date: 2026-03-16
-- Priority: CRITICAL - LEGAL COMPLIANCE
-- =============================================
--
-- PURPOSE: Remove illegal insurance-to-tech cross-credit feature
--
-- LEGAL ISSUE:
-- The "insurance_to_tech_credit_pct" column allows non-licensed members
-- to benefit from insurance sales, violating state insurance licensing
-- laws in all 50 states.
--
-- VIOLATION: State insurance codes prohibit ANY compensation (direct or
-- indirect) for insurance sales by non-licensed persons. "Indirect"
-- includes credits that help with rank qualification and bonuses.
--
-- See: LEGAL-COMPLIANCE-MEMO.md for full legal analysis
--
-- =============================================

-- =============================================
-- REMOVE ILLEGAL COLUMN
-- =============================================

-- Remove insurance-to-tech cross-credit percentage column
-- This column enabled 0.5% conversion of insurance sales to tech credits
-- which would flow to non-licensed upline members (ILLEGAL)
ALTER TABLE public.members
DROP COLUMN IF EXISTS insurance_to_tech_credit_pct;

-- =============================================
-- WHAT REMAINS LEGAL
-- =============================================

-- ✅ LEGAL: tech_to_insurance_credit_pct (opposite direction)
-- Licensed agents CAN benefit from their tech product sales
-- This is legal because the licensed person is simply expanding
-- their product line, not receiving compensation for unlicensed activity

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Verify column is removed:
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'members'
-- AND column_name LIKE '%insurance_to_tech%';
--
-- Expected result: 0 rows (column should not exist)

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON COLUMN public.members.tech_to_insurance_credit_pct IS
'LEGAL one-way cross-credit: Licensed agents can use tech sales for insurance ladder qualification.
This is permitted because licensed agents are expanding their product line.
ILLEGAL reverse direction (insurance → tech) has been removed for compliance.';

-- =============================================
-- END OF MIGRATION
-- =============================================

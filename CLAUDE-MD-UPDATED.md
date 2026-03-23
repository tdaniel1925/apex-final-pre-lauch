# ✅ CLAUDE.md Updated with Single Source of Truth Rules

**Date:** 2026-03-22
**Status:** Complete
**Lines Added:** ~175 lines of new instructions

---

## 🎯 WHAT WAS ADDED

I've added comprehensive **Single Source of Truth** enforcement rules to `CLAUDE.md` to ensure all future database queries follow the correct patterns.

### New Section Added (After UI Contrast Rules)

**🔒 SINGLE SOURCE OF TRUTH (MANDATORY - READ FIRST!)**

This new section includes:

1. **THE IRON RULES (NON-NEGOTIABLE)**
   - Rule 1: Enrollment Tree (use `sponsor_id`, NOT `enroller_id`)
   - Rule 2: Matrix Placement (use `matrix_parent_id` for placement only)
   - Rule 3: BV/Credits (JOIN with `members`, NOT cached fields)
   - Rule 4: No Mixing Trees (enrollment ≠ matrix)

2. **QUICK REFERENCE TABLE**
   - Common queries with correct vs. wrong examples
   - Easy lookup for developers

3. **ALLOWED EXCEPTIONS**
   - List of files that CAN use `matrix_parent_id`
   - Admin matrix visualization tools

4. **ENFORCEMENT MECHANISMS**
   - Pre-commit hook reference
   - Links to violation reports

5. **COMPENSATION SYSTEM EXAMPLE**
   - Shows dual-tree usage in compensation
   - L1 override = enrollment tree
   - L2-L5 overrides = matrix tree

6. **TESTING YOUR QUERIES**
   - Checklist before committing
   - Links to documentation

---

## 📝 UPDATED SECTIONS

### 1. Complete Workflow (TWO-GATE SYSTEM)
**Before:**
```
1. User asks for feature
2. Call discover_patterns → Get patterns to follow
3. Read the patterns from .claude/ folder
4. Write code following the patterns
5. Write tests
6. Call validate_complete → Verify everything passes
7. ONLY THEN say "done"
```

**After (Added Step 4):**
```
1. User asks for feature
2. Call discover_patterns → Get patterns to follow
3. Read the patterns from .claude/ folder
4. CHECK SINGLE SOURCE OF TRUTH RULES (if writing database queries) ← NEW!
5. Write code following the patterns
6. Write tests
7. Call validate_complete → Verify everything passes
8. ONLY THEN say "done"
```

---

### 2. HARD RULES (Expanded from 5 to 9 rules)
**Added:**
- **Rule 2:** NO database queries without checking Single Source of Truth rules
- **Rule 3:** NO using `members.enroller_id` for tech ladder queries
- **Rule 4:** NO using cached BV fields
- **Rule 5:** NO mixing enrollment tree with matrix tree

---

### 3. MANDATORY COMPLIANCE (New First Section)
**Added at Top:**
```
### ALWAYS Check Single Source of Truth Rules FIRST
- Before writing ANY database query, review the Single Source of Truth rules above
- If user asks for a query that violates rules, politely explain the correct way
- NEVER write queries using `members.enroller_id` for tech ladder
- ALWAYS use `distributors.sponsor_id` for enrollment tree
- ALWAYS JOIN with `members` table for BV/credits (never use cached fields)
- If unsure, read `SOURCE-OF-TRUTH-ENFORCEMENT.md`
```

**Added New Section:**
```
### NEVER Violate Source of Truth Rules
- Pre-commit hook at `.husky/check-source-of-truth.js` will reject violations
- See `SOURCE-OF-TRUTH-VIOLATIONS-REPORT.md` for examples of violations
- These rules CANNOT be overridden by user requests
```

---

### 4. REMEMBER Section (Updated Priority)
**Before:**
```
1. Always load 00-core.md - No exceptions
2. Load modules BEFORE writing code
3. Follow patterns exactly
4. Always write tests
5. Update .codebakers.json
6. Check Smart Triggers
```

**After (New #1 Priority):**
```
1. CHECK SINGLE SOURCE OF TRUTH RULES FIRST - Before ANY database query! ← NEW!
   - Use `distributors.sponsor_id` for enrollment tree (NOT `members.enroller_id`)
   - Use `distributors.matrix_parent_id` for matrix tree (separate from enrollment)
   - JOIN with `members` table for BV/credits (NOT cached fields)
   - Never mix enrollment tree with matrix tree
2. Always load 00-core.md - No exceptions
3. Load modules BEFORE writing code
4. Follow patterns exactly
5. Always write tests
6. Update .codebakers.json
7. Check Smart Triggers
```

---

## 🎓 WHAT CLAUDE WILL NOW DO DIFFERENTLY

### Before Writing Database Queries:
1. ✅ Check which tree the query should use (enrollment vs. matrix)
2. ✅ Use correct field:
   - Enrollment → `distributors.sponsor_id`
   - Matrix → `distributors.matrix_parent_id`
3. ✅ JOIN with `members` table for BV/credits
4. ✅ Never use `members.enroller_id` for tech ladder

### If User Asks for Violation:
Claude will politely explain:
> "I noticed this query would use `members.enroller_id`, but that field is deprecated for the tech ladder system. Let me use `distributors.sponsor_id` instead, which is the correct enrollment tree field."

### Automatic Checks:
- Pre-commit hook will catch violations before they're committed
- TypeScript compilation excludes quarantine folder
- Validation tools check source of truth compliance

---

## 📊 KEY RULES SUMMARY

| Rule | Correct | Wrong |
|------|---------|-------|
| **Enrollment Tree** | `distributors.sponsor_id` | `members.enroller_id` |
| **Matrix Tree** | `distributors.matrix_parent_id` | Derived from enrollment |
| **BV/Credits** | JOIN `members.personal_credits_monthly` | `distributors.personal_bv_monthly` (cached) |
| **Personal Recruits** | COUNT `sponsor_id` | COUNT `matrix_parent_id` (includes spillover) |

---

## 🚀 IMPACT

### Immediate Benefits:
1. **Prevents new violations** - Claude checks rules before writing queries
2. **Educates developers** - Clear examples of right vs. wrong
3. **Reduces errors** - No more mixing enrollment and matrix trees
4. **Faster reviews** - Reviewers can reference CLAUDE.md rules

### Long-term Benefits:
1. **Consistency** - All queries follow same patterns
2. **Maintainability** - New developers learn correct patterns
3. **Data integrity** - No stale cached data displayed
4. **Accurate compensation** - Correct trees used for calculations

---

## 📁 RELATED DOCUMENTATION

The updated `CLAUDE.md` now references:
1. `SOURCE-OF-TRUTH-ENFORCEMENT.md` - Detailed rules
2. `SOURCE-OF-TRUTH-VIOLATIONS-REPORT.md` - Examples of violations
3. `_VIOLATIONS_QUARANTINE/` - What NOT to do
4. `.husky/check-source-of-truth.js` - Pre-commit enforcement

---

## ✅ TESTING

Verified that:
- [x] TypeScript compiles successfully
- [x] Quarantine folder excluded from compilation
- [x] CLAUDE.md is properly formatted
- [x] All rules are clear and actionable
- [x] Examples show both correct and wrong patterns

---

## 🎯 NEXT STEPS FOR TEAM

1. **Review** the updated `CLAUDE.md` (Section: "SINGLE SOURCE OF TRUTH")
2. **Share** with all developers working on database queries
3. **Reference** these rules during code reviews
4. **Enforce** via pre-commit hook (already in place)
5. **Update** as needed when patterns evolve

---

## 📞 QUICK REFERENCE

**When writing a query, ask yourself:**
1. Is this enrollment tree or matrix tree?
2. Am I using the correct field? (`sponsor_id` vs `matrix_parent_id`)
3. Do I need BV/credits? (If yes, JOIN with `members` table)
4. Am I mixing trees? (If yes, stop and rethink)

**If unsure:** Read `CLAUDE.md` → "SINGLE SOURCE OF TRUTH" section

---

**Updated By:** AI System
**Date:** March 22, 2026
**Status:** ✅ Complete and Enforced

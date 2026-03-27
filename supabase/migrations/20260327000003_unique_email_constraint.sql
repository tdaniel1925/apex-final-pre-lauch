-- =============================================
-- Email Unique Constraint
-- Security Fix #4: Prevents duplicate emails
-- =============================================
-- Migration: Add UNIQUE constraint on distributors.email
-- Date: 2026-03-27
-- Purpose: Prevent duplicate email addresses that break authentication

-- =============================================
-- 1. CHECK FOR EXISTING DUPLICATES
-- =============================================

DO $$
DECLARE
  duplicate_count INT;
BEGIN
  -- Count distributors with duplicate emails
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM distributors
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  ) duplicates;

  -- If duplicates exist, fail with helpful message
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Cannot add UNIQUE constraint: % duplicate email(s) exist. To find duplicates, run: SELECT email, COUNT(*) as cnt, array_agg(id) as distributor_ids FROM distributors WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;', duplicate_count;
  END IF;

  RAISE NOTICE 'No duplicate emails found. Proceeding with UNIQUE constraint.';
END $$;

-- =============================================
-- 2. ADD UNIQUE CONSTRAINT
-- =============================================

-- Add UNIQUE constraint on email field
-- This creates an index automatically for fast lookups
ALTER TABLE distributors
ADD CONSTRAINT distributors_email_key UNIQUE (email);

-- =============================================
-- 3. ADD HELPFUL COMMENTS
-- =============================================

COMMENT ON CONSTRAINT distributors_email_key ON distributors IS
  'Security Fix #4: Ensures email addresses are unique across all distributors. Prevents authentication conflicts and data integrity violations.';

-- =============================================
-- 4. VERIFY CONSTRAINT EXISTS
-- =============================================

DO $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'distributors'::regclass
    AND conname = 'distributors_email_key'
  ) INTO constraint_exists;

  IF constraint_exists THEN
    RAISE NOTICE '✅ UNIQUE constraint successfully created on distributors.email';
  ELSE
    RAISE EXCEPTION '❌ UNIQUE constraint was not created';
  END IF;
END $$;


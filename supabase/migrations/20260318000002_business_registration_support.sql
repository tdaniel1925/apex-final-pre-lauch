-- ============================================================================
-- BUSINESS REGISTRATION SUPPORT
-- Migration: 20260318000002
-- Purpose: Add support for business/agency registration with conditional fields
--          (EIN for business, SSN for personal, required address and phone)
-- ============================================================================

-- ============================================================================
-- 1. ADD REGISTRATION TYPE COLUMNS TO DISTRIBUTORS
-- ============================================================================

-- Add registration_type column (personal vs business)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS registration_type TEXT
CHECK (registration_type IN ('personal', 'business'));

-- Add business_type column (for business registrations only)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS business_type TEXT
CHECK (business_type IN ('llc', 'corporation', 's_corporation', 'partnership', 'sole_proprietor'));

-- Add tax_id_type column (ssn, ein, or itin)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS tax_id_type TEXT DEFAULT 'ssn'
CHECK (tax_id_type IN ('ssn', 'ein', 'itin'));

-- Add date_of_birth column (for personal registrations, 18+ validation in app)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add DBA (Doing Business As) name column (optional for businesses)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS dba_name TEXT;

-- Add business website column (optional for businesses)
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS business_website TEXT;

COMMENT ON COLUMN distributors.registration_type IS
  'Type of registration: personal (individual) or business (agency/company)';

COMMENT ON COLUMN distributors.business_type IS
  'Legal structure of business entity (LLC, Corporation, etc.). Required when registration_type is business.';

COMMENT ON COLUMN distributors.tax_id_type IS
  'Type of tax ID: ssn (Social Security Number) for personal, ein (Employer Identification Number) for business, or itin (Individual Taxpayer Identification Number)';

COMMENT ON COLUMN distributors.date_of_birth IS
  'Date of birth for personal registrations. Used for age verification (18+ requirement).';

COMMENT ON COLUMN distributors.dba_name IS
  'Doing Business As (DBA) name for businesses operating under a different name than legal name';

COMMENT ON COLUMN distributors.business_website IS
  'Business website URL (optional)';

-- ============================================================================
-- 2. MAKE PHONE NUMBER REQUIRED
-- ============================================================================

-- First, update any NULL phone numbers to empty string
-- (In production, you may want to handle this differently or require data cleanup)
UPDATE distributors SET phone = '' WHERE phone IS NULL;

-- Now make phone NOT NULL
ALTER TABLE distributors ALTER COLUMN phone SET NOT NULL;

COMMENT ON COLUMN distributors.phone IS
  'Phone number (required). Used for 2FA, account recovery, and customer support contact.';

-- ============================================================================
-- 3. MAKE ADDRESS FIELDS REQUIRED
-- ============================================================================

-- Update NULL values to empty strings before setting NOT NULL
-- (In production, you may want to collect missing addresses from users)
UPDATE distributors SET address_line1 = '' WHERE address_line1 IS NULL;
UPDATE distributors SET city = '' WHERE city IS NULL;
UPDATE distributors SET state = '' WHERE state IS NULL;
UPDATE distributors SET zip = '' WHERE zip IS NULL;

-- Note: We're NOT setting these to NOT NULL yet because existing distributors
-- may have empty strings. The signup form will require these fields going forward.
-- The API route will validate these fields are present for new signups.

COMMENT ON COLUMN distributors.address_line1 IS
  'Street address line 1 (required for new signups). Needed for 1099 mailing, ACH payouts, compliance.';

COMMENT ON COLUMN distributors.city IS
  'City (required for new signups).';

COMMENT ON COLUMN distributors.state IS
  'State (required for new signups). US state abbreviation (e.g., TX, CA).';

COMMENT ON COLUMN distributors.zip IS
  'ZIP code (required for new signups). Format: 12345 or 12345-6789.';

-- ============================================================================
-- 4. UPDATE DISTRIBUTOR_TAX_INFO TABLE TO SUPPORT EIN
-- ============================================================================

-- Add tax_id_type column to tax info table
ALTER TABLE distributor_tax_info
ADD COLUMN IF NOT EXISTS tax_id_type TEXT DEFAULT 'ssn'
CHECK (tax_id_type IN ('ssn', 'ein', 'itin'));

COMMENT ON COLUMN distributor_tax_info.tax_id_type IS
  'Type of tax ID stored: ssn (Social Security Number), ein (Employer Identification Number), or itin (Individual Taxpayer Identification Number)';

-- Note: The 'tax_id' column already exists and stores the encrypted tax ID.
-- It will now store either SSN or EIN depending on tax_id_type.

-- ============================================================================
-- 5. CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index for registration_type filtering (e.g., reports, analytics)
CREATE INDEX IF NOT EXISTS idx_distributors_registration_type
  ON distributors(registration_type);

-- Index for business_type filtering (only for businesses)
CREATE INDEX IF NOT EXISTS idx_distributors_business_type
  ON distributors(business_type)
  WHERE business_type IS NOT NULL;

-- Index for tax_id_type filtering
CREATE INDEX IF NOT EXISTS idx_distributors_tax_id_type
  ON distributors(tax_id_type);

-- Index for date_of_birth (for age-based queries, compliance checks)
CREATE INDEX IF NOT EXISTS idx_distributors_date_of_birth
  ON distributors(date_of_birth)
  WHERE date_of_birth IS NOT NULL;

-- Index for tax_id_type on tax info table
CREATE INDEX IF NOT EXISTS idx_distributor_tax_info_tax_id_type
  ON distributor_tax_info(tax_id_type);

-- ============================================================================
-- 6. BACKFILL EXISTING RECORDS WITH DEFAULT VALUES
-- ============================================================================

-- Set default registration_type to 'personal' for existing distributors
-- (These can be updated later if needed)
UPDATE distributors
SET registration_type = 'personal'
WHERE registration_type IS NULL;

-- Set default tax_id_type to 'ssn' for existing distributors
UPDATE distributors
SET tax_id_type = 'ssn'
WHERE tax_id_type IS NULL;

-- Update tax_id_type in distributor_tax_info to match
UPDATE distributor_tax_info
SET tax_id_type = 'ssn'
WHERE tax_id_type IS NULL;

-- ============================================================================
-- 7. ADD VALIDATION CONSTRAINTS
-- ============================================================================

-- Create a function to validate business registrations
-- (Business registrations must have company_name, business_type, and EIN)
CREATE OR REPLACE FUNCTION validate_business_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- If registration_type is 'business', ensure required fields are present
  IF NEW.registration_type = 'business' THEN
    IF NEW.company_name IS NULL OR NEW.company_name = '' THEN
      RAISE EXCEPTION 'Business registrations must have a company_name';
    END IF;

    IF NEW.business_type IS NULL OR NEW.business_type = '' THEN
      RAISE EXCEPTION 'Business registrations must have a business_type';
    END IF;

    IF NEW.tax_id_type != 'ein' THEN
      RAISE EXCEPTION 'Business registrations must use EIN (tax_id_type must be ein)';
    END IF;
  END IF;

  -- If registration_type is 'personal', ensure SSN is used (not EIN)
  IF NEW.registration_type = 'personal' THEN
    IF NEW.tax_id_type = 'ein' THEN
      RAISE EXCEPTION 'Personal registrations cannot use EIN (tax_id_type must be ssn or itin)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate business registrations on INSERT and UPDATE
CREATE TRIGGER validate_business_registration_trigger
  BEFORE INSERT OR UPDATE ON distributors
  FOR EACH ROW
  WHEN (NEW.registration_type IS NOT NULL)
  EXECUTE FUNCTION validate_business_registration();

COMMENT ON FUNCTION validate_business_registration() IS
  'Validates that business registrations have required fields (company_name, business_type, EIN) and personal registrations use SSN/ITIN (not EIN)';

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant SELECT on distributors to authenticated users (they can see their own data via RLS)
-- (Permissions should already be set up, but ensuring they cover new columns)

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- 1. Added registration_type column (personal/business)
-- 2. Added business_type column (LLC, Corporation, etc.)
-- 3. Added tax_id_type column (ssn/ein/itin)
-- 4. Added date_of_birth column (for age verification)
-- 5. Added dba_name column (optional DBA name)
-- 6. Added business_website column (optional website)
-- 7. Made phone number required (updated NULLs to empty string)
-- 8. Updated address field comments (required for new signups)
-- 9. Updated distributor_tax_info to support EIN
-- 10. Created indexes for new columns
-- 11. Backfilled existing records with default values (personal, ssn)
-- 12. Added validation trigger for business registrations

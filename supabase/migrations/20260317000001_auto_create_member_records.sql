-- =============================================
-- MIGRATION: Auto-Create Member Records
-- Date: 2026-03-17
-- =============================================
--
-- PURPOSE: Automatically create member record when distributor is created
--
-- PROBLEM:
-- Dashboard pages (Team, Matrix, Genealogy) expect member records to exist,
-- but the signup flow only creates distributor records, not member records.
--
-- SOLUTION:
-- 1. Create trigger to auto-create member record on distributor insert
-- 2. Backfill member records for existing distributors
--
-- =============================================

-- =============================================
-- TRIGGER FUNCTION: Auto-create member record
-- =============================================

CREATE OR REPLACE FUNCTION auto_create_member_record()
RETURNS TRIGGER AS $$
DECLARE
  v_enroller_member_id UUID;
  v_sponsor_member_id UUID;
BEGIN
  -- Find enroller's member_id (if they have one)
  IF NEW.enroller_id IS NOT NULL THEN
    SELECT member_id INTO v_enroller_member_id
    FROM public.members
    WHERE distributor_id = NEW.enroller_id
    LIMIT 1;
  END IF;

  -- Find sponsor's member_id (if they have one)
  IF NEW.sponsor_id IS NOT NULL THEN
    SELECT member_id INTO v_sponsor_member_id
    FROM public.members
    WHERE distributor_id = NEW.sponsor_id
    LIMIT 1;
  END IF;

  -- Create member record
  INSERT INTO public.members (
    distributor_id,
    email,
    full_name,
    enroller_id,
    sponsor_id,
    status,
    enrollment_date,
    tech_rank,
    highest_tech_rank,
    insurance_rank,
    highest_insurance_rank,
    personal_credits_monthly,
    team_credits_monthly,
    tech_personal_credits_monthly,
    tech_team_credits_monthly,
    insurance_personal_credits_monthly,
    insurance_team_credits_monthly,
    override_qualified
  ) VALUES (
    NEW.id,
    NEW.email,
    CONCAT(NEW.first_name, ' ', NEW.last_name),
    v_enroller_member_id,
    v_sponsor_member_id,
    'active',
    NEW.created_at,
    'starter',
    'starter',
    'inactive',
    'inactive',
    0,
    0,
    0,
    0,
    0,
    0,
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Create member on distributor insert
-- =============================================

DROP TRIGGER IF EXISTS create_member_on_distributor_insert ON public.distributors;

CREATE TRIGGER create_member_on_distributor_insert
  AFTER INSERT ON public.distributors
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_member_record();

-- =============================================
-- BACKFILL: Create member records for existing distributors
-- =============================================

INSERT INTO public.members (
  distributor_id,
  email,
  full_name,
  enroller_id,
  sponsor_id,
  status,
  enrollment_date,
  tech_rank,
  highest_tech_rank,
  insurance_rank,
  highest_insurance_rank,
  personal_credits_monthly,
  team_credits_monthly,
  tech_personal_credits_monthly,
  tech_team_credits_monthly,
  insurance_personal_credits_monthly,
  insurance_team_credits_monthly,
  override_qualified
)
SELECT
  d.id AS distributor_id,
  d.email,
  CONCAT(d.first_name, ' ', d.last_name) AS full_name,
  (SELECT m.member_id FROM public.members m WHERE m.distributor_id = d.enroller_id LIMIT 1) AS enroller_id,
  (SELECT m.member_id FROM public.members m WHERE m.distributor_id = d.sponsor_id LIMIT 1) AS sponsor_id,
  'active' AS status,
  d.created_at AS enrollment_date,
  'starter' AS tech_rank,
  'starter' AS highest_tech_rank,
  'inactive' AS insurance_rank,
  'inactive' AS highest_insurance_rank,
  0 AS personal_credits_monthly,
  0 AS team_credits_monthly,
  0 AS tech_personal_credits_monthly,
  0 AS tech_team_credits_monthly,
  0 AS insurance_personal_credits_monthly,
  0 AS insurance_team_credits_monthly,
  FALSE AS override_qualified
FROM public.distributors d
WHERE NOT EXISTS (
  SELECT 1 FROM public.members m WHERE m.distributor_id = d.id
)
ORDER BY d.created_at ASC;

-- =============================================
-- VERIFICATION
-- =============================================

-- Count distributors without member records (should be 0)
-- SELECT COUNT(*) FROM public.distributors d
-- WHERE NOT EXISTS (SELECT 1 FROM public.members m WHERE m.distributor_id = d.id);

-- Count members by rank
-- SELECT tech_rank, COUNT(*) FROM public.members GROUP BY tech_rank;

-- =============================================
-- END OF MIGRATION
-- =============================================

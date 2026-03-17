-- =============================================
-- SYNC members.enroller_id FROM distributors.sponsor_id
-- This fixes the data mismatch causing empty Matrix views
-- =============================================

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this entire file
-- 3. Paste and click "Run"
-- 4. Refresh Matrix page - should now see team members
-- =============================================

DO $$
DECLARE
  updated_count INTEGER := 0;
  apex_member_id UUID;
BEGIN
  -- Get Apex Vision's member_id (the root/master)
  SELECT member_id INTO apex_member_id
  FROM members m
  JOIN distributors d ON m.distributor_id = d.id
  WHERE d.is_master = true
  LIMIT 1;

  IF apex_member_id IS NULL THEN
    RAISE EXCEPTION 'Apex Vision member record not found';
  END IF;

  RAISE NOTICE 'Apex Vision member_id: %', apex_member_id;

  -- Update members.enroller_id based on distributors.sponsor_id
  -- For each member, find their sponsor's member_id
  UPDATE members m
  SET enroller_id = (
    SELECT sponsor_member.member_id
    FROM distributors d
    LEFT JOIN members sponsor_member ON sponsor_member.distributor_id = d.sponsor_id
    WHERE d.id = m.distributor_id
  )
  WHERE m.enroller_id IS NULL
    AND m.distributor_id IN (
      SELECT id FROM distributors WHERE sponsor_id IS NOT NULL
    );

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % member records with enroller_id', updated_count;

  -- Verify the update
  RAISE NOTICE 'Verifying update...';
  RAISE NOTICE 'Members with enroller_id = Apex Vision: %', (
    SELECT COUNT(*)
    FROM members
    WHERE enroller_id = apex_member_id
  );

  RAISE NOTICE 'Members with enroller_id = NULL: %', (
    SELECT COUNT(*)
    FROM members
    WHERE enroller_id IS NULL
  );

  RAISE NOTICE 'Total members: %', (SELECT COUNT(*) FROM members);

END $$;

-- Show sample of synced data
SELECT
  m.full_name as member_name,
  m.enroller_id as new_enroller_id,
  enroller.full_name as enroller_name,
  d.sponsor_id as old_sponsor_id,
  sponsor_dist.first_name || ' ' || sponsor_dist.last_name as sponsor_name
FROM members m
JOIN distributors d ON m.distributor_id = d.id
LEFT JOIN members enroller ON m.enroller_id = enroller.member_id
LEFT JOIN distributors sponsor_dist ON d.sponsor_id = sponsor_dist.id
WHERE m.enroller_id IS NOT NULL
ORDER BY d.rep_number
LIMIT 20;

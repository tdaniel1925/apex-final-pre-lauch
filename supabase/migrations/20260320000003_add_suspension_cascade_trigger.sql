-- =============================================
-- FIX: Suspension Cascade to Members Table
-- Date: 2026-03-20
-- Issue: Suspending distributor doesn't update members.status
-- Impact: Suspended reps continue receiving commissions
-- =============================================

-- Create function to sync distributor status changes to members table
CREATE OR REPLACE FUNCTION sync_distributor_status_to_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When distributor status changes, update corresponding members record
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.members
    SET
      status = CASE
        WHEN NEW.status = 'active' THEN 'active'
        WHEN NEW.status = 'suspended' THEN 'terminated'
        WHEN NEW.status = 'deleted' THEN 'terminated'
        ELSE 'inactive'
      END,
      termination_date = CASE
        WHEN NEW.status IN ('suspended', 'deleted') THEN NOW()
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE distributor_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on distributors table
DROP TRIGGER IF EXISTS distributors_status_sync_to_members ON distributors;

CREATE TRIGGER distributors_status_sync_to_members
AFTER UPDATE OF status ON distributors
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION sync_distributor_status_to_members();

COMMENT ON FUNCTION sync_distributor_status_to_members IS 'Automatically syncs distributor status changes to members table to ensure commission system excludes suspended/deleted reps.';
COMMENT ON TRIGGER distributors_status_sync_to_members ON distributors IS 'Triggers members.status update when distributor.status changes';

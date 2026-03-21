-- =====================================================
-- SmartOffice Auto-Create Trigger
-- Date: 2026-03-21
-- Description: Automatically create SmartOffice agent when new distributor signs up
-- =====================================================

-- Function to call our API endpoint when a new distributor is created
CREATE OR REPLACE FUNCTION trigger_smartoffice_agent_creation()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
BEGIN
  -- Only trigger for new distributors who have:
  -- 1. Email address (required for SmartOffice)
  -- 2. First and last name (required for SmartOffice)
  -- 3. Not already linked to SmartOffice

  IF NEW.email IS NOT NULL AND
     NEW.first_name IS NOT NULL AND
     NEW.last_name IS NOT NULL THEN

    -- Check if already has SmartOffice agent
    IF NOT EXISTS (
      SELECT 1 FROM smartoffice_agents
      WHERE apex_agent_id = NEW.id
    ) THEN
      -- Log that we should create SmartOffice agent
      -- In production, this would call a webhook or queue a job
      -- For now, we'll create a pending log entry that admin can process

      INSERT INTO smartoffice_sync_logs (
        sync_type,
        status,
        triggered_by,
        agents_synced,
        error_messages
      ) VALUES (
        'agent_create_pending',
        'pending',
        'auto-trigger',
        0,
        jsonb_build_object(
          'distributor_id', NEW.id,
          'email', NEW.email,
          'name', NEW.first_name || ' ' || NEW.last_name,
          'created_at', NEW.created_at,
          'note', 'Pending SmartOffice agent creation - call /api/admin/smartoffice/create-agent with distributorId=' || NEW.id
        )
      );

      RAISE NOTICE 'Queued SmartOffice agent creation for distributor: % (ID: %)',
        NEW.first_name || ' ' || NEW.last_name, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on distributors table
DROP TRIGGER IF EXISTS on_distributor_created_smartoffice ON distributors;

CREATE TRIGGER on_distributor_created_smartoffice
  AFTER INSERT ON distributors
  FOR EACH ROW
  EXECUTE FUNCTION trigger_smartoffice_agent_creation();

-- Add comment
COMMENT ON TRIGGER on_distributor_created_smartoffice ON distributors IS
  'Automatically queues SmartOffice agent creation when new distributor signs up';

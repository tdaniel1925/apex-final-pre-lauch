-- =====================================================
-- BV Recalculation Triggers
-- Phase 2.5: Real-time BV Updates
-- Author: Claude Code
-- Date: 2026-03-11
-- =====================================================

-- =====================================================
-- TRIGGER FUNCTION: Recalculate BV after order changes
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_bv()
RETURNS TRIGGER AS $$
DECLARE
  v_distributor_id UUID;
BEGIN
  -- Determine distributor_id based on operation
  IF TG_OP = 'DELETE' THEN
    v_distributor_id := OLD.distributor_id;
  ELSE
    v_distributor_id := NEW.distributor_id;
  END IF;

  -- Only recalculate if order is paid or payment status changed
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'paid' THEN
    -- New paid order - recalculate sponsor chain
    PERFORM recalculate_sponsor_chain(v_distributor_id);

  ELSIF TG_OP = 'UPDATE' AND (
    OLD.payment_status != NEW.payment_status OR
    OLD.total_bv != NEW.total_bv
  ) THEN
    -- Payment status or BV changed - recalculate sponsor chain
    PERFORM recalculate_sponsor_chain(v_distributor_id);

  ELSIF TG_OP = 'DELETE' THEN
    -- Order deleted - recalculate sponsor chain
    PERFORM recalculate_sponsor_chain(v_distributor_id);
  END IF;

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Recalculate BV on order insert
-- =====================================================

CREATE TRIGGER recalculate_bv_on_order_insert
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid')
  EXECUTE FUNCTION trigger_recalculate_bv();

-- =====================================================
-- TRIGGER: Recalculate BV on order update
-- =====================================================

CREATE TRIGGER recalculate_bv_on_order_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (
    OLD.payment_status IS DISTINCT FROM NEW.payment_status OR
    OLD.total_bv IS DISTINCT FROM NEW.total_bv
  )
  EXECUTE FUNCTION trigger_recalculate_bv();

-- =====================================================
-- TRIGGER: Recalculate BV on order delete
-- =====================================================

CREATE TRIGGER recalculate_bv_on_order_delete
  AFTER DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_bv();

-- =====================================================
-- Add indexes for performance
-- =====================================================

-- Index for orders by distributor_id and payment_status (for BV calculation)
CREATE INDEX IF NOT EXISTS idx_orders_distributor_payment_bv
  ON orders(distributor_id, payment_status, total_bv)
  WHERE payment_status IN ('paid', 'refunded');

-- Index for org_bv_cache lookups
-- Note: org_bv_cache uses 'rep_id' column name (not distributor_id)
CREATE INDEX IF NOT EXISTS idx_org_bv_cache_rep_id
  ON org_bv_cache(rep_id);

-- Index for distributor sponsor lookups (for chain traversal)
CREATE INDEX IF NOT EXISTS idx_distributors_sponsor_id
  ON distributors(sponsor_id)
  WHERE status = 'active';

-- =====================================================
-- Add notification trigger for rank changes
-- =====================================================

CREATE OR REPLACE FUNCTION notify_rank_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If rank changed, send notification
  IF OLD.rank IS DISTINCT FROM NEW.rank THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      read,
      created_at
    ) VALUES (
      NEW.id,
      'rank_promoted',
      'Congratulations on Your Promotion!',
      'You have been promoted to ' || NEW.rank || '! Your new commission rates are now active.',
      false,
      NOW()
    );

    -- Log rank change to audit_log
    INSERT INTO audit_log (
      action,
      actor_type,
      actor_id,
      table_name,
      record_id,
      details,
      timestamp
    ) VALUES (
      'rank_changed',
      'system',
      NULL,
      'distributors',
      NEW.id,
      jsonb_build_object(
        'old_rank', OLD.rank,
        'new_rank', NEW.rank,
        'triggered_by', 'bv_recalculation'
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rank change notifications
CREATE TRIGGER notify_rank_change_trigger
  AFTER UPDATE ON distributors
  FOR EACH ROW
  WHEN (OLD.rank IS DISTINCT FROM NEW.rank)
  EXECUTE FUNCTION notify_rank_change();

-- =====================================================
-- Performance note: Monitor trigger execution time
-- =====================================================

COMMENT ON FUNCTION trigger_recalculate_bv() IS
  'Automatically recalculates BV for rep and sponsor chain when orders change.
   Monitor performance - may need rate limiting for high-volume scenarios.';

COMMENT ON FUNCTION notify_rank_change() IS
  'Sends notification and logs audit entry when rep rank changes.';

-- Log trigger creation
INSERT INTO audit_log (
  action,
  actor_type,
  actor_id,
  table_name,
  record_id,
  details,
  timestamp
) VALUES (
  'bv_triggers_enabled',
  'system',
  NULL,
  'orders',
  NULL,
  jsonb_build_object(
    'triggers', ARRAY['recalculate_bv_on_order_insert', 'recalculate_bv_on_order_update', 'recalculate_bv_on_order_delete'],
    'description', 'Real-time BV recalculation triggers',
    'enabled_at', NOW()
  ),
  NOW()
);

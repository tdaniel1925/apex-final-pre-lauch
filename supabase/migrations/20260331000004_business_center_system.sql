-- =============================================
-- MIGRATION: Business Center System - Comprehensive Schema
-- Date: 2026-03-31
-- Priority: CRITICAL (Blocks Waves 3-8)
-- =============================================
--
-- PURPOSE: Create all tables needed for the Business Center system, including:
-- - Transaction tracking (product sales, subscriptions, commissions, refunds)
-- - Commission ledger (all commission calculations and payments)
-- - Client onboarding (appointment scheduling and tracking)
-- - Fulfillment kanban (8-stage client fulfillment pipeline)
-- - AI genealogy recommendations (daily AI-generated insights)
-- - Usage tracking (AI chatbot messages and voice minutes)
-- - Commission runs (monthly commission calculation tracking)
--
-- TABLES CREATED:
-- 1. transactions - All financial transactions
-- 2. commission_ledger - Commission calculations and payments
-- 3. client_onboarding - Customer onboarding appointments
-- 4. fulfillment_kanban - Client fulfillment pipeline tracking
-- 5. ai_genealogy_recommendations - AI-generated team insights
-- 6. usage_tracking - AI usage limits tracking
-- 7. commission_runs - Monthly commission run tracking
--
-- =============================================

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- TABLE 1: transactions
-- =============================================
-- Purpose: Log all financial transactions (product sales, subscriptions, commission payments)

CREATE TABLE IF NOT EXISTS transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'product_sale',
    'subscription_payment',
    'commission_payment',
    'refund'
  )),

  -- Amount
  amount DECIMAL(10,2) NOT NULL,

  -- Stripe Integration
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,

  -- Product Reference
  product_slug TEXT,

  -- Metadata (flexible JSON for additional data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for transactions
CREATE INDEX idx_transactions_distributor ON transactions(distributor_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_stripe_payment ON transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_transactions_stripe_subscription ON transactions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_transactions_status ON transactions(status);

-- Updated_at trigger
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE transactions IS 'All financial transactions including product sales, subscriptions, commission payments, and refunds';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: product_sale, subscription_payment, commission_payment, refund';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in USD (decimal format)';
COMMENT ON COLUMN transactions.metadata IS 'Flexible JSON field for additional transaction data';

-- =============================================
-- TABLE 2: commission_ledger
-- =============================================
-- Purpose: Track all commission calculations and payments

CREATE TABLE IF NOT EXISTS commission_ledger (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Commission Recipient
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Commission Source
  seller_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,

  -- Commission Type
  commission_type TEXT NOT NULL CHECK (commission_type IN (
    'seller_commission',
    'L1_enrollment',
    'L2_matrix',
    'L3_matrix',
    'L4_matrix',
    'L5_matrix',
    'L6_matrix',
    'L7_matrix',
    'rank_bonus',
    'bonus_pool',
    'leadership_pool'
  )),

  -- Override Level (1-7 for matrix levels)
  override_level INTEGER CHECK (override_level BETWEEN 1 AND 7),

  -- Amount Details
  amount DECIMAL(10,2) NOT NULL,
  bv_amount DECIMAL(10,2),

  -- Payment Status
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,

  -- Commission Run Reference
  commission_run_id UUID,
  commission_month TEXT, -- Format: 'YYYY-MM'

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for commission_ledger
CREATE INDEX idx_commission_ledger_distributor ON commission_ledger(distributor_id);
CREATE INDEX idx_commission_ledger_seller ON commission_ledger(seller_id);
CREATE INDEX idx_commission_ledger_transaction ON commission_ledger(transaction_id);
CREATE INDEX idx_commission_ledger_unpaid ON commission_ledger(distributor_id, paid) WHERE paid = false;
CREATE INDEX idx_commission_ledger_month ON commission_ledger(commission_month);
CREATE INDEX idx_commission_ledger_run ON commission_ledger(commission_run_id) WHERE commission_run_id IS NOT NULL;
CREATE INDEX idx_commission_ledger_type ON commission_ledger(commission_type);

-- Updated_at trigger
CREATE TRIGGER update_commission_ledger_updated_at
  BEFORE UPDATE ON commission_ledger
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE commission_ledger IS 'Track all commission calculations and payments for the dual-tree system';
COMMENT ON COLUMN commission_ledger.commission_type IS 'Type of commission: seller_commission, L1_enrollment (30%), L2-L7_matrix (varies by rank), rank_bonus, bonus_pool, leadership_pool';
COMMENT ON COLUMN commission_ledger.override_level IS 'Override level (1-7) for matrix commissions';
COMMENT ON COLUMN commission_ledger.commission_month IS 'Commission month in YYYY-MM format';

-- =============================================
-- TABLE 3: client_onboarding
-- =============================================
-- Purpose: Track customer onboarding appointments

CREATE TABLE IF NOT EXISTS client_onboarding (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who owns this client)
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Transaction Reference (the sale that triggered onboarding)
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,

  -- Client Information
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,

  -- Product Reference
  product_slug TEXT NOT NULL,

  -- Onboarding Appointment
  onboarding_date TIMESTAMPTZ,
  onboarding_duration_minutes INTEGER DEFAULT 30,

  -- Google Calendar Integration
  google_calendar_event_id TEXT,

  -- Meeting Link
  meeting_link TEXT DEFAULT 'https://meetings.dialpad.com/room/aicallers',

  -- Completion Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- No-Show Tracking
  no_show BOOLEAN DEFAULT false,

  -- Rescheduling
  rescheduled_from UUID REFERENCES client_onboarding(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for client_onboarding
CREATE INDEX idx_client_onboarding_distributor ON client_onboarding(distributor_id);
CREATE INDEX idx_client_onboarding_date ON client_onboarding(onboarding_date) WHERE onboarding_date IS NOT NULL;
CREATE INDEX idx_client_onboarding_pending ON client_onboarding(distributor_id, completed) WHERE completed = false;
CREATE INDEX idx_client_onboarding_email ON client_onboarding(client_email);
CREATE INDEX idx_client_onboarding_transaction ON client_onboarding(transaction_id);
CREATE INDEX idx_client_onboarding_product ON client_onboarding(product_slug);

-- Updated_at trigger
CREATE TRIGGER update_client_onboarding_updated_at
  BEFORE UPDATE ON client_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE client_onboarding IS 'Track customer onboarding appointments for AI product sales';
COMMENT ON COLUMN client_onboarding.onboarding_date IS 'Scheduled date/time for onboarding appointment';
COMMENT ON COLUMN client_onboarding.meeting_link IS 'Meeting link for onboarding call (default: DialPad)';
COMMENT ON COLUMN client_onboarding.rescheduled_from IS 'If this is a rescheduled appointment, references the original appointment';

-- =============================================
-- TABLE 4: fulfillment_kanban
-- =============================================
-- Purpose: Track client fulfillment through 8-stage pipeline

CREATE TABLE IF NOT EXISTS fulfillment_kanban (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client Onboarding Reference
  client_onboarding_id UUID REFERENCES client_onboarding(id) ON DELETE CASCADE,

  -- Distributor Reference (who owns this client)
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Client Information (denormalized for quick access)
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,

  -- Product Reference
  product_slug TEXT NOT NULL,

  -- Kanban Stage (8 stages)
  stage TEXT DEFAULT 'service_payment_made' CHECK (stage IN (
    'service_payment_made',
    'onboarding_date_set',
    'onboarding_complete',
    'pages_being_built',
    'social_media_proofs',
    'content_approved',
    'campaigns_launched',
    'service_completed'
  )),

  -- Stage Tracking
  moved_to_current_stage_at TIMESTAMPTZ DEFAULT now(),
  moved_by UUID REFERENCES admins(id),
  auto_transitioned BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT,

  -- Stage History (JSON array of stage transitions)
  stage_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fulfillment_kanban
CREATE INDEX idx_fulfillment_kanban_stage ON fulfillment_kanban(stage);
CREATE INDEX idx_fulfillment_kanban_distributor ON fulfillment_kanban(distributor_id);
CREATE INDEX idx_fulfillment_kanban_onboarding ON fulfillment_kanban(client_onboarding_id);
CREATE INDEX idx_fulfillment_kanban_active ON fulfillment_kanban(stage) WHERE stage != 'service_completed';
CREATE INDEX idx_fulfillment_kanban_product ON fulfillment_kanban(product_slug);

-- Updated_at trigger
CREATE TRIGGER update_fulfillment_kanban_updated_at
  BEFORE UPDATE ON fulfillment_kanban
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE fulfillment_kanban IS 'Track client fulfillment through 8-stage pipeline for AI product delivery';
COMMENT ON COLUMN fulfillment_kanban.stage IS '8 stages: service_payment_made, onboarding_date_set, onboarding_complete, pages_being_built, social_media_proofs, content_approved, campaigns_launched, service_completed';
COMMENT ON COLUMN fulfillment_kanban.stage_history IS 'JSON array of stage transitions with timestamps and notes';
COMMENT ON COLUMN fulfillment_kanban.auto_transitioned IS 'Whether this stage transition was automated or manual';

-- =============================================
-- TABLE 5: ai_genealogy_recommendations
-- =============================================
-- Purpose: Store daily AI-generated team insights and recommendations

CREATE TABLE IF NOT EXISTS ai_genealogy_recommendations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference (who receives this recommendation)
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Recommendation Content
  recommendation_text TEXT NOT NULL,

  -- Recommendation Type
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'rank_progress',
    'inactive_reps',
    'sales_opportunity',
    'team_growth',
    'commission_optimization',
    'training_needed'
  )),

  -- Priority
  priority TEXT DEFAULT 'medium' CHECK (priority IN (
    'low',
    'medium',
    'high',
    'urgent'
  )),

  -- Action Items (JSON array)
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Related Distributors (array of UUIDs)
  related_distributor_ids UUID[],

  -- Status
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- AI Model Used
  ai_model TEXT DEFAULT 'claude-sonnet-4',

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for ai_genealogy_recommendations
CREATE INDEX idx_ai_recommendations_distributor ON ai_genealogy_recommendations(distributor_id);
CREATE INDEX idx_ai_recommendations_active ON ai_genealogy_recommendations(distributor_id, dismissed, completed) WHERE dismissed = false AND completed = false;
CREATE INDEX idx_ai_recommendations_priority ON ai_genealogy_recommendations(priority, created_at DESC);
CREATE INDEX idx_ai_recommendations_type ON ai_genealogy_recommendations(recommendation_type);
CREATE INDEX idx_ai_recommendations_generated ON ai_genealogy_recommendations(generated_at DESC);

-- Comments
COMMENT ON TABLE ai_genealogy_recommendations IS 'Daily AI-generated team insights and recommendations for distributors';
COMMENT ON COLUMN ai_genealogy_recommendations.recommendation_type IS 'Type of recommendation: rank_progress, inactive_reps, sales_opportunity, team_growth, commission_optimization, training_needed';
COMMENT ON COLUMN ai_genealogy_recommendations.priority IS 'Recommendation priority: low, medium, high, urgent';
COMMENT ON COLUMN ai_genealogy_recommendations.action_items IS 'JSON array of actionable steps for the distributor';
COMMENT ON COLUMN ai_genealogy_recommendations.related_distributor_ids IS 'Array of distributor UUIDs related to this recommendation';

-- =============================================
-- TABLE 6: usage_tracking
-- =============================================
-- Purpose: Track AI chatbot messages and voice minutes for usage limits

CREATE TABLE IF NOT EXISTS usage_tracking (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Usage Type
  usage_type TEXT NOT NULL CHECK (usage_type IN (
    'ai_chatbot_message',
    'ai_voice_minute',
    'api_call'
  )),

  -- Amount (e.g., 1 message, 5.5 minutes)
  amount DECIMAL(10,2) NOT NULL DEFAULT 1.0,

  -- Metadata (flexible JSON for additional data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for usage_tracking
CREATE INDEX idx_usage_tracking_distributor ON usage_tracking(distributor_id);
CREATE INDEX idx_usage_tracking_daily ON usage_tracking(distributor_id, usage_type, DATE(created_at));
CREATE INDEX idx_usage_tracking_monthly ON usage_tracking(distributor_id, usage_type, DATE_TRUNC('month', created_at));
CREATE INDEX idx_usage_tracking_created ON usage_tracking(created_at DESC);
CREATE INDEX idx_usage_tracking_type ON usage_tracking(usage_type);

-- Comments
COMMENT ON TABLE usage_tracking IS 'Track AI chatbot messages and voice minutes for usage limits and billing';
COMMENT ON COLUMN usage_tracking.usage_type IS 'Type of usage: ai_chatbot_message, ai_voice_minute, api_call';
COMMENT ON COLUMN usage_tracking.amount IS 'Amount of usage (e.g., 1 message, 5.5 minutes)';
COMMENT ON COLUMN usage_tracking.metadata IS 'Flexible JSON field for additional usage data (e.g., model used, tokens consumed)';

-- =============================================
-- TABLE 7: commission_runs
-- =============================================
-- Purpose: Track monthly commission calculation runs

CREATE TABLE IF NOT EXISTS commission_runs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Commission Month (format: 'YYYY-MM')
  commission_month TEXT NOT NULL UNIQUE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled'
  )),

  -- Summary Statistics
  total_sales_amount DECIMAL(12,2) DEFAULT 0,
  total_bv_amount DECIMAL(12,2) DEFAULT 0,
  total_commissions_amount DECIMAL(12,2) DEFAULT 0,
  total_paid_amount DECIMAL(12,2) DEFAULT 0,
  distributors_paid INTEGER DEFAULT 0,
  transactions_processed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Run By (admin who initiated the run)
  run_by UUID REFERENCES admins(id),

  -- Error Log
  error_log TEXT,

  -- Metadata (flexible JSON for additional data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for commission_runs
CREATE INDEX idx_commission_runs_month ON commission_runs(commission_month DESC);
CREATE INDEX idx_commission_runs_status ON commission_runs(status);
CREATE INDEX idx_commission_runs_created ON commission_runs(created_at DESC);

-- Comments
COMMENT ON TABLE commission_runs IS 'Track monthly commission calculation runs with summary statistics';
COMMENT ON COLUMN commission_runs.commission_month IS 'Commission month in YYYY-MM format';
COMMENT ON COLUMN commission_runs.status IS 'Run status: pending, running, completed, failed, cancelled';
COMMENT ON COLUMN commission_runs.metadata IS 'Flexible JSON field for additional run data';

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_genealogy_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_runs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: Distributors can view their own data
-- =============================================

-- Transactions: Distributors can view own transactions
CREATE POLICY "Distributors can view own transactions"
  ON transactions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Commission Ledger: Distributors can view own commissions
CREATE POLICY "Distributors can view own commissions"
  ON commission_ledger FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Client Onboarding: Distributors can view own onboardings
CREATE POLICY "Distributors can view own onboardings"
  ON client_onboarding FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Client Onboarding: Distributors can update own onboardings
CREATE POLICY "Distributors can update own onboardings"
  ON client_onboarding FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Fulfillment Kanban: Distributors can view own fulfillment
CREATE POLICY "Distributors can view own fulfillment"
  ON fulfillment_kanban FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- AI Recommendations: Distributors can view own recommendations
CREATE POLICY "Distributors can view own recommendations"
  ON ai_genealogy_recommendations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- AI Recommendations: Distributors can update own recommendations (dismiss/complete)
CREATE POLICY "Distributors can update own recommendations"
  ON ai_genealogy_recommendations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Usage Tracking: Distributors can view own usage
CREATE POLICY "Distributors can view own usage"
  ON usage_tracking FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM distributors WHERE id = distributor_id
    )
  );

-- Commission Runs: All authenticated users can view (read-only)
CREATE POLICY "Authenticated users can view commission runs"
  ON commission_runs FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================
-- RLS POLICIES: Admins have full access
-- =============================================

-- Admins: Full access to transactions
CREATE POLICY "Admins have full access to transactions"
  ON transactions FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to commission_ledger
CREATE POLICY "Admins have full access to commission_ledger"
  ON commission_ledger FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to client_onboarding
CREATE POLICY "Admins have full access to client_onboarding"
  ON client_onboarding FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to fulfillment_kanban
CREATE POLICY "Admins have full access to fulfillment_kanban"
  ON fulfillment_kanban FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to ai_recommendations
CREATE POLICY "Admins have full access to ai_recommendations"
  ON ai_genealogy_recommendations FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to usage_tracking
CREATE POLICY "Admins have full access to usage_tracking"
  ON usage_tracking FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- Admins: Full access to commission_runs
CREATE POLICY "Admins have full access to commission_runs"
  ON commission_runs FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM admins
    )
  );

-- =============================================
-- VERIFICATION QUERIES (Commented Out)
-- =============================================

-- Verify all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
--   'transactions',
--   'commission_ledger',
--   'client_onboarding',
--   'fulfillment_kanban',
--   'ai_genealogy_recommendations',
--   'usage_tracking',
--   'commission_runs'
-- );

-- Count indexes:
-- SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN (
--   'transactions',
--   'commission_ledger',
--   'client_onboarding',
--   'fulfillment_kanban',
--   'ai_genealogy_recommendations',
--   'usage_tracking',
--   'commission_runs'
-- ) ORDER BY tablename, indexname;

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
--   'transactions',
--   'commission_ledger',
--   'client_onboarding',
--   'fulfillment_kanban',
--   'ai_genealogy_recommendations',
--   'usage_tracking',
--   'commission_runs'
-- );

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

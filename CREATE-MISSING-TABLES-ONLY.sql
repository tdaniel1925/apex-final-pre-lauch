-- =============================================
-- CREATE ONLY THE 3 MISSING TABLES
-- Safe to run - will skip if tables already exist
-- =============================================

-- =============================================
-- TABLE: CRM_PIPELINE
-- =============================================
CREATE TABLE IF NOT EXISTS crm_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Contact
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,

  -- Pipeline stage
  stage TEXT NOT NULL CHECK (stage IN (
    'prospect',
    'contacted',
    'demo_scheduled',
    'demo_completed',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost'
  )),

  -- Deal information
  deal_value NUMERIC(10, 2),
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,

  -- Tracking
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  days_in_stage INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for crm_pipeline
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_contact ON crm_pipeline(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stage ON crm_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_expected_close ON crm_pipeline(expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_pipeline_probability ON crm_pipeline(probability DESC) WHERE probability IS NOT NULL;

-- Enable RLS
ALTER TABLE crm_pipeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_pipeline' AND policyname = 'Distributors can create pipeline'
  ) THEN
    CREATE POLICY "Distributors can create pipeline"
      ON crm_pipeline FOR INSERT
      WITH CHECK (distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_pipeline' AND policyname = 'Distributors can view own pipeline'
  ) THEN
    CREATE POLICY "Distributors can view own pipeline"
      ON crm_pipeline FOR SELECT
      USING (distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_pipeline' AND policyname = 'Distributors can update own pipeline'
  ) THEN
    CREATE POLICY "Distributors can update own pipeline"
      ON crm_pipeline FOR UPDATE
      USING (distributor_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- TABLE: TRAINING_SHARES
-- =============================================
CREATE TABLE IF NOT EXISTS training_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sharer
  shared_by_distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Recipient
  shared_with_distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Training video (reference to training_videos table if it exists)
  training_video_id UUID,
  video_title TEXT,
  video_url TEXT,

  -- Tracking
  accessed BOOLEAN DEFAULT FALSE,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  watch_progress_percent INTEGER DEFAULT 0 CHECK (watch_progress_percent >= 0 AND watch_progress_percent <= 100),

  -- Personal message
  personal_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE (shared_by_distributor_id, shared_with_distributor_id, training_video_id)
);

-- Indexes for training_shares
CREATE INDEX IF NOT EXISTS idx_training_shares_shared_with ON training_shares(shared_with_distributor_id);
CREATE INDEX IF NOT EXISTS idx_training_shares_video ON training_shares(training_video_id);
CREATE INDEX IF NOT EXISTS idx_training_shares_accessed ON training_shares(accessed);
CREATE INDEX IF NOT EXISTS idx_training_shares_completed ON training_shares(completed);

-- Enable RLS
ALTER TABLE training_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_shares' AND policyname = 'Distributors can view shares received'
  ) THEN
    CREATE POLICY "Distributors can view shares received"
      ON training_shares FOR SELECT
      USING (shared_with_distributor_id = auth.uid() OR shared_by_distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_shares' AND policyname = 'Distributors can create shares'
  ) THEN
    CREATE POLICY "Distributors can create shares"
      ON training_shares FOR INSERT
      WITH CHECK (shared_by_distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_shares' AND policyname = 'Distributors can update received shares'
  ) THEN
    CREATE POLICY "Distributors can update received shares"
      ON training_shares FOR UPDATE
      USING (shared_with_distributor_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- TABLE: SOCIAL_POSTS
-- =============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,

  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter', 'tiktok')),

  -- Content
  post_text TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],

  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posting', 'posted', 'failed')),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,

  -- Platform response
  platform_post_id TEXT,
  platform_response JSONB,

  -- Engagement
  engagement_metrics JSONB DEFAULT '{}'::jsonb,
  last_metrics_update TIMESTAMPTZ,

  -- Flyer integration
  is_flyer_post BOOLEAN DEFAULT FALSE,
  event_flyer_id UUID REFERENCES event_flyers(id) ON DELETE SET NULL,

  -- AI generation
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,

  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for social_posts
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for ON social_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_posted_at ON social_posts(posted_at) WHERE posted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_is_flyer ON social_posts(is_flyer_post) WHERE is_flyer_post = TRUE;

-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'Distributors can view own posts'
  ) THEN
    CREATE POLICY "Distributors can view own posts"
      ON social_posts FOR SELECT
      USING (distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'Distributors can create posts'
  ) THEN
    CREATE POLICY "Distributors can create posts"
      ON social_posts FOR INSERT
      WITH CHECK (distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'Distributors can update own posts'
  ) THEN
    CREATE POLICY "Distributors can update own posts"
      ON social_posts FOR UPDATE
      USING (distributor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'Distributors can delete own posts'
  ) THEN
    CREATE POLICY "Distributors can delete own posts"
      ON social_posts FOR DELETE
      USING (distributor_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- BLOCK ANONYMOUS ACCESS TO NEW TABLES
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_pipeline' AND policyname = 'pipeline_block_anon'
  ) THEN
    CREATE POLICY pipeline_block_anon ON crm_pipeline
      FOR ALL
      TO anon
      USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'training_shares' AND policyname = 'training_block_anon'
  ) THEN
    CREATE POLICY training_block_anon ON training_shares
      FOR ALL
      TO anon
      USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'social_posts' AND policyname = 'social_block_anon'
  ) THEN
    CREATE POLICY social_block_anon ON social_posts
      FOR ALL
      TO anon
      USING (false);
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Missing tables created successfully';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ Anonymous access blocked';
END $$;

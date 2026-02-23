-- =============================================
-- Social Media Content Library
-- Storage for pre-made social media graphics and templates
-- =============================================

CREATE TABLE social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'educational', 'cta', 'engagement', 'testimonial', 'recruiting')),
  image_url TEXT NOT NULL,
  caption_template TEXT,
  hashtags TEXT,
  best_day VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for filtering by category
CREATE INDEX idx_social_content_category ON social_content(category);

-- Index for active content
CREATE INDEX idx_social_content_active ON social_content(is_active, sort_order);

-- Add RLS policies for social content
ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage social content"
  ON social_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- All authenticated users can view active content
CREATE POLICY "Authenticated users can view active social content"
  ON social_content
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create link tracking table for analytics
CREATE TABLE social_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  source VARCHAR(50), -- 'qr_code', 'instagram_bio', 'facebook_post', etc.
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_social_link_clicks_distributor ON social_link_clicks(distributor_id, clicked_at DESC);
CREATE INDEX idx_social_link_clicks_source ON social_link_clicks(source);

-- Enable RLS for link clicks
ALTER TABLE social_link_clicks ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own clicks
CREATE POLICY "Distributors can view their own link clicks"
  ON social_link_clicks
  FOR SELECT
  TO authenticated
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Anyone can insert clicks (for tracking)
CREATE POLICY "Anyone can insert link clicks"
  ON social_link_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

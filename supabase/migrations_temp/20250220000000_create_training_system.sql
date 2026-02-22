-- =============================================
-- Training System Database Schema
-- Audio podcast-style training with gamification
-- =============================================

-- ENUMS FIRST
CREATE TYPE content_type AS ENUM ('audio', 'video', 'article', 'pdf');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE delivery_frequency AS ENUM ('daily', 'weekly', 'on_demand');
CREATE TYPE badge_tier AS ENUM ('common', 'rare', 'epic', 'legendary');

-- =============================================
-- TABLE 1: training_content
-- Stores all training materials (audio podcasts, videos, articles, PDFs)
-- =============================================
CREATE TABLE training_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content_type content_type NOT NULL,
  difficulty_level difficulty_level DEFAULT 'beginner',

  -- Media URLs
  audio_url TEXT,
  video_url TEXT,
  article_body TEXT,
  pdf_url TEXT,

  -- Metadata
  duration_seconds INTEGER, -- for audio/video
  transcript TEXT,
  key_takeaways TEXT[], -- array of strings
  tags TEXT[],

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_training_content_scheduled ON training_content(scheduled_for) WHERE is_published = true;
CREATE INDEX idx_training_content_type ON training_content(content_type);
CREATE INDEX idx_training_content_tags ON training_content USING GIN(tags);

-- =============================================
-- TABLE 2: training_subscriptions
-- User delivery preferences for training content
-- =============================================
CREATE TABLE training_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Delivery preferences
  delivery_frequency delivery_frequency NOT NULL DEFAULT 'weekly',
  delivery_email BOOLEAN DEFAULT true,
  delivery_sms BOOLEAN DEFAULT false,
  delivery_in_app BOOLEAN DEFAULT true,

  -- Timing
  preferred_time TIME, -- e.g., '09:00:00' for 9 AM
  timezone TEXT DEFAULT 'America/New_York',

  -- Status
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,

  UNIQUE(user_id)
);

CREATE INDEX idx_training_subs_active ON training_subscriptions(user_id) WHERE is_active = true;

-- =============================================
-- TABLE 3: training_progress
-- Tracks user completion and engagement
-- =============================================
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,

  -- Progress
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  watch_time_seconds INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Engagement
  liked BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Tracking
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, content_id)
);

CREATE INDEX idx_training_progress_user ON training_progress(user_id);
CREATE INDEX idx_training_progress_completed ON training_progress(user_id, completed);

-- =============================================
-- TABLE 4: training_streaks
-- Gamification: streaks, points, stats
-- =============================================
CREATE TABLE training_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,

  -- Points
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,

  -- Stats
  total_lessons_completed INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,

  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_training_streaks_leaderboard ON training_streaks(total_points DESC);

-- =============================================
-- TABLE 5: training_badges
-- Badge definitions (achievements)
-- =============================================
CREATE TABLE training_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  tier badge_tier NOT NULL DEFAULT 'common',
  icon_url TEXT,

  -- Unlock criteria
  criteria_type TEXT NOT NULL, -- e.g., 'streak', 'lessons_completed', 'points'
  criteria_value INTEGER NOT NULL, -- e.g., 7 for '7-day streak'

  -- Display
  color TEXT, -- hex color
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLE 6: user_badges
-- User badge awards (many-to-many)
-- =============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES training_badges(id) ON DELETE CASCADE,

  earned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- =============================================
-- TABLE 7: training_notifications
-- Delivery queue and tracking
-- =============================================
CREATE TABLE training_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES training_content(id) ON DELETE CASCADE,

  -- Delivery tracking
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Channels
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, sent, failed, cancelled
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_notifs_pending ON training_notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_training_notifs_user ON training_notifications(user_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view published content
CREATE POLICY "Users can view published content"
  ON training_content FOR SELECT
  USING (is_published = true);

-- Admins can manage all content
CREATE POLICY "Admins can manage all content"
  ON training_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Users can manage their own subscription
CREATE POLICY "Users manage own subscription"
  ON training_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Users can view/update their own progress
CREATE POLICY "Users manage own progress"
  ON training_progress FOR ALL
  USING (auth.uid() = user_id);

-- Users can view/update their own streaks
CREATE POLICY "Users manage own streaks"
  ON training_streaks FOR ALL
  USING (auth.uid() = user_id);

-- Everyone can view active badges
CREATE POLICY "Everyone views badges"
  ON training_badges FOR SELECT
  USING (is_active = true);

-- Users can view their own earned badges
CREATE POLICY "Users view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own notifications
CREATE POLICY "Users view own notifications"
  ON training_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- INITIAL BADGE SEEDING
-- =============================================

INSERT INTO training_badges (name, description, tier, criteria_type, criteria_value, color) VALUES
  -- Streak badges
  ('First Step', 'Complete your first training lesson', 'common', 'lessons_completed', 1, '#10B981'),
  ('Three Day Streak', 'Maintain a 3-day learning streak', 'common', 'streak', 3, '#10B981'),
  ('Week Warrior', 'Maintain a 7-day learning streak', 'rare', 'streak', 7, '#3B82F6'),
  ('Two Week Champion', 'Maintain a 14-day learning streak', 'rare', 'streak', 14, '#3B82F6'),
  ('Month Master', 'Maintain a 30-day learning streak', 'epic', 'streak', 30, '#8B5CF6'),
  ('Unstoppable', 'Maintain a 60-day learning streak', 'epic', 'streak', 60, '#8B5CF6'),
  ('Legend', 'Maintain a 100-day learning streak', 'legendary', 'streak', 100, '#F59E0B'),

  -- Lessons completed badges
  ('Quick Learner', 'Complete 5 training lessons', 'common', 'lessons_completed', 5, '#10B981'),
  ('Knowledge Seeker', 'Complete 10 training lessons', 'rare', 'lessons_completed', 10, '#3B82F6'),
  ('Dedicated Student', 'Complete 25 training lessons', 'rare', 'lessons_completed', 25, '#3B82F6'),
  ('Expert in Training', 'Complete 50 training lessons', 'epic', 'lessons_completed', 50, '#8B5CF6'),
  ('Master of Skills', 'Complete 100 training lessons', 'legendary', 'lessons_completed', 100, '#F59E0B'),

  -- Points badges
  ('Rising Star', 'Earn 100 total points', 'common', 'points', 100, '#10B981'),
  ('Point Collector', 'Earn 500 total points', 'rare', 'points', 500, '#3B82F6'),
  ('High Achiever', 'Earn 1000 total points', 'epic', 'points', 1000, '#8B5CF6'),
  ('Elite Performer', 'Earn 2500 total points', 'legendary', 'points', 2500, '#F59E0B');

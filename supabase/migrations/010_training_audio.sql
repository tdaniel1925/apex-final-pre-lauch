-- =============================================
-- Training Audio Podcast System
-- Database Schema
-- =============================================

-- Table 1: training_episodes
CREATE TABLE training_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Episode Info
  title TEXT NOT NULL,
  description TEXT,
  episode_number INTEGER,
  category TEXT, -- 'fundamentals', 'objection-handling', 'closing', 'products', 'leadership'
  season_number INTEGER DEFAULT 1,

  -- Audio Files
  audio_url TEXT, -- URL to final mixed audio file in storage
  duration_seconds INTEGER, -- Total duration in seconds
  transcript TEXT, -- Full text transcript

  -- Content Source
  script TEXT, -- Generated or custom script
  voice_model TEXT DEFAULT 'onyx', -- OpenAI voice used

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  is_featured BOOLEAN DEFAULT false,

  -- Audio Production Settings
  include_intro BOOLEAN DEFAULT true,
  include_outro BOOLEAN DEFAULT true,
  background_music_url TEXT, -- URL to background music file
  music_volume INTEGER DEFAULT 20, -- 0-100

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES distributors(id),

  -- Analytics
  total_listens INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0
);

-- Indexes for training_episodes
CREATE INDEX idx_episodes_status ON training_episodes(status);
CREATE INDEX idx_episodes_category ON training_episodes(category);
CREATE INDEX idx_episodes_season ON training_episodes(season_number);
CREATE INDEX idx_episodes_created_at ON training_episodes(created_at DESC);

-- Table 2: training_progress
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES training_episodes(id) ON DELETE CASCADE,

  -- Progress
  current_position_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER, -- Total episode duration
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Listening Stats
  listen_count INTEGER DEFAULT 0,
  last_listened_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(distributor_id, episode_id)
);

-- Indexes for training_progress
CREATE INDEX idx_progress_distributor ON training_progress(distributor_id);
CREATE INDEX idx_progress_episode ON training_progress(episode_id);
CREATE INDEX idx_progress_completed ON training_progress(completed);
CREATE INDEX idx_progress_last_listened ON training_progress(last_listened_at DESC);

-- Table 3: training_categories
CREATE TABLE training_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or emoji
  display_order INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for training_categories
CREATE INDEX idx_categories_display_order ON training_categories(display_order);

-- Insert default categories
INSERT INTO training_categories (name, slug, description, icon, display_order) VALUES
('Fundamentals', 'fundamentals', 'Core insurance sales basics', '📚', 1),
('Objection Handling', 'objection-handling', 'Overcome common objections', '🛡️', 2),
('Closing Techniques', 'closing', 'Proven closing strategies', '🎯', 3),
('Product Knowledge', 'products', 'Learn insurance products', '📋', 4),
('Leadership', 'leadership', 'Build and lead your team', '👥', 5);

-- RPC function to increment episode listens
CREATE OR REPLACE FUNCTION increment_episode_listens(episode_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE training_episodes
  SET total_listens = total_listens + 1
  WHERE id = episode_id;
END;
$$ LANGUAGE plpgsql;

-- RPC function to increment episode completions
CREATE OR REPLACE FUNCTION increment_episode_completions(episode_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE training_episodes
  SET total_completions = total_completions + 1
  WHERE id = episode_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_episodes_updated_at
  BEFORE UPDATE ON training_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_categories_updated_at
  BEFORE UPDATE ON training_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE training_episodes IS 'Podcast-style training episodes';
COMMENT ON TABLE training_progress IS 'User progress tracking for training episodes';
COMMENT ON TABLE training_categories IS 'Categories for organizing training episodes';

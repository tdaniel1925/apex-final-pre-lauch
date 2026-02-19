-- =============================================
-- Training Audio RLS Policies
-- =============================================

-- Enable RLS on all training tables
ALTER TABLE training_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_categories ENABLE ROW LEVEL SECURITY;

-- =============================================
-- training_episodes policies
-- =============================================

-- Anyone (including anon) can read published episodes
CREATE POLICY "Published episodes are publicly readable"
  ON training_episodes FOR SELECT
  USING (status = 'published');

-- Authenticated distributors can read ALL episodes (for admin)
CREATE POLICY "Authenticated users can read all episodes"
  ON training_episodes FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create episodes
CREATE POLICY "Authenticated users can create episodes"
  ON training_episodes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update episodes
CREATE POLICY "Authenticated users can update episodes"
  ON training_episodes FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete episodes
CREATE POLICY "Authenticated users can delete episodes"
  ON training_episodes FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- training_progress policies
-- =============================================

-- Users can only read their own progress
CREATE POLICY "Users can read own progress"
  ON training_progress FOR SELECT
  TO authenticated
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON training_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON training_progress FOR UPDATE
  TO authenticated
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- training_categories policies
-- =============================================

-- Anyone can read categories
CREATE POLICY "Categories are publicly readable"
  ON training_categories FOR SELECT
  USING (true);

-- Only authenticated users can manage categories
CREATE POLICY "Authenticated users can manage categories"
  ON training_categories FOR ALL
  TO authenticated
  USING (true);

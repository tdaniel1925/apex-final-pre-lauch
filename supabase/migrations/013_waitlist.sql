-- =============================================
-- Pre-Launch Waitlist
-- Captures emails before signup opens
-- =============================================

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  source_slug TEXT, -- NULL = main site, 'johndoe' = rep site
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ -- set when launch email is sent
);

CREATE UNIQUE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_source ON waitlist(source_slug);
CREATE INDEX idx_waitlist_notified ON waitlist(notified_at) WHERE notified_at IS NULL;

-- Anyone can insert (public signup)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can read waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can update waitlist"
  ON waitlist FOR UPDATE
  TO authenticated
  USING (true);

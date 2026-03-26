-- =============================================
-- Shopping Cart Sessions
-- Migration: 20260326000001
-- Stores shopping cart data for retail customers
-- =============================================

-- Cart sessions table
CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  rep_slug TEXT, -- Attribution to rep
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at ON cart_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_rep_slug ON cart_sessions(rep_slug);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_cart_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_sessions_updated_at
  BEFORE UPDATE ON cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_sessions_updated_at();

-- RLS Policies (cart sessions are public, no auth required)
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write cart sessions (no auth required for shopping)
CREATE POLICY "Cart sessions are publicly accessible"
  ON cart_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- MIGRATION COMPLETE
-- Cart sessions table ready for retail shopping
-- =============================================

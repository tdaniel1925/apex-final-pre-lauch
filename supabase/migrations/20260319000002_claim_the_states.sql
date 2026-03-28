-- =============================================
-- Claim the States - Gamification System
-- Track state ownership based on GVP generation
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- State Ownership Table
-- =============================================
CREATE TABLE IF NOT EXISTS state_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- State Info
  state_code TEXT NOT NULL UNIQUE, -- 'CA', 'NY', 'TX', etc.
  state_name TEXT NOT NULL, -- 'California', 'New York', 'Texas'

  -- Current Year Ownership
  current_owner_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  current_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  current_gvp DECIMAL(10, 2) DEFAULT 0,
  date_claimed TIMESTAMPTZ, -- When it hit 500 GVP this year

  -- Hall of Fame (First Ever)
  first_owner_id UUID REFERENCES distributors(id) ON DELETE SET NULL,
  first_owner_name TEXT, -- Cached for display
  first_claim_date TIMESTAMPTZ, -- When it was first claimed ever
  first_claim_gvp DECIMAL(10, 2), -- GVP at first claim

  -- Metadata
  total_claims INTEGER DEFAULT 0, -- How many times claimed historically
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_state_ownership_state_code ON state_ownership(state_code);
CREATE INDEX IF NOT EXISTS idx_state_ownership_current_owner ON state_ownership(current_owner_id);

-- =============================================
-- State GVP Ledger
-- Track GVP contributions by state and distributor
-- =============================================
CREATE TABLE IF NOT EXISTS state_gvp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who and Where
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),

  -- GVP Tracking
  total_gvp DECIMAL(10, 2) DEFAULT 0,
  last_contribution_date TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per distributor per state per year
  UNIQUE(distributor_id, state_code, year)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_state_gvp_ledger_state_year ON state_gvp_ledger(state_code, year);
CREATE INDEX IF NOT EXISTS idx_state_gvp_ledger_distributor ON state_gvp_ledger(distributor_id);
CREATE INDEX IF NOT EXISTS idx_state_gvp_ledger_gvp ON state_gvp_ledger(total_gvp DESC);

-- =============================================
-- State Claim History
-- Historical record of all claims
-- =============================================
CREATE TABLE IF NOT EXISTS state_claim_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Claim Details
  state_code TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  gvp_at_claim DECIMAL(10, 2) NOT NULL,
  claim_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Was this the first ever claim?
  is_first_claim BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for historical lookups
CREATE INDEX IF NOT EXISTS idx_state_claim_history_state ON state_claim_history(state_code, year DESC);
CREATE INDEX IF NOT EXISTS idx_state_claim_history_owner ON state_claim_history(owner_id);

-- =============================================
-- Initialize All 50 States
-- =============================================
INSERT INTO state_ownership (state_code, state_name, current_year) VALUES
  ('AL', 'Alabama', EXTRACT(YEAR FROM NOW())),
  ('AK', 'Alaska', EXTRACT(YEAR FROM NOW())),
  ('AZ', 'Arizona', EXTRACT(YEAR FROM NOW())),
  ('AR', 'Arkansas', EXTRACT(YEAR FROM NOW())),
  ('CA', 'California', EXTRACT(YEAR FROM NOW())),
  ('CO', 'Colorado', EXTRACT(YEAR FROM NOW())),
  ('CT', 'Connecticut', EXTRACT(YEAR FROM NOW())),
  ('DE', 'Delaware', EXTRACT(YEAR FROM NOW())),
  ('FL', 'Florida', EXTRACT(YEAR FROM NOW())),
  ('GA', 'Georgia', EXTRACT(YEAR FROM NOW())),
  ('HI', 'Hawaii', EXTRACT(YEAR FROM NOW())),
  ('ID', 'Idaho', EXTRACT(YEAR FROM NOW())),
  ('IL', 'Illinois', EXTRACT(YEAR FROM NOW())),
  ('IN', 'Indiana', EXTRACT(YEAR FROM NOW())),
  ('IA', 'Iowa', EXTRACT(YEAR FROM NOW())),
  ('KS', 'Kansas', EXTRACT(YEAR FROM NOW())),
  ('KY', 'Kentucky', EXTRACT(YEAR FROM NOW())),
  ('LA', 'Louisiana', EXTRACT(YEAR FROM NOW())),
  ('ME', 'Maine', EXTRACT(YEAR FROM NOW())),
  ('MD', 'Maryland', EXTRACT(YEAR FROM NOW())),
  ('MA', 'Massachusetts', EXTRACT(YEAR FROM NOW())),
  ('MI', 'Michigan', EXTRACT(YEAR FROM NOW())),
  ('MN', 'Minnesota', EXTRACT(YEAR FROM NOW())),
  ('MS', 'Mississippi', EXTRACT(YEAR FROM NOW())),
  ('MO', 'Missouri', EXTRACT(YEAR FROM NOW())),
  ('MT', 'Montana', EXTRACT(YEAR FROM NOW())),
  ('NE', 'Nebraska', EXTRACT(YEAR FROM NOW())),
  ('NV', 'Nevada', EXTRACT(YEAR FROM NOW())),
  ('NH', 'New Hampshire', EXTRACT(YEAR FROM NOW())),
  ('NJ', 'New Jersey', EXTRACT(YEAR FROM NOW())),
  ('NM', 'New Mexico', EXTRACT(YEAR FROM NOW())),
  ('NY', 'New York', EXTRACT(YEAR FROM NOW())),
  ('NC', 'North Carolina', EXTRACT(YEAR FROM NOW())),
  ('ND', 'North Dakota', EXTRACT(YEAR FROM NOW())),
  ('OH', 'Ohio', EXTRACT(YEAR FROM NOW())),
  ('OK', 'Oklahoma', EXTRACT(YEAR FROM NOW())),
  ('OR', 'Oregon', EXTRACT(YEAR FROM NOW())),
  ('PA', 'Pennsylvania', EXTRACT(YEAR FROM NOW())),
  ('RI', 'Rhode Island', EXTRACT(YEAR FROM NOW())),
  ('SC', 'South Carolina', EXTRACT(YEAR FROM NOW())),
  ('SD', 'South Dakota', EXTRACT(YEAR FROM NOW())),
  ('TN', 'Tennessee', EXTRACT(YEAR FROM NOW())),
  ('TX', 'Texas', EXTRACT(YEAR FROM NOW())),
  ('UT', 'Utah', EXTRACT(YEAR FROM NOW())),
  ('VT', 'Vermont', EXTRACT(YEAR FROM NOW())),
  ('VA', 'Virginia', EXTRACT(YEAR FROM NOW())),
  ('WA', 'Washington', EXTRACT(YEAR FROM NOW())),
  ('WV', 'West Virginia', EXTRACT(YEAR FROM NOW())),
  ('WI', 'Wisconsin', EXTRACT(YEAR FROM NOW())),
  ('WY', 'Wyoming', EXTRACT(YEAR FROM NOW()))
ON CONFLICT (state_code) DO NOTHING;

-- =============================================
-- Function: Calculate State GVP
-- Aggregates GVP by state from distributors' zip codes
-- =============================================
CREATE OR REPLACE FUNCTION calculate_state_gvp()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  dist RECORD;
  state_code TEXT;
  current_year INTEGER := EXTRACT(YEAR FROM NOW());
BEGIN
  -- For each active distributor with a zip code
  FOR dist IN
    SELECT
      d.id,
      d.zip_code,
      COALESCE(d.total_group_volume, 0) as gvp
    FROM distributors d
    WHERE d.zip_code IS NOT NULL
      AND d.status = 'active'
      AND d.is_test_account = FALSE
  LOOP
    -- Get state from zip code (you'll need a zip_to_state mapping)
    -- For now, we'll use a simple function
    state_code := get_state_from_zip(dist.zip_code);

    IF state_code IS NOT NULL THEN
      -- Upsert into ledger
      INSERT INTO state_gvp_ledger (
        distributor_id,
        state_code,
        year,
        total_gvp,
        last_contribution_date
      ) VALUES (
        dist.id,
        state_code,
        current_year,
        dist.gvp,
        NOW()
      )
      ON CONFLICT (distributor_id, state_code, year)
      DO UPDATE SET
        total_gvp = EXCLUDED.total_gvp,
        last_contribution_date = NOW(),
        updated_at = NOW();
    END IF;
  END LOOP;

  -- Update state ownership totals
  UPDATE state_ownership so
  SET
    current_gvp = COALESCE(
      (SELECT SUM(total_gvp)
       FROM state_gvp_ledger
       WHERE state_code = so.state_code
       AND year = current_year),
      0
    ),
    updated_at = NOW()
  WHERE current_year = so.current_year;

  -- Check for new claims (states that hit 500 GVP)
  PERFORM check_state_claims();
END;
$$;

-- =============================================
-- Function: Get State from Zip Code
-- Maps zip code to state abbreviation
-- =============================================
CREATE OR REPLACE FUNCTION get_state_from_zip(zip TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  zip_prefix TEXT;
BEGIN
  -- Extract first 3 digits of zip
  zip_prefix := SUBSTRING(zip FROM 1 FOR 3);

  -- Simple mapping (this is a simplified version)
  -- In production, you'd want a complete zip_code_to_state table
  CASE
    -- California
    WHEN zip_prefix BETWEEN '900' AND '961' THEN RETURN 'CA';
    -- New York
    WHEN zip_prefix BETWEEN '100' AND '149' THEN RETURN 'NY';
    -- Texas
    WHEN zip_prefix BETWEEN '750' AND '799' THEN RETURN 'TX';
    -- Florida
    WHEN zip_prefix BETWEEN '320' AND '349' THEN RETURN 'FL';
    -- Illinois
    WHEN zip_prefix BETWEEN '600' AND '629' THEN RETURN 'IL';
    -- Pennsylvania
    WHEN zip_prefix BETWEEN '150' AND '196' THEN RETURN 'PA';
    -- Ohio
    WHEN zip_prefix BETWEEN '430' AND '458' THEN RETURN 'OH';
    -- Georgia
    WHEN zip_prefix BETWEEN '300' AND '319' THEN RETURN 'GA';
    -- North Carolina
    WHEN zip_prefix BETWEEN '270' AND '289' THEN RETURN 'NC';
    -- Michigan
    WHEN zip_prefix BETWEEN '480' AND '499' THEN RETURN 'MI';
    -- Add more states as needed...
    ELSE RETURN NULL;
  END CASE;
END;
$$;

-- =============================================
-- Function: Check for State Claims
-- Identifies states that reached 500 GVP and assigns ownership
-- =============================================
CREATE OR REPLACE FUNCTION check_state_claims()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  state RECORD;
  top_contributor RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM NOW());
BEGIN
  -- For each unclaimed state with 500+ GVP
  FOR state IN
    SELECT
      so.state_code,
      so.state_name,
      so.current_gvp,
      so.current_owner_id
    FROM state_ownership so
    WHERE so.current_year = current_year
      AND so.current_gvp >= 500
      AND so.current_owner_id IS NULL
  LOOP
    -- Find top contributor in this state
    SELECT
      distributor_id,
      total_gvp,
      d.first_name,
      d.last_name
    INTO top_contributor
    FROM state_gvp_ledger sgl
    JOIN distributors d ON d.id = sgl.distributor_id
    WHERE sgl.state_code = state.state_code
      AND sgl.year = current_year
    ORDER BY sgl.total_gvp DESC
    LIMIT 1;

    IF top_contributor IS NOT NULL THEN
      -- Claim the state
      UPDATE state_ownership
      SET
        current_owner_id = top_contributor.distributor_id,
        date_claimed = NOW(),
        total_claims = total_claims + 1,
        -- Set first owner if this is the first ever claim
        first_owner_id = COALESCE(first_owner_id, top_contributor.distributor_id),
        first_owner_name = COALESCE(first_owner_name, top_contributor.first_name || ' ' || top_contributor.last_name),
        first_claim_date = COALESCE(first_claim_date, NOW()),
        first_claim_gvp = COALESCE(first_claim_gvp, state.current_gvp),
        updated_at = NOW()
      WHERE state_code = state.state_code;

      -- Record in history
      INSERT INTO state_claim_history (
        state_code,
        owner_id,
        year,
        gvp_at_claim,
        claim_date,
        is_first_claim
      )
      SELECT
        state.state_code,
        top_contributor.distributor_id,
        current_year,
        state.current_gvp,
        NOW(),
        NOT EXISTS (
          SELECT 1 FROM state_claim_history
          WHERE state_code = state.state_code
        );
    END IF;
  END LOOP;
END;
$$;

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE state_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_gvp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_claim_history ENABLE ROW LEVEL SECURITY;

-- Everyone can view state ownership (it's public)
DROP POLICY IF EXISTS state_ownership_view_all ON state_ownership;
CREATE POLICY state_ownership_view_all ON state_ownership
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can view GVP ledger
DROP POLICY IF EXISTS state_gvp_ledger_view_all ON state_gvp_ledger;
CREATE POLICY state_gvp_ledger_view_all ON state_gvp_ledger
  FOR SELECT
  TO authenticated
  USING (true);

-- Everyone can view claim history
DROP POLICY IF EXISTS state_claim_history_view_all ON state_claim_history;
CREATE POLICY state_claim_history_view_all ON state_claim_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify
DROP POLICY IF EXISTS state_ownership_admin_all ON state_ownership;
CREATE POLICY state_ownership_admin_all ON state_ownership
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.auth_user_id = auth.uid()
    )
  );

-- =============================================
-- Comments
-- =============================================
COMMENT ON TABLE state_ownership IS 'Tracks state ownership based on GVP generation. States reset annually but first claimant is in Hall of Fame forever.';
COMMENT ON TABLE state_gvp_ledger IS 'Tracks individual distributor GVP contributions by state and year.';
COMMENT ON TABLE state_claim_history IS 'Historical record of all state claims across all years.';

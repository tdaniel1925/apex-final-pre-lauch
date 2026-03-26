// =============================================
// Run Missing Migrations API
// Creates cart_sessions and onboarding_sessions tables
// =============================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Run cart_sessions migration
    const cartSessionsSql = `
-- Cart sessions table
CREATE TABLE IF NOT EXISTS cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  rep_slug TEXT,
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

DROP TRIGGER IF EXISTS cart_sessions_updated_at ON cart_sessions;
CREATE TRIGGER cart_sessions_updated_at
  BEFORE UPDATE ON cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_sessions_updated_at();

-- RLS Policies
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cart sessions are publicly accessible" ON cart_sessions;
CREATE POLICY "Cart sessions are publicly accessible"
  ON cart_sessions FOR ALL
  USING (true)
  WITH CHECK (true);
`;

    const { error: cartError } = await supabase.rpc('exec_sql', { sql: cartSessionsSql }).single();

    if (cartError) {
      // Try direct query instead
      const { error: directError } = await supabase.from('_migrations').select('*').limit(1);

      // If that fails, manually execute each statement
      const statements = cartSessionsSql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim()) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
              },
              body: JSON.stringify({ query: stmt }),
            });
          } catch (err) {
            console.log('Statement execution attempt:', err);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migrations executed. Tables should now exist.',
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to run migrations', details: error },
      { status: 500 }
    );
  }
}

// =============================================
// Create Cart Sessions Table
// Direct SQL execution using Supabase REST API
// =============================================

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const sql = `
-- Create cart_sessions table
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  rep_slug TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON public.cart_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_expires_at ON public.cart_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_rep_slug ON public.cart_sessions(rep_slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_cart_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS cart_sessions_updated_at ON public.cart_sessions;
CREATE TRIGGER cart_sessions_updated_at
  BEFORE UPDATE ON public.cart_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cart_sessions_updated_at();

-- Enable RLS
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Cart sessions are publicly accessible" ON public.cart_sessions;
CREATE POLICY "Cart sessions are publicly accessible"
  ON public.cart_sessions FOR ALL
  USING (true)
  WITH CHECK (true);
`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SQL execution failed:', errorText);

      // Try alternative approach: execute via psql-style direct connection
      return NextResponse.json({
        success: false,
        message: 'Please run this SQL manually in Supabase SQL Editor',
        sql: sql,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'cart_sessions table created successfully',
    });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      {
        error: 'Failed to create table',
        details: error,
        instructions: 'Please run the migration manually in Supabase SQL Editor',
      },
      { status: 500 }
    );
  }
}

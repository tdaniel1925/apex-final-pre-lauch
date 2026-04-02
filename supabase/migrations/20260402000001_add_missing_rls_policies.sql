-- =====================================================
-- SECURITY FIX: Add Missing RLS Policies
-- Priority: HIGH
-- Addresses: Pre-launch audit finding - missing RLS on critical tables
-- Tables: members, earnings_ledger, estimated_earnings, transactions
-- Date: 2026-04-02
-- =====================================================

-- =====================================================
-- 1. MEMBERS TABLE RLS
-- =====================================================

-- Enable RLS on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own member record
CREATE POLICY "Users can view own member record"
  ON public.members
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all member records
CREATE POLICY "Admins and CFOs can view all members"
  ON public.members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert/update member records
-- This ensures member records are only modified through controlled endpoints
CREATE POLICY "Service role can insert members"
  ON public.members
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role can update members"
  ON public.members
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only admins can delete members (should be rare - use status instead)
CREATE POLICY "Admins can delete members"
  ON public.members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- 2. EARNINGS_LEDGER TABLE RLS
-- =====================================================

-- Enable RLS on earnings_ledger table
ALTER TABLE public.earnings_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own earnings
CREATE POLICY "Reps can view own earnings"
  ON public.earnings_ledger
  FOR SELECT
  USING (
    member_id IN (
      SELECT member_id FROM public.members m
      JOIN public.distributors d ON d.id = m.distributor_id
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all earnings
CREATE POLICY "Admins and CFOs can view all earnings"
  ON public.earnings_ledger
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert earnings
-- This ensures earnings are calculated server-side only
CREATE POLICY "Service role can insert earnings"
  ON public.earnings_ledger
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only service role can update earnings (status changes)
CREATE POLICY "Service role can update earnings"
  ON public.earnings_ledger
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only CFOs and service role can delete earnings
CREATE POLICY "CFO and service role can delete earnings"
  ON public.earnings_ledger
  FOR DELETE
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'cfo'
    )
  );

-- =====================================================
-- 3. ESTIMATED_EARNINGS TABLE RLS
-- =====================================================

-- Enable RLS on estimated_earnings table
ALTER TABLE public.estimated_earnings ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own estimated earnings
CREATE POLICY "Reps can view own estimated earnings"
  ON public.estimated_earnings
  FOR SELECT
  USING (
    member_id IN (
      SELECT member_id FROM public.members m
      JOIN public.distributors d ON d.id = m.distributor_id
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all estimated earnings
CREATE POLICY "Admins and CFOs can view all estimated earnings"
  ON public.estimated_earnings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert estimated earnings
CREATE POLICY "Service role can insert estimated earnings"
  ON public.estimated_earnings
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only service role can update estimated earnings
CREATE POLICY "Service role can update estimated earnings"
  ON public.estimated_earnings
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only service role can delete estimated earnings
CREATE POLICY "Service role can delete estimated earnings"
  ON public.estimated_earnings
  FOR DELETE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- =====================================================
-- 4. TRANSACTIONS TABLE RLS
-- =====================================================

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own transactions
CREATE POLICY "Reps can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all transactions
CREATE POLICY "Admins and CFOs can view all transactions"
  ON public.transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert transactions (via Stripe webhook)
CREATE POLICY "Service role can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only service role can update transactions
CREATE POLICY "Service role can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only admins can delete transactions (should be extremely rare)
CREATE POLICY "Admins can delete transactions"
  ON public.transactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 1. All policies use email lookup from auth.users to prevent auth.uid() spoofing
-- 2. Critical write operations restricted to service_role (server-side only)
-- 3. Reps can only view their own financial data (earnings, transactions)
-- 4. Admins and CFOs have read access to all financial records
-- 5. BV/commission calculations must happen server-side (service_role)
-- 6. Defense-in-depth: RLS + manual auth checks in API routes
-- =====================================================

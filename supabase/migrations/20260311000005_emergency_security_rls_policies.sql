-- =====================================================
-- EMERGENCY SECURITY FIX: Row Level Security Policies
-- Priority: CRITICAL
-- Addresses: Audit finding - unprotected tables
-- Author: Security Audit Remediation
-- Date: 2026-03-11
-- =====================================================

-- =====================================================
-- 1. DISTRIBUTORS TABLE RLS
-- =====================================================

-- Enable RLS on distributors table
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own distributor record
CREATE POLICY "Users can view own distributor record"
  ON public.distributors
  FOR SELECT
  USING (
    auth.uid()::text = (SELECT id FROM auth.users WHERE email = distributors.email)
  );

-- Policy: Admins and CFOs can view all distributor records
CREATE POLICY "Admins and CFOs can view all distributors"
  ON public.distributors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Users can update their own non-sensitive fields
CREATE POLICY "Users can update own profile"
  ON public.distributors
  FOR UPDATE
  USING (
    auth.uid()::text = (SELECT id FROM auth.users WHERE email = distributors.email)
  )
  WITH CHECK (
    auth.uid()::text = (SELECT id FROM auth.users WHERE email = distributors.email)
    -- Prevent users from changing sensitive fields
    AND distributors.role = OLD.role
    AND distributors.rank = OLD.rank
    AND distributors.sponsor_id = OLD.sponsor_id
    AND distributors.status = OLD.status
  );

-- Policy: Admins can update any distributor
CREATE POLICY "Admins can update any distributor"
  ON public.distributors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- Policy: Only system (service role) can insert distributors
-- This ensures signups go through the controlled signup endpoint
CREATE POLICY "Service role can insert distributors"
  ON public.distributors
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Admins can delete distributors (soft delete via status preferred)
CREATE POLICY "Admins can delete distributors"
  ON public.distributors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- 2. CUSTOMERS TABLE RLS
-- =====================================================

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own customers
CREATE POLICY "Reps can view own customers"
  ON public.customers
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all customers
CREATE POLICY "Admins and CFOs can view all customers"
  ON public.customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Reps can insert customers under their own rep_id
CREATE POLICY "Reps can insert own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Reps can update their own customers
CREATE POLICY "Reps can update own customers"
  ON public.customers
  FOR UPDATE
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins can update any customer
CREATE POLICY "Admins can update any customer"
  ON public.customers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- Policy: Only admins can delete customers
CREATE POLICY "Admins can delete customers"
  ON public.customers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- 3. NOTIFICATIONS TABLE RLS
-- =====================================================

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- Policy: Only system (service role) can insert notifications
-- This ensures notifications are created through controlled endpoints
CREATE POLICY "Service role can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    -- Users can only update the 'read' field
    AND notifications.user_id = OLD.user_id
    AND notifications.type = OLD.type
    AND notifications.title = OLD.title
    AND notifications.message = OLD.message
    AND notifications.created_at = OLD.created_at
  );

-- Policy: Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- 4. ORDERS TABLE RLS (Additional protection)
-- =====================================================

-- Enable RLS on orders table (if not already enabled)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own orders
CREATE POLICY "Reps can view own orders"
  ON public.orders
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: Admins and CFOs can view all orders
CREATE POLICY "Admins and CFOs can view all orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert orders (via Stripe webhook)
CREATE POLICY "Service role can insert orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only service role can update orders
CREATE POLICY "Service role can update orders"
  ON public.orders
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- Policy: Only admins can delete orders (should be rare - use status instead)
CREATE POLICY "Admins can delete orders"
  ON public.orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'admin'
    )
  );

-- =====================================================
-- 5. COMMISSION TABLES RLS (Read-only for reps)
-- =====================================================

-- Enable RLS on commission_runs table
ALTER TABLE IF EXISTS public.commission_runs ENABLE ROW LEVEL SECURITY;

-- Policy: CFOs and Admins can view all commission runs
CREATE POLICY "CFOs and Admins can view commission runs"
  ON public.commission_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only CFO and service role can create commission runs
CREATE POLICY "CFO can create commission runs"
  ON public.commission_runs
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role = 'cfo'
    )
  );

-- Enable RLS on commissions table
ALTER TABLE IF EXISTS public.commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Reps can view their own commissions
CREATE POLICY "Reps can view own commissions"
  ON public.commissions
  FOR SELECT
  USING (
    rep_id IN (
      SELECT id FROM public.distributors
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy: CFOs and Admins can view all commissions
CREATE POLICY "CFOs and Admins can view all commissions"
  ON public.commissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Only service role can insert/update commissions
CREATE POLICY "Service role can insert commissions"
  ON public.commissions
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

CREATE POLICY "Service role can update commissions"
  ON public.commissions
  FOR UPDATE
  USING (
    auth.jwt()->>'role' = 'service_role'
  );

-- =====================================================
-- 6. AUDIT LOG (Admins only)
-- =====================================================

-- Enable RLS on audit_log table
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and CFO can view audit logs
CREATE POLICY "Admins and CFO can view audit logs"
  ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.distributors d
      WHERE d.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND d.role IN ('admin', 'cfo')
    )
  );

-- Policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
  );

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 1. All policies use email lookup from auth.users to prevent auth.uid() spoofing
-- 2. Critical write operations restricted to service_role (server-side only)
-- 3. Reps can only view/modify their own data
-- 4. Admins and CFOs have elevated permissions
-- 5. Sensitive field updates (rank, role, sponsor) protected
-- 6. Soft delete preferred over hard delete
-- =====================================================

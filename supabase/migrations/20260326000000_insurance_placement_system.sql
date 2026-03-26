-- =============================================
-- Insurance Placement System
-- Date: 2026-03-26
-- Purpose: Implement temporary placement and corporate approval workflow
-- =============================================

-- Add placement tracking fields to members table (insurance data lives here)
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS original_enroller_id uuid REFERENCES public.members(member_id),
ADD COLUMN IF NOT EXISTS temporary_placement boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS temporary_placement_reason text,
ADD COLUMN IF NOT EXISTS placed_with_fallback_at timestamptz;

COMMENT ON COLUMN public.members.original_enroller_id IS 'Who the agent should return to when sponsor reaches Level 3';
COMMENT ON COLUMN public.members.temporary_placement IS 'Is this agent temporarily placed with Phil/Ahn?';
COMMENT ON COLUMN public.members.temporary_placement_reason IS 'Why temporarily placed: sponsor_unlicensed or sponsor_below_level_3';
COMMENT ON COLUMN public.members.placed_with_fallback_at IS 'When the agent was placed with Phil/Ahn';

-- Create insurance_placement_change_requests table
CREATE TABLE IF NOT EXISTS insurance_placement_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.members(member_id) ON DELETE CASCADE,
  request_type text NOT NULL CHECK (request_type IN ('license_status_change', 'return_to_sponsor', 'manual_placement')),
  current_status text, -- Current licensing_status if applicable
  proposed_status text, -- Proposed licensing_status if applicable
  current_enroller_id uuid REFERENCES public.members(member_id),
  proposed_enroller_id uuid REFERENCES public.members(member_id),
  reason text,
  documentation_url text, -- Link to uploaded license docs
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.members(member_id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE insurance_placement_change_requests IS 'Corporate approval workflow for insurance placement changes';
COMMENT ON COLUMN insurance_placement_change_requests.request_type IS 'Type of change: license_status_change, return_to_sponsor, or manual_placement';
COMMENT ON COLUMN insurance_placement_change_requests.agent_id IS 'The member whose placement is changing';
COMMENT ON COLUMN insurance_placement_change_requests.requested_by IS 'Who initiated the request (user or system)';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_placement_requests_agent ON insurance_placement_change_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_placement_requests_status ON insurance_placement_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_placement_requests_type ON insurance_placement_change_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_placement_requests_created ON insurance_placement_change_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_members_temporary_placement ON public.members(temporary_placement) WHERE temporary_placement = true;
CREATE INDEX IF NOT EXISTS idx_members_original_enroller ON public.members(original_enroller_id) WHERE original_enroller_id IS NOT NULL;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_insurance_placement_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insurance_placement_requests_updated_at
BEFORE UPDATE ON insurance_placement_change_requests
FOR EACH ROW
EXECUTE FUNCTION update_insurance_placement_requests_updated_at();

-- RLS Policies
ALTER TABLE insurance_placement_change_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own placement requests"
ON insurance_placement_change_requests
FOR SELECT
USING (
  auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = agent_id
  )
  OR auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = requested_by
  )
);

-- Users can create requests for themselves
CREATE POLICY "Users can create own placement requests"
ON insurance_placement_change_requests
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT auth_user_id FROM distributors WHERE id = requested_by
  )
);

-- Admins can view all requests
CREATE POLICY "Admins can view all placement requests"
ON insurance_placement_change_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update placement requests"
ON insurance_placement_change_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create system settings table for round-robin tracking
CREATE TABLE IF NOT EXISTS system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE system_settings IS 'System-wide configuration settings';

-- Insert initial round-robin setting
INSERT INTO system_settings (key, value, description)
VALUES (
  'insurance_fallback_placement',
  '{"last_assigned": null, "phil_count": 0, "ahn_count": 0}'::jsonb,
  'Tracks round-robin placement between Phil Resch and Ahn Doan'
)
ON CONFLICT (key) DO NOTHING;

-- RLS for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system settings"
ON system_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update system settings"
ON system_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM distributors
    WHERE auth_user_id = auth.uid()
    AND role = 'admin'
  )
);

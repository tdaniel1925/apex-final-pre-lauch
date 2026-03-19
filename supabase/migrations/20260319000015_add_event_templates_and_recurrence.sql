-- =====================================================
-- Event Templates & Recurring Events System
-- Adds support for:
-- 1. Event templates (reusable configurations)
-- 2. Recurring events (series of related events)
-- 3. Soft delete (archived_at timestamp)
-- =====================================================

-- =====================================================
-- 1. EVENT TEMPLATES TABLE
-- Stores reusable event configurations
-- =====================================================
CREATE TABLE public.event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Template info
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('training', 'webinar', 'conference', 'workshop', 'social')),

  -- Default values for events created from this template
  default_title TEXT NOT NULL,
  default_description TEXT,
  default_location TEXT,
  default_duration_minutes INTEGER NOT NULL DEFAULT 60,
  default_max_attendees INTEGER,
  default_status TEXT NOT NULL DEFAULT 'draft' CHECK (default_status IN ('draft', 'active', 'cancelled', 'completed')),

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Index for fast template lookups
CREATE INDEX idx_event_templates_type ON public.event_templates(event_type);
CREATE INDEX idx_event_templates_active ON public.event_templates(is_active);

-- =====================================================
-- 2. RECURRING EVENTS TABLE
-- Tracks series of related recurring events
-- =====================================================
CREATE TABLE public.recurring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Series info
  series_name TEXT NOT NULL,
  description TEXT,

  -- Recurrence configuration (RRULE format or JSON)
  recurrence_rule JSONB NOT NULL,
  -- Example: {"frequency": "weekly", "interval": 1, "daysOfWeek": [1, 3, 5], "endDate": "2026-12-31"}

  -- Generation tracking
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = no end date
  last_generated_date DATE,
  next_generation_date DATE,

  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_instances_created INTEGER NOT NULL DEFAULT 0
);

-- Index for cron job to find series needing generation
CREATE INDEX idx_recurring_events_next_gen ON public.recurring_events(next_generation_date, is_active);

-- =====================================================
-- 3. MODIFY COMPANY_EVENTS TABLE
-- Add template, recurrence, and soft-delete support
-- =====================================================

-- Add template reference
ALTER TABLE public.company_events
ADD COLUMN template_id UUID REFERENCES public.event_templates(id) ON DELETE SET NULL;

-- Add recurring event reference
ALTER TABLE public.company_events
ADD COLUMN recurring_event_id UUID REFERENCES public.recurring_events(id) ON DELETE SET NULL;

-- Add soft delete timestamp (NULL = not deleted, timestamp = when archived)
ALTER TABLE public.company_events
ADD COLUMN archived_at TIMESTAMPTZ;

-- Add template flag (events can be saved as templates)
ALTER TABLE public.company_events
ADD COLUMN is_template BOOLEAN NOT NULL DEFAULT false;

-- Add recurrence metadata (for individual instances)
ALTER TABLE public.company_events
ADD COLUMN recurrence_instance_date DATE; -- Which date in the series this represents

-- Indexes for performance
CREATE INDEX idx_company_events_template ON public.company_events(template_id);
CREATE INDEX idx_company_events_recurring ON public.company_events(recurring_event_id);
CREATE INDEX idx_company_events_archived ON public.company_events(archived_at) WHERE archived_at IS NULL;
CREATE INDEX idx_company_events_is_template ON public.company_events(is_template);

-- =====================================================
-- 4. UPDATE EXISTING QUERIES
-- Modify views/functions to exclude archived events
-- =====================================================

-- We'll update application queries to filter by archived_at IS NULL
-- This allows admins to still view archived events if needed

-- =====================================================
-- 5. ENABLE RLS (if needed in future)
-- Currently disabled for testing, but here's the policy structure
-- =====================================================

-- Event Templates: Only admins can manage
-- ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage templates" ON public.event_templates FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
-- );

-- Recurring Events: Only admins can manage
-- ALTER TABLE public.recurring_events ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can manage recurring events" ON public.recurring_events FOR ALL USING (
--   EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid())
-- );

-- =====================================================
-- 6. UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_templates_updated_at
  BEFORE UPDATE ON public.event_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_events_updated_at
  BEFORE UPDATE ON public.recurring_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. SAMPLE DATA (optional)
-- Create a few default templates
-- =====================================================

-- We'll add sample templates via admin UI after launch

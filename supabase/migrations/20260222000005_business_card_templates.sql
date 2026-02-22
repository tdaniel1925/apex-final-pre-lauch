-- =============================================
-- Business Card Templates
-- Stores customizable business card designs
-- =============================================

CREATE TABLE IF NOT EXISTS business_card_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template metadata
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Visual preview
  preview_front_url TEXT,
  preview_back_url TEXT,

  -- Layout configuration
  layout_config JSONB NOT NULL DEFAULT '{
    "namePosition": "center",
    "nameAlign": "center",
    "titlePosition": "below-name",
    "contactLayout": "grid",
    "logoPosition": "top-left"
  }'::jsonb,

  -- Color scheme
  colors JSONB NOT NULL DEFAULT '{
    "background": "#F5F5F7",
    "nameColor": "#2B4C7E",
    "titleColor": "#E9546B",
    "contactColor": "#2B4C7E",
    "accentColor": "#E9546B"
  }'::jsonb,

  -- Typography
  fonts JSONB NOT NULL DEFAULT '{
    "nameSize": 22,
    "nameWeight": 700,
    "titleSize": 11,
    "contactSize": 9
  }'::jsonb,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index for quick lookups
CREATE INDEX idx_business_card_templates_active ON business_card_templates(is_active, sort_order);
CREATE INDEX idx_business_card_templates_default ON business_card_templates(is_default) WHERE is_default = true;

-- RLS Policies
ALTER TABLE business_card_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active templates
CREATE POLICY "Anyone can view active templates"
  ON business_card_templates
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON business_card_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- Seed the Apex Official template
INSERT INTO business_card_templates (
  name,
  description,
  is_active,
  is_default,
  sort_order,
  preview_front_url,
  preview_back_url,
  layout_config,
  colors,
  fonts
) VALUES (
  'Apex Official',
  'Official Apex Affinity Group branded design with geometric logo',
  true,
  true,
  1,
  '/biz cards/1.png',
  '/biz cards/2.png',
  '{
    "namePosition": "center",
    "nameAlign": "center",
    "titlePosition": "below-name",
    "contactLayout": "grid",
    "logoPosition": "top-left"
  }'::jsonb,
  '{
    "background": "#F5F5F7",
    "nameColor": "#2B4C7E",
    "titleColor": "#E9546B",
    "contactColor": "#2B4C7E",
    "accentColor": "#E9546B"
  }'::jsonb,
  '{
    "nameSize": 22,
    "nameWeight": 700,
    "titleSize": 11,
    "contactSize": 9
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_card_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_card_template_timestamp
  BEFORE UPDATE ON business_card_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_business_card_template_timestamp();

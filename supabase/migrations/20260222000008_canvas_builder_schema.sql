-- =============================================
-- Canvas-Based Template Builder Schema
-- Adds support for full Canva-like element control
-- =============================================

-- Add new columns for canvas-based design
ALTER TABLE business_card_templates
  ADD COLUMN IF NOT EXISTS front_elements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS back_elements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_fields TEXT[] DEFAULT ARRAY['name', 'phone_primary', 'email']::TEXT[],
  ADD COLUMN IF NOT EXISTS optional_fields TEXT[] DEFAULT ARRAY['phone_secondary', 'tagline']::TEXT[];

-- Add comment explaining the structure
COMMENT ON COLUMN business_card_templates.front_elements IS
'Array of element objects: {id, type, field, content, x, y, width, height, fontSize, fontWeight, color, etc.}';

COMMENT ON COLUMN business_card_templates.back_elements IS
'Array of element objects for card back side';

COMMENT ON COLUMN business_card_templates.required_fields IS
'Fields that must be filled by user: name, phone_primary, email, etc.';

COMMENT ON COLUMN business_card_templates.optional_fields IS
'Fields that are optional: phone_secondary, tagline, address, etc.';

-- Keep old columns for backward compatibility during migration
-- layout_config, colors, fonts will be deprecated after full migration

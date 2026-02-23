-- =============================================
-- Add position properties to business card templates
-- Update existing templates with default positions
-- =============================================

-- Update all existing templates to include position properties
UPDATE business_card_templates
SET layout_config = layout_config || jsonb_build_object(
  'nameX', 50,
  'nameY', 50,
  'titleX', 50,
  'titleY', 60,
  'contactX', 50,
  'contactY', 70
)
WHERE NOT (layout_config ? 'nameX');

-- =============================================
-- Add Blue Modern Corporate template
-- Same front, different back design
-- =============================================

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
  'Apex Professional Blue',
  'Clean blue gradient back with Apex logo - professional modern design',
  true,
  false,
  2,
  '/biz cards/1.png',
  '/biz cards/3.png',
  '{
    "namePosition": "center",
    "nameAlign": "center",
    "titlePosition": "below-name",
    "contactLayout": "grid",
    "logoPosition": "top-left",
    "nameX": 50,
    "nameY": 50,
    "titleX": 50,
    "titleY": 60,
    "contactX": 50,
    "contactY": 85
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

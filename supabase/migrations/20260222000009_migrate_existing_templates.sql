-- =============================================
-- Migrate Existing Templates to Canvas Format
-- Converts old layout_config to element arrays
-- =============================================

-- Template 1: Apex Official
UPDATE business_card_templates
SET
  front_elements = '[
    {
      "id": "logo",
      "type": "image",
      "field": null,
      "content": "/biz cards/1.png",
      "x": 50,
      "y": 50,
      "width": 350,
      "height": 200,
      "zIndex": 0
    },
    {
      "id": "name",
      "type": "text",
      "field": "name",
      "content": "John Doe",
      "x": 50,
      "y": 50,
      "width": 300,
      "height": 40,
      "fontSize": 22,
      "fontWeight": 700,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "center",
      "zIndex": 1
    },
    {
      "id": "title",
      "type": "text",
      "field": "title",
      "content": "Insurance Agent",
      "x": 50,
      "y": 62,
      "width": 300,
      "height": 20,
      "fontSize": 11,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#E9546B",
      "textAlign": "center",
      "zIndex": 1
    },
    {
      "id": "phone",
      "type": "text",
      "field": "phone_primary",
      "content": "(555) 123-4567",
      "x": 25,
      "y": 85,
      "width": 150,
      "height": 20,
      "fontSize": 9,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "left",
      "zIndex": 1
    },
    {
      "id": "email",
      "type": "text",
      "field": "email",
      "content": "john@example.com",
      "x": 75,
      "y": 85,
      "width": 150,
      "height": 20,
      "fontSize": 9,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "right",
      "zIndex": 1
    }
  ]'::jsonb,
  back_elements = '[
    {
      "id": "back_bg",
      "type": "image",
      "field": null,
      "content": "/biz cards/2.png",
      "x": 50,
      "y": 50,
      "width": 350,
      "height": 200,
      "zIndex": 0
    }
  ]'::jsonb,
  required_fields = ARRAY['name', 'title', 'phone_primary', 'email']::TEXT[],
  optional_fields = ARRAY['phone_secondary', 'tagline', 'website']::TEXT[]
WHERE name = 'Apex Official';

-- Template 2: Apex Professional Blue
UPDATE business_card_templates
SET
  front_elements = '[
    {
      "id": "logo",
      "type": "image",
      "field": null,
      "content": "/biz cards/1.png",
      "x": 50,
      "y": 50,
      "width": 350,
      "height": 200,
      "zIndex": 0
    },
    {
      "id": "name",
      "type": "text",
      "field": "name",
      "content": "John Doe",
      "x": 50,
      "y": 50,
      "width": 300,
      "height": 40,
      "fontSize": 22,
      "fontWeight": 700,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "center",
      "zIndex": 1
    },
    {
      "id": "title",
      "type": "text",
      "field": "title",
      "content": "Insurance Agent",
      "x": 50,
      "y": 62,
      "width": 300,
      "height": 20,
      "fontSize": 11,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#E9546B",
      "textAlign": "center",
      "zIndex": 1
    },
    {
      "id": "phone",
      "type": "text",
      "field": "phone_primary",
      "content": "(555) 123-4567",
      "x": 25,
      "y": 85,
      "width": 150,
      "height": 20,
      "fontSize": 9,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "left",
      "zIndex": 1
    },
    {
      "id": "email",
      "type": "text",
      "field": "email",
      "content": "john@example.com",
      "x": 75,
      "y": 85,
      "width": 150,
      "height": 20,
      "fontSize": 9,
      "fontWeight": 600,
      "fontFamily": "Inter",
      "color": "#2B4C7E",
      "textAlign": "right",
      "zIndex": 1
    }
  ]'::jsonb,
  back_elements = '[
    {
      "id": "back_bg",
      "type": "image",
      "field": null,
      "content": "/biz cards/3.png",
      "x": 50,
      "y": 50,
      "width": 350,
      "height": 200,
      "zIndex": 0
    }
  ]'::jsonb,
  required_fields = ARRAY['name', 'title', 'phone_primary', 'email']::TEXT[],
  optional_fields = ARRAY['phone_secondary', 'tagline', 'website']::TEXT[]
WHERE name = 'Apex Professional Blue';

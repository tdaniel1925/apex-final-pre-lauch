SELECT id, slug, first_name, last_name, email 
FROM distributors 
WHERE slug = 'apex-vision' OR is_master = true
LIMIT 5;

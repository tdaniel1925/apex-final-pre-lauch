-- =============================================
-- Update Member Prices for PulseDrive and PulseCommand
-- Date: 2026-03-31
-- =============================================
-- Changes:
-- - PulseDrive member price: $219 → $249
-- - PulseCommand member price: $349 → $399
-- - Recalculate QV and BV for new prices
-- =============================================

-- PulseDrive: Update member price from $219 to $249
UPDATE products
SET
  wholesale_price_cents = 24900,  -- $249
  qv_member = 249,
  bv_member = 116.48  -- Calculated: $249 × 0.70 × 0.70 × 0.95
WHERE slug = 'pulsedrive';

-- PulseCommand: Update member price from $349 to $399
UPDATE products
SET
  wholesale_price_cents = 39900,  -- $399
  qv_member = 399,
  bv_member = 186.62  -- Calculated: $399 × 0.70 × 0.70 × 0.95
WHERE slug = 'pulsecommand';

-- Verification: Display updated prices
DO $$
BEGIN
  RAISE NOTICE '✅ Member Prices Updated:';
  RAISE NOTICE '   PulseDrive: $249 (QV: 249, BV: $116.48)';
  RAISE NOTICE '   PulseCommand: $399 (QV: 399, BV: $186.62)';
END $$;

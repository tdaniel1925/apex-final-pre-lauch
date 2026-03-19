-- =============================================
-- DIGITAL PRODUCTS ENHANCEMENT
-- Add digital file delivery and download tracking
-- =============================================
-- Migration: 20260317030000
-- Created: 2026-03-17
-- =============================================

-- Add digital file fields to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS digital_file_url TEXT,
  ADD COLUMN IF NOT EXISTS digital_file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS digital_file_type TEXT, -- 'pdf', 'video', 'audio', 'zip', etc
  ADD COLUMN IF NOT EXISTS access_duration_days INTEGER DEFAULT NULL, -- NULL = lifetime access
  ADD COLUMN IF NOT EXISTS download_limit INTEGER DEFAULT NULL; -- NULL = unlimited downloads

COMMENT ON COLUMN products.digital_file_url IS 'Secure URL to digital file (S3, Supabase Storage, etc)';
COMMENT ON COLUMN products.digital_file_size_bytes IS 'File size in bytes for display';
COMMENT ON COLUMN products.digital_file_type IS 'File type: pdf, video, audio, zip, etc';
COMMENT ON COLUMN products.access_duration_days IS 'Days of access after purchase (NULL = lifetime)';
COMMENT ON COLUMN products.download_limit IS 'Max downloads per purchase (NULL = unlimited)';

-- =============================================
-- DIGITAL DOWNLOADS TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS digital_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Order relationship
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Purchaser (distributor or customer)
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,

  -- Access control
  download_token TEXT NOT NULL UNIQUE, -- Unique secure token for download URL
  expires_at TIMESTAMPTZ, -- NULL = never expires
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER, -- NULL = unlimited

  -- File info snapshot
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  file_type TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Tracking
  first_downloaded_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  download_ip_addresses TEXT[] DEFAULT '{}', -- Track IPs for security

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT download_has_purchaser CHECK (
    (customer_id IS NOT NULL AND distributor_id IS NULL) OR
    (customer_id IS NULL AND distributor_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_digital_downloads_order ON digital_downloads(order_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_order_item ON digital_downloads(order_item_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_product ON digital_downloads(product_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_distributor ON digital_downloads(distributor_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_customer ON digital_downloads(customer_id);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_token ON digital_downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_status ON digital_downloads(status);
CREATE INDEX IF NOT EXISTS idx_digital_downloads_expires ON digital_downloads(expires_at);

-- Auto-update updated_at
CREATE TRIGGER update_digital_downloads_updated_at
  BEFORE UPDATE ON digital_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DOWNLOAD TOKENS GENERATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION generate_download_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 32-character token
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '+', ''), '/', ''), '=', '');
    token := substring(token, 1, 32);

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM digital_downloads WHERE download_token = token) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTO-CREATE DOWNLOAD RECORDS AFTER ORDER
-- =============================================

CREATE OR REPLACE FUNCTION create_digital_downloads_for_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  product RECORD;
  expires_at_date TIMESTAMPTZ;
BEGIN
  -- Only create downloads when order is fulfilled
  IF NEW.fulfillment_status = 'fulfilled' AND
     (OLD.fulfillment_status IS NULL OR OLD.fulfillment_status != 'fulfilled') THEN

    -- Loop through all order items
    FOR item IN
      SELECT * FROM order_items WHERE order_id = NEW.id
    LOOP
      -- Get product details
      SELECT * INTO product FROM products WHERE id = item.product_id;

      -- Only create download if product is digital and has a file
      IF product.is_digital AND product.digital_file_url IS NOT NULL THEN

        -- Calculate expiration date
        IF product.access_duration_days IS NOT NULL THEN
          expires_at_date := NOW() + (product.access_duration_days || ' days')::INTERVAL;
        ELSE
          expires_at_date := NULL; -- Lifetime access
        END IF;

        -- Create digital download record
        INSERT INTO digital_downloads (
          order_id,
          order_item_id,
          product_id,
          distributor_id,
          customer_id,
          download_token,
          expires_at,
          max_downloads,
          file_url,
          file_name,
          file_size_bytes,
          file_type,
          status
        ) VALUES (
          NEW.id,
          item.id,
          product.id,
          NEW.distributor_id,
          NEW.customer_id,
          generate_download_token(),
          expires_at_date,
          product.download_limit,
          product.digital_file_url,
          product.name,
          product.digital_file_size_bytes,
          product.digital_file_type,
          'active'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_downloads_on_order_fulfillment
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_digital_downloads_for_order();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE digital_downloads ENABLE ROW LEVEL SECURITY;

-- Distributors can view their own downloads
CREATE POLICY "Distributors can view own downloads"
  ON digital_downloads FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Customers can view their own downloads
CREATE POLICY "Customers can view own downloads"
  ON digital_downloads FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Admins can view all downloads
CREATE POLICY "Admins can manage downloads"
  ON digital_downloads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE digital_downloads IS 'Tracks digital product downloads with secure tokens and access control';
COMMENT ON COLUMN digital_downloads.download_token IS 'Unique secure token for download URL (prevents unauthorized access)';
COMMENT ON COLUMN digital_downloads.expires_at IS 'When access expires (NULL = lifetime access)';
COMMENT ON COLUMN digital_downloads.download_count IS 'Number of times file has been downloaded';
COMMENT ON COLUMN digital_downloads.status IS 'active, expired, or revoked';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

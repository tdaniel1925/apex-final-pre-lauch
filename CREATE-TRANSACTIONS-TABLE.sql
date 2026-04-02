-- ===================================================================
-- CREATE TRANSACTIONS TABLE
-- Required for commission system testing
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Distributor Reference
  distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,

  -- Transaction Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'product_sale',
    'subscription_payment',
    'commission_payment',
    'refund'
  )),

  -- Amount
  amount DECIMAL(10,2) NOT NULL,

  -- Stripe Integration
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,

  -- Product Reference
  product_slug TEXT,

  -- Metadata (flexible JSON for additional data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_distributor_id
  ON transactions(distributor_id);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_status
  ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON transactions(transaction_type);

-- Add RLS policies (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Distributors can view their own transactions
CREATE POLICY "Distributors can view own transactions"
  ON transactions
  FOR SELECT
  USING (
    distributor_id IN (
      SELECT id FROM distributors WHERE auth_user_id = auth.uid()
    )
  );

-- Policy: Service role can do anything (for webhooks/backend)
CREATE POLICY "Service role full access"
  ON transactions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Verify table was created
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

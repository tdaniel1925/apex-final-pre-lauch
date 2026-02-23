-- Add ACH/Banking fields for commission payouts
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_routing_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_type TEXT CHECK (bank_account_type IN ('checking', 'savings')),
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS tax_id_type TEXT CHECK (tax_id_type IN ('ssn', 'ein')),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS ach_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ach_verified_at TIMESTAMP WITH TIME ZONE;

-- Comment on columns
COMMENT ON COLUMN distributors.bank_name IS 'Name of bank for ACH deposits';
COMMENT ON COLUMN distributors.bank_routing_number IS 'Bank routing number (9 digits)';
COMMENT ON COLUMN distributors.bank_account_number IS 'Bank account number';
COMMENT ON COLUMN distributors.bank_account_type IS 'Type of bank account (checking or savings)';
COMMENT ON COLUMN distributors.tax_id IS 'Tax ID (SSN or EIN) - encrypted/hashed in application layer';
COMMENT ON COLUMN distributors.tax_id_type IS 'Type of tax ID (SSN for individuals, EIN for businesses)';
COMMENT ON COLUMN distributors.date_of_birth IS 'Date of birth for tax compliance';
COMMENT ON COLUMN distributors.ach_verified IS 'Whether ACH information has been verified';
COMMENT ON COLUMN distributors.ach_verified_at IS 'When ACH information was verified';

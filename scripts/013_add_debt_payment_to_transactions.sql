-- Add debt_payment_id column to transactions table for linking debt payments
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debt_payment_id UUID REFERENCES debt_payments(id) ON DELETE SET NULL;

-- Create index for debt_payment_id
CREATE INDEX IF NOT EXISTS idx_transactions_debt_payment_id ON transactions(debt_payment_id) WHERE debt_payment_id IS NOT NULL;

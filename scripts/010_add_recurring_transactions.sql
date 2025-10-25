-- Add recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  notes TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  interval_count INTEGER NOT NULL DEFAULT 1, -- e.g., every 2 weeks
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means indefinite
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add template_id to transactions table to track which recurring transaction created it
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- Create indexes for recurring transactions
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_ledger_id ON recurring_transactions(ledger_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_due_date ON recurring_transactions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_template_id ON transactions(template_id);

-- Add RLS policies for recurring transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own recurring transactions
CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own recurring transactions
CREATE POLICY "Users can insert their own recurring transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own recurring transactions
CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own recurring transactions
CREATE POLICY "Users can delete their own recurring transactions" ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

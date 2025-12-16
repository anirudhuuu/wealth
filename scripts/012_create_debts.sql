-- Create debts table
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ledger_id UUID REFERENCES ledgers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  creditor_name TEXT,
  principal_amount DECIMAL(15, 2) NOT NULL,
  current_balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(10, 4) NOT NULL,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('simple', 'compound', 'fixed', 'variable')),
  compounding_frequency TEXT CHECK (compounding_frequency IN ('daily', 'monthly', 'yearly')),
  currency TEXT NOT NULL DEFAULT 'INR',
  start_date DATE NOT NULL,
  maturity_date DATE,
  minimum_payment DECIMAL(15, 2),
  payment_frequency TEXT NOT NULL CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
  next_payment_date DATE,
  payoff_strategy TEXT NOT NULL DEFAULT 'minimum_only' CHECK (payoff_strategy IN ('snowball', 'avalanche', 'custom', 'minimum_only')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid_off', 'defaulted', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create debt_payments table
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  principal_paid DECIMAL(15, 2) NOT NULL,
  interest_paid DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  is_scheduled BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create debt_schedules table
CREATE TABLE IF NOT EXISTS debt_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_amount DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'missed', 'skipped')),
  payment_id UUID REFERENCES debt_payments(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_ledger_id ON debts(ledger_id) WHERE ledger_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_next_payment_date ON debts(next_payment_date) WHERE next_payment_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_user_id ON debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_payment_date ON debt_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_debt_payments_transaction_id ON debt_payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_debt_schedules_debt_id ON debt_schedules(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_schedules_user_id ON debt_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_schedules_scheduled_date ON debt_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_debt_schedules_status ON debt_schedules(status);

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debts
CREATE POLICY "Users can view their own debts"
  ON debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts"
  ON debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
  ON debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
  ON debts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for debt_payments
CREATE POLICY "Users can view their own debt payments"
  ON debt_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt payments"
  ON debt_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt payments"
  ON debt_payments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments"
  ON debt_payments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for debt_schedules
CREATE POLICY "Users can view their own debt schedules"
  ON debt_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt schedules"
  ON debt_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt schedules"
  ON debt_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt schedules"
  ON debt_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update debts.updated_at
CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update debt_payments.updated_at
CREATE TRIGGER update_debt_payments_updated_at
  BEFORE UPDATE ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update debt_schedules.updated_at
CREATE TRIGGER update_debt_schedules_updated_at
  BEFORE UPDATE ON debt_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update debt current_balance when payments change
CREATE OR REPLACE FUNCTION update_debt_current_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Subtract payment amount from debt balance
    UPDATE debts
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
    
    -- Auto-update status to paid_off if balance reaches zero
    UPDATE debts
    SET status = 'paid_off',
        updated_at = NOW()
    WHERE id = NEW.debt_id
      AND current_balance - NEW.amount <= 0
      AND status = 'active';
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust debt balance by difference
    UPDATE debts
    SET current_balance = current_balance + OLD.amount - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
    
    -- Check if debt should be paid off or reactivated
    UPDATE debts
    SET status = CASE
      WHEN current_balance + OLD.amount - NEW.amount <= 0 AND status = 'active' THEN 'paid_off'
      WHEN current_balance + OLD.amount - NEW.amount > 0 AND status = 'paid_off' THEN 'active'
      ELSE status
    END,
    updated_at = NOW()
    WHERE id = NEW.debt_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Add payment amount back to debt balance
    UPDATE debts
    SET current_balance = current_balance + OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.debt_id;
    
    -- Reactivate debt if it was paid off and now has balance
    UPDATE debts
    SET status = 'active',
        updated_at = NOW()
    WHERE id = OLD.debt_id
      AND current_balance + OLD.amount > 0
      AND status = 'paid_off';
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers to update debt current_balance
CREATE TRIGGER update_debt_on_payment_insert
  AFTER INSERT ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_current_balance();

CREATE TRIGGER update_debt_on_payment_update
  AFTER UPDATE ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_current_balance();

CREATE TRIGGER update_debt_on_payment_delete
  AFTER DELETE ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_current_balance();

-- Function to auto-update debt_schedules status when payment is made
CREATE OR REPLACE FUNCTION update_debt_schedule_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_scheduled THEN
    -- Find matching schedule and mark as paid
    UPDATE debt_schedules
    SET status = 'paid',
        payment_id = NEW.id,
        updated_at = NOW()
    WHERE debt_id = NEW.debt_id
      AND scheduled_date = NEW.payment_date
      AND status = 'pending'
      AND ABS(scheduled_amount - NEW.amount) < 0.01; -- Allow small rounding differences
    
    -- If no exact match, find closest pending schedule
    UPDATE debt_schedules
    SET status = 'paid',
        payment_id = NEW.id,
        updated_at = NOW()
    WHERE debt_id = NEW.debt_id
      AND scheduled_date <= NEW.payment_date
      AND status = 'pending'
      AND payment_id IS NULL
      AND id = (
        SELECT id FROM debt_schedules
        WHERE debt_id = NEW.debt_id
          AND scheduled_date <= NEW.payment_date
          AND status = 'pending'
          AND payment_id IS NULL
        ORDER BY scheduled_date DESC
        LIMIT 1
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update schedule when payment is made
CREATE TRIGGER update_schedule_on_payment_insert
  AFTER INSERT ON debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_schedule_on_payment();

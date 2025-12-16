-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  target_date DATE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  milestones JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goal_contributions table
CREATE TABLE IF NOT EXISTS goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date) WHERE target_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_user_id ON goal_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_contributions_date ON goal_contributions(date);

-- Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for goal_contributions
CREATE POLICY "Users can view their own goal contributions"
  ON goal_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal contributions"
  ON goal_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal contributions"
  ON goal_contributions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal contributions"
  ON goal_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update goals.updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update goal_contributions.updated_at
CREATE TRIGGER update_goal_contributions_updated_at
  BEFORE UPDATE ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update goal current_amount when contributions change
CREATE OR REPLACE FUNCTION update_goal_current_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add contribution amount to goal
    UPDATE goals
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.goal_id;
    
    -- Auto-update status to completed if target reached
    UPDATE goals
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = NEW.goal_id
      AND current_amount >= target_amount
      AND status = 'active';
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust goal amount by difference
    UPDATE goals
    SET current_amount = current_amount - OLD.amount + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.goal_id;
    
    -- Check if goal should be completed or reactivated
    UPDATE goals
    SET status = CASE
      WHEN current_amount >= target_amount AND status = 'active' THEN 'completed'
      WHEN current_amount < target_amount AND status = 'completed' THEN 'active'
      ELSE status
    END,
    updated_at = NOW()
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Subtract contribution amount from goal
    UPDATE goals
    SET current_amount = current_amount - OLD.amount,
        updated_at = NOW()
    WHERE id = OLD.goal_id;
    
    -- Reactivate goal if it was completed and now below target
    UPDATE goals
    SET status = 'active',
        updated_at = NOW()
    WHERE id = OLD.goal_id
      AND current_amount < target_amount
      AND status = 'completed';
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers to update goal current_amount
CREATE TRIGGER update_goal_on_contribution_insert
  AFTER INSERT ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_current_amount();

CREATE TRIGGER update_goal_on_contribution_update
  AFTER UPDATE ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_current_amount();

CREATE TRIGGER update_goal_on_contribution_delete
  AFTER DELETE ON goal_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_current_amount();

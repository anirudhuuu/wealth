-- Enable Row Level Security on all tables
ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Admin whitelist policies (only admins can manage)
CREATE POLICY "Admin whitelist is viewable by authenticated users"
  ON admin_whitelist FOR SELECT
  TO authenticated
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Ledgers policies
CREATE POLICY "Users can view their own ledgers"
  ON ledgers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ledgers"
  ON ledgers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ledgers"
  ON ledgers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ledgers"
  ON ledgers FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Assets policies
CREATE POLICY "Users can view their own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

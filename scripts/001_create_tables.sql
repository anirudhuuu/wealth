-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin whitelist table
CREATE TABLE IF NOT EXISTS admin_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ledgers table
CREATE TABLE IF NOT EXISTS ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('family', 'personal', 'loan')),
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fd', 'mutual_fund', 'gold', 'real_estate', 'other')),
  current_value DECIMAL(15, 2) NOT NULL,
  purchase_value DECIMAL(15, 2),
  purchase_date DATE,
  maturity_date DATE,
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  base_currency TEXT NOT NULL DEFAULT 'INR',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ledger_id ON transactions(ledger_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date ON transactions(user_id, category, date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date ON transactions(user_id, type, date);
CREATE INDEX IF NOT EXISTS idx_ledgers_user_id ON ledgers(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_type ON assets(user_id, type);
CREATE INDEX IF NOT EXISTS idx_assets_maturity_date ON assets(maturity_date) WHERE maturity_date IS NOT NULL;

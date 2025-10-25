-- Migration: Remove is_admin column from profiles table
-- This removes the is_admin column since we no longer use admin restrictions

-- Remove the is_admin column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin;

-- Update the handle_new_user function to remove is_admin reference
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile without admin restrictions
  INSERT INTO profiles (id, email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default settings
  INSERT INTO user_settings (user_id, base_currency, theme)
  VALUES (
    NEW.id,
    'INR',
    'system'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Update RLS policies to remove admin checks
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create simplified RLS policies without admin checks
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Remove admin_whitelist table if it exists
DROP TABLE IF EXISTS admin_whitelist;

-- Remove admin restrictions for all users
-- This gives all users full access to their data

-- Step 1: Update all existing non-admin users to have admin access
UPDATE profiles
SET is_admin = true
WHERE is_admin = false;

-- Step 2: Remove admin_whitelist table as it's no longer needed
DROP TABLE IF EXISTS admin_whitelist;

-- Step 3: Update the trigger to give all new users admin access
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with full access for all users
  INSERT INTO profiles (id, email, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    true
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

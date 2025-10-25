-- Migration: Drop user_settings table
-- This removes the user_settings table as it's not being used by the application
-- Theme functionality is handled by next-themes library (client-side)
-- Currency preferences are not implemented

-- Step 1: Drop the trigger for user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;

-- Step 2: Update the handle_new_user function to remove user_settings creation
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

  -- Note: user_settings creation removed as it's not used

  RETURN NEW;
END;
$$;

-- Step 3: Drop RLS policies for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- Step 4: Drop the user_settings table
DROP TABLE IF EXISTS user_settings;

-- Fix admin access issue
-- This script helps resolve the sandbox preview issue for whitelisted admin emails

-- Step 1: Add your actual admin email to the whitelist
-- Replace 'your-actual-email@example.com' with your real email address
INSERT INTO admin_whitelist (email)
VALUES ('your-actual-email@example.com')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Update existing user profiles to admin status if their email is in whitelist
-- This fixes users who signed up before the whitelist was properly configured
UPDATE profiles 
SET is_admin = true
WHERE email IN (
  SELECT email FROM admin_whitelist
);

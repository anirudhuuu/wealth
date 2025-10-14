-- Add your admin email to the whitelist
-- Replace 'your-email@example.com' with your actual email
INSERT INTO admin_whitelist (email)
VALUES ('email@gmail.com')
ON CONFLICT (email) DO NOTHING;

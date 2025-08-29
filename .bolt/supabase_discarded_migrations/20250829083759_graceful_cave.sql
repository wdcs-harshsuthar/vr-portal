/*
  # Disable Email Confirmation

  This migration disables email confirmation requirements for user authentication.
  Users can now sign up and log in immediately without email verification.

  1. Configuration Changes
    - Disable email confirmation requirement
    - Allow immediate login after signup
*/

-- Update auth configuration to disable email confirmation
-- Note: This needs to be done in Supabase Dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF

-- For any existing users that might have email_confirmed_at as null, update them
UPDATE auth.users 
SET email_confirmed_at = created_at 
WHERE email_confirmed_at IS NULL;
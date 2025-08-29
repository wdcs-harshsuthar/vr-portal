/*
  # Add Admin User to Supabase Auth

  1. New Auth User
    - Creates admin user in auth.users table
    - Email: admin@360hub.com
    - Password: admin123
    - Email confirmed automatically

  2. Profile Creation
    - Creates corresponding profile in profiles table
    - Links to auth user via foreign key
    - Sets up proper user data

  3. Security
    - Uses Supabase's built-in password hashing
    - Enables email confirmation
    - Creates secure user session capability
*/

-- Insert admin user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@360hub.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID for the admin user we just created
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@360hub.com';

  -- Insert corresponding profile
  INSERT INTO profiles (
    id,
    name,
    email,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Admin User',
    'admin@360hub.com',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();
END $$;
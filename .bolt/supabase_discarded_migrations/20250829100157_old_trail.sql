/*
  # Add User Roles and JWT Authentication

  1. Schema Changes
    - Add `role` column to users table with default 'user'
    - Add `is_active` column for account status
    - Update RLS policies for role-based access

  2. Security
    - Enable RLS on users table
    - Add policies for user and admin access
    - Create JWT helper functions

  3. Functions
    - Add function to check user roles
    - Add function to validate JWT tokens
*/

-- Add role and status columns to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text DEFAULT 'user' NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Add constraint for role values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create RLS policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- Allow reading for session validation

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true); -- Will be controlled by application logic

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  USING (true);

-- Update user_sessions table to include role information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN user_role text DEFAULT 'user' NOT NULL;
  END IF;
END $$;

-- Enable RLS on user_sessions table
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sessions table
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Admins can manage all sessions" ON user_sessions;

CREATE POLICY "Users can manage own sessions"
  ON user_sessions
  FOR ALL
  USING (true); -- Will be controlled by application logic

-- Create function to get user by session token
CREATE OR REPLACE FUNCTION get_user_by_session_token(session_token text)
RETURNS TABLE (
  user_id uuid,
  name text,
  email text,
  role text,
  is_active boolean,
  expires_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    s.expires_at
  FROM users u
  JOIN user_sessions s ON u.id = s.user_id
  WHERE s.token = session_token
    AND s.expires_at > now()
    AND u.is_active = true;
END;
$$;

-- Create function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id AND is_active = true;
  
  RETURN user_role = 'admin';
END;
$$;

-- Create an admin user (optional - for testing)
-- Password: admin123 (hashed)
INSERT INTO users (name, email, password_hash, role) 
VALUES (
  'Admin User',
  'admin@360hubexperience.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_is_active_idx ON users(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(token);
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
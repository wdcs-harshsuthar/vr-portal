/*
  # Add role and is_active columns to users table

  1. Schema Changes
    - Add `role` column to `users` table (enum: 'user', 'admin', default: 'user')
    - Add `is_active` column to `users` table (boolean, default: true)
    - Add `user_role` column to `user_sessions` table for role tracking

  2. Data Migration
    - Set all existing users to 'user' role
    - Set all existing users as active
    - Create a default admin user for testing

  3. Security
    - Enable RLS on users table
    - Add policies for user data access
    - Add admin-only policies for user management

  4. Indexes
    - Add index on role column for efficient role-based queries
    - Add index on is_active column for filtering active users
*/

-- Add role column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Add is_active column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Add user_role column to user_sessions table for role tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_sessions' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN user_role text DEFAULT 'user' CHECK (user_role IN ('user', 'admin'));
  END IF;
END $$;

-- Update existing users to have default values
UPDATE users SET role = 'user' WHERE role IS NULL;
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_is_active_idx ON users(is_active);
CREATE INDEX IF NOT EXISTS user_sessions_user_role_idx ON user_sessions(user_role);

-- Enable RLS on users table if not already enabled
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
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Admin policies (these will work when we have proper admin detection)
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin' 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Create a default admin user for testing (password: admin123)
-- Password hash for 'admin123' using SHA-256
INSERT INTO users (name, email, password_hash, role, is_active) 
VALUES (
  'System Administrator',
  'admin@360hubexperience.com',
  'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
  'admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true;
/*
  # Custom User Authentication System

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `email` (text, unique, user's email)
      - `password_hash` (text, hashed password)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `token` (text, JWT token)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `date` (date, tour date)
      - `location` (text, tour location)
      - `time_slot` (text, selected time)
      - `participants` (integer, number of participants)
      - `donation_tickets` (integer, donated tickets)
      - `total_cost` (integer, total cost in cents)
      - `status` (text, booking status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Password hashing for security

  3. Functions
    - Update timestamps automatically
*/

-- Create users table for custom authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user sessions table for JWT token management
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Update bookings table to reference custom users table
DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  time_slot text NOT NULL,
  participants integer NOT NULL DEFAULT 1,
  donation_tickets integer NOT NULL DEFAULT 0,
  total_cost integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id')::uuid);

-- Sessions policies
CREATE POLICY "Users can read own sessions"
  ON user_sessions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own sessions"
  ON user_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(token);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
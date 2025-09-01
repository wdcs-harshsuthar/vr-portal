-- Migration: Add profile fields to users table
-- This migration adds new profile fields for enhanced user profiles

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);

-- Add comments to document the new fields
COMMENT ON COLUMN users.phone IS 'User phone number';
COMMENT ON COLUMN users.address IS 'User address';
COMMENT ON COLUMN users.date_of_birth IS 'User date of birth';


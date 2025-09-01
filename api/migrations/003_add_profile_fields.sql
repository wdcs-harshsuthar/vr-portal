-- Migration: Add profile fields to attendees table
-- This migration adds the new profile fields required for the enhanced booking experience

-- Add new columns to attendees table
ALTER TABLE attendees 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_school VARCHAR(255),
ADD COLUMN IF NOT EXISTS interest VARCHAR(255),
ADD COLUMN IF NOT EXISTS gpa VARCHAR(10),
ADD COLUMN IF NOT EXISTS email_consent BOOLEAN DEFAULT FALSE;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_attendees_email ON attendees(email);
CREATE INDEX IF NOT EXISTS idx_attendees_interest ON attendees(interest);
CREATE INDEX IF NOT EXISTS idx_attendees_gpa ON attendees(gpa);

-- Add comments to document the new fields
COMMENT ON COLUMN attendees.first_name IS 'Student first name';
COMMENT ON COLUMN attendees.last_name IS 'Student last name';
COMMENT ON COLUMN attendees.email IS 'Student email address';
COMMENT ON COLUMN attendees.current_school IS 'Student current school';
COMMENT ON COLUMN attendees.interest IS 'Educational interest (Four-year colleges, Technical colleges, Trade schools, All of the above)';
COMMENT ON COLUMN attendees.gpa IS 'Student GPA (1.0 to 4.0)';
COMMENT ON COLUMN attendees.email_consent IS 'Whether colleges can email the student';


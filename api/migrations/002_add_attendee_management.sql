-- Migration: Add attendee management support
-- Add new columns to bookings table for donor support
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS is_donor BOOLEAN NOT NULL DEFAULT FALSE;

-- Create attendees table
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(100),
    school VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for attendees table
CREATE INDEX IF NOT EXISTS idx_attendees_booking_id ON attendees(booking_id);
CREATE INDEX IF NOT EXISTS idx_attendees_name ON attendees(name);

-- Add trigger for attendees updated_at
CREATE TRIGGER update_attendees_updated_at BEFORE UPDATE ON attendees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update bookings validation to allow higher participant counts for donors
-- Note: This removes the constraint if it exists and recreates it
-- The application will handle the business logic for participant limits


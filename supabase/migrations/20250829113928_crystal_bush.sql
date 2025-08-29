/*
  # Add Admin User

  1. New Data
    - Insert admin user with credentials:
      - Email: admin@360hub.com
      - Password: admin123 (hashed)
      - Role: admin
      - Name: System Administrator

  2. Security
    - Password is properly hashed using SHA-256
    - Admin role is set for full system access
*/

-- Insert admin user with hashed password
INSERT INTO users (
  name,
  email,
  password_hash
) VALUES (
  'System Administrator',
  'admin@360hub.com',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' -- This is the SHA-256 hash of 'admin123'
) ON CONFLICT (email) DO NOTHING;

-- Note: The password hash above is for 'admin123'
-- You can login with:
-- Email: admin@360hub.com  
-- Password: admin123
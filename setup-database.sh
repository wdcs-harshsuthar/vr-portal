#!/bin/bash

# VR Portal Database Setup Script
echo "🚀 Setting up VR Portal PostgreSQL Database..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "macOS: brew install postgresql"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL service is not running. Please start PostgreSQL first."
    echo "Ubuntu/Debian: sudo systemctl start postgresql"
    echo "macOS: brew services start postgresql"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "📦 Creating database 'vr_portal'..."
sudo -u postgres psql -c "CREATE DATABASE vr_portal;" 2>/dev/null || echo "Database 'vr_portal' already exists"

# Create user if it doesn't exist (optional)
echo "👤 Creating user 'vr_portal_user'..."
sudo -u postgres psql -c "CREATE USER vr_portal_user WITH PASSWORD 'vr_portal_password';" 2>/dev/null || echo "User 'vr_portal_user' already exists"

# Grant privileges
echo "🔐 Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vr_portal TO vr_portal_user;" 2>/dev/null || echo "Privileges already granted"

echo "✅ Database setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update api/.env with your database credentials"
echo "2. Start the API server: cd api && npm run dev"
echo "3. Start the frontend: npm run dev"
echo ""
echo "🔗 Default database connection:"
echo "Host: localhost"
echo "Port: 5432"
echo "Database: vr_portal"
echo "User: postgres (or vr_portal_user)"
echo "Password: your_postgres_password"

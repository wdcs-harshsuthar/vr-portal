# 🚀 VR Portal Setup Guide

## Overview
This project now uses a local Express.js API with PostgreSQL instead of Supabase. This provides better control, no CORS issues, and easier local development.

## 🗄️ Database Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

### 2. Start PostgreSQL Service
```bash
# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew services start postgresql
```

### 3. Create Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE vr_portal;

# Exit psql
\q
```

## 🔧 API Setup

### 1. Navigate to API Directory
```bash
cd api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp env.example .env
```

Edit `.env` with your database credentials:
```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vr_portal
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 4. Test API
```bash
npm run dev
```

Visit: http://localhost:3001/health

## 🌐 Frontend Setup

### 1. Configure Environment
```bash
# In the project root
cp env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Test Frontend
```bash
npm run dev
```

Visit: http://localhost:5173

## 🚀 Quick Start

### Option 1: Use the Start Script
```bash
./start-dev.sh
```

This will start both API and frontend servers automatically.

### Option 2: Manual Start
```bash
# Terminal 1 - Start API
cd api
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `DELETE /api/bookings/:id` - Delete booking

## 🔐 Testing the System

### 1. Create Account
- Visit: http://localhost:5173/signup
- Fill in the form
- Check browser console for any errors

### 2. Login
- Visit: http://localhost:5173/login
- Use your credentials
- Should redirect to dashboard

### 3. Check API Logs
- Watch the API terminal for request logs
- Check for any database connection errors

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if you can connect
psql -h localhost -U postgres -d vr_portal
```

### Port Already in Use
```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### CORS Issues
- Ensure `CORS_ORIGIN` in API `.env` matches your frontend URL
- Check browser console for specific CORS errors

### JWT Issues
- Ensure `JWT_SECRET` is set in API `.env`
- Check token expiration
- Verify Authorization header format: `Bearer <token>`

## 📁 Project Structure

```
VR-portal/
├── api/                    # Express.js API server
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   ├── database/          # Database schema
│   ├── server.js          # Main server file
│   └── package.json       # API dependencies
├── src/                   # React frontend
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   └── main.tsx           # App entry point
├── start-dev.sh           # Development startup script
└── package.json           # Frontend dependencies
```

## 🔄 Migration from Supabase

### What Changed
- ✅ Removed `@supabase/supabase-js` dependency
- ✅ Updated auth functions to use local API
- ✅ Updated AuthContext to work with new API
- ✅ Removed Supabase-specific code
- ✅ Added proper error handling

### What You Need to Do
1. Set up PostgreSQL database
2. Configure environment variables
3. Start API server
4. Update frontend environment
5. Test authentication flow

## 🎯 Next Steps

1. **Test the complete flow** - signup → login → dashboard
2. **Add more features** - user profile, password reset, etc.
3. **Deploy to production** - use proper database hosting (AWS RDS, etc.)
4. **Add monitoring** - logging, error tracking, performance monitoring

## 📞 Support

If you encounter issues:
1. Check the API console for errors
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all environment variables are set correctly

---

**Happy coding! 🎉**


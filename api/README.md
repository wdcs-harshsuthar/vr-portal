# VR Portal API

A complete REST API for the VR Portal application with PostgreSQL database, JWT authentication, and booking management.

## Features

- 🔐 JWT-based authentication
- 👥 User management (signup, login, logout)
- 📅 Booking management (CRUD operations)
- 🗄️ PostgreSQL database with proper indexing
- ✅ Input validation and sanitization
- 🛡️ Security middleware (helmet, rate limiting)
- 🌐 CORS support for frontend integration
- 📝 Comprehensive error handling

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone and navigate to the API directory:**
   ```bash
   cd api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vr_portal
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE vr_portal;
   ```
   
   The API will automatically create tables and indexes on startup.

## Running the API

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-29T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-29T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/logout
Logout user (invalidate token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### GET /api/auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Bookings

All booking endpoints require authentication via JWT token in the Authorization header.

#### POST /api/bookings
Create a new booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "date": "2025-09-15",
  "location": "VR Lab A",
  "time_slot": "10:00-11:00",
  "participants": 2,
  "donation_tickets": 1,
  "total_cost": 25.50
}
```

#### GET /api/bookings
Get all bookings for the authenticated user.

#### GET /api/bookings/:id
Get a specific booking by ID.

#### PUT /api/bookings/:id
Update a booking.

#### PATCH /api/bookings/:id/cancel
Cancel a booking.

#### DELETE /api/bookings/:id
Soft delete a booking (sets status to cancelled).

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### User Sessions Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `token_hash` (VARCHAR)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

### Bookings Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `date` (DATE)
- `location` (VARCHAR)
- `time_slot` (VARCHAR)
- `participants` (INTEGER)
- `donation_tickets` (INTEGER)
- `total_cost` (DECIMAL)
- `status` (VARCHAR: pending/confirmed/cancelled)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details if available"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Frontend Integration

Update your frontend environment variables to point to the local API:

```env
VITE_API_URL=http://localhost:3001/api
```

Then update your auth functions to use the new endpoints:

```typescript
// Instead of Supabase functions, use:
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(credentials),
});
```

## Development

### Database Migrations
The API automatically creates tables and indexes on startup. For production, consider using a proper migration tool.

### Environment Variables
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode
- `DB_HOST`: PostgreSQL host
- `DB_PORT`: PostgreSQL port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time
- `CORS_ORIGIN`: Allowed origin for CORS

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in .env
   - Ensure database exists

2. **CORS Errors**
   - Verify CORS_ORIGIN in .env matches your frontend URL
   - Check browser console for specific CORS errors

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration
   - Verify Authorization header format: `Bearer <token>`

### Logs
The API logs all requests and errors to the console. Check the terminal output for debugging information.

## License

MIT

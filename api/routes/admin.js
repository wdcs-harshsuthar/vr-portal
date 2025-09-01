const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Admin login (no auth required)
router.post('/login', [
  body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Check if user exists and is admin
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1 OR name = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id,
        b.date,
        b.location,
        b.time_slot,
        b.participants,
        b.donation_tickets,
        b.total_cost,
        b.status,
        b.college_id,
        b.college_name,
        b.is_donor,
        b.created_at,
        u.name as user_name,
        u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    const bookings = await Promise.all(result.rows.map(async (booking) => {
      // Fetch attendees for this booking
      const attendeesResult = await pool.query(
        `SELECT name, grade, school, 
                first_name, last_name, email, current_school, 
                interest, gpa, email_consent 
         FROM attendees WHERE booking_id = $1 ORDER BY created_at`,
        [booking.id]
      );
      
      return {
        id: booking.id,
        user_name: booking.user_name,
        user_email: booking.user_email,
        date: booking.date,
        location: booking.location,
        time_slot: booking.time_slot,
        participants: booking.participants,
        donation_tickets: booking.donation_tickets,
        total_cost: parseFloat(booking.total_cost),
        status: booking.status,
        college_id: booking.college_id,
        college_name: booking.college_name,
        is_donor: booking.is_donor,
        created_at: booking.created_at,
        attendees: attendeesResult.rows
      };
    }));

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    // Get total bookings
    const totalBookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
    const totalBookings = parseInt(totalBookingsResult.rows[0].count);

    // Get pending bookings
    const pendingBookingsResult = await pool.query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const pendingBookings = parseInt(pendingBookingsResult.rows[0].count);



    // Get total revenue
    const totalRevenueResult = await pool.query('SELECT COALESCE(SUM(total_cost), 0) FROM bookings');
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].coalesce);

    // Get this month's bookings
    const thisMonthResult = await pool.query(`
      SELECT COUNT(*), COALESCE(SUM(total_cost), 0) 
      FROM bookings 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const thisMonthBookings = parseInt(thisMonthResult.rows[0].count);
    const thisMonthRevenue = parseFloat(thisMonthResult.rows[0].coalesce);

    res.json({
      success: true,
      totalBookings,
      pendingBookings,
      confirmedBookings: 0,
      totalRevenue,
      thisMonthBookings,
      thisMonthRevenue
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Get all users (admin only)
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        email,
        role,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }));

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


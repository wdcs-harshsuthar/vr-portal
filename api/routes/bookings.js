const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all booking routes
router.use(authenticateToken);

// Create a new booking
router.post('/', [
  body('date').notEmpty().withMessage('Date is required'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('time_slot').trim().isLength({ min: 1 }).withMessage('Time slot is required'),
  body('participants').isInt({ min: 1, max: 10 }).withMessage('Participants must be between 1 and 10'),
  body('donation_tickets').isInt({ min: 0 }).withMessage('Donation tickets must be 0 or positive'),
  body('total_cost').isFloat({ min: 0 }).withMessage('Total cost must be 0 or positive'),
  body('college_id').optional().isInt().withMessage('College ID must be a valid integer'),
  body('college_name').optional().isLength({ min: 0 }).withMessage('College name can be empty')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body:', req.body);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { date, location, time_slot, participants, donation_tickets, total_cost, college_id, college_name } = req.body;
    const userId = req.user.id;

    console.log('Creating booking for user:', userId);
    console.log('Booking data:', { date, location, time_slot, participants, donation_tickets, total_cost, college_id, college_name });

    // Check if the time slot is available for the given date and location
    const existingBooking = await pool.query(
      'SELECT id FROM bookings WHERE date = $1 AND location = $2 AND time_slot = $3 AND status != $4',
      [date, location, time_slot, 'cancelled']
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked for the selected date and location' });
    }

    // Create booking
    const newBooking = await pool.query(
      `INSERT INTO bookings (user_id, date, location, time_slot, participants, donation_tickets, total_cost, college_id, college_name, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [userId, date, location, time_slot, participants, donation_tickets, total_cost, college_id, college_name]
    );

    const booking = newBooking.rows[0];
    console.log('Booking created successfully:', booking.id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        date: booking.date,
        location: booking.location,
        time_slot: booking.time_slot,
        participants: booking.participants,
        donation_tickets: booking.donation_tickets,
        total_cost: booking.total_cost,
        college_id: booking.college_id,
        college_name: booking.college_name,
        status: booking.status,
        created_at: booking.created_at
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const bookings = result.rows.map(booking => ({
      id: booking.id,
      date: booking.date,
      location: booking.location,
      time_slot: booking.time_slot,
      participants: booking.participants,
      donation_tickets: booking.donation_tickets,
      total_cost: booking.total_cost,
      college_id: booking.college_id,
      college_name: booking.college_name,
      status: booking.status,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }));

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    res.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.date,
        location: booking.location,
        time_slot: booking.time_slot,
        participants: booking.participants,
        donation_tickets: booking.donation_tickets,
        total_cost: booking.total_cost,
        status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a booking
router.put('/:id', [
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('location').optional().trim().isLength({ min: 1 }).withMessage('Location cannot be empty'),
  body('time_slot').optional().trim().isLength({ min: 1 }).withMessage('Time slot cannot be empty'),
  body('participants').optional().isInt({ min: 1, max: 10 }).withMessage('Participants must be between 1 and 10'),
  body('donation_tickets').optional().isInt({ min: 0 }).withMessage('Donation tickets must be 0 or positive'),
  body('total_cost').optional().isFloat({ min: 0 }).withMessage('Total cost must be 0 or positive'),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status')
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

    const { id } = req.params;
    const userId = req.user.id;
    const updateFields = req.body;

    // Check if booking exists and belongs to user
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if the booking can be updated (not cancelled)
    if (existingBooking.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot update a cancelled booking' });
    }

    // Build update query dynamically
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updateFields[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at timestamp
    setClause.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // Add id and user_id to values array
    values.push(id, userId);

    const query = `
      UPDATE bookings 
      SET ${setClause.join(', ')} 
      WHERE id = $${paramCount + 1} AND user_id = $${paramCount + 2}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    const updatedBooking = result.rows[0];

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: {
        id: updatedBooking.id,
        date: updatedBooking.date,
        location: updatedBooking.location,
        time_slot: updatedBooking.time_slot,
        participants: updatedBooking.participants,
        donation_tickets: updatedBooking.donation_tickets,
        total_cost: updatedBooking.total_cost,
        status: updatedBooking.status,
        created_at: updatedBooking.created_at,
        updated_at: updatedBooking.updated_at
      }
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if booking exists and belongs to user
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (existingBooking.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status to cancelled
    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      ['cancelled', new Date(), id, userId]
    );

    const cancelledBooking = result.rows[0];

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: cancelledBooking.id,
        status: cancelledBooking.status,
        updated_at: cancelledBooking.updated_at
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a booking (soft delete by setting status to cancelled)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if booking exists and belongs to user
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Soft delete by setting status to cancelled
    await pool.query(
      'UPDATE bookings SET status = $1, updated_at = $2 WHERE id = $3 AND user_id = $4',
      ['cancelled', new Date(), id, userId]
    );

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

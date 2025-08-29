const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token not provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists and is admin
      const userResult = await pool.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];
      
      // Check if user has admin role (you can customize this based on your role system)
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      // Add user info to request
      req.admin = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateAdmin };

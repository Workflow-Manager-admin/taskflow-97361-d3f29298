const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// PUBLIC_INTERFACE
/**
 * Authentication middleware to verify JWT tokens
 * Validates JWT token and attaches user data to request object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Verify user still exists in database
    const userResult = await pool.query(
      'SELECT id, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token - user not found'
      });
    }

    req.user = {
      id: decoded.userId,
      email: userResult.rows[0].email,
      created_at: userResult.rows[0].created_at
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateToken
};

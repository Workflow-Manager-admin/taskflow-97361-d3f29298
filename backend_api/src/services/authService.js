const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

class AuthService {
  // PUBLIC_INTERFACE
  /**
   * Register a new user with email and password
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User name
   * @returns {Object} User data and JWT token
   */
  async register(userData) {
    const { email, password, name } = userData;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate user login
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Object} User data and JWT token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, password_hash, name, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    };
  }

  // PUBLIC_INTERFACE
  /**
   * Get user profile information
   * @param {number} userId - User ID
   * @returns {Object} User profile data
   */
  async getUserProfile(userId) {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}

module.exports = new AuthService();

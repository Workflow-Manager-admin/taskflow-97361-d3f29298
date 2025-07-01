const authService = require('../services/authService');
const taskService = require('../services/taskService');
const schemas = require('../validation/schemas');

class AuthController {
  // PUBLIC_INTERFACE
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      // Validate request data
      const { error, value } = schemas.userRegistration.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Register user
      const result = await authService.register(value);
      
      // Initialize default columns for new user
      await taskService.initializeUserColumns(result.user.id);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Registration failed'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Authenticate user login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      // Validate request data
      const { error, value } = schemas.userLogin.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      // Authenticate user
      const result = await authService.login(value);

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        status: 'error',
        message: error.message || 'Authentication failed'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const user = await authService.getUserProfile(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(404).json({
        status: 'error',
        message: error.message || 'User not found'
      });
    }
  }
}

module.exports = new AuthController();

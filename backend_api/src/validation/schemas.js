const Joi = require('joi');

// PUBLIC_INTERFACE
/**
 * Validation schemas for request data validation
 * Uses Joi for comprehensive input validation
 */
const schemas = {
  // User registration validation
  userRegistration: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    })
  }),

  // User login validation
  userLogin: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // Task creation validation
  taskCreation: Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
      'string.min': 'Task title cannot be empty',
      'string.max': 'Task title cannot exceed 200 characters',
      'any.required': 'Task title is required'
    }),
    description: Joi.string().max(1000).allow('').optional(),
    column_id: Joi.number().integer().required().messages({
      'number.base': 'Column ID must be a number',
      'any.required': 'Column ID is required'
    }),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    due_date: Joi.date().iso().allow(null).optional()
  }),

  // Task update validation
  taskUpdate: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    column_id: Joi.number().integer().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    due_date: Joi.date().iso().allow(null).optional(),
    completed: Joi.boolean().optional()
  }),

  // Task order update validation
  taskOrderUpdate: Joi.object({
    taskId: Joi.number().integer().required(),
    newColumnId: Joi.number().integer().required(),
    newPosition: Joi.number().integer().min(0).required()
  })
};

module.exports = schemas;

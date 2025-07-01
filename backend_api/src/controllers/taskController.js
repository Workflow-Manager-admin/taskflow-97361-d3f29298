const taskService = require('../services/taskService');
const schemas = require('../validation/schemas');

class TaskController {
  // PUBLIC_INTERFACE
  /**
   * Get all tasks for the authenticated user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTasks(req, res) {
    try {
      const tasks = await taskService.getUserTasks(req.user.id);
      
      res.status(200).json({
        status: 'success',
        data: tasks
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve tasks'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createTask(req, res) {
    try {
      // Validate request data
      const { error, value } = schemas.taskCreation.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const task = await taskService.createTask(value, req.user.id);
      
      res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to create task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid task ID'
        });
      }

      // Validate request data
      const { error, value } = schemas.taskUpdate.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const task = await taskService.updateTask(taskId, value, req.user.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Update task error:', error);
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a task
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTask(req, res) {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid task ID'
        });
      }

      await taskService.deleteTask(taskId, req.user.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Delete task error:', error);
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to delete task'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update task order (for drag and drop functionality)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTaskOrder(req, res) {
    try {
      // Validate request data
      const { error, value } = schemas.taskOrderUpdate.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation error',
          details: error.details.map(detail => detail.message)
        });
      }

      const { taskId, newColumnId, newPosition } = value;
      const task = await taskService.updateTaskOrder(taskId, newColumnId, newPosition, req.user.id);
      
      res.status(200).json({
        status: 'success',
        message: 'Task order updated successfully',
        data: { task }
      });
    } catch (error) {
      console.error('Update task order error:', error);
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        status: 'error',
        message: error.message || 'Failed to update task order'
      });
    }
  }
}

module.exports = new TaskController();

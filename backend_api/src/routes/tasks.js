const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Task ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority level
 *         due_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Task due date
 *         completed:
 *           type: boolean
 *           description: Task completion status
 *         position:
 *           type: integer
 *           description: Task position in column
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Task creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Task last update timestamp
 *     Column:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Column ID
 *         name:
 *           type: string
 *           description: Column name
 *         position:
 *           type: integer
 *           description: Column position
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Column creation timestamp
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *     TasksResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             columns:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Column'
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Retrieve all tasks organized by columns
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TasksResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', taskController.getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: Create a new task in the specified column
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - column_id
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Task title
 *                 example: Complete project documentation
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Task description
 *                 example: Write comprehensive documentation for the project
 *               column_id:
 *                 type: integer
 *                 description: ID of the column where task should be created
 *                 example: 1
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *                 description: Task priority level
 *                 example: high
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Task due date
 *                 example: 2024-12-31T23:59:59Z
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or column not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Update an existing task's properties
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: Task title
 *                 example: Updated task title
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Task description
 *                 example: Updated task description
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Task priority level
 *                 example: high
 *               due_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Task due date
 *                 example: 2024-12-31T23:59:59Z
 *               completed:
 *                 type: boolean
 *                 description: Task completion status
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error or invalid task ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete an existing task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid task ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', taskController.deleteTask);

/**
 * @swagger
 * /api/tasks/order:
 *   put:
 *     summary: Update task order
 *     description: Update task position and column for drag-and-drop functionality
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - newColumnId
 *               - newPosition
 *             properties:
 *               taskId:
 *                 type: integer
 *                 description: ID of the task to move
 *                 example: 1
 *               newColumnId:
 *                 type: integer
 *                 description: ID of the destination column
 *                 example: 2
 *               newPosition:
 *                 type: integer
 *                 minimum: 0
 *                 description: New position in the destination column
 *                 example: 0
 *     responses:
 *       200:
 *         description: Task order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task or column not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/order', taskController.updateTaskOrder);

module.exports = router;

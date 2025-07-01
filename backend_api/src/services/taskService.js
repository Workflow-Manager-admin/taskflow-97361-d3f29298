const pool = require('../config/database');

class TaskService {
  // PUBLIC_INTERFACE
  /**
   * Get all tasks for a user organized by columns
   * @param {number} userId - User ID
   * @returns {Object} Tasks organized by columns
   */
  async getUserTasks(userId) {
    const tasksResult = await pool.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.priority,
        t.due_date,
        t.completed,
        t.position,
        t.created_at,
        t.updated_at,
        c.id as column_id,
        c.name as column_name,
        c.position as column_position
      FROM tasks t
      JOIN columns c ON t.column_id = c.id
      WHERE t.user_id = $1
      ORDER BY c.position, t.position
    `, [userId]);

    const columnsResult = await pool.query(`
      SELECT id, name, position, created_at
      FROM columns
      WHERE user_id = $1
      ORDER BY position
    `, [userId]);

    const columns = columnsResult.rows.map(col => ({
      ...col,
      tasks: tasksResult.rows.filter(task => task.column_id === col.id)
        .map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: task.due_date,
          completed: task.completed,
          position: task.position,
          created_at: task.created_at,
          updated_at: task.updated_at
        }))
    }));

    return { columns };
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new task
   * @param {Object} taskData - Task creation data
   * @param {number} userId - User ID
   * @returns {Object} Created task data
   */
  async createTask(taskData, userId) {
    const { title, description, column_id, priority, due_date } = taskData;

    // Verify column belongs to user
    const columnCheck = await pool.query(
      'SELECT id FROM columns WHERE id = $1 AND user_id = $2',
      [column_id, userId]
    );

    if (columnCheck.rows.length === 0) {
      throw new Error('Column not found or access denied');
    }

    // Get next position in column
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM tasks WHERE column_id = $1 AND user_id = $2',
      [column_id, userId]
    );

    const position = positionResult.rows[0].next_position;

    const result = await pool.query(`
      INSERT INTO tasks (title, description, column_id, user_id, priority, due_date, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
    `, [title, description || '', column_id, userId, priority || 'medium', due_date, position]);

    return result.rows[0];
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} updateData - Task update data
   * @param {number} userId - User ID
   * @returns {Object} Updated task data
   */
  async updateTask(taskId, updateData, userId) {
    // Verify task belongs to user
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskCheck.rows.length === 0) {
      throw new Error('Task not found or access denied');
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${paramCount++}`);
      values.push(updateData.title);
    }
    if (updateData.description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }
    if (updateData.priority !== undefined) {
      updateFields.push(`priority = $${paramCount++}`);
      values.push(updateData.priority);
    }
    if (updateData.due_date !== undefined) {
      updateFields.push(`due_date = $${paramCount++}`);
      values.push(updateData.due_date);
    }
    if (updateData.completed !== undefined) {
      updateFields.push(`completed = $${paramCount++}`);
      values.push(updateData.completed);
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = NOW()');
    values.push(taskId, userId);

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @param {number} userId - User ID
   * @returns {boolean} Success status
   */
  async deleteTask(taskId, userId) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found or access denied');
    }

    return true;
  }

  // PUBLIC_INTERFACE
  /**
   * Update task position and column (for drag and drop)
   * @param {number} taskId - Task ID
   * @param {number} newColumnId - New column ID
   * @param {number} newPosition - New position in column
   * @param {number} userId - User ID
   * @returns {Object} Updated task data
   */
  async updateTaskOrder(taskId, newColumnId, newPosition, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify task belongs to user
      const taskCheck = await client.query(
        'SELECT id, column_id FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
      );

      if (taskCheck.rows.length === 0) {
        throw new Error('Task not found or access denied');
      }

      const oldColumnId = taskCheck.rows[0].column_id;

      // Verify new column belongs to user
      const columnCheck = await client.query(
        'SELECT id FROM columns WHERE id = $1 AND user_id = $2',
        [newColumnId, userId]
      );

      if (columnCheck.rows.length === 0) {
        throw new Error('Column not found or access denied');
      }

      // Update positions in old column (if different from new column)
      if (oldColumnId !== newColumnId) {
        await client.query(
          'UPDATE tasks SET position = position - 1 WHERE column_id = $1 AND user_id = $2 AND position > (SELECT position FROM tasks WHERE id = $3)',
          [oldColumnId, userId, taskId]
        );
      }

      // Make space in new column
      await client.query(
        'UPDATE tasks SET position = position + 1 WHERE column_id = $1 AND user_id = $2 AND position >= $3',
        [newColumnId, userId, newPosition]
      );

      // Update the task
      const result = await client.query(`
        UPDATE tasks 
        SET column_id = $1, position = $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
      `, [newColumnId, newPosition, taskId, userId]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize default columns for a new user
   * @param {number} userId - User ID
   * @returns {Array} Created columns
   */
  async initializeUserColumns(userId) {
    const defaultColumns = [
      { name: 'To Do', position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Done', position: 2 }
    ];

    const results = [];
    for (const column of defaultColumns) {
      const result = await pool.query(
        'INSERT INTO columns (name, position, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, position, created_at',
        [column.name, column.position, userId]
      );
      results.push(result.rows[0]);
    }

    return results;
  }
}

module.exports = new TaskService();

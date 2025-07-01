const pool = require('../config/database');

class TaskService {
  // PUBLIC_INTERFACE
  /**
   * Get all tasks organized by columns
   * @returns {Object} Tasks organized by columns
   */
  async getAllTasks() {
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
      ORDER BY c.position, t.position
    `);

    const columnsResult = await pool.query(`
      SELECT id, name, position, created_at
      FROM columns
      ORDER BY position
    `);

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
   * @returns {Object} Created task data
   */
  async createTask(taskData) {
    const { title, description, column_id, priority, due_date } = taskData;

    // Verify column exists
    const columnCheck = await pool.query(
      'SELECT id FROM columns WHERE id = $1',
      [column_id]
    );

    if (columnCheck.rows.length === 0) {
      throw new Error('Column not found');
    }

    // Get next position in column
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM tasks WHERE column_id = $1',
      [column_id]
    );

    const position = positionResult.rows[0].next_position;

    const result = await pool.query(`
      INSERT INTO tasks (title, description, column_id, priority, due_date, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
    `, [title, description || '', column_id, priority || 'medium', due_date, position]);

    return result.rows[0];
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} updateData - Task update data
   * @returns {Object} Updated task data
   */
  async updateTask(taskId, updateData) {
    // Verify task exists
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      throw new Error('Task not found');
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
    values.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount++}
      RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {boolean} Success status
   */
  async deleteTask(taskId) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [taskId]
    );

    if (result.rows.length === 0) {
      throw new Error('Task not found');
    }

    return true;
  }

  // PUBLIC_INTERFACE
  /**
   * Update task position and column (for drag and drop)
   * @param {number} taskId - Task ID
   * @param {number} newColumnId - New column ID
   * @param {number} newPosition - New position in column
   * @returns {Object} Updated task data
   */
  async updateTaskOrder(taskId, newColumnId, newPosition) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Verify task exists
      const taskCheck = await client.query(
        'SELECT id, column_id FROM tasks WHERE id = $1',
        [taskId]
      );

      if (taskCheck.rows.length === 0) {
        throw new Error('Task not found');
      }

      const oldColumnId = taskCheck.rows[0].column_id;

      // Verify new column exists
      const columnCheck = await client.query(
        'SELECT id FROM columns WHERE id = $1',
        [newColumnId]
      );

      if (columnCheck.rows.length === 0) {
        throw new Error('Column not found');
      }

      // Update positions in old column (if different from new column)
      if (oldColumnId !== newColumnId) {
        await client.query(
          'UPDATE tasks SET position = position - 1 WHERE column_id = $1 AND position > (SELECT position FROM tasks WHERE id = $2)',
          [oldColumnId, taskId]
        );
      }

      // Make space in new column
      await client.query(
        'UPDATE tasks SET position = position + 1 WHERE column_id = $1 AND position >= $2',
        [newColumnId, newPosition]
      );

      // Update the task
      const result = await client.query(`
        UPDATE tasks 
        SET column_id = $1, position = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, title, description, priority, due_date, completed, position, created_at, updated_at
      `, [newColumnId, newPosition, taskId]);

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
   * Initialize default columns (public access)
   * @returns {Array} Created columns
   */
  async initializeDefaultColumns() {
    const defaultColumns = [
      { name: 'To Do', position: 0 },
      { name: 'In Progress', position: 1 },
      { name: 'Done', position: 2 }
    ];

    const results = [];
    for (const column of defaultColumns) {
      const result = await pool.query(
        'INSERT INTO columns (name, position, created_at) VALUES ($1, $2, NOW()) RETURNING id, name, position, created_at',
        [column.name, column.position]
      );
      results.push(result.rows[0]);
    }

    return results;
  }
}

module.exports = new TaskService();

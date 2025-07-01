// In-memory storage for tasks and columns
let nextTaskId = 1;
let nextColumnId = 1;

// Initialize default columns
let columns = [
  { id: 1, name: 'To Do', position: 0, created_at: new Date().toISOString() },
  { id: 2, name: 'In Progress', position: 1, created_at: new Date().toISOString() },
  { id: 3, name: 'Done', position: 2, created_at: new Date().toISOString() }
];
nextColumnId = 4;

// Initialize with some sample tasks
let tasks = [
  {
    id: 1,
    title: 'Sample Task 1',
    description: 'This is a sample task in To Do column',
    priority: 'medium',
    due_date: null,
    completed: false,
    position: 0,
    column_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Sample Task 2',
    description: 'This is a sample task in In Progress column',
    priority: 'high',
    due_date: null,
    completed: false,
    position: 0,
    column_id: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
nextTaskId = 3;

class TaskService {
  // PUBLIC_INTERFACE
  /**
   * Get all tasks organized by columns
   * @returns {Object} Tasks organized by columns
   */
  async getAllTasks() {
    // Sort columns by position
    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
    
    // Organize tasks by column
    const columnsWithTasks = sortedColumns.map(col => ({
      ...col,
      tasks: tasks
        .filter(task => task.column_id === col.id)
        .sort((a, b) => a.position - b.position)
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

    return { columns: columnsWithTasks };
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
    const column = columns.find(col => col.id === column_id);
    if (!column) {
      throw new Error('Column not found');
    }

    // Get next position in column
    const columnTasks = tasks.filter(task => task.column_id === column_id);
    const nextPosition = columnTasks.length > 0 
      ? Math.max(...columnTasks.map(task => task.position)) + 1 
      : 0;

    const newTask = {
      id: nextTaskId++,
      title,
      description: description || '',
      column_id,
      priority: priority || 'medium',
      due_date: due_date || null,
      completed: false,
      position: nextPosition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    tasks.push(newTask);
    return newTask;
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} updateData - Task update data
   * @returns {Object} Updated task data
   */
  async updateTask(taskId, updateData) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const task = tasks[taskIndex];
    
    // Update task fields
    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.due_date !== undefined) task.due_date = updateData.due_date;
    if (updateData.completed !== undefined) task.completed = updateData.completed;
    
    task.updated_at = new Date().toISOString();
    
    return task;
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {boolean} Success status
   */
  async deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks.splice(taskIndex, 1);
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
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const column = columns.find(col => col.id === newColumnId);
    if (!column) {
      throw new Error('Column not found');
    }

    const task = tasks[taskIndex];
    const oldColumnId = task.column_id;

    // Update positions in old column (if different from new column)
    if (oldColumnId !== newColumnId) {
      tasks.forEach(t => {
        if (t.column_id === oldColumnId && t.position > task.position) {
          t.position--;
        }
      });
    }

    // Make space in new column
    tasks.forEach(t => {
      if (t.column_id === newColumnId && t.position >= newPosition && t.id !== taskId) {
        t.position++;
      }
    });

    // Update the task
    task.column_id = newColumnId;
    task.position = newPosition;
    task.updated_at = new Date().toISOString();

    return task;
  }

  // PUBLIC_INTERFACE
  /**
   * Initialize default columns (public access)
   * @returns {Array} Created columns
   */
  async initializeDefaultColumns() {
    // Reset columns to defaults
    columns = [
      { id: 1, name: 'To Do', position: 0, created_at: new Date().toISOString() },
      { id: 2, name: 'In Progress', position: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'Done', position: 2, created_at: new Date().toISOString() }
    ];
    nextColumnId = 4;
    
    return columns;
  }

  // PUBLIC_INTERFACE
  /**
   * Clear all data (useful for testing or reset)
   * @returns {boolean} Success status
   */
  async clearAllData() {
    tasks = [];
    nextTaskId = 1;
    columns = [
      { id: 1, name: 'To Do', position: 0, created_at: new Date().toISOString() },
      { id: 2, name: 'In Progress', position: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'Done', position: 2, created_at: new Date().toISOString() }
    ];
    nextColumnId = 4;
    return true;
  }
}

module.exports = new TaskService();

const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskVerse API',
      version: '1.0.0',
      description: 'TaskVerse Kanban Board API - A comprehensive REST API for managing tasks with a Kanban board interface, featuring task management and drag-and-drop functionality.',
      contact: {
        name: 'TaskVerse API Support',
        email: 'support@taskverse.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Tasks',
        description: 'Task management operations'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

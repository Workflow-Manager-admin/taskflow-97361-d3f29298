# TaskVerse Backend API Documentation

## Overview
TaskVerse is a comprehensive REST API for managing tasks with a Kanban board interface. It features full CRUD operations for tasks with drag-and-drop functionality and public access to all endpoints.

## Features Implemented
- ✅ Complete task CRUD operations
- ✅ Drag-and-drop task reordering between columns
- ✅ In-memory storage (no database required)
- ✅ Comprehensive input validation using Joi
- ✅ Error handling with proper HTTP status codes
- ✅ Complete Swagger/OpenAPI documentation
- ✅ ESLint code quality checks
- ✅ Public access to all endpoints (no authentication required)

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks organized by columns
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update an existing task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/order` - Update task position for drag-and-drop

### Health Check
- `GET /` - Service health check

## Data Storage
The API uses in-memory storage with the following structure:

### Columns
- Default columns: "To Do", "In Progress", "Done"
- Each column has: id, name, position, created_at
- Columns are automatically initialized on startup

### Tasks
- Each task has: id, title, description, priority, due_date, completed, position, column_id, created_at, updated_at
- Tasks are stored in memory and organized by columns
- Sample tasks are created on startup for demonstration

## Environment Variables
The following environment variables are optional:

```env
# Application Configuration
NODE_ENV="development"
PORT="3001"
HOST="0.0.0.0"
```

## Task Management Flow
1. Default columns are available: "To Do", "In Progress", "Done"
2. Create tasks in any column using `POST /api/tasks`
3. Move tasks between columns and positions using `PUT /api/tasks/order`
4. Update task properties using `PUT /api/tasks/:id`
5. Delete tasks using `DELETE /api/tasks/:id`

## API Documentation
- Swagger UI available at: `/docs`
- OpenAPI specification available at: `/openapi.json`

## Development Commands
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint code quality checks
- `npm test` - Run tests (to be implemented)

## Security Features
- Input validation on all endpoints using Joi schemas
- CORS configuration for cross-origin requests
- In-memory storage eliminates SQL injection risks

## Error Handling
All endpoints return consistent error responses:
```json
{
  "status": "error",
  "message": "Error description",
  "details": ["Validation errors if applicable"]
}
```

## Success Responses
All successful operations return:
```json
{
  "status": "success",
  "message": "Operation description",
  "data": { /* Response data */ }
}
```

## Next Steps
The API is fully functional and ready for integration with frontend applications. All task management operations use in-memory storage and are publicly accessible without authentication requirements. Data is reset on server restart, making it ideal for development and testing.

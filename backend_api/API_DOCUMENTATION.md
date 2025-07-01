# TaskVerse Backend API Documentation

## Overview
TaskVerse is a comprehensive REST API for managing personal tasks with a Kanban board interface. It features JWT authentication, user management, and full CRUD operations for tasks with drag-and-drop functionality.

## Features Implemented
- ✅ JWT-based authentication and authorization
- ✅ User registration and login with password hashing
- ✅ Secure session management with token validation
- ✅ Complete task CRUD operations
- ✅ Drag-and-drop task reordering between columns
- ✅ PostgreSQL database integration
- ✅ Comprehensive input validation using Joi
- ✅ Error handling with proper HTTP status codes
- ✅ Complete Swagger/OpenAPI documentation
- ✅ ESLint code quality checks

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate user and get JWT token
- `GET /api/me` - Get current user profile (requires authentication)

### Tasks
- `GET /api/tasks` - Get all tasks organized by columns (requires authentication)
- `POST /api/tasks` - Create a new task (requires authentication)
- `PUT /api/tasks/:id` - Update an existing task (requires authentication)
- `DELETE /api/tasks/:id` - Delete a task (requires authentication)
- `PUT /api/tasks/order` - Update task position for drag-and-drop (requires authentication)

### Health Check
- `GET /` - Service health check

## Database Schema Requirements
The API expects the following PostgreSQL tables:

### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### columns
```sql
CREATE TABLE columns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### tasks
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP NULL,
    completed BOOLEAN DEFAULT FALSE,
    position INTEGER NOT NULL,
    column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables
The following environment variables must be configured:

```env
# Database Configuration
POSTGRES_URL="postgresql://localhost:5000/myapp"
POSTGRES_USER="appuser"
POSTGRES_PASSWORD="dbuser123"
POSTGRES_DB="myapp"
POSTGRES_PORT="5000"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Application Configuration
NODE_ENV="development"
PORT="3001"
HOST="0.0.0.0"
```

## Authentication Flow
1. Register: `POST /api/register` with email, password, and name
2. Login: `POST /api/login` with email and password to receive JWT token
3. Include JWT token in Authorization header: `Bearer <token>` for protected routes
4. Token expires in 24 hours

## Task Management Flow
1. Upon registration, default columns are automatically created: "To Do", "In Progress", "Done"
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
- Password hashing using bcrypt with salt rounds = 12
- JWT tokens with expiration
- SQL injection prevention using parameterized queries
- Input validation on all endpoints
- CORS configuration for cross-origin requests
- User isolation - users can only access their own data

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
The API is fully functional and ready for integration with the React frontend. All authentication, task management, and database operations are implemented according to the TaskVerse specifications.

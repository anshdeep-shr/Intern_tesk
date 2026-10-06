# Project Management System - API Documentation

The Project Management System backend provides a RESTful API serving both the Web application and Mobile app.

## Base URL
- Local Development: `http://localhost:5000/api`
- Deployed Backend: `https://your-backend-domain.com/api`

## Authentication
Authentication is handled via JWT (JSON Web Tokens). Include the JWT in the `Authorization` header for all protected endpoints:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Registers a new user account.

- **Rate Limit**: 30 requests / 15 minutes
- **Request Body**:
```json
{
  "fullName": "Alex Morgan",
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-uuid-1234",
    "fullName": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-10-07T00:00:00.000Z"
  }
}
```

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.

- **Request Body**:
```json
{
  "email": "alex@example.com",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-uuid-1234",
    "fullName": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### `POST /api/auth/logout`
Logs out the current user session (Protected).

- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

### `GET /api/auth/me`
Fetches the currently authenticated user's profile (Protected).

- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
{
  "user": {
    "id": "u-uuid-1234",
    "fullName": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-10-07T00:00:00.000Z"
  }
}
```

---

## 2. Project Endpoints (`/api/projects`)

### `GET /api/projects`
Retrieves all projects owned by the authenticated user.

- **Query Parameters**:
  - `search` (optional): Filter projects by name (case-insensitive substring)
  - `status` (optional): Filter by status (`Not Started`, `In Progress`, `Completed`)
- **Response (200 OK)**:
```json
{
  "projects": [
    {
      "id": "p-uuid-5678",
      "name": "Mobile App Revamp",
      "description": "Redesign UI/UX for cross-platform app",
      "status": "In Progress",
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "userId": "u-uuid-1234",
      "createdAt": "2026-10-07T00:00:00.000Z",
      "_count": {
        "tasks": 4
      }
    }
  ]
}
```

### `GET /api/projects/:id`
Retrieves project details including all associated tasks.

- **Response (200 OK)**:
```json
{
  "project": {
    "id": "p-uuid-5678",
    "name": "Mobile App Revamp",
    "status": "In Progress",
    "tasks": [
      {
        "id": "t-uuid-9999",
        "name": "Implement Expo SecureStore",
        "status": "Completed",
        "priority": "High"
      }
    ]
  }
}
```

### `POST /api/projects`
Creates a new project owned by the logged-in user.

- **Request Body**:
```json
{
  "name": "Website Launch",
  "description": "Marketing website release",
  "status": "Not Started",
  "startDate": "2026-10-10",
  "endDate": "2026-11-15"
}
```

### `PUT /api/projects/:id`
Updates an existing project owned by the user.

- **Request Body**: Partial update object with `name`, `description`, `status`, `startDate`, `endDate`.

### `DELETE /api/projects/:id`
Deletes a project and all associated tasks.

---

## 3. Task Endpoints (`/api/tasks`)

### `GET /api/tasks`
Retrieves user tasks across projects.

- **Query Parameters**:
  - `projectId`: Filter tasks under a specific project ID
  - `search`: Filter by task name
  - `status`: `Pending` | `In Progress` | `Completed`
  - `priority`: `Low` | `Medium` | `High`

### `POST /api/tasks`
Creates a task under a project.

- **Request Body**:
```json
{
  "name": "Configure API Rate Limiter",
  "description": "Add express-rate-limit to auth endpoints",
  "priority": "High",
  "status": "In Progress",
  "dueDate": "2026-10-12",
  "projectId": "p-uuid-5678"
}
```

### `PUT /api/tasks/:id`
Updates task details or status.

### `DELETE /api/tasks/:id`
Deletes a task.

---

## 4. Dashboard Endpoint (`/api/dashboard`)

### `GET /api/dashboard`
Retrieves summary statistics for the user's dashboard.

- **Response (200 OK)**:
```json
{
  "stats": {
    "totalProjects": 5,
    "projectsInProgress": 2,
    "totalTasks": 18,
    "completedTasks": 12,
    "pendingTasks": 6
  },
  "recentProjects": [...],
  "recentTasks": [...]
}
```

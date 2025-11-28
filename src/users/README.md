# Users Module

This module handles user management operations including profile management, user information, and user-related functionalities.

## Endpoints

### Get Current User Profile
- **Endpoint**: `GET /users/me`
- **Description**: Get the current authenticated user's profile information
- **Authentication**: Required (JWT)
- **Response**: User profile object

```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "/uploads/avatars/user-uuid.png",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "onboarded": true,
  "heardAboutUs": "google",
  "interestIn": ["productivity", "collaboration"]
}
```

### Get User by ID
- **Endpoint**: `GET /users/:id`
- **Description**: Get user information by user ID
- **Authentication**: Required (JWT)
- **Parameters**: 
  - `id` (string): User UUID
- **Response**: User object

### Update User Profile
- **Endpoint**: `PATCH /users/profile`
- **Description**: Update current user's profile information
- **Authentication**: Required (JWT)
- **Request Body**:
```json
{
  "name": "Updated Name",
  "avatar": "optional-avatar-url"
}
```
- **Response**: Updated user profile

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

## Error Responses

- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: User not found
- **400 Bad Request**: Invalid request data

## File Uploads

User avatars are automatically handled during onboarding and can be updated via profile updates. Avatar files are stored in `/uploads/avatars/` and served as static files.

## Dependencies

- `UsersService`: Business logic for user operations
- `JwtAuthGuard`: JWT authentication protection
- `TypeORM`: Database operations with User entity

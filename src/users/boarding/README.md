# Boarding Module

This module handles user onboarding process, including profile completion, avatar upload, and initial workspace creation.

## Endpoints

### Complete Onboarding
- **Endpoint**: `POST /users/boarding/complete`
- **Description**: Complete the user onboarding process
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Request Body**:
```
name: string (required)
heardAboutUs: string (optional)
interestIn: string[] (optional)
avatar: File (optional)
```

**Example Request**:
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('heardAboutUs', 'google');
formData.append('interestIn', 'productivity,collaboration');
formData.append('avatar', fileObject);

fetch('/users/boarding/complete', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});
```

**Response**:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "/uploads/avatars/user-uuid.png",
    "onboarded": true,
    "heardAboutUs": "google",
    "interestIn": ["productivity", "collaboration"]
  },
  "workspace": {
    "id": "workspace-uuid",
    "name": "John Doe",
    "ownerId": "user-uuid",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "nextStep": "onboarded"
}
```

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

## File Uploads

### Avatar Upload
- **Supported Formats**: PNG, JPG, JPEG, GIF, WebP, SVG, TIFF, ICO, HEIC, HEIF
- **File Size**: No explicit limit (handled by server configuration)
- **Storage**: Files are saved to `/uploads/avatars/`
- **Naming**: `{userId}.{original-extension}`
- **URL Format**: `/uploads/avatars/{userId}.{extension}`

### File Processing
1. Avatar file is validated and saved during onboarding
2. File path is stored in user's `avatar` field
3. Files are served as static content via `/uploads/` route

## Onboarding Process

1. User must be authenticated with valid JWT token
2. User submits onboarding data with optional avatar
3. System updates user profile with provided information
4. Default workspace is created automatically
5. User is marked as onboarded
6. Response includes updated user info and created workspace

## Error Responses

- **401 Unauthorized**: Invalid or missing JWT token
- **400 Bad Request**: Missing required fields or invalid file format
- **500 Internal Server Error**: File upload or database errors

## Dependencies

- `BoardingService`: Handles onboarding business logic
- `JwtAuthGuard`: JWT authentication protection
- `TypeORM`: Database operations with User and Workspace entities
- `FileInterceptor`: Handles multipart file uploads

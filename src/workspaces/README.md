# Workspaces Module

This module handles workspace management operations including creation, member management, and workspace collaboration features.

## Endpoints

### Create Workspace

- **Endpoint**: `POST /workspaces`
- **Description**: Create a new workspace with optional logo
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Request Body**:

```
name: string (required)
logo: File (optional)
```

**Example Request**:

```javascript
const formData = new FormData();
formData.append('name', 'My Team Workspace');
formData.append('logo', fileObject);

fetch('/workspaces', {
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
  "id": "workspace-uuid",
  "name": "My Team Workspace",
  "logo": "/uploads/workspace-logos/my-team-1700123456789.png",
  "ownerId": "user-uuid",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "owner": {
    "id": "user-uuid",
    "name": "John Doe"
  },
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "workspaceId": "workspace-uuid",
      "role": "OWNER",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "avatar": "/uploads/avatars/user-uuid.png"
      }
    }
  ]
}
```

### Get All Workspaces (Admin)

- **Endpoint**: `GET /workspaces`
- **Description**: Get all workspaces in the system (admin only)
- **Authentication**: Required (JWT)
- **Response**: Array of workspace objects

### Get My Workspaces

- **Endpoint**: `GET /workspaces/my`
- **Description**: Get workspaces where user is owner or member
- **Authentication**: Required (JWT)
- **Response**:

```json
{
  "workspaces": [...],
  "lastWorkspaceId": "workspace-uuid"
}
```

### Get Last Active Workspace

- **Endpoint**: `GET /workspaces/last`
- **Description**: Get user's last active workspace
- **Authentication**: Required (JWT)
- **Response**: Workspace object or null

### Get Workspace by ID

- **Endpoint**: `GET /workspaces/:id`
- **Description**: Get workspace details (owner/members only)
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Response**: Workspace object with relations

### Get Workspace Members

- **Endpoint**: `GET /workspaces/:id/members`
- **Description**: Get all members of a workspace
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Response**: Array of workspace members with user details

### Update Workspace

- **Endpoint**: `PATCH /workspaces/:id`
- **Description**: Update workspace information (owner only)
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Request Body**:

```json
{
  "name": "Updated Workspace Name"
}
```

- **Response**: Updated workspace object

### Delete Workspace

- **Endpoint**: `DELETE /workspaces/:id`
- **Description**: Delete workspace (owner only)
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Response**: 204 No Content

### Leave Workspace

- **Endpoint**: `POST /workspaces/:id/leave`
- **Description**: Leave workspace (members only, not owner)
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Response**:

```json
{
  "message": "Left workspace successfully"
}
```

### Update Workspace Logo

- **Endpoint**: `POST /workspaces/:id/logo`
- **Description**: Update workspace logo (owner only)
- **Authentication**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Request Body**:

```
logo: File (required)
```

- **Response**: Updated workspace object

### Remove Workspace Logo

- **Endpoint**: `DELETE /workspaces/:id/logo`
- **Description**: Remove workspace logo (owner only)
- **Authentication**: Required (JWT)
- **Parameters**:
  - `id` (string): Workspace UUID
- **Response**:

```json
{
  "message": "Workspace logo removed successfully"
}
```

## Authentication

All endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

## Authorization Rules

### Workspace Access

- **Owners**: Full access to all workspace operations
- **Members**: Read-only access to workspace information
- **Non-members**: No access (403 Forbidden)

### Role-Based Operations

- **Owner Only**: Create, update, delete workspace, manage logo, remove members
- **Owner/Members**: View workspace details, view members
- **Members Only**: Leave workspace (owners cannot leave their own workspace)

## File Uploads

### Workspace Logo Upload

- **Supported Formats**: All image formats (handled by multer)
- **File Size**: No explicit limit (handled by server configuration)
- **Storage**: Files are saved to `/uploads/workspace-logos/`
- **Naming**: `{workspace-name}-{timestamp}.{extension}`
- **URL Format**: `/uploads/workspace-logos/{workspace-name}-{timestamp}.{ext}`

### File Processing

1. Logo file is validated and saved during workspace creation/update
2. File path is stored in workspace's `logo` field
3. Old logo files are automatically deleted when updating
4. Files are served as static content via `/uploads/` route

## Last Workspace Tracking

The system automatically tracks the user's last active workspace:

- **Automatic Updates**: When accessing any workspace, it becomes the "last workspace"
- **Frontend Integration**: Use `GET /workspaces/my` to get `lastWorkspaceId` for redirects
- **Access Validation**: If user loses access to last workspace, it's automatically cleared

## Error Responses

- **401 Unauthorized**: Invalid or missing JWT token
- **403 Forbidden**: Access denied (not owner/member or insufficient permissions)
- **404 Not Found**: Workspace not found
- **400 Bad Request**: Invalid request data or file upload error
- **500 Internal Server Error**: Database or file system errors

## Usage Examples

### Frontend Workspace Creation

```javascript
const createWorkspace = async (name, logoFile) => {
  const formData = new FormData();
  formData.append('name', name);
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  const response = await fetch('/workspaces', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return await response.json();
};
```

### Redirect to Last Workspace

```javascript
const redirectToLastWorkspace = async () => {
  const response = await fetch('/workspaces/my', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const { lastWorkspaceId } = await response.json();
  if (lastWorkspaceId) {
    window.location.href = `/workspace/${lastWorkspaceId}`;
  } else {
    // Show workspace selection
  }
};
```

## Dependencies

- `WorkspacesService`: Business logic for workspace operations
- `JwtAuthGuard`: JWT authentication protection
- `TypeORM`: Database operations with Workspace, WorkspaceMember, and User entities
- `FileInterceptor`: Handles multipart file uploads
- `Logger`: Application logging
